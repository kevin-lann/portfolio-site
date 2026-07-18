---
name: verify
description: Build, serve, and headlessly drive the portfolio site to verify changes at the rendered surface.
---

# Verifying portfolio-site

Astro 6 static site with React islands. Surface is the rendered page (GUI).

## Build and serve

```bash
cd portfolio-site
npm run build                      # ~2s, outputs dist/
npm run preview -- --port 4399     # serves dist/ (run in background)
```

There is no `tsc`/`@astrojs/check` installed; the build does not type-check.

## Drive headlessly

No Playwright package in the project, but browsers are cached. Install
`playwright-core` in the scratchpad and launch the cached binary:

- Executable: `/Users/kevinlan/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
  (glob `~/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/` if the version moved)
- For WebGL content pass `args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']`

## Gotchas

- `canvas.toDataURL()` on the hero WebGL canvas returns a blank buffer
  (no `preserveDrawingBuffer`); use Playwright screenshots for pixel evidence.
- `/_vercel/insights/script.js` 404s locally — Vercel Analytics, expected
  outside Vercel deployments.
- Color modes: set `data-color-mode` on `<html>` (`dark|light|summer|night`)
  and dispatch `new CustomEvent('portfolio-color-mode-change', { detail: { colorMode } })`.
- Theme colors come from CSS vars in `src/styles/global.css` (`--light`, `--bg`, `--lime`).

## Flows worth driving

- Home hero (ASCII 3D model, `AsciiModelHero.tsx`): initial render, drag on
  the canvas to rotate (mouse down/move/up), color-mode switch, viewport resize.
