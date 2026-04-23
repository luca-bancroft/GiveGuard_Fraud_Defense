from scoring.scorer import score_submission


SEED_EINS = [
    ("53-0196605", "American Red Cross"),
    ("13-3433452", "Doctors Without Borders"),
    ("20-2370934", "Wounded Warrior Project"),
    ("58-0660607", "The Salvation Army"),
    ("99-0000001", "Dawg Nation Relief Fund LLC"),
    ("99-8887776", "Fake Charity LLC"),
]


def run_seed():
    print("Running seed submissions...\n")
    for ein, name in SEED_EINS:
        result = score_submission(ein, name)
        verdict_icon = {"verified": "✓", "flagged": "⚠", "blocked": "⛔"}.get(result["verdict"], "?")
        print(f"{verdict_icon}  {result['org_name']} ({result['ein']})")
        print(f"   Trust Score: {result['trust_score']}/100 — {result['verdict'].upper()}")
        print(f"   Data source: {result['irs_lookup'].get('source', 'unknown')}")
        print(f"   NTEE Code:   {result['irs_lookup'].get('ntee_code', 'None')}")
        if result["signals"]:
            for s in result["signals"]:
                print(f"   Signal: {s['flag']} (+{s['risk_points']})")
        else:
            print("   No signals raised")
        print()


if __name__ == "__main__":
    run_seed()