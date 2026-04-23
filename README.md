# GiveGuard

**Real-time nonprofit fraud detection for pay-by-bank payment platforms.**

GiveGuard is a full-stack web application that verifies nonprofit organizations in real time before donation splits are assigned. Built as a fraud defense layer. Currently functional, not deployment ready yet however.

## How It Works

GiveGuard intercepts every nonprofit nomination and runs it through a three-layer verification pipeline:

### 1. Data Retrieval
Queries two public data sources in sequence:
- **ProPublica Nonprofit API** — primary source, returns organization details, NTEE codes, 990 filing history and ruling dates
- **IRS Tax Exempt Search API** — fallback when ProPublica has no record, queries the IRS EFTS index directly

### 2. Scoring Engine
Starts at a trust score of 100 and deducts risk points for each signal raised:

| Signal | Risk Points |
|---|---|
| EIN not found in IRS or ProPublica records | −35 |
| Unable to verify organization legitimacy | −25 |
| No IRS 990 filing on record | −30 |
| Organization registered less than 1 year ago | −40 |
| NTEE category mismatch with stated mission | −20 |
| Incorporated in high-risk state (DE, NV, WY) | −10 |
| Organization name contains for-profit suffix (LLC, Inc, Corp) | −25 |
| No active IRS tax-exempt status found | −20 |

### 3. Verdict Engine
| Verdict | Condition |
|---|---|
| ✓ Verified | Score ≥ 75 with zero signals |
| ⚠ Flagged | Any other result — queued for manual review |
| ⛔ Blocked | EIN exists but score < 40 with 2+ signals fired |

organizations not found in either database are **flagged**, not blocked. Database gaps are a known limitation of public data sources — automatically blocking unknown EINs would produce too many false positives against legitimate smaller nonprofits.

### 4. AI Analysis
If a Gemini API key is configured, GiveGuard generates a plain-English fraud risk explanation for every submission, summarizing the strongest signals and ending with a recommendation.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Python + FastAPI |
| Scoring | Python rules engine |
| Data | ProPublica API + IRS EFTS |
| AI | Google Gemini 2.0 Flash |
| Deployment | WIP |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+

### Running locally

Clone the repo and run the start script:
```bash
git clone https://github.com/YOUR_USERNAME/giveguard.git
cd giveguard
./start.sh
```


### Environment variables

Create a `backend/.env` file:
GEMINI_API_KEY=your_key_here   # optional — enables AI analysis

