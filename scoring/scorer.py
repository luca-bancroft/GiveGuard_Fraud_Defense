import os
import json
from datetime import datetime, timezone
from typing import Any
import httpx

from scoring.irs_client import fetch_organization, looks_like_ein, normalize_ein

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _build_irs_lookup(org: dict[str, Any] | None, source: str) -> dict[str, Any]:
    if not org:
        return {
            "ein_exists": False,
            "active_status": "Not found",
            "filing_990": False,
            "ntee_code": None,
            "ruling_date": None,
            "state": None,
            "source": "none",
        }

    if source == "propublica":
        filing_candidates = [
            org.get("filings_with_data"),
            org.get("filings_without_data"),
            org.get("tax_filings"),
        ]
        filing_990 = any(isinstance(v, list) and len(v) > 0 for v in filing_candidates)
    else:
        filing_990 = bool(org.get("filing_990"))

    active_status = (
        org.get("status")
        or org.get("organization_status")
        or org.get("foundation_status")
        or "Unknown"
    )

    return {
        "ein_exists": True,
        "active_status": str(active_status),
        "filing_990": filing_990,
        "ntee_code": org.get("ntee_code") or org.get("ntee_cd"),
        "ruling_date": org.get("ruling_date"),
        "state": org.get("state"),
        "source": source,
    }


