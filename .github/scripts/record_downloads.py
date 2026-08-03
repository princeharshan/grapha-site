#!/usr/bin/env python3
"""Append one day's download numbers to data/downloads.csv.

Reads the GitHub releases JSON (as produced by `gh api repos/OWNER/REPO/releases
--paginate`) on stdin and records the running total across EVERY asset of EVERY
release, so the number stays cumulative when a new version ships.

The daily figure is always derived by subtracting the previous recorded total,
never by trusting that the job ran yesterday. A skipped day therefore loses no
downloads: the next row simply reports a larger `new` and says how many days it
covers. That is the whole reliability argument for this script.
"""

import csv
import json
import os
import sys
from datetime import date, datetime

CSV_PATH = os.environ.get("DOWNLOADS_CSV", "data/downloads.csv")
HEADER = ["date", "total", "new", "days_covered"]


def read_rows(path):
    if not os.path.exists(path):
        return []
    with open(path, newline="") as f:
        rows = list(csv.DictReader(f))
    return [r for r in rows if r.get("date")]


def total_from_releases(payload):
    """Sum download_count over every asset of every release."""
    return sum(
        int(asset.get("download_count", 0))
        for release in payload
        for asset in release.get("assets", [])
    )


def main():
    payload = json.load(sys.stdin)
    if not isinstance(payload, list):
        print(f"expected a list of releases, got {type(payload).__name__}", file=sys.stderr)
        return 1

    total = total_from_releases(payload)
    today = os.environ.get("RECORD_DATE") or date.today().isoformat()

    rows = read_rows(CSV_PATH)

    # A re-run on the same day replaces that day's row rather than adding a
    # second one, so a manual trigger can never double-count or split a day.
    if rows and rows[-1]["date"] == today:
        rows.pop()

    if rows:
        prev = rows[-1]
        prev_total = int(prev["total"])
        prev_date = datetime.strptime(prev["date"], "%Y-%m-%d").date()
        days = (datetime.strptime(today, "%Y-%m-%d").date() - prev_date).days
    else:
        prev_total = 0
        days = 1

    new = total - prev_total
    rows.append(
        {"date": today, "total": str(total), "new": str(new), "days_covered": str(days)}
    )

    os.makedirs(os.path.dirname(CSV_PATH) or ".", exist_ok=True)
    with open(CSV_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HEADER)
        writer.writeheader()
        writer.writerows(rows)

    print(f"{today}: total={total} new={new} days_covered={days}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
