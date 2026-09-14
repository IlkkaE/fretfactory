# Four-route FretFactory, GTRFactory and WireFactory release — 2026-09-14

## FEATURE BRIEF — DESIGN READY

### Goal
Publish the existing FretFactory landing, fretboard designer, packaged GTRFactory snapshot and packaged WireFactory snapshot at `/`, `/fretboard/`, `/gtrfactory/` and `/wirefactory/`.

### Non-goals
No geometry, file-format, editor-feature, source-repository, hosting-domain or HTTPS configuration changes. The snapshots publish browser builds only; neither sibling source checkout is published.

### User-confirmed decisions
The user requested local FretFactory landing publication, approved the latest WireFactory resolver integration and requested publication of the newest local GTRFactory and WireFactory versions. The landing WireFactory card is a native `/wirefactory/` link with the CTA “Open Wiring Designer”.

### Allowed local assumptions
Both sibling applications build with Node 24.15.0 and npm 12.0.1. A snapshot manifest identifies the exact hashed source inputs and emitted artifacts. `public/` is optional in WireFactory source and is only hashed when present.

### Behaviour paths
- Landing links natively to all three tools; direct route loads and reloads work for all four static entry points.
- `refresh:gtrfactory` and `refresh:wirefactory` build to unique staging folders with their respective base paths, validate artifacts and manifests, then install a recoverable `public/<tool>` snapshot.
- Static build validates both `public` snapshots and copies both snapshots into `dist`; the Fretboard compatibility entry remains unchanged.
- WireFactory verification stays explicit: checked results permit exports, electrically stale results require another check, and unsupported analysis blocks exports.

### Changed responsibilities or files
Landing card/link/style/test; shared artifact validation and release-contract tests; WireFactory snapshot refresh script and package command; static-route preparation; generated `public/gtrfactory` and `public/wirefactory`; README and release/landing documentation.

### Preserved boundaries
Fretboard sharing, geometry and exports are unchanged. GTRFactory and WireFactory source histories, remotes and local development state are unchanged. No source maps or local absolute paths are accepted in snapshots.

### Data model and interface changes
No application-data change. A new `/wirefactory/` static route and schema-1 manifest mirror the existing GTR snapshot contract, with `/wirefactory/` asset base and source SHA-256.

### Implementation order
Verify current source evidence, update route/validator/link contracts, refresh both snapshots, build the combined static site, then conduct local and public browser/release verification.

### Acceptance criteria
All four routes return their intended static entry point on direct load and reload. Landing opens the native WireFactory link. Both manifests match emitted hashes and bases; artifacts have no source maps or local paths. WireFactory checked/stale export behaviour and newest GTRFactory behaviour are verified at their correct evidence levels.

### Tests and other verification levels
Release-contract and FretFactory unit tests, sibling app evidence, snapshot build/hash checks, combined local browser checks, GitHub Actions and public HTTPS checks are separate. Physical devices, fabrication and native dialogs are outside this release evidence.

### Documentation impact
README and landing verification now describe the active WireFactory route. This section supersedes earlier three-route release instructions; historical evidence below remains a record.

### Risks
The sibling source trees may be dirty or unborn, so manifests identify but do not replace source control. A snapshot proves bundled route artifacts, not a physical guitar circuit, fabrication result or native device behaviour. Public deployment evidence remains pending until the deploy action completes.

### Implementation authorization
The user request of 2026-09-14 explicitly authorizes publication of the local FretFactory landing, approved WireFactory version and newest local GTRFactory version.

## VERIFICATION LEDGER — current release preparation

