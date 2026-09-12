# Landing page correction — feature brief and verification ledger

## FEATURE BRIEF — DESIGN READY

| Field | Agreement |
| --- | --- |
| Goal | Match the approved technical-manga landing composition: a screened workshop scene with tables, a three-line headline, two visible tool choices, and a coherent yin–yang selector. |
| Non-goals | No router, editor, geometry, export, dependency, or publishing change. |
| User-confirmed decisions | English copy uses “Design your dream instrument.”; Dela display type is limited to headings; FretFactory is blue, GTRFactory coral and marked In development; Japanese vertical labels remain. |
| Allowed local assumptions | Desktop composition targets 1440×900 and 1920×1080; 1366×768 may need a small vertical scroll, while smaller screens stack the cards. |
| Behaviour paths | FretFactory link opens /fretboard and returns to the landing page. GTRFactory remains a non-navigating button with visible status. Pointer and keyboard focus set the same visual active state; focusedTool takes priority over hoveredTool. Idle light opacity is 0.55; focused/hovered FretFactory uses its blue state and GTRFactory uses 0.78. Reduced-motion removes movement. |
| Changed responsibility | Landing DOM and CSS only. |
| Preserved boundaries | Existing workshop image is retained, editor routes and share-link handling are untouched, and no image replaces live UI content. |
| Data/API changes | None. |
| Implementation order | Replace selector SVG and layout; retain the single static background lamp; add workshop screening, soft tool-state lighting and responsive card layout; validate tests/build and browser render. |
| Acceptance criteria | Three-line headline fits; selector uses an S seam with correctly clipped blue/coral halves; it contains a tapered six-string fretted neck and an illustrative double-cut electric guitar; cards are fully visible in the target desktop layouts; one static background lamp remains with restrained soft lighting and no large light triangle. |
| Documentation impact | README entry-point description remains accurate; this document records the visual acceptance and validation scope. |
| Risks/open items | No blocking landing issue remains in the checked browser scope. The original PNG is retained as the source asset; runtime uses the optimized WebP (135,754 bytes versus 2,056,155 bytes for the PNG). The artwork is illustrative only; no export or physical-manufacture claim is made. |
| Implementation authorization | Current user request: “Toteuta”, following the prior six-item correction list. |

## VERIFICATION LEDGER

The initial landing checks below are the historical landing baseline. The
GTRFactory non-navigating behavior recorded there is superseded by the shared
release ledger in `docs/shared-release.md`; the guitar-asset section remains a
record of the landing artwork change.

| Check / criterion | Method | Result | Evidence and scope | Validity |
| --- | --- | --- | --- | --- |
| Type and unit regression | `npm run test:run` | PASS — 13 files, 59 tests | Existing geometry, export, unit, state and share tests passed against the final landing sources. | 2026-09-11 14:38 |
| Production build | `npm run build` | PASS | Type-checks landing JSX and produced the final WebP-referencing asset bundle. | 2026-09-11 |
| Final asset fingerprints | Inspect built asset references | PASS — `index-lO6C0dmI.js`, `index--8jhFvQW.css` | Runtime references the optimized WebP; original PNG remains retained as the source asset. | 2026-09-11 |
| Desktop and responsive render | Fresh Chromium screenshots from the preview | PASS for the checked composition | 1440×900 and 1920×1080 have no scroll; 1366×768 shows cards through y=737 with a 778px page height; 390×844 and 320×740 stack without horizontal scroll. Source/1440/1366/320 visual review found no blocking mismatch. A 720×450 CSS viewport (200% equivalent, not a claim about browser zoom controls) reflowed to 720px width with the expected vertical scroll and a three-line title. | 2026-09-11 |
| Navigation and tool state | Independent fresh Chromium interaction | PASS | FretFactory focus takes priority over GTRFactory hover and remains after pointer leave; GTRFactory click, Enter and Space remain non-navigating; FretFactory reaches the editor and returns to the landing page. | 2026-09-11 |
| Reduced motion | Browser emulation with `prefers-reduced-motion: reduce` | PASS — all sampled animation/transition/transform values were 0/none | Landing motion is disabled for the reduced-motion preference. | 2026-09-11 |
| Browser console/network notes | Fresh Chromium preview run | Warning only | `favicon.ico` returned 404 (pre-existing); GA external requests were aborted during navigation. No local application crash was observed. | 2026-09-11 |

## User-supplied guitar illustration — 2026-09-11

The selector and GTRFactory thumbnail now use `src/assets/landing-guitar.svg`,
adapted from the supplied `kitara.svg`. All 463 path definitions and group
transforms are retained. The SVG is cropped to its drawing bounds, scaled
uniformly for display, recoloured coral and rendered without white fills;
body, neck and headstock outlines are emphasized. Editor-only metadata is
removed, and only SVG groups and paths are imported. The original file is
unchanged. This remains decorative artwork, not manufacturing/export geometry.

| Check | Method | Result / evidence |
| --- | --- | --- |
| Geometry preservation | XML comparison against the supplied source | PASS: 463/463 paths; zero changed path definitions or transforms. |
| Regression suite | `npm run test:run`, 2026-09-11 14:58 | PASS: 13 files, 59 tests; later changes only adjust decorative stroke weight and image placement. |
| Production build | `npm run build` after the final image placement | PASS; imported SVG is bundled as a versioned asset. |
| Browser rendering | Fresh Chromium on localhost:4173 at 1440×900 and 390×844 | SVG loads with HTTP 200 in both shared image instances; GTR hover still sets the active state. Screenshots: `.cache/guitar-desktop.png`, `.cache/guitar-mobile.png`. |
| Console | Fresh browser run | No application exception; existing favicon.ico 404 remains. No deployment or physical-device verification performed. |
