"""Auditable, deterministic checks for a small curated results-framework pilot."""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

DATA = Path(__file__).parent / "data" / "indicators.json"


def load_data(path: Path = DATA) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def checks(row: dict) -> list[str]:
    flags = []
    if row.get("current_target") is None:
        flags.append("No current target / dropped")
    elif row.get("actual") is None:
        flags.append("No reported actual")
    elif row["actual"] < row["current_target"]:
        flags.append("Below current target")
    else:
        flags.append("At or above current target")
    if row.get("original_target") is not None and row.get("current_target") is not None and not math.isclose(row["original_target"], row["current_target"]):
        flags.append("Target revised")
    if row.get("kind") == "output" and row.get("level") == "PDO":
        flags.append("Review output at PDO level")
    if row.get("id") == "VN-10":
        flags.append("Non-additive subindicators")
    return flags


def source_url(project: dict, row: dict) -> str:
    return f'{project["document"]}#page={row["page"]}'


def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower())) - {"the", "of", "and", "for", "with", "at", "in", "a", "to", "what", "which", "are", "is", "by"}


def retrieve(question: str, data: dict, limit: int = 4) -> list[dict]:
    """Small transparent lexical retrieval. It is not an LLM or semantic search."""
    lower = question.lower()
    terms = tokenize(question) - {"below", "missed", "target", "targets", "revised", "revision", "dropped", "drop"}
    projects = {p["id"]: p for p in data["projects"]}
    country = next((p["country"] for p in data["projects"] if p["country"].lower() in lower), None)
    if country:
        terms -= tokenize(country)
    required_flag = ("Below current target" if "below" in lower or "missed" in lower
                     else "Target revised" if "revised" in lower or "revision" in lower
                     else "No current target / dropped" if "dropped" in lower else None)
    ranked = []
    for row in data["indicators"]:
        project = projects[row["project_id"]]
        if country and project["country"] != country:
            continue
        if required_flag and required_flag not in checks(row):
            continue
        score = 2 * len(terms & tokenize(row["name"])) + len(terms & tokenize(" ".join([row["kind"], row["note"], project["name"]])))
        if score or not terms and (country or required_flag):
            ranked.append((score, row["id"], row, project))
    ranked.sort(key=lambda item: (-item[0], item[1]))
    return [{"indicator": r, "project": p, "flags": checks(r), "url": source_url(p, r)} for _, _, r, p in ranked[:limit]]


if __name__ == "__main__":
    data = load_data()
    print(f'{len(data["projects"])} projects, {len(data["indicators"])} curated indicators')
    for row in data["indicators"]:
        print(row["id"], "; ".join(checks(row)))
