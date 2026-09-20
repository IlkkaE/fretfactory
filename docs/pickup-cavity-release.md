# Editable pickup cavities — release capture, 2026-09-20

Status at this pre-deployment capture: local verification complete; deployment and public verification follow the authorized main push. The final public verification receipt is recorded in GTRFactory FEATURE_BRIEF.md.

This scoped release updates the GTRFactory snapshot at `/gtrfactory/`. Selecting a pickup cavity exposes Angle, Width and Length. Dimensions describe the local outer contour before rotation; the complete profile, including mounting ears and corner curves, scales together. The centre remains on the instrument centreline. Modified profiles are marked `(custom)`. Canvas, placement checks and SVG/DXF/PDF use the same transformed contour, with pickup dimensions and angle in the optional measurement table.

Project v12 records these values. Supported v10/v11 projects receive their profile defaults on opening; old geometry, including the Tele profile's 17-degree default, is retained. Invalid transformations are rejected without replacing the accepted document. The landing heading is also shortened to “Design your guitar”, removing “from fretboard to wiring.” No FretFactory or WireFactory instrument-design behaviour, hosting configuration or dependencies are changed.

The user authorized implementation and publication on 20 September 2026: “Suunnittele ominaisuus, jolla mikrofonikolon kulmaa voi muuttaa yhdellä parametrilla. 2. mikrofonikolon leveys ja pituusmittoja voi muuttaa. Julkaise muutokset, jos devaamisessa ei tule ongelmia.” The GTRFactory FEATURE_BRIEF.md owns the feature specification and source verification ledger.

The user additionally authorized committing, pushing and verifying the existing local landing-heading correction. The normal FretFactory checkout also contains unrelated untracked image/output files, which remain excluded. This release is prepared from clean `origin/main` (`db981584a0fff233783d7c02a8e57d1958123dbc`) in an isolated `codex/pickup-shape-release` worktree. Only `public/gtrfactory/`, the two `LandingPage.tsx` / `LandingPage.test.ts` headline changes and this release record belong to the site change.

## Verification ledger

| Check | Method | Result / evidence boundary |
|---|---|---|
| Source implementation | GTRFactory feature ledger and independent QA | VERIFIED: 253/253 unit/integration, 136/136 full E2E before scoped label fix, 45/45 unit and 16/16 pickup E2E after fix; independent geometry and artifact audits each 6/6 |
| Site regression | `npm run test:run` | PASS; 20 September final candidate, unit 63/63, release contract 11/11, build + postbuild exit 0 |
| Static release contract | `npm run test:release` | PASS; 20 September final candidate, unit 63/63, release contract 11/11, build + postbuild exit 0 |
| Shared production build | `npm run build` including postbuild route preparation | PASS; 20 September final candidate, unit 63/63, release contract 11/11, build + postbuild exit 0 |
| Production dependencies | `npm audit --omit=dev --json` | PASS, zero production vulnerabilities; clean site base, dependencies unchanged |
| Snapshot generation | `npm run refresh:gtrfactory -- C:\Programming\GTRfactory` | PASS: clean source 8199cfd4b203feb850ba4079142b15e598d70c17; sourceSha256 1e96983f735ca07dbc17dc69baab2683818305e8edfc819a1c14ee4f9049c8dd; all six files exactly match the browser-tested candidate; only manifest revision/dirty/time changed. |
| Shared local browser | Desktop and narrow Chromium/Edge simulation, real project and SVG/DXF/PDF downloads | PASS: exact landing headline, linked JS excludes old phrase, GTR navigation/reload, custom 8 degrees / 80 x 30 mm, v12 save and six downloads; existing root favicon.ico 404 warning only. |
| Publication gate | Independent release_check on actual source/site diff and evidence | READY WITH WARNINGS: existing favicon 404 only, disclosed; clean-source hash parity required and passed. |
| GitHub Pages | Existing main-push workflow | Pending; no deployment claimed |
| Public verification | HTTPS manifest and all emitted asset hashes, browser actions and actual downloads | Pending; local checks do not prove public success |

Physical fabrication, physical paper scale, native OS file-picker dialogs, external CAD software and physical mobile devices are outside this verification. Named pickup profiles provide a design starting point; custom scaling is not a hardware-fit certification.
