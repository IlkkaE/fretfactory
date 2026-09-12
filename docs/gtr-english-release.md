# GTRFactory English-language release — 2026-09-12

> Update, 2026-09-12: the user subsequently authorized publication together with
> the two editor workshop backgrounds. The current reviewed snapshot includes
> this English UI, later editor tools and unified Save. The local-only wording
> and ledger below are historical; [workshop-release.md](workshop-release.md)
> owns the new authorization and actual deployment evidence. The separate GTR
> source repository remains local/unborn and is not published by this release.

## FEATURE BRIEF — IMPLEMENTED LOCAL ONLY

- **Goal:** Translate GTRFactory's user-facing interface and export text into English and verify the local version. Publication is on hold following the user's subsequent instruction.
- **Non-goals:** No language switch, localization framework, restyling, geometry changes, new features, format migrations or publication of the separate GTRFactory source repository.
- **Confirmed decisions:** The user requested the English implementation, then explicitly changed the delivery boundary: “Ei tehdä vielä julkaisua.” The implementation is therefore local-only; publication remains separately gated.
- **Allowed assumptions:** English-only interface, `html lang=en`, English names for new projects; established guitar-building terminology.
- **Behaviour paths:** Startup/reload, all selection and editing tools, File/New/Open/Save, confirmations, diagnostics, reference import, neck/headstock/pickup/cavity tools, export options and human-readable SVG/DXF/PDF text. Existing user-entered and loaded project names remain untouched.
- **Changed responsibilities:** GTRFactory HTML, user-facing source strings and corresponding tests; GTRFactory README/FEATURE_BRIEF; and this FretFactory release ledger. The generated FretFactory `public/gtrfactory` snapshot is explicitly excluded until publication is authorized.
- **Preserved boundaries:** V9 schema, identifiers, units, canonical geometry, numeric values, vendor code, export role/layer identifiers and stored user content. FretFactory landing and fretboard editor remain unchanged.
- **Data/API changes:** None; only display strings and the new-project default name change.
- **Implementation order:** Architect brief; translation and tests; source comparison and independent QA; documentation; local preview. Snapshot refresh, release gate, commit/push/Pages and live verification are deferred until separately authorized.
- **Acceptance criteria:** All application-owned user-facing text is English, including accessibility and errors. User content survives. Manufacturing geometry remains unchanged. The local desktop/mobile-size UI and actual exports work. The existing public snapshot is not changed.
- **Verification levels:** Source and compiled-string audit; type/format/unit tests; local Edge E2E and downloaded artifacts. Combined static release, public HTTPS and hashes are deferred with publication. Physical devices and physical print/fabrication are not covered.
- **Documentation impact:** Current README control names match the English UI; historical verification stays historical. The GTRFactory FEATURE_BRIEF and this ledger record the new evidence.
- **Risks:** Missed ASCII Finnish strings, longer text on narrow screens, export-label layout and text-based test selectors. GTR source remains unborn/uncommitted; an ignored pre-change copy supports this comparison but is not a source-control backup.
- **Unresolved items:** No user decision is needed. The port-conflict test cannot run while the existing user development server occupies port 5174; do not stop it for this language-only change.
- **Implementation authority:** Local GTR source translation and verification remain authorized. The user's follow-up “Ei tehdä vielä julkaisua” withdraws publication authority. Do not commit, push, refresh the tracked public snapshot or deploy this change until separately authorized.

## VERIFICATION LEDGER

| Check | Method | Result | Scope and validity |
| --- | --- | --- | --- |
| Baseline | Exact pre-change source/test/document copy; Fret Git status | PASS | Fret main `61bc3ce`; GTR source unchanged at capture, no Git commits/remotes added. Comparison copy `.cache/gtr-english-before-20260912`. |
| GTR regression | npm run test:run -- --reporter=json --outputFile=tmp/english-unit.json | PASS 209/209 | Final source, 2026-09-12. Includes five new language tests, saved Finnish name preservation, English import errors and decoded PDF labels. |
| Types, build, formatting | npm run typecheck; npm run build; npm run format:check | PASS | Final build `index-BAXcERj7.js`, lazy `pdf-bIP_sEFD.js`. Build includes type checking. |
| Full GTR E2E | `PLAYWRIGHT_JSON_OUTPUT_NAME=tmp/english-e2e.json node node_modules/@playwright/test/cli.js test --workers=2 --max-failures=3 --reporter=list,json` | PASS 102/102, exit 0 | 2026-09-12; final build served from local preview 4174, desktop/mobile paths. |
| Source scope | Baseline AST comparison and JSON deep equality | PASS with reviewed UI-only exception | No non-text AST differences except NeckWorkspace's four local tab keys and matching whitespace-free ID/ARIA references. Headstock JSON changes only two display names; coordinates and canonical IDs are identical. Vendor, package and lock files are unchanged. |
| Downloaded manufacturing artifacts | Compare downloaded desktop headstock SVG/DXF to the previous Finnish release; decode downloaded PDF | PASS | SVG path/circle tags identical; DXF byte-for-byte identical. PDF has Headstock, Guitar dimensions and Tuner hole diameter, with mm/in values and one page. No physical print/fabrication claim. |
| Historical correction rounds | Worker recovery, type checking and test reports | RECORDED | Rejected word-level pass was fully restored and baseline equality verified before exact text patches. Initial unit run 177/209 and next 202/209 had obsolete Finnish assertions; final 209/209 passes. Early E2E runs were interrupted or stopped for obsolete composite/regex selectors, not accepted as green. Latest affected-path retry passed 6/6 desktop/mobile before the final short-fragment edits. |
| Independent QA | Source, browser and export checks | VERIFIED | Fresh final production preview at desktop 1440×900 and mobile 390×844; English UI/export paths, no horizontal overflow, console/page errors 0, and downloaded PDF checked. Separate from worker evidence. |
| Fret regression | npm run test:run; npm run test:release | PASS 59/59 and 6/6 | 2026-09-12 18:29; Fret application sources unchanged. |
| Publication | User follow-up | NOT AUTHORIZED | No snapshot refresh, commit, push or deployment for this language change. Existing production is unchanged. |
