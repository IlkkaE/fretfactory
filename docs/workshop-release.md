# Workshop backgrounds and current GTRFactory release — 2026-09-12

## FEATURE BRIEF — IMPLEMENTED, publication authorized

### Goal
Use the approved two same-room workshop images in the FretFactory and GTRFactory editors and publish the current applications at the existing www.fretfactory.fi entry points.

### Non-goals
No landing redesign, font/layout changes, new animation, geometry/export changes, cavity rotation, hosting changes or publication of the separate GTRFactory TypeScript repository.

### Confirmed decisions
The user requested: “Julkaise muutokset ja laita taustakuvat fretfactoryyn ja GTRfactoryyn. Julkaise muutokset sivustolle.” This supersedes the earlier publication hold. Include the already implemented English GTR UI, five editor improvements and unified Save workflow, as well as the new backgrounds.

### Allowed local assumptions
Preserve the approved images as originals; use optimized WebP copies in the site. Fret uses the cooler fretboard bench; GTR uses the warmer guitar/drafting bench. Dark overlays and translucent GTR canvas surfaces preserve legibility. Original PNGs and image prompts remain local rather than being added to the release commit.

### Behaviour paths
Landing links and direct/reloaded /fretboard/ and /gtrfactory/ entries still work. Each editor loads its own image. Backgrounds do not intercept pointer input or change geometry, layout, project data or exports. Fret legacy share URLs continue working. GTR Save prompts for a name and either overwrites a session-bound supported file or clearly downloads a new copy. GTR lazy PDF export stays under /gtrfactory/.

### Changed responsibilities and files
Fret src/styles/ui.css and public/img/fretfactory-workshop-background-v1.webp; GTR src/styles.css and src/assets/gtrfactory-workshop-background-v1.webp; generated public/gtrfactory snapshot and manifest; current README/release documentation.

### Preserved boundaries
Canonical millimetre geometry, v9 project schema, export roles and editor controls retain their previously verified behaviour. GTR source Git remains local/unborn. Fret's existing main-branch GitHub Actions deployment is the only publishing route; no domain or security configuration changes.

### Data/API changes
None. CSS references the GTR image as a Vite-managed asset so subpath builds rewrite its URL. The existing release manifest hashes all emitted GTR files, including the background.

### Implementation order
Inspect approved assets and current deployment → optimize/apply backgrounds → tests and GTR snapshot refresh → combined build → independent browser/artifact QA → documentation → independent release gate → Fret commit/push → GitHub Pages deployment → public HTTPS/browser verification.

### Acceptance criteria
Both backgrounds are recognizable and text/geometry remain readable at desktop and narrow widths. No new console or failed asset requests. Existing landing, editor operations, Save and exports work from the shared route structure. Snapshot hashes match and contain no source maps/local source paths. Final public routes and background assets are verified separately from local checks.

### Tests and verification levels
Fret unit suite and six release contracts; GTR unit suite; production builds; independent desktop/mobile browser checks including actual saved/exported artifacts. Reuse still-valid prior Save/editor regression evidence where implementation is unchanged. Public deployment, physical devices and native OS dialogs are separate evidence levels.

### Documentation impact
README files describe the new editor backgrounds and release notes supersede the historical publication hold. Prior ledgers remain historical.

### Risks
Busy artwork could reduce contrast; desktop/mobile visual QA is required. The GTR source tree is unborn and is not backed up by publishing the compiled snapshot. Native file-picker UI, physical devices and fabrication are not verified by browser automation.

### Unresolved items
No user choice required. Deployment and public verification remain pending until the release gate passes.

### Implementation authorization
The current user request authorizes this scoped implementation and the necessary FretFactory commit/push/Pages deployment. It does not authorize publishing the separate GTR source repository.

## VERIFICATION LEDGER — pre-release capture

