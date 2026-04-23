import re
from typing import Any
import httpx

PROPUBLICA_URL = "https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json"
IRS_URL = "https://apps.irs.gov/pub/epostcard/dl/full_data.zip"
IRS_SEARCH_URL = "https://efts.irs.gov/LATEST/search-index?q=%22{ein}%22&dateRange=custom&startDate=2000-01-01&endDate=2026-12-31&hits.hits.total.value=1&hits.hits._source.ein=true"
EIN_PATTERN = re.compile(r"^\d{2}-?\d{7}$")


def normalize_ein(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def looks_like_ein(value: str) -> bool:
    if not value:
        return False
    return bool(EIN_PATTERN.match(value.strip()))


def fetch_propublica_organization(ein: str) -> dict[str, Any] | None:
    normalized = normalize_ein(ein)
    if len(normalized) != 9:
        return None
    url = PROPUBLICA_URL.format(ein=normalized)
    try:
        resp = httpx.get(url, timeout=12.0)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        payload = resp.json()
        org = payload.get("organization")
        if not isinstance(org, dict):
            return None
        filings = payload.get("filings_with_data") or payload.get("filings_without_data") or []
        if filings:
            org["filings_with_data"] = payload.get("filings_with_data") or []
            org["filings_without_data"] = payload.get("filings_without_data") or []
        return org
    except Exception:
        return None


def fetch_irs_organization(ein: str) -> dict[str, Any] | None:
    normalized = normalize_ein(ein)
    if len(normalized) != 9:
        return None
    formatted = f"{normalized[:2]}-{normalized[2:]}"
    url = f"https://efts.irs.gov/LATEST/search-index?q=%22{formatted}%22&hits.hits._source=true"
    try:
        resp = httpx.get(url, timeout=12.0, headers={"User-Agent": "GiveGuard/1.0"})
        resp.raise_for_status()
        data = resp.json()
        hits = (data.get("hits") or {}).get("hits") or []
        if not hits:
            return None
        source = hits[0].get("_source") or {}
        if not source:
            return None
        return {
            "ein": normalized,
            "name": source.get("organization_name") or source.get("legal_name"),
            "status": source.get("organization_status") or "Active",
            "ntee_code": source.get("ntee_cd"),
            "ruling_date": source.get("ruling_date"),
            "state": source.get("state") or source.get("state_cd"),
            "filing_990": bool(source.get("form_type")),
            "source": "irs",
        }
    except Exception:
        return None


def fetch_organization(ein: str) -> tuple[dict[str, Any] | None, str]:
    org = fetch_propublica_organization(ein)
    if org:
        org["source"] = "propublica"
        return org, "propublica"
    org = fetch_irs_organization(ein)
    if org:
        return org, "irs"
    return None, "none"