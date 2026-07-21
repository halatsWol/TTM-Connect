# Firefox / AMO — listing text (TTM Connect)

Copy each block into the matching field on addons.mozilla.org (Developer Hub).
Add-on ID (already in the manifest): `ttm-connect@kmarflow.com`

---

## Name
```
TTM Connect
```

## Summary  (max 250 characters)
```
Insert your Marflow Software - TextTemplateManager templates into any editable field — Jira comments, emails, web forms — straight from the right-click menu. Requires the free TextTemplateManager desktop app (Windows).
```

## Categories
Other  (pick a second if the form allows, e.g. Web Development)

---

## Description
```
TTM Connect brings your Marflow Software - TextTemplateManager templates into the browser. Right-click inside any editable field — a Jira comment, an email, a web form, a support ticket — and insert a saved template at the cursor, with its formatting intact.

FEATURES
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app.
• Templates insert with the right formatting for the target — rich HTML (including Jira-tuned output), Markdown, plain text, or RTF.
• Choose a default paste mode for everything, or let each template use its own.
• Ctrl+click a template to paste it as plain text.
• Select text on a page and choose "Create template from selection" to save it as a new template in the app, keeping its formatting.
• The menu refreshes automatically as you add or rename templates in the app.

REQUIREMENTS
TTM Connect is a companion for the TextTemplateManager desktop app — it does nothing on its own. You need:
1. The TextTemplateManager desktop application (Windows), available here:
   https://github.com/halatsWol/TextTemplateManager
2. In the app, enable Settings > General > Browser extensions, then copy the shown port and token into this add-on's preferences and click "Test connection".

HOW IT WORKS & PRIVACY
The add-on communicates only with the desktop app running on your own computer, over a local loopback connection (127.0.0.1). Nothing is sent to the internet, no account or login is involved, and there is no analytics or tracking of any kind. Your settings stay on your device.
```

---

## Version / release notes  (v0.2.0)
```
Create templates from the browser.

• Select text on a page, then TTM Connect ▸ Create template from selection to save it as a new template in the desktop app — keeping its formatting.

Requires the free TextTemplateManager desktop app (Windows):
https://github.com/halatsWol/TextTemplateManager
```

---

## License
Custom license (All Rights Reserved) — the LICENSE file is included in the package.
Free to use and modify; may not be sold or offered as a service. Choose "Custom License" and, if a
text box is offered, paste the contents of LICENSE.

---

## Data collection (consent form)
Collects data? **No.** (Matches the manifest: `data_collection_permissions: { "required": ["none"] }`.)

---

## Source code / build tools
Answer **Yes** (a tool generates the per-browser manifest.json). Provide these build instructions
(and upload a zip of the project root: manifest.json, src/, icons/, scripts/build.mjs, package.ps1 —
excluding build/, dist/, store-assets/, node_modules/):

```
BUILD ENVIRONMENT
- Any OS (Windows, macOS, or Linux)
- Node.js 18 or newer — the only tool required
- No dependencies to install: scripts/build.mjs uses only Node's built-in modules (no npm install, no network)

WHAT THE BUILD DOES
The extension code (src/*.js, src/options.html, src/options.css) and icons/ ship verbatim — no minification, bundling, transpiling, or templating. The only generated file is manifest.json: scripts/build.mjs copies the repo's manifest.json and, for the Firefox target, sets the background key to { "scripts": ["src/background.js"] } (removing the Chrome-only "service_worker" key) while keeping everything else.

STEPS TO REPRODUCE THE SUBMITTED PACKAGE
1. From the project root, run:
       node scripts/build.mjs firefox
   This writes build/firefox/ containing the generated manifest.json plus verbatim copies of src/ and icons/.
2. Zip the CONTENTS of build/firefox/ (so manifest.json is at the archive root), using forward-slash paths:
       cd build/firefox && zip -r ../../ttm-connect-firefox.zip .
   (On Windows you can instead run: ./package.ps1 -Target firefox)

The resulting archive is content-identical to the submitted add-on.
```

---

## Notes to Reviewer  (max 3000 characters)
```
ABOUT
TTM Connect is a companion for the Windows desktop app "Marflow Software - TextTemplateManager". It inserts the user's saved text templates into editable fields on web pages (e.g. a Jira comment box) via the right-click context menu. It has no standalone function — templates come from the desktop app.

IMPORTANT — REQUIRED FOR LIVE TESTING
The add-on talks only to the desktop app, which runs a token-protected API on loopback (http://127.0.0.1:<port>). Without the app installed and running, the add-on cannot connect to anything and only shows a "Configure..." prompt.

For full testing you MUST download and run the desktop app (Windows only) from:
https://github.com/halatsWol/TextTemplateManager/releases/tag/v0.9.12-beta

FULL TEST (Windows)
1. Run the release above.
2. In the app: Settings > General > Browser extensions > enable. It shows a Port (default 47615) and a Token.
3. In this add-on's Preferences, enter the Port + Token and click "Test connection" — it should report "Connected: TextTemplateManager <version>".
4. Right-click inside any web text field (or a Jira comment editor). The "TTM Connect" submenu mirrors the app's templates. Click one — it is inserted at the cursor.
5. FIREFOX-ONLY FEATURE: Ctrl+click a template to force plain-text paste.
6. Select some text on a page, right-click > TTM Connect > "Create template from selection" — it is saved as a new template in the app and appears in the menu.

VERIFIABLE WITHOUT THE APP (e.g. on non-Windows)
- The Preferences page loads (Port, Token, default paste mode, RTF-warning toggle).
- "Test connection" with no app running reports it is unreachable (expected).
- Right-clicking a text field shows "TTM Connect > Configure...". The add-on does nothing on any page until the user clicks a template.

PERMISSIONS
- host http://127.0.0.1/*: only network access; reaches the local desktop app only. No internet host is contacted.
- scripting + activeTab: only after a template click, to inject a one-shot paste into the right-clicked tab/frame. Never on page load.
- contextMenus: the template menu. storage: local settings only. alarms: refresh the menu.

DATA & PRIVACY
No data is collected or transmitted off the device — no account, analytics, or tracking. Matches data_collection_permissions: none. The Port/Token are a local pairing secret sent only to 127.0.0.1.

CODE
All code is first-party and unminified (background.js, content.js, options.*). No remote code, no bundled third-party libraries. Build instructions are provided in the source submission.
```
