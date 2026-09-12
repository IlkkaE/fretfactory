# FretFactory (Vite + React)

## Entry points

- `/` opens the FretFactory landing page and tool selector.
- `/fretboard/` opens the fretboard designer. Existing root-level `#state=...`
  share URLs are redirected there automatically.
- `/gtrfactory/` opens the packaged GTRFactory editor snapshot.

The landing page and fretboard designer share a technical manga visual language,
while the designer retains its compact, geometry-first working layout.

Both editors use companion manga workshop backgrounds from different angles of
the landing-page room: the cooler fretboard bench in FretFactory and the warmer
guitar/drafting bench in GTRFactory. Optimized WebP images sit behind dark working
surfaces; the artwork does not change editing geometry or exported files.
The refreshed GTRFactory snapshot includes the English UI, original-body overlay,
body reset, Off/10/5/1 mm body grid, corrected rear-cavity view, headstock access
from neck editing and unified **Save** with an explicit download-copy fallback.
Release evidence and deployment status are in [the workshop release ledger](docs/workshop-release.md).

The landing selector uses a shared blue/coral yin-yang visual and links to both
editors; responsive manga panels and lamp lighting respect reduced motion.

## Development

Install dependencies and start the dev server:

```
npm i
npm run dev
```

## Build

```
npm run build
```

Outputs are written to `dist/`.

Before a shared release, refresh the reviewed GTRFactory snapshot with
`npm run refresh:gtrfactory`, then run `npm run build`. The refresh validates and
hashes a unique sibling build while excluding original source and sourcemaps.

## WebMCP (experimental)

When the browser supports WebMCP, FretFactory registers four read-only tools for
AI applications:

- `get_fretboard_state`
- `list_fretboard_presets`
- `get_fretboard_preset`
- `get_export_capabilities`

The tools expose the current configuration, preset data, and export capabilities
without changing application state or starting downloads. Length values follow
the measurement unit selected in FretFactory. Browsers without WebMCP continue
to use the normal interface without errors.

For local Chrome testing, enable `chrome://flags/#enable-webmcp-testing`, restart
Chrome, and inspect the registered tools in DevTools or with
`await document.modelContext.getTools()`.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project.
2. Ensure your default branch is `main` (or update the workflow accordingly).
3. The included GitHub Actions workflow `.github/workflows/deploy-pages.yml` tests, builds, and deploys to Pages on each push to `main`.
4. In the repository settings, set Pages source to “GitHub Actions”.

Vite is configured for a custom domain served from `/`. If the application is instead published at `https://name.github.io/repository/`, change `base` in `vite.config.ts` to `/repository/` before building.

### Local test of base path

Run `npm run build` and `npm run preview` to verify the production build locally.

## Google AdSense (optional)

This app can render AdSense units if configured. We ship a minimal component `src/components/Adsense.tsx` that loads AdSense only when a publisher ID is provided.

1. Copy `.env.example` to `.env` and set:

```
VITE_GADS_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
# Optional if you use a specific slot
VITE_GADS_SLOT_ID=YYYYYYYYYY
```

2. Build or run dev. The ad block appears under the Preview on the right.

Notes:
- Ensure your domain is approved by AdSense and you comply with policies.
- Ads may not appear in dev; verify on the production URL.
