# Ape War Site

## Project Structure
- `/` - Unity WebGL game (NEW build - OW Build, index.html)
- `/v1` - Previous build (Chimp War build)
- `/info` - Info/landing page (index.html, styles.css, script.js)
- `/Build` - New Unity build files (OW Build, compressed .unityweb)
- `/Chimp War/Build` - Old Unity build files (compressed .unityweb)
- `/assets` - Images, videos, icons

## URLs
- `apewar.io` → New Game (OW Build)
- `apewar.io/v1` → Old Game (Chimp War build)
- `apewar.io/info` → Info/Landing page

## Hosting
- **Vercel** (GitHub integration)
- Large data files were previously hosted on **GitHub Releases** via Cloudflare Worker proxy, but the current OW Build data file is small enough (5.3MB) to serve directly from the repo
  - Old build: `assets-v12` release → `ChimpWar.data.unityweb` (still proxied)

## Unity WebGL Build
- Files use Brotli compression (.unityweb)
- `vercel.json` sets Content-Encoding: br headers
- Data files proxied through Cloudflare Worker for CORS

## Uploading a New OW Build

When the user provides a new `OW Build` folder, follow these steps:

1. **Copy Build/ files** — All 4 files (`.data.unityweb`, `.framework.js.unityweb`, `.loader.js`, `.wasm.unityweb`) into `Build/`. Delete any old files not in the new build (e.g., `.symbols.json.unityweb`).
2. **Update StreamingAssets/aa/** — Copy `catalog.bin` and `catalog.hash`. The map bundles in `WebGL/` have content hashes in their filenames — delete the old ones and copy the new ones. The 2 small bundles (monoscripts, unitybuiltinassets) rarely change; only replace if hashes differ.
3. **Update index.html** — Copy the new `index.html` from the build, then restore site-specific customizations:
   - Favicon links: `<link rel="icon" type="image/x-icon" href="/favicon.ico">`, `<link rel="icon" type="image/png" href="/favicon.png">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
   - Bump `buildVersion` (cache buster) to the next version number
   - **Make asset paths absolute** — Unity's template uses relative paths which break under party URL routing (e.g. `/Y1519/`). Change: `var buildUrl = "Build"` → `"/Build"`, `streamingAssetsUrl: "StreamingAssets"` → `"/StreamingAssets"`, and any `url('loader-bg.jpg')` → `url('/loader-bg.jpg')`
4. **Copy other assets** — `logo.jpg`, `loader-bg.jpg`, `patchnotes.md`, `TemplateData/`
5. **Commit and push** — Stage all changes, commit with message like "Update to latest OW Build (date)", and `git push` to trigger Vercel deploy

**Important notes:**
- The new build's `index.html` may contain JS improvements (e.g., keyboard input handling) — always use the new build's version as the base and patch in site customizations, not the other way around
- Old map bundles MUST be deleted (different content hash = different filename), otherwise stale files accumulate
- The `.unityweb` files use brotli compression — `vercel.json` headers are set for `Content-Encoding: br`

## Key Files
- `index.html` - New game loader (OW Build)
- `v1/index.html` - Old game loader (Chimp War)
- `info/index.html` - Landing page
- `logo.jpg` - New build loading screen logo
- `loader-bg.jpg` - New build loading screen background
- `Chimp War/logo.png` - Old build loading screen logo
- `Chimp War/loader-bg.jpg` - Old build loading screen background
- `worker/index.js` - Cloudflare Worker for data file CORS proxy (handles both builds)
- `vercel.json` - Vercel headers for .unityweb files + SPA rewrite for party URL routing