| Check | Command or method | Result | Scope and validity |
| --- | --- | --- | --- |
| GTR units | `npm run test:run -- --reporter=json --outputFile=tmp/workshop-unit.json` in GTRFactory | PASS 222/222 | 2026-09-12; final background CSS and current editor source |
| Fret units | `npm run test:run` | PASS 59/59 | 2026-09-12; final Fret source |
| Static release contract | `npm run test:release` | PASS 6/6 | Hash integrity, subpath URLs, no maps/local source paths |
| GTR snapshot build | `npm run refresh:gtrfactory` | PASS; source SHA-256 `1b78ef0eb648ae825c3794b31d473f225b72d671975ad0704e06e2b6b3c9692c`; 6 hashed files | Node 24.15.0/npm 12.0.1; previous snapshot retained in ignored cache; GTR source remains unborn |
| Combined build | `npm run build` including static route preparation | PASS; Fret `index-CLpRIHdx.js`; GTR `index-CGdv_KPt.js` | Final combined dist; GTR background `gtrfactory-workshop-background-v1-Bp2CYewL.webp` |
| Formatting / dependencies | GTR `npm run format:check`; Fret `npm audit --omit=dev` | PASS; 0 production vulnerabilities | Dependencies unchanged |
| Reused Save evidence | Previous local GTR FEATURE_BRIEF and tmp/save-workflow-verification reports | 222 unit tests; final 24/24 targeted Save/regression tests plus 112 unchanged prior full-run passes | Save logic unchanged by this CSS-only source change; not a fresh single 122/122 E2E run. Real OPFS changed-byte readback and downloaded v9 JSON were separately verified. Native OS dialog unverified. |
| Independent combined browser QA | `.cache/workshop-qa.cjs`, `.cache/workshop-qa/results.json`; Edge 1440x900 and 390x844 | PASS both sizes: correct background assets, landing links, direct reloads, named Save copy and explicit fallback warning, Fret PDF and GTR SVG/PDF downloads including lazy PDF route | Final combined preview on 4186. No page errors or non-favicon failed assets; pre-existing favicon.ico 404 remains cosmetic. The stale historical smoke expectation `My guitar` was replaced only in the scoped scratch check by the authorized unnamed default. |
| Visual QA | Desktop and mobile screenshots under `.cache/workshop-qa/` | Both workshop views visible; controls and geometry legible; no layout changes | Local screenshot evidence; no physical-device or fabrication claim |
| Release boundary | Staged file inspection and `git diff --cached --check` | PASS: intended 13 files only, original PNG/output excluded | GTR source repository not committed or published; only compiled snapshot included |
| Independent release gate | release_check role, reviewed final staged scope and evidence | READY WITH WARNINGS | No blockers. GTR source remains local/unborn; native OS dialog, physical devices and fabrication unverified; old favicon.ico 404 cosmetic. Six staged artifact SHA-256 values exactly match manifest. |
| GitHub Pages deployment | Existing main-push workflow | Pending at this pre-release capture | API confirms `www.fretfactory.fi`, workflow-based hosting; no settings changes. Actual run result is verified after this commit and reported with the delivery. |
| Public HTTPS/browser | Live routes, emitted images and manifest hashes | Pending at this pre-release capture | Local success is not production evidence. Post-deploy evidence is retained in ignored `.cache/workshop-live/` and reported separately. |

## Current release capture — 2026-09-12

The landing hero copy was reduced by removing “Precision guitar-design tools for the workshop, from the fretboard outward.” The refreshed six-file GTRFactory snapshot includes the verified open Neck pocket export and direct `potero-v1` profile replacement. This section records pre-release evidence only; deployment and public HTTPS verification remain pending until the release action completes.

| Check | Result | Scope and validity |
| --- | --- | --- |
| Fret regression and release contract | PASS 59/59; `test:release` 6/6 | Current Fret source; local checks |
| Fret build and production audit | PASS; `index-BS4Bchro.js`; 0 production vulnerabilities | Current local build/dependency audit |
| GTR snapshot refresh | PASS; source SHA-256 `b720adf3c4ce83271409da76e06c96799e4e10dbce96898bb11bb56805e132dc`; six snapshot files | Snapshot build; GTR source remains unborn/local |
| Combined browser QA | PASS at 1440×900 and 390×844 | Routes, reload, landing links, no intro paragraph, actual Neck pocket/back exports, console/assets/overflow; known favicon 404 is cosmetic |
| Artifact parity | PASS | Six snapshot hashes match; Neck pocket SVG and Back SVG byte-identical to prior verified artifacts; PDF page/dimensions match prior tested output |
| Release boundary | AUTHORIZED, not yet completed | Commit/push/deploy are authorized for this release, but no deployed/public success is claimed in this capture |

## Neck pocket template correction — 2026-09-13 pre-release capture

The user approved publishing the corrected Neck pocket export. The GTR snapshot now uses the same upper-body template contour as the editor: one closed `CUT_OUTER` perimeter containing the neck-entry notch, with no transverse mouth-closing segment and no duplicate `ROUTE_NECK_POCKET`. Optional centreline annotations remain separate. Other geometry and the `potero-v1` replacement are unchanged. Earlier open-U-only descriptions above are historical.

| Check | Result | Evidence / boundary |
|---|---|---|
| GTR implementation | PASS 227/227 unit, 28/28 focused export, 8/8 focused export E2E; build/format PASS | Reused unchanged source evidence from GTR `FEATURE_BRIEF.md`; no new full E2E claim |
| Fret regression / release contract | PASS 59/59 and 6/6; build PASS; production audit 0 vulnerabilities | Current combined build |
| Snapshot | Six hashed files; source SHA-256 `8acaed610fdd5bdfa1559d14aea3572fef6a38a6effdf54afadc93ea4a141c79` | Main bundle `index-D74vUZuv.js`; lazy PDF `pdf-DX4BcTem.js`; only compiled GTR snapshot is published |
| Combined browser/artifact check | PASS desktop 1440×900 and mobile 390×844 | `.cache/pocket-release-local/results.json`: all six snapshot hashes verified; root/fretboard/GTR routes and reloads pass; downloaded pocket SVG/DXF match approved artifacts byte-for-byte, PDF render and page dimensions match; Back SVG unchanged; no console/page/asset errors except the excluded known favicon.ico 404. Poppler's known Symbol-font warning did not prevent rendering. Public checks remain separate. |
| Deployment | Authorized, not yet completed | Existing main-push GitHub Pages workflow; final receipt will be stored in ignored `.cache/pocket-release-live/` |

GTR source remains local/unborn. Physical paper scale, fabrication, third-party CAD import and native file-picker dialogs are not proven by this deployment. The prior snapshot is recoverable under `.cache/gtrfactory-release-cdtExE/previous-snapshot`.
