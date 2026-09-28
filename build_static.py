"""Copy the canonical data file into the GitHub Pages bundle."""
from pathlib import Path
import json

root = Path(__file__).parent
source = root / "data" / "indicators.json"
destination = root / "docs" / "data" / "indicators.json"
destination.parent.mkdir(parents=True, exist_ok=True)
data = json.loads(source.read_text(encoding="utf-8"))
destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Copied {len(data['indicators'])} indicators to {destination.relative_to(root)}")
