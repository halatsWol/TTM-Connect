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
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app. Folders are shown in bold and templates carry a document icon, so you can tell them apart at a glance.
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

## Version / release notes  (v1.2.0)
```
• Multi-language templates (needs TextTemplateManager 2.8+): a template held in several languages opens as a submenu — insert any language, default first.
• Folders and templates now carry distinct icons, and folder names are bold, so a multi-language template (which opens like a folder) is easy to tell apart.
• "Save selection as language of…": save a page selection onto an existing template as one of its languages, via a picker window — pick the language or let it be detected. The template's default text is never changed.
• Shift+F10 now inserts into the focused field. For this, the add-on asks for access to your data on all websites: a small script notes which field the menu was opened on. It reads no page content and sends nothing anywhere.
• Settings ▸ Test connection reports when the language features are available.

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

## Notes to Reviewer  (max 3000 characters)
```
ABOUT
TTM Connect is a companion for the Windows desktop app "Marflow Software - TextTemplateManager". It inserts the user's saved templates into editable fields on web pages (e.g. a Jira comment) via the context menu. It has no standalone function.

REQUIRED FOR LIVE TESTING
The add-on talks only to the desktop app's token-protected API on loopback (http://127.0.0.1:<port>). Without the app running it cannot connect and only shows a "Configure..." prompt. Download the app (Windows only) from the Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or GitHub:
https://github.com/halatsWol/TextTemplateManager-v2/releases/latest

FULL TEST (Windows)
1. Run the app: Settings > General > Browser extensions > enable. It shows a Port (default 47615) and a Token.
2. In the add-on's Preferences, enter Port + Token > "Test connection" — expect "Connected: TextTemplateManager <version>" (2.8+: "— multi-language templates supported").
3. Right-click a web text field: "TTM Connect" mirrors the app's templates. Click one — it is inserted at the cursor.
4. FIREFOX-ONLY: Ctrl+click a template to force plain-text paste.
5. Select text > right-click > TTM Connect > "Create template from selection" — saved as a new template in the app.
6. Keyboard: in a text field press Shift+F10 > TTM Connect > a template — it is inserted into that field.
7. Languages (app 2.8+): a template with a second language opens as a submenu, default first. Select text > TTM Connect > "Save selection as language of..." > pick a template and a language (or Detect) > Save.

WITHOUT THE APP (e.g. non-Windows)
- Preferences load (Port, Token, default paste mode, RTF-warning toggle); "Test connection" reports the app unreachable (expected).
- A text field's context menu shows "TTM Connect > Configure...". Apart from noting which field a context menu opens on, the add-on does nothing on a page until a template is clicked.

PERMISSIONS
- host http://127.0.0.1/*: the only network access (the local desktop app); no internet host.
- content script on all sites (<all_urls>, Firefox build only): records which editable field a context menu opens on, since Firefox doesn't resolve the target of a Shift+F10 menu, and performs the paste on a template click. Reads no page content, stores nothing, makes no network requests.
- scripting + activeTab: only after a menu click, a one-shot paste or selection read in the right-clicked tab/frame. Never on page load.
- contextMenus: the template menu. storage: local settings; storage.session holds the language picker's selection (memory only). alarms: refresh the menu.

DATA & PRIVACY
No data is collected or leaves the device — no account, analytics, or tracking (data_collection_permissions: none). Port/Token: a local pairing secret, sent only to 127.0.0.1.

CODE
All code is first-party and unminified (background.js, content.js, options.*, picker.*). No remote code or third-party libraries. Build instructions are in the source submission.
```
