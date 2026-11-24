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
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app. Folders carry a folder icon and templates a document icon, so you can tell them apart at a glance.
• Open the menu with a right-click, the keyboard context-menu key, or Shift+F10.
• Templates insert with the right formatting for the target — rich HTML (including Jira-tuned output), Markdown, plain text, or RTF.
• Choose a default paste mode for everything, or let each template use its own.
• Ctrl+click a template to paste it as plain text.
• Multi-language templates: a template kept in several languages opens as a submenu — pick the language to insert, with its default listed first.
• Select text on a page and choose "Create template from selection" to save it as a new template in the app, keeping its formatting.
• Choose "Save selection as language of…" to add a selection to an existing template as another language — pick the language, or let it be detected from the text. The template's default text is never changed.
• The menu refreshes automatically as you add or rename templates in the app.

REQUIREMENTS
TTM Connect is a companion for the TextTemplateManager desktop app — it does nothing on its own. You need:
1. The TextTemplateManager desktop application (Windows), from the Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or GitHub (https://github.com/halatsWol/TextTemplateManager-v2). Documentation: https://software.kmarflow.com/TextTemplateManager-v2/
2. In the app, enable Settings > General > Browser extensions, then copy the shown port and token into this add-on's preferences and click "Test connection".
Multi-language templates and "Save selection as language of…" need TextTemplateManager 2.8 or newer; everything else also works with older versions.

HOW IT WORKS & PRIVACY
The add-on communicates only with the desktop app running on your own computer, over a local loopback connection (127.0.0.1). Nothing is sent to the internet, no account or login is involved, and there is no analytics or tracking of any kind. Your settings stay on your device.

Why "access your data for all websites"? When the menu is opened with the keyboard (Shift+F10), Firefox doesn't tell an add-on which field it belongs to. A small script on each page therefore notes the editable field the context menu was opened on, so the template lands in the right place. It reads no page content, stores nothing, and sends nothing anywhere.
```

---

## Screenshots and captions  (max 280 characters each)
Upload in this order from `store-assets/screenshots/`.

`01-settings.png`
```
Pair once: enter the port and token from the TextTemplateManager desktop app and click Test connection. The status shows when multi-language templates are available.
```

`02-menu.png`
```
Right-click any editable field to reach your templates. A multi-language template opens as a submenu, default language first; a folder icon marks folders.
```

`03-insert.png`
```
Templates arrive with their formatting intact (lists, links and panels), even in rich editors like Jira.
```

`04-language.png`
```
Save a selection as another language of an existing template: choose the template from the folder tree, then pick the language or let Detect read it from the text.
```

---

## Version / release notes  (v1.2.2)
```
• Folders and templates now have real icons in the menu, so names line up and render crisp.
• Folder names use the regular menu font again; the previous bold look came from substitute characters that looked blurry and uneven.

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2
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
- Node.js 24 or newer — the only tool required
- No dependencies to install: scripts/build.mjs uses only Node's built-in modules (no npm install, no network)

WHAT THE BUILD DOES
The extension code (everything in src/: *.js, *.html, *.css) and icons/ ship verbatim — no minification, bundling, transpiling, or templating. The only generated file is manifest.json: scripts/build.mjs copies the repo's manifest.json and, for the Firefox target, sets the background key to { "scripts": ["src/background.js"] } (removing the Chrome-only "service_worker" key) while keeping everything else.

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

## Developer Comments  (Edit Listing > Technical Details; public)
```
TTM Connect needs the free TextTemplateManager desktop app (Windows) running on the same PC, with its browser connector turned on. Help and troubleshooting: https://software.kmarflow.com/TTM-Connect/help/

Found a bug? Report it on GitHub: https://github.com/halatsWol/TTM-Connect/issues/new?template=bug_report.yml
or by e-mail (no account needed): contact@kmarflow.com, subject "TTM Connect: problem report".

Please include:
- your Firefox version and the TTM Connect version
- the TextTemplateManager app version (Help > About)
- the steps that led to the problem, what you expected and what happened instead (exact message text)
- what "Test connection" reports in the add-on's preferences

GitHub issues are public, so don't post private template text there.

Ideas and feature requests: https://github.com/halatsWol/TTM-Connect/issues/new?template=feature_request.yml or by e-mail.

Security vulnerabilities: please report them privately, never as a public issue, by e-mail to contact@kmarflow.com or at https://github.com/halatsWol/TTM-Connect/security/advisories/new
```

---

## Whiteboard  (Edit Listing > Technical Details; reviewers only, kept across versions; keep under 3000 characters)
Version-independent testing info. What changed in a release goes into that version's Notes to Reviewer.

```
ABOUT
Companion for the Windows desktop app "Marflow Software - TextTemplateManager": inserts the user's saved templates into editable fields on web pages via the context menu. No standalone function, no account or login.

TEST SETUP (Windows)
The add-on talks only to the app's token-protected API on http://127.0.0.1:<port>. Free app: Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or GitHub (https://github.com/halatsWol/TextTemplateManager-v2/releases/latest).
1. In the app: Settings > General > Browser extensions > enable. It shows a Port (default 47615) and a Token.
2. Add-on Preferences: enter Port + Token > "Test connection". Expected: "Connected: TextTemplateManager <version>" (app 2.8+ adds "— multi-language templates supported").
3. Create a few templates in a folder or two; give one a second language (app 2.8+).
Use a regular web page: Firefox runs no add-on scripts on about: pages or AMO.

TEST STEPS
1. Right-click a text field: "TTM Connect" mirrors the app's template tree (folders with a folder icon). Click a template: it is inserted at the cursor.
2. Ctrl+click a template: plain-text paste (Firefox only).
3. In a text field press Shift+F10 or the context-menu key > TTM Connect > a template: inserted into that field.
4. Select text > TTM Connect > "Create template from selection": saved as a new template in the app.
5. Languages (app 2.8+): the two-language template opens as a submenu, default first. Select text > TTM Connect > "Save selection as language of..." > pick a template and a language (or Detect) > Save. The default text stays unchanged.

WITHOUT THE APP (e.g. non-Windows)
Preferences load; "Test connection" reports the app unreachable (expected). A text field's menu shows "TTM Connect > Configure...". Apart from noting which field a context menu opens on, the add-on does nothing on a page until a template is clicked.

PERMISSIONS
- host http://127.0.0.1/*: the only network access (the local app); no internet host.
- content script (<all_urls>): records which editable field a context menu opens on, since Firefox doesn't resolve the target of a Shift+F10 menu, and pastes on a template click. Reads no page content, stores nothing, no network requests.
- scripting + activeTab: only after a menu click, a one-shot paste or selection read in that tab/frame. Never on page load.
- contextMenus: the template menu. storage: local settings; storage.session: the language picker's selection (memory only). alarms: menu refresh.

DATA & PRIVACY
No data is collected or leaves the device: no analytics or tracking (data_collection_permissions: none). Port/Token are a local pairing secret, sent only to 127.0.0.1.

CODE & BUILD
All code is first-party and unminified (src/*.js, *.html, *.css); no remote code, no third-party libraries. Only manifest.json is generated (scripts/build.mjs, Node 24, no dependencies); build steps are in the source submission.
```

---

## Notes to Reviewer  (max 3000 characters; per version: what changed, the testing steps live in the Whiteboard)
```
VERSION 1.2.2: CHANGES SINCE 1.2.1
- src/background.js: folder and template menu items get per-item icons via the "icons" property of contextMenus.create (Firefox detected via runtime.getBrowserInfo) (new files icons/menu-folder.svg and icons/menu-template.svg, packaged static SVGs). Titles are now plain text: the previous mapping of folder names to Mathematical Sans-Serif Bold code points was removed.
- Chromium-only code path (unused in Firefox): the title glyph spacing changed.

No new or changed permissions, no other code changes. The build instructions are unchanged (source submission). Test setup and steps are on the Whiteboard.
```
