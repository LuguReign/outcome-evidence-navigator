# Methodology and limitations

## Purpose and scope

This is an independent demonstration of source-linked outcomes measurement review. It contains **16 manually curated indicators from two publicly disclosed health-sector Implementation Completion and Results Reports (ICRs)**. It is not a full World Bank portfolio database, a WBG Scorecard replica, an IEG evaluation, or an automated extraction accuracy study. Snapshot: September 28, 2026.

| Project | Source | Results table pages in PDF viewer |
|---|---|---|
| Viet Nam P161283, Investing and Innovating for Grassroots Health Service Delivery | [ICR](https://documents1.worldbank.org/curated/en/099122325160518502/pdf/BOSIB-58bd6bce-8a47-4e04-b90e-5630a7607702.pdf) | 46–48 |
| Argentina P163345, Supporting Effective Universal Health Coverage | [ICR](https://documents1.worldbank.org/curated/en/099120325081026335/pdf/BOSIB-3c2dccb3-2383-4446-8954-3722a6c8c545.pdf) | 42–43 |

The `#page=` fragment uses the **PDF viewer page**, which differs from the page number printed in the report. Some PDF viewers ignore the fragment; use the printed results-framework annex if so.

## Data preparation

Records were manually transcribed from the published tables and checked against the visible text of those tables. `baseline` is the revised baseline where the source supplies one, otherwise the original baseline. `original_target` is the initial end target. `current_target` is the final/revised target; it is `null` when the report says an indicator was dropped. `actual` is the reported value in the table. VN-09's actual is an earlier observation and should not be treated as a completion measure. The dataset retains the indicator level and a plain-language measurement category. Categories are author judgments for exploration, not official World Bank classifications.

The entries are a deliberately selected sample, not a random or representative sample. No aggregate country, region, or portfolio performance rate should be inferred from them. These two projects should not be compared as if their indicators shared definitions, dates, or denominators.

## Rules

The deterministic checker in `analysis.py` and its JavaScript equivalent:

1. Marks an indicator **below current target** if `actual < current_target`; at/above otherwise. This assumes higher is better for these selected rows. For an indicator where lower is better, the rule would need explicit directional metadata before use. A missing or dropped current target is never replaced with the original target.
2. Marks **target revised** where original and current target values differ. This does not assess whether the revision was justified.
3. Preserves a **non-additive subindicators** caution for VN-10, stated in the source table. The dashboard never sums the listed components.
4. Separately tags descriptive measurement types (output, service use, coverage, proxy). These are interpretive annotations, not impact estimates.

The browser lookup uses simple token overlap, with a small stopword list. It shows matching rows and source links, and does not synthesize an answer. The optional `ask.py` sends only the retrieved curated facts to a **locally running Ollama model** and asks for a cited draft. This integration is optional, not exercised in the public site, and its output requires human fact checking. It does not extract facts from new PDFs. Source links appended by the script are generated from the curated records; a model's inline citations may still be wrong.

## What this pilot does not establish

- A project-level rating from the Independent Evaluation Group (IEG) differs from a single indicator's reported actual value. Neither is interchangeable with WBG Scorecard results.
- A reported target achieved does not prove a causal effect, service quality, sustained benefit, or independent verification.
- Coverage and service counts may involve overlap, changed denominators, revised targets, and uneven data quality. Do not add beneficiaries across projects or subgroups without a compatible methodology.
- Some records use revised baselines and targets. The dashboard favors traceability over a single normalized performance percentage.
- Source PDFs may have extraction/OCR and table layout issues. The small hand-curated dataset is not a benchmark of automated extraction, NLP accuracy, or an LLM.

## Reproducibility and future work

The data file is the only source of dashboard records. Run `python -m unittest discover -s tests -v`, then `python build_static.py` and `python -m http.server 8000 -d docs` to inspect it. A production version would ingest documents from the [World Bank Documents & Reports API](https://documents.worldbank.org/en/publication/documents-reports/api) by project ID, extract table cells with confidence and page geometry, keep original/revised targets separate, obtain a double-reviewed labeled benchmark, and report precision/recall and error cases before scaling. The public site intentionally makes no accuracy claim for an extractor that has not yet been built.
