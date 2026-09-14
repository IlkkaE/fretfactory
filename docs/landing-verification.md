# Landing page correction — feature brief and verification ledger

## Three-workshop selector — 2026-09-14

IMPLEMENTED AND LOCALLY VERIFIED. The 2026-09-14 shared-release request supersedes the historical local-only boundary: WireFactory is now a native `/wirefactory/` link with “Open Wiring Designer”; direct/reload and public deployment verification belong to `docs/shared-release.md`.

| Field | Current agreement |
| --- | --- |
| Goal / confirmed decisions | Replace yin-yang with three sectors separated by a Y; add the active WireFactory `/wirefactory/` destination. Keep the workshop/manga style and English UI. This is deliberately not the four-region peace symbol. |
| Non-goals / preserved boundaries | No WireFactory editor, export, geometry or routing redesign; the reviewed existing application is packaged as a static snapshot. Existing FretFactory and GTRFactory links remain functional. |
| Allowed assumptions | Blue fretboard at left, coral guitar at right, amber wiring below. WireFactory is a native anchor to `/wirefactory/` with the CTA “Open Wiring Designer”. |
| Behaviour paths | Each card's pointer/focus highlights its sector; keyboard focus retains precedence over hover. WireFactory click/Enter opens `/wirefactory/`. Existing editor links and return routes remain unchanged. Narrow screens stack all three cards; reduced motion disables movement. |
| Files / ownership | LandingPage.tsx, landing.css, landing tests, README and this ledger. Main agent implements this bounded local change. |
| Data/API changes | None; wiring drawing is decorative, not a functional circuit or manufacturing output. |
| Sequence | Three-sector SVG and third card, responsive fit, tests/build, independent browser review, documentation. |
| Acceptance | Three distinct sectors with a Y divider and corresponding illustrations; all three English cards legible; WireFactory opens its native route; all three tool destinations work; no new runtime errors or horizontal overflow. |
| Tests / verification | Static-render regression tests and full unit/build; local browser at desktop, intermediate and narrow widths, pointer/keyboard and reduced motion. |
| Documentation / risks / open items | README describes the active three-way selector. Card fit and the native WireFactory link are checked locally. Physical devices and public deployment are separate evidence levels. |

### Historical verification — three-workshop selector before link activation

| Check | Method | Result / evidence | Validity |
| --- | --- | --- | --- |
| Full unit regression | `npm run test:run` | PASS 62/62, including three new static-render landing tests. | 2026-09-14; later change only moved a CSS annotation. |
| Final production build | `npm run build` | PASS; `index-pUNmEUkk.js`, `index-CvoVbbon.css`; existing static routes preserved. | Final source, local preview at http://127.0.0.1:4173/. |
| Independent source / responsive review | QA role; Edge screenshots at widths 1920, 1440, 1024, 901, 390 and 320 px | Source PASS; screenshots under `.cache/wire-landing-qa/`. Root visually inspected 1440/901/390/320: three sectors, readable cards, no horizontal overflow. | Local desktop browser and responsive simulation, not physical devices. |
| Final visual correction | Root inspected fresh `final-901.png` | PASS; scale annotation moved to top 21% / left 35% to avoid the new fretboard illustration. | Final CSS build. |
| Pointer / keyboard / navigation / reduced motion | Root's targeted Edge run; `.cache/wire-landing-qa/final-interactions.json` | Historical evidence: the then-disabled WireFactory control did not navigate. The current native-link and four-route checks are recorded in `docs/shared-release.md`. | 2026-09-14T07:46:16Z; final build. |
| Verification boundary | QA harness followed by root's targeted check | The independent full interaction run did not finish because its Fretboard return selector incorrectly used `.landing-wordmark`. Root completed the missing checks with `.fretboard-home-link`; this is combined evidence, not a completed independent full run. | No open application failure from this harness error. |
| Scope / publication | Git diff and request scope | Only landing component, CSS, landing tests and current documentation changed. GTR snapshot, editors, exports and existing untracked artwork retained. No commit, push or deployment. | Local-only change. |

The earlier two-workshop and yin-yang descriptions below are historical.

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