def _parse_ruling_date(ruling_date: str | None) -> datetime | None:
    if not ruling_date:
        return None
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y-%m", "%Y"):
        try:
            return datetime.strptime(ruling_date, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def _is_recent_org(ruling_date: str | None, days: int = 365) -> bool:
    parsed = _parse_ruling_date(ruling_date)
    if not parsed:
        return False
    return (datetime.now(timezone.utc) - parsed).days < days


def _ntee_mismatch(org_name: str, ntee_code: str | None) -> bool:
    if not ntee_code:
        return False 
    prefix = ntee_code[:1].upper()
    name = (org_name or "").lower()

    keyword_expected = {
        "food":        {"K"},
        "hunger":      {"K"},
        "scholarship": {"B"},
        "education":   {"B"},
        "school":      {"B"},
        "art":         {"A"},
        "music":       {"A"},
        "health":      {"E", "F", "G", "H"},
        "medical":     {"E", "F", "G", "H"},
        "hospital":    {"E"},
        "veteran":     {"W"},
        "military":    {"W"},
        "housing":     {"L"},
        "animal":      {"D"},
        "environment": {"C"},
        "religion":    {"X"},
        "church":      {"X"},
        "salvation":   {"X"},
        "relief":      {"P", "Q", "K"},
        "community":   {"S"},
        "foundation":  {"T"},
    }

    for keyword, allowed in keyword_expected.items():
        if keyword in name:
            return prefix not in allowed

    return False

def _is_high_risk_state(state: str | None) -> bool:
    if not state:
        return False
    return state.strip().upper() in {"DE", "NV", "WY"}


def _is_suspicious_name(org_name: str) -> bool:
    name = (org_name or "").lower()
    suspicious_suffixes = ["llc", "inc.", "corp", "ltd", "limited"]
    return any(suffix in name for suffix in suspicious_suffixes)


def _verdict_from_signals(trust_score: int, signal_count: int, irs_lookup: dict) -> str:
    if not irs_lookup.get("ein_exists"):
        return "flagged"
    if signal_count >= 2 and trust_score < 40:
        return "blocked"
    if trust_score >= 75 and signal_count == 0:
        return "verified"
    return "flagged"


def _build_explanation(payload: dict[str, Any]) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key:
        prompt_payload = {
            "task": (
                "Write a concise plain-English fraud risk explanation for a fintech dashboard. "
                "Reference the strongest signals and end with a clear recommendation."
            ),
            "organization": payload.get("org_name"),
            "ein": payload.get("ein"),
            "trust_score": payload.get("trust_score"),
            "verdict": payload.get("verdict"),
            "signals": payload.get("signals"),
            "irs_lookup": payload.get("irs_lookup"),
        }

        body = {
            "contents": [{"parts": [{"text": json.dumps(prompt_payload)}]}],
            "generationConfig": {"maxOutputTokens": 300, "temperature": 0.3},
        }

        url = GEMINI_URL.format(model=GEMINI_MODEL)
        try:
            resp = httpx.post(url, params={"key": gemini_key}, json=body, timeout=20.0)
            if resp.status_code < 400:
                data = resp.json()
                candidates = data.get("candidates") or []
                if candidates:
                    parts = ((candidates[0].get("content") or {}).get("parts") or [])
                    text = " ".join(
                        part.get("text", "").strip()
                        for part in parts if isinstance(part, dict)
                    ).strip()
                    if text:
                        return text
        except Exception:
            pass

    if not payload.get("signals"):
        return (
            f"IRS validation passed with no fraud signals detected. "
            f"Trust score: {payload['trust_score']}/100. "
            f"This organization appears legitimate based on available records."
        )

    flag_text = ", ".join(s["flag"] for s in payload["signals"][:4])
    verdict = payload.get("verdict", "flagged")
    if verdict == "blocked":
        return (
            f"Multiple serious fraud signals detected: {flag_text}. "
            f"Trust score: {payload['trust_score']}/100. "
            f"Recommendation: block this organization immediately."
        )
    return (
        f"The following signals were raised during verification: {flag_text}. "
        f"Trust score: {payload['trust_score']}/100. "
        f"Recommendation: flag for manual review before approving."
    )


def score_submission(ein: str, org_name: str) -> dict[str, Any]:
    signals: list[dict[str, Any]] = []
    cleaned_ein = (ein or "").strip()
    is_ein_input = looks_like_ein(cleaned_ein)

    irs_org = None
    source = "none"

    if is_ein_input:
        irs_org, source = fetch_organization(cleaned_ein)
        if irs_org is None:
            signals.append({
                "flag": "EIN not found in IRS or ProPublica records",
                "risk_points": 35,
            })
            signals.append({
                "flag": "Unable to verify organization legitimacy",
                "risk_points": 25,
            })
    else:
        signals.append({
            "flag": "Input is not a valid EIN format — organization name provided",
            "risk_points": 15,
        })

    irs_lookup = _build_irs_lookup(irs_org, source)

    if irs_lookup["ein_exists"]:
        if _is_recent_org(irs_lookup["ruling_date"], days=365):
            signals.append({
                "flag": "Organization registered less than 1 year ago",
                "risk_points": 40,
            })
        if not irs_lookup["filing_990"]:
            signals.append({
                "flag": "No IRS 990 filing on record",
                "risk_points": 30,
            })
        if _ntee_mismatch(org_name or (irs_org or {}).get("name", ""), irs_lookup["ntee_code"]):
            signals.append({
                "flag": "NTEE category mismatch with stated mission",
                "risk_points": 20,
            })
        if _is_high_risk_state(irs_lookup.get("state")):
            signals.append({
                "flag": "Incorporated in high-risk state",
                "risk_points": 10,
            })
        if _is_suspicious_name(org_name or (irs_org or {}).get("name", "")):
            signals.append({
                "flag": "Organization name contains for-profit business suffix (LLC, Inc, Corp)",
                "risk_points": 25,
            })
    else:
        signals.append({
            "flag": "No active IRS tax-exempt status found",
            "risk_points": 20,
        })

    lookup_name = (
        (org_name or "").strip()
        or (irs_org or {}).get("name", "")
        or cleaned_ein
    )

    total_risk = sum(s["risk_points"] for s in signals)
    trust_score = max(0, 100 - total_risk)
    verdict = _verdict_from_signals(trust_score, len(signals), irs_lookup)

    payload = {
        "ein": normalize_ein(cleaned_ein) if is_ein_input else cleaned_ein,
        "org_name": lookup_name,
        "trust_score": trust_score,
        "verdict": verdict,
        "signals": signals,
        "top_flag": signals[0]["flag"] if signals else None,
        "irs_lookup": irs_lookup,
    }
    payload["ai_explanation"] = _build_explanation(payload)
    return payload