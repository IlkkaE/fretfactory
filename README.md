# FretFactory (Vite + React)

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