| Check | Method | Result | Scope / validity |
| --- | --- | --- | --- |
| Fret release contracts | `npm run test:release` | PASS 9/9 | Includes both GTR and Wire bases, hash, map, local-path, missing-reference and cross-route negative cases. |
| Fret unit suite | `npm run test:run -- --reporter=dot` | PASS 62/62, 14 files | Includes native WireFactory landing-link rendering. |
| GTR snapshot | `npm run refresh:gtrfactory` | PASS | Base `/gtrfactory/`; source SHA-256 `6b2f06188c65109051dd857419d20b5e1b83bad9c5f47b5f17e1a8f02c521193`; staged snapshot installed. |
| Wire snapshot | `npm run refresh:wirefactory` | PASS | Base `/wirefactory/`; source SHA-256 `746672e73f37fb3d563a1a14b6301858b91d11f394c78380a5979cd012e074ca`; staged snapshot installed. |
| Final combined build | npm run build | PASS 5.18s; postbuild four routes | index-0XvdCVSP.js / index-DChbpwl6.css; final link cursor fix. |
| Production dependency audit | npm audit --omit=dev | PASS, zero vulnerabilities | 2026-09-14 before publication. |
| Wire active source | Full unit, build, format, Playwright | PASS 62/62 unit, 20/20 desktop/mobile E2E, build and format | Explicit check, drag preservation, stale/export gates and actual downloads. |
| GTR active source | Full unit; type/format/build; prior exact-bundle ledger | PASS 246/246 fresh unit; type/format/build PASS; existing 38/38 E2E and 18/18 artifacts retained | Fresh GTR test log tmp/release-20260914/unit.log. Extra audit E2E aggregate was lost and is not counted. Port5174 dev process prevents port-conflict test. |
| Exact source identity | Recompute each refresh script input hash | PASS both source SHA-256 values above | GTR103 inputs; Wire32 inputs. Reviewer initially used Wire config list for GTR, then retracted its false mismatch. |
| Combined local browser / downloads | Edge1440x900 and390x844; four-route smoke | PASS both viewports, each56 same-origin requests, zero app/HTTP errors, six downloads | Native Wire link, direct/reload all routes, GTR handedness/Undo, Wire checked/stale gates. PDF parsed; SVG/DXF/BOM checked. Results in WireFactory output/shared-release-local-final/results.json. |
| Visual review | Fresh local screenshots | PASS all six desktop/mobile landing/GTR/Wire images | Parent viewed actual screenshots after final build; no physical-device claim. |
| Public release | GitHub Pages and public HTTPS/browser verification | PENDING | Completed only after publication and separate public checks. |

---
# Shared FretFactory / GTRFactory release

## FEATURE BRIEF — DESIGN READY

### Goal
Publish the accepted routes on the existing GitHub Pages custom domain:
`https://www.fretfactory.fi/`, `/fretboard/`, and `/gtrfactory/`.

### Non-goals
No geometry, file-format, editor-language or editor-feature changes. No GTRFactory
source publication or Git remote. No hosting/domain/HTTPS settings changes.

### Confirmed decisions and authorization
The user confirmed the route structure and requested “varmista ja julkaise”.
Authorization covers the landing link, shared package, validation and the
necessary FretFactory commit/push/Pages deployment. It does not publish the
separate GTRFactory source repository.

### Local assumptions
GTRFactory is built with Node 24.15.0 / npm 12.0.1. FretFactory CI retains Node
22.12.0 and consumes a reviewed, tracked browser-build snapshot. Public browser
JavaScript is necessarily downloadable; original TS sources and sourcemaps are
not included. GTRFactory has no internal router requiring additional pages.

### Behaviour paths
- Landing has native links to both editors; the GTR card uses Open Guitar Designer.
- `/fretboard/` is a real static entry point with root-relative Fret assets.
- Legacy root `#state=` links still hydrate the Fret editor.
- GTR HTML, favicon, JS, CSS and lazy PDF chunk use `/gtrfactory/` URLs.
- Refresh builds into a unique staging directory, validates and hashes the
  snapshot, then installs it. A previous validated snapshot is retained in cache.
- Existing 404 fallback remains; no new GTR subroutes or overlay navigation.

### Changed responsibilities
Landing link/styles; package scripts; snapshot validation/refresh/postbuild
scripts; generated `public/gtrfactory`; CI contract-test step; current-state docs.
Earlier approved landing changes are included in this release.

### Preserved boundaries
Both applications retain their geometry, share/project formats and export
semantics. GTRFactory source files, Git history and remote configuration are
unchanged. No local reference assets or original source trees are published.

### Data and interface changes
No application data changes. New static `/gtrfactory/` path and a versioned
`release-manifest.json` identifying source-input SHA-256, build environment,
unborn revision status and emitted-file hashes; no absolute local paths.

### Implementation order
Baseline tests; link and packaging scripts; GTR subpath build; shared static
build; local browser/artifact checks; independent QA; documentation sync;
release check; Fret commit/push; Actions; separate HTTPS production verification.

