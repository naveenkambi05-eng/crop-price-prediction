from __future__ import annotations

import argparse
import time
from datetime import datetime

from pipeline.run_once import run_once


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Simple loop-based scheduler for market pipeline.")
    parser.add_argument("--interval-minutes", type=int, default=60, help="Run pipeline every N minutes.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    interval_seconds = max(1, args.interval_minutes) * 60

    while True:
        print(f"\n[{datetime.utcnow().isoformat()}Z] Starting pipeline cycle...")
        try:
            run_once()
        except Exception as exc:  # noqa: BLE001
            print(f"Pipeline failed: {exc}")
        print(f"Sleeping for {args.interval_minutes} minute(s)...")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()

