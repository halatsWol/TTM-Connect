# TTM Connect — Implementation Plan

MV3 browser extension that connects to the **Marflow Software - TextTemplateManager** desktop app's
loopback Browser Connector API and inserts text templates into editable fields (e.g. the Jira
comment editor) from the browser's right-click context menu.

Target browsers: **Chrome, Microsoft Edge (Chromium), and Firefox** from a single codebase.

---

## 1. Locked-in design decisions

| Concern | Decision |
|---|---|
| Manifest | MV3; `background` declares both `service_worker` (Chromium) and `scripts` (Firefox — this Firefox build hasn't enabled MV3 service workers yet). Classic script, no `type:module`. |
| Menu | Native context menu (`chrome.contextMenus` / `browser.menus`), `contexts:["editable"]` |
| Menu refresh | One uniform strategy on both engines: rebuild on install/startup/save + periodic alarm. No Firefox-only `menus.onShown`. |
| Ctrl+click → Plaintext | Single shared handler reading `info.modifiers`. Works on Firefox; silently inert on Chrome/Edge (accepted restriction). |
| Insertion | Synthetic `paste` event (DataTransfer) → fallback `execCommand` → fallback `setRangeText` |
| RTF mode | Kept as RTF (no downgrade). Warn on every RTF paste; warning is dismissable via a setting. Options shows warning text when RTF is the chosen default. |
| Config store | `chrome.storage.local` (per-machine, persists across restarts/updates) |
| Defaults | `port = ""`, `token = ""`, `defaultMode = "default"`, `rtfWarnings = true` |
| Scope (v1) | Context menu only — no toolbar popup / quick-search |
| Cross-engine shim | Vendored `webextension-polyfill` so one codebase uses `browser.*` everywhere |

---

## 2. The connector API (verified against the app source)

Base: `http://127.0.0.1:<port>/`, header `x-ttm-token: <token>`, CORS pre-approved for extension origins.

- `GET /ping` → `{app, version, protocol:1}` — health/pairing.
- `GET /pastemodes` → ordered ids: `Auto, Jira, HTML, RTF, Markdown, Plaintext` (Jira label = "HTML/Jira").
- `GET /tree` → nested `{id, name, type:"folder"|"template", defaultMode?, source, children?}` — the menu.
- `GET /template?id=<guid>&mode=<mode>` → `{content, contentType, mode}`.
  `mode` = a pastemode id, or `default`/omitted to use the template's own default.

`contentType` → how to insert:

| contentType | modes | insertion |
|---|---|---|
| `text/html` | Auto / HTML / Jira | synthetic paste with `text/html` |
| `text/markdown` | Markdown | insert markdown source as text |
| `text/plain` | Plaintext | insert as plain text |
| `application/rtf` | RTF | kept as RTF; carried in the paste `DataTransfer` as `text/rtf` (+ plain-text fallback). Editors that don't accept RTF fall back to the plain text. Warning shown on each RTF paste (see §7/§5). |

**Default-mode setting → API:** options `defaultMode = "default"` sends `mode=default` (each template's
own mode wins). Any other value sends that id, enforcing it for every template. Ctrl+click (Firefox)
overrides to `Plaintext` for that one click.

---

## 3. File layout

```
ttm-connect/
  manifest.json
  src/
    browser-polyfill.js   # vendored webextension-polyfill
    background.js         # service worker: menus, click routing, API fetch
    content.js            # insertion into focused editable
    options.html
    options.js
    options.css
  icons/
    icon-16.png  icon-32.png  icon-48.png  icon-128.png   # reused from TextTemplateManager
  README.md               # load-unpacked + packaging
  PLAN.md                 # this file
```

No build step / no npm. Plain JS, load unpacked directly.

---

## 4. manifest.json

```jsonc
{
  "manifest_version": 3,
  "name": "TTM Connect",
  "version": "0.1.0",
  "description": "Insert TextTemplateManager templates into editable fields from the context menu.",
  "permissions": ["contextMenus", "storage", "scripting", "activeTab"],
  "host_permissions": ["http://127.0.0.1/*"],   // match pattern ignores port -> any configured port
  "background": { "service_worker": "src/background.js", "scripts": ["src/background.js"] },
  "options_ui": { "page": "src/options.html", "open_in_tab": true },
  "icons": { "16": "icons/icon-16.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" },
  "browser_specific_settings": { "gecko": { "id": "ttm-connect@marflow.example", "strict_min_version": "121.0" } }
}
```

Notes:
- `host_permissions: ["http://127.0.0.1/*"]` covers any port (match patterns don't match on port).
- `background` carries both keys: Chromium reads `service_worker`, Firefox reads `scripts`
  (this Firefox build rejects MV3 `service_worker`). Each engine ignores the other's key. No
  `type:module` because `background.js` uses no `import`/`export`. Chrome may log a benign
  "unrecognized key" warning for `scripts`; it still loads.
- No static `content_scripts`; the content script is injected on demand via `scripting.executeScript`
  (uses `activeTab`, stays off unrelated pages).

---

## 5. Options page

Fields (stored in `storage.local`):
- **Port** — number, default empty.
- **API token** — the `x-ttm-token`, default empty.
- **Default paste mode** — dropdown: `App default (per template)` + live list from `/pastemodes`.
  When **RTF** is selected, an inline warning block appears beneath the dropdown:
  *"RTF is a clipboard format for native apps (Word, Outlook). Most web editors (incl. Jira) can't
  render it and will fall back to plain text. Pick HTML/Jira for rich web paste."*
- **Show RTF paste warnings** — checkbox, default **on** (`rtfWarnings`). When off, the per-paste
  RTF toast (§7) is suppressed.
- **Test connection** — calls `/ping`; shows `app + version`, warns if `protocol !== 1`, and reports
  401 (bad token) / connection-refused (app not running) clearly.

On save: write `storage.local`; `storage.onChanged` in the background triggers `rebuildMenu()`.

---

## 6. Background service worker

- `getConfig()` / `saveConfig()` over `storage.local`; `baseUrl = http://127.0.0.1:${port}`.
- `api(path)` centralizes fetch + 401/403/404/connection-refused handling.
- `rebuildMenu()`:
  1. `menus.removeAll()`.
  2. If token/port empty → single item **"⚙ Configure TTM Connect…"** (opens options).
  3. Else fetch `/tree`; on failure → disabled **"⚠ Not connected — check settings"**.
  4. On success → recurse: folder ⇒ submenu parent, template ⇒ leaf `menuItemId = "tpl:<guid>"`.
- Rebuild triggers (identical on both engines): `onInstalled`, `onStartup`, `storage.onChanged`,
  periodic `chrome.alarms` while active. (Menu may be up to one alarm-interval stale — acceptable.)
- `menus.onClicked`:
  1. Ignore non-`tpl:*` ids.
  2. `mode = config.defaultMode`; **if `info.modifiers?.includes("Ctrl")` → `mode = "Plaintext"`**
     (Firefox only; `modifiers` is `undefined` on Chromium, so the line is a no-op there).
  3. `GET /template?id=<guid>&mode=<mode>`.
  4. `scripting.executeScript` into `tab.id` + `info.frameId` (so Jira iframes work), then
     `tabs.sendMessage` the `{content, contentType}` payload.

---

## 7. Content script — insertion

Receives `{content, contentType}`; inserts into `document.activeElement`:

1. Not editable → show a brief on-page notice, bail.
2. `text/html` → build `DataTransfer` (`text/html` + plain-text fallback), dispatch
   `new ClipboardEvent("paste", {clipboardData, bubbles, cancelable})`. Handles ProseMirror (Jira),
   TipTap, Slate, CKEditor natively. No clipboard permission needed.
3. `text/markdown` / `text/plain`:
   - `<input>`/`<textarea>` → `setRangeText(...)` + dispatch `input`.
   - `contenteditable` → paste event with `text/plain`.
4. Fallbacks if nothing changed → `execCommand("insertHTML"|"insertText")`.
5. `application/rtf` → put the RTF on the `DataTransfer` as `text/rtf` **plus** a plain-text fallback,
   then dispatch the paste. Editors that accept RTF use it; the rest fall back to plain text.
   Unless `rtfWarnings` is off, show a brief toast: *"Pasted as RTF — many web editors can't render
   RTF and may show plain text instead."*

The background passes `rtfWarnings` (from `storage.local`) in the message payload. The content script
decides to warn based on the **effective returned mode** (`template.mode === "RTF"`), so it also fires
for templates whose own default is RTF when the setting is `App default (per template)`.

---

## 8. Icons

Reuse the TextTemplateManager app icon (the rounded blue "TTM" tile), copied into `icons/`:

| Extension slot | Source file |
|---|---|
| icon-16 | `Assets/Square44x44Logo.targetsize-16.png` |
| icon-32 | `Assets/Square44x44Logo.targetsize-32.png` |
| icon-48 | `Assets/Square44x44Logo.targetsize-48.png` |
| icon-128 | downscaled from `Assets/Square44x44Logo.targetsize-256.png` |

---

## 9. Testing (against the running app: use the port + token shown in the desktop app's settings)

1. Chrome: `chrome://extensions` → Developer mode → Load unpacked → `ttm-connect/`.
2. Options → set port/token → **Test connection** → expect `TextTemplateManager <version> protocol 1`.
3. Right-click a `<textarea>` → tree renders as nested submenus.
4. Click a template → verify insert; try each default-mode setting.
5. Jira comment editor → insert an HTML/Jira template → verify formatting/panels survive.
6. Firefox: `about:debugging` → Load Temporary Add-on → `manifest.json`; repeat + Ctrl+click → plaintext.
7. Edge: same as Chrome; confirm Ctrl+click is inert, everything else works.

---

## 10. Packaging

- Chrome / Edge: zip folder → store upload (or internal unpacked/CRX).
- Firefox: zip → sign via AMO / `web-ext sign` (uses `gecko.id`).
