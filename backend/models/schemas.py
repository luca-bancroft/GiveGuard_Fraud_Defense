from pydantic import BaseModel
from typing import Optional

class OrgSubmission(BaseModel):
    ein: str
    org_name: str
    
class Signal(BaseModel):
    flag: str
    risk_points: int

class IRSLookup(BaseModel):
    ein_exists: bool
    active_status: str
    filing_990: bool
    ntee_code: str
    ruling_date: str

class VerifyResponse(BaseModel):
    ein: str
    org_name: str
    trust_score: int
    verdict: str
    signals: list[Signal]
    irs_lookup: IRSLookup
