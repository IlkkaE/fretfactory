# FretFactory repository instructions

## Project role and working style

- FretFactory is a mature side project. Favor small, compatible maintenance changes and avoid speculative rewrites.
- Before asking questions, decide whether an unanswered choice materially affects geometry, physical output, stored/shareable state, or user-visible behavior. Implement clear local changes directly; ask only consequential questions.
- Use the existing global workflow and agent roles. A separate architecture pass is normally needed only for geometry contracts, unit handling, persistent/share URL data, export formats, or a genuinely cross-cutting redesign.
- Do not assume the current branch is `main`; inspect Git state before branch-sensitive work. Do not push, merge, deploy, or publish unless the user explicitly requests it.

## Geometry and export invariants

- Treat internal geometry and SVG `viewBox` coordinates as millimetre-based. Derive any import or display scale from explicit physical dimensions and the `viewBox`, never from a filename or screen pixels.
- Keep preview/display scaling separate from the physical dimensions of SVG, PDF, and DXF exports.
- Preserve the documented multi-scale convention: string index `0` is the treble/right side, and index `strings - 1` is the bass/left side. `scaleTreble` and `scaleBass` must affect those respective sides.
- Preserve semantic manufacturing roles and explicit topology. An `open-edge-notch` runs `P1 -> P2 -> P3 -> P4`; the closing `P4 -> P1` segment is reference-only and must not become a laser/CNC cut. A body outline may be closed while the neck-pocket component remains open.
- Keep body outline, neck pocket, and alignment/reference operations distinguishable in generated artifacts.
- When changing units, audit types, state, UI, calculations, share URLs, and every affected exporter together.

## Verification

- Run focused tests while iterating. Before completing a code change, run `npm run test:run` and `npm run build` unless the change is documentation-only.
- Geometry changes require the relevant tests under `src/geom/`; unit and export changes require the relevant tests under `src/utils/` as well.
- For meaningful UI changes, inspect the running production build or preview in a browser and check the console.
- For SVG, PDF, or DXF work, inspect a freshly downloaded artifact rather than relying only on source inspection or passing tests. Verify physical dimensions, `viewBox` or page metadata, layer/path structure, and visible output as applicable.
- If the browser appears to serve old behavior after tests pass, restart Vite cleanly, reload, export again, and inspect the newest downloaded file before diagnosing the code.
- Automated checks do not prove a fabrication result. State separately what was checked in code, in the browser, in the exported file, and physically.

## Documentation and release check

- Update documentation in the same local change when behavior or a contract changes. Use `README.md` for setup and user-visible capabilities, `MULTISCALE_BEHAVIOR.md` and `docs/geometry.md` for geometry contracts, and other documentation only when it has real maintained content.
- Do not fill empty placeholder documents merely to make documentation look complete.
- Documentation may be delegated after the implementation stabilizes, but the implementing agent must verify it against the code, tests, and exported artifact behavior.
- Before a requested push, PR, merge, deployment, or release, review the actual diff, run scope-appropriate tests and build, confirm documentation consistency, and inspect affected export artifacts. Report any skipped physical or browser verification explicitly.
