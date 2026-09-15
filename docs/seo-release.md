# SEO release brief and verification ledger

## DESIGN READY — implemented locally

| Field | Approved scope |
| --- | --- |
| Goal | Improve indexability for `/`, `/fretboard/`, `/gtrfactory/`, and `/wirefactory/` without changing application behaviour, geometry, exports, shares, snapshots, or route ownership. |
| Non-goals | Analytics, ads, schema markup, new routes, generated images, and environment-specific robots rules. |
| Confirmed decisions | English copy; canonical origin `https://www.fretfactory.fi`; sitemap uses trailing slashes except root; GTRFactory and WireFactory retain their snapshot-owned HTML metadata. |
| Behaviour paths | Root renders landing metadata and accurate tool copy. Postbuild derives `/fretboard/index.html` from the root entry with its own metadata profile. `robots.txt` points crawlers to the sitemap, which lists exactly the four public routes and excludes the 404 fallback. |
| Preserved boundaries | CNAME, 404 fallback, CSP, Google Analytics snippet, asset URLs, snapshots, and static snapshot validation. |
| Authorization | User requested implementation of route-specific metadata, sitemap, robots.txt, and landing copy in the current task. |

## Verification ledger

| Check or criterion | Method | Result | What it proves | Validity |
| --- | --- | --- | --- | --- |
| Root/fretboard metadata and sitemap inventory | `npm run test:release` | PASS — 11/11 | Automated validator covers both metadata profiles, robots sitemap directive, exact four-route inventory, and 404 exclusion. | Current source checkout |
| Static build output | `npm run build` plus direct `dist` inspection | PASS | Postbuild writes root and `/fretboard/` metadata profiles, validates emitted SEO files, and preserves each entry's hashed application script. | Current local build |
| Browser/runtime | Fresh production preview and console inspection | Not run: browser automation helper exited before it could select a target window. | Rendered page, browser parsing, and console state. | Open verification boundary |
| Unit and landing-copy regression | `npm run test:run` | PASS — 14 files, 63 tests | Existing application behaviour and the updated landing workflow copy. | Current source checkout |
| Public HTTPS routes | Live HTTPS fetches of all four routes, `robots.txt`, and `sitemap.xml` | PASS — workflow `34955697280`; all four routes 200; HTTP root 301 to HTTPS | Hosting, HTTPS enforcement, redirects, and deployed route availability. | Checked 2026-09-15 |

This document records both local implementation and the public deployment evidence listed above.

## Final local release preparation — 2026-09-15

The final local release build added the exact-only snapshot canonical rule and aligned the hydrated fretboard title with its static SEO profile. `npm run test:release` passed 11/11, `npm run test:run` passed 63/63, and `npm run build` passed. The refreshed GTRFactory snapshot records public source commit `1ea5964` with source SHA-256 `0f4901030162b2aa8182cbd93367f166d04ba909b173aa588c6d5b5de5b525c8` and `sourceDirty: false`; the WireFactory snapshot records public source commit `b030f6e` with source SHA-256 `c0d78cbeadbfad130a0885ca8540389a4222b664b8f2b49532e1b67707ba8f2d` and `sourceDirty: false`. Sources are public at [IlkkaE/GTRfactory](https://github.com/IlkkaE/GTRfactory) and [IlkkaE/WireFactory](https://github.com/IlkkaE/WireFactory). Public deployment verification passed: GitHub Pages workflow `34955697280` deployed `1df48fb`, HTTPS is enforced with an approved certificate, and the canonical routes plus `robots.txt` and `sitemap.xml` are publicly reachable. Browser-console verification remains open because the local browser-automation helper exited before window selection.
