# Outcome Evidence Navigator

An independent, source-linked pilot for reviewing reported development results in publicly disclosed World Bank project completion reports. [Live dashboard](https://lugureign.github.io/outcome-evidence-navigator/).

**Current scope:** 16 hand-curated health indicators from two ICRs (Viet Nam P161283 and Argentina P163345). The browser app filters indicators, checks their reported current targets, highlights revisions and reporting cautions, and retrieves relevant records by keyword. Every indicator links to the PDF page. This is a demonstration, not a portfolio-wide assessment or an automated PDF extractor.

## Run locally

Python 3.10+; no packages required for the deterministic checks or the static dashboard.

```bash
python -m unittest discover -s tests -v
python analysis.py
python build_static.py
python -m http.server 8000 -d docs
```

Open `http://localhost:8000`. Do not open the HTML as `file://`, because the browser loads a JSON file with `fetch`.

### Optional local LLM draft

Install [Ollama](https://ollama.com/), download a model such as `ollama pull llama3.2`, and run it locally. Then:

```bash
python ask.py "Which hypertension indicators were below target?" --model llama3.2
```

The command retrieves at most four curated records using lexical overlap, sends their facts to the **local** model, and prints a draft plus fixed source links. It has no cloud API key, is not used by the public dashboard, and cannot assess reports outside this pilot. Review generated claims and citations against the PDFs.

## Files

- `data/indicators.json`: curated records and report metadata.
- `analysis.py`: deterministic flags and transparent retrieval.
- `ask.py`: optional local LLM drafting over retrieved facts.
- `docs/`: GitHub Pages application and synchronized JSON copy.
- `METHODOLOGY.md`: definitions, assumptions, limitations, and scaling path.

The data and app are linked to [official report PDFs](https://documents.worldbank.org/). See [methodology](METHODOLOGY.md) for exact sources and pages. This is an independent project and is not affiliated with, endorsed by, or a product of the World Bank Group.

Companion project: [World Bank project outcomes dashboard](https://github.com/LuguReign/world-bank-outcomes), which analyzes historical IEG ratings. Those ratings are conceptually separate from the indicator records here.