### Acceptance criteria
All three entry points load directly and via landing links. GTR assets and PDF
lazy loading work under the subpath. Fret shares still hydrate. Local desktop and
mobile smoke checks exercise both editors and actual export downloads. Snapshot
hashes match, sources are excluded, Actions succeeds and live routes are checked.

### Tests and verification levels
App unit/integration suites, full GTR Edge E2E, package contract tests, type/format
checks, production dependency audits, combined static browser checks and live
HTTPS checks are separate evidence. No physical fabrication or paper-scale claim.

### Documentation impact
README describes active routes and snapshot refresh. Prior landing ledger is
historical; this ledger owns the shared release and production evidence.

### Risks and unresolved items
GTRFactory has an unborn local Git repository: the source hash identifies this
build but cannot restore its sources. No source backup/commit is implied.
The port-conflict test requires both local ports free; port 5174 was already used
by a development server, so this test was blocked without stopping that server.
Existing Fret favicon.ico 404 is cosmetic. Physical devices remain unverified.
No further user decision is required before the authorized release.

## VERIFICATION LEDGER

| Check | Method | Result | Scope / validity |
| --- | --- | --- | --- |
| Fret regression | npm run test:run | PASS 59/59, 13 files | 2026-09-12 17:09; final link and fflate patch |
| Fret production audit | npm audit --omit=dev | PASS, 0 vulnerabilities | fflate patched from 0.8.2 to 0.8.3; no major dependency upgrade |
| GTR regression | npm run test:run | PASS 204/204, 25 files | 2026-09-12 17:00; unchanged GTR sources |
| GTR full E2E | npm run test:e2e -- --workers=2 | PASS 102/102, 5.4 minutes | Desktop Edge and mobile Chromium emulation, actual export downloads |
| GTR type and formatting | npm run typecheck; npm run format:check | PASS | Unchanged GTR sources |
| GTR port conflict | npm run test:port-conflict | BLOCKED: EADDRINUSE 5174 | Existing development server PID 21152 was not stopped; not a deployed-runtime failure |
| GTR production audit | npm audit --omit=dev | PASS, 0 vulnerabilities | Same source lock used for snapshot |
| Release contracts | npm run test:release | PASS 6/6 | Hash mismatch, maps, local paths, missing/root asset URLs and stable inventory |
| GTR snapshot | npm run refresh:gtrfactory | PASS | Source SHA fc478ea502dfa88b204197cc1f85ac446339e1d865fa92c7e3ab61972d73d63a; Node 24.15.0/npm12.0.1; manifest has emitted hashes |
| Combined build/browser | npm run build and static release smoke | PASS | Local combined static build at localhost:4186; desktop 1440 and mobile 390 smoke checks produced 50 requests and 0 page errors each. Legacy root share hydration, Fret PDF single-page export, and GTR SVG/DXF/PDF downloads (including lazy PDF chunk) passed parser checks. Checked 2026-09-12. |
| Independent QA / release gate | Role review against brief and actual artifacts | VERIFIED | Public manifest and `dist/` match across five hashed files; no source disclosure; all three routes return HTTP 200 on reload; native keyboard GTR links work on desktop and mobile. Checked 2026-09-12. |
| Release gate | Independent release_check of staged scope, artifacts, docs and ledger | READY WITH WARNINGS | 2026-09-12; warnings are listed above. Five indexed snapshot artifacts retain exact SHA-256 bytes. Generated PDF template whitespace is intentional; other staged diff checks pass. |
| GitHub Actions | [Pages run 34699025507](https://github.com/IlkkaE/fretfactory/actions/runs/34699025507) for `17f152a8e0a1d56708c9de7a2b28ff5db8962d6d` | PASS | 2026-09-12; dependency audit, regression tests, release contracts, build and deploy succeeded. |
| Public HTTPS and artifact identity | Fetch all three entry points, font notice, GTR manifest and five hashed files | PASS | 2026-09-12; HTTP 200, exact manifest and SHA-256 matches; landing and fretboard use `index-vGRqp6EE.js`. |
| Production browser and downloads | Edge against https://www.fretfactory.fi; desktop 1440x900 and mobile 390x844 | PASS | 2026-09-12; 48/49 same-origin requests, zero page errors. Direct reloads, landing navigation, legacy share, Fret single-page PDF and GTR SVG/DXF/PDF downloads passed. Local evidence: `.cache/release-live/results.json`, screenshots and downloaded files. Desktop landing screenshot visually inspected. No physical-device claim. |
