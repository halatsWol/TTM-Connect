# TTM Connect

An MV3 browser extension (Chrome, Edge, Firefox) that connects to the **Marflow Software -
TextTemplateManager** desktop app and inserts text templates into editable fields — e.g. a Jira
comment editor — from the browser's right-click context menu.

See [PLAN.md](PLAN.md) for the full design.

## Install

- **Google Chrome / Chromium** — [Chrome Web Store](https://chrome.google.com/webstore/detail/jclopjpjdldbknjdhmjldehlkgbihlmi)
- **Microsoft Edge** — coming soon
- **Mozilla Firefox** — coming soon

## What it does

- Right-click inside any editable field → **TTM Connect** submenu mirrors your template tree.
- Clicking a template fetches its rendered content from the app and inserts it at the cursor.
- Paste mode is configurable (see settings); **Firefox only**: Ctrl+click a template to force Plaintext.

## Prerequisites

1. Install and run the **Marflow Software - TextTemplateManager** desktop app (Windows) —
   download from <https://github.com/halatsWol/TextTemplateManager/releases>.
2. In the app, enable the connector under **Settings ▸ General ▸ Browser extensions (beta)**.
3. Note the **port** (default 47615) and **token** shown there.

## Install (unpacked, for development)

### Chrome / Edge
1. Go to `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. **Load unpacked** → select this `ttm-connect/` folder.
4. Open the extension's **Options** (Details ▸ Extension options) and enter the port + token, then
   **Test connection**.

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`.
2. **Load Temporary Add-on…** → pick `manifest.json` in this folder.
3. Open the add-on's **Preferences** and enter the port + token, then **Test connection**.

   (Temporary add-ons are removed when Firefox restarts. For a persistent install, sign the package
   via AMO / `web-ext sign`.)

## Settings

| Setting | Meaning |
| --- | --- |
| **Port** | The connector port from the app. Empty by default. |
| **API token** | The `x-ttm-token` from the app. Empty by default. |
| **Default paste mode** | `App default` defers to each template's own mode; any other value is enforced for all templates. |
| **Show RTF paste warnings** | Toast shown whenever a template is pasted as RTF (web editors usually can't render RTF). |

Settings are stored per-machine in `storage.local` and persist across browser and extension updates.

## Notes & limitations

- **Ctrl+click → Plaintext** works on Firefox only. Chromium doesn't expose modifier keys to context
  menu clicks, so on Chrome/Edge a normal click always uses the configured default mode.
- **RTF** is kept as RTF and placed on the synthetic paste as `text/rtf` (with a best-effort plain
  text fallback). Most web editors ignore RTF — use **HTML/Jira** for rich web paste.
- The template menu refreshes the moment it opens on Firefox, and on Chrome/Edge when you switch back
  to the browser or change tabs — plus on install/startup and settings change. A 15-second refresh
  runs during active use, with a 1-minute wake as the idle fallback (the shortest a published MV3
  alarm allows). In normal use, new or renamed templates appear right away.

## Building store packages

The repo's `manifest.json` carries **both** background keys so the folder loads unpacked on either
engine. Packaging tailors a manifest per browser so each store gets only what it uses:

| Package | `background` | Firefox `gecko` block |
| --- | --- | --- |
| `ttm-connect-chromium-v<version>.zip` | `service_worker` | removed |
| `ttm-connect-firefox-v<version>.zip` | `scripts` (event page) | kept |

### Locally (Windows)

```powershell
./package.ps1            # both browsers -> dist/
./package.ps1 -Target firefox   # just one
```

Requires Node.js (it runs the shared manifest transform in `scripts/build.mjs`); zipping uses the
built-in `Compress-Archive`.

### In CI (GitHub Actions)

`.github/workflows/package.yml`:
- **Push a tag** `vX.Y.Z` → builds both zips, attaches them to a GitHub Release, then runs the
  store-publish jobs.
- **Run manually** (Actions ▸ Package extension ▸ Run workflow) → uploads the zips as build
  artifacts only (never publishes).

Keep the tag in sync with the `version` in `manifest.json`.

## Publishing to stores (CI)

On a tag push the workflow publishes to the Chrome Web Store, Edge Add-ons, and AMO (Firefox,
listed). Each publish job runs **only on tags** and uses a GitHub **Environment** named
`store-release` — add required reviewers under Settings ▸ Environments to gate publishing behind a
manual approval.

Add these repository secrets (Settings ▸ Secrets and variables ▸ Actions) before tagging:

| Store | Secrets |
| --- | --- |
| Chrome Web Store | `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN` |
| Edge Add-ons | `EDGE_PRODUCT_ID`, `EDGE_CLIENT_ID`, `EDGE_API_KEY` |
| Firefox / AMO | `AMO_JWT_ISSUER`, `AMO_JWT_SECRET` |

**One-time setup — the listing must exist first.** These jobs publish *updates*; the initial store
listing has to be created once by hand (it needs metadata, screenshots, and category selection the
APIs don't supply):
- **Chrome:** create the item in the Web Store dashboard to obtain `CWS_EXTENSION_ID`; generate
  OAuth credentials for the Web Store API for the other three secrets.
- **Edge:** submit once in Partner Center to get `EDGE_PRODUCT_ID`; create API credentials there.
- **Firefox:** create the listed add-on once on AMO; get the API key/secret from
  *Manage API Keys*.

Notes:
- Missing secrets make the relevant publish job fail (loudly) — the build + GitHub Release still
  succeed. Add secrets only for the stores you're ready to publish to.
- Edge publishing calls the Microsoft Edge Add-ons API v1.1 directly with `curl` (no third-party
  action) — upload → poll → publish → poll, with retries for the API's intermittent 5xx responses.
- Chrome/Edge publish the **chromium** package; Firefox submits the **firefox** package.

### Store submission

- **Chrome / Edge:** upload the chromium zip to the Chrome Web Store / Edge Add-ons dashboard.
- **Firefox:** upload the firefox zip to AMO, or sign it with `web-ext sign` (the manifest's
  `gecko.id` is set). Store any signing keys outside the repo — `.gitignore` already excludes
  `*.pem`, `*.p12`, and `web-ext-key.json`.

Ready-made listing assets (screenshots, promo tiles) live in [`store-assets/`](store-assets/).

## License

TTM Connect is licensed under the **TTM Connect License** — see [LICENSE](LICENSE).
Copyright © 2026 Marflow Software (Wolfram Halatschek).

You may use, run, copy, and modify it for free (including internally within an organization), but you
may **not** sell it or provide it to others as, or as part of, a service. For any use beyond the
license, contact Marflow Software (contact@kmarflow.com).
