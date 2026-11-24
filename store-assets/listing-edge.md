# Microsoft Edge Add-ons — listing text (TTM Connect)

Copy each block into the matching field in Partner Center.

---

## Name
```
TTM Connect
```

## Short description
```
Insert TextTemplateManager templates into any editable field from the right-click menu. Requires the free desktop app.
```

## Category
Productivity

---

## Description
```
TTM Connect brings your Marflow Software - TextTemplateManager templates into the browser. Right-click inside any editable field — a Jira comment, an email, a web form, a support ticket — and insert a saved template at the cursor, with its formatting intact.

FEATURES
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app. Folders carry a folder icon and templates a document icon, so you can tell them apart at a glance.
• Open the menu with a right-click, the keyboard context-menu key, or Shift+F10.
• Templates insert with the right formatting for the target — rich HTML (including Jira-tuned output), Markdown, plain text, or RTF.
• Choose a default paste mode for everything, or let each template use its own.
• Multi-language templates: a template kept in several languages opens as a submenu — pick the language to insert, with its default listed first.
• Select text on a page and choose "Create template from selection" to save it as a new template in the app, keeping its formatting.
• Choose "Save selection as language of…" to add a selection to an existing template as another language — pick the language, or let it be detected from the text. The template's default text is never changed.
• The menu refreshes automatically as you add or rename templates in the app.

REQUIREMENTS
TTM Connect is a companion for the TextTemplateManager desktop app — it does nothing on its own. You need:
1. The TextTemplateManager desktop application (Windows), from the Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or GitHub (https://github.com/halatsWol/TextTemplateManager-v2). Documentation: https://software.kmarflow.com/TextTemplateManager-v2/
2. In the app, enable Settings > General > Browser extensions, then copy the shown port and token into this extension's options and click "Test connection".
Multi-language templates and "Save selection as language of…" need TextTemplateManager 2.8 or newer; everything else also works with older versions.

HOW IT WORKS & PRIVACY
The extension communicates only with the desktop app running on your own computer, over a local loopback connection (127.0.0.1). Nothing is sent to the internet, no account or login is involved, and there is no analytics or tracking of any kind. Your settings stay on your device.
```

---

## Screenshots and captions  (keep each under 200 characters)
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

## Search terms  (up to 7)
```
text templates
template manager
text snippets
canned responses
context menu paste
text expander
paste templates
```

---

## Notes for certification  (max 2000 characters)
```
TTM Connect is a companion for the Windows desktop app "Marflow Software - TextTemplateManager". It inserts the user's saved templates into editable fields (e.g. a Jira comment box) via the right-click menu. It has no standalone function.

REQUIRED FOR LIVE TESTING
The extension talks only to the desktop app over loopback (http://127.0.0.1:<port>). Without it running, the extension cannot connect and only shows a "Configure..." prompt. Download the app (Windows only) from the Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or GitHub:
https://github.com/halatsWol/TextTemplateManager-v2/releases/latest

FULL TEST (Windows)
1. Run the app; open Settings > General > Browser extensions > enable. It shows a Port (default 47615) and a Token.
2. In the extension's Options, enter the Port + Token and click "Test connection" (expect "Connected: TextTemplateManager <version>").
3. Right-click a web text field > TTM Connect > pick a template > it inserts at the cursor.
4. Select text > right-click > TTM Connect > Create template from selection > saved as a new template in the app.
5. Languages (app 2.8+): multi-language templates open as a submenu. Select text > TTM Connect > Save selection as language of... > pick template + language > Save.

WITHOUT THE APP
The Options page loads; "Test connection" reports the app is unreachable (expected); right-clicking a text field shows "TTM Connect > Configure...". The extension does nothing on any page until the user clicks a template.

PERMISSIONS
- 127.0.0.1 host: reach the local desktop app only; no internet host is contacted.
- scripting/activeTab: insert the chosen template into the right-clicked field, only on click.
- contextMenus: the template menu. storage: local settings + session storage for the language picker's selection. alarms: refresh the menu.

PRIVACY
No account, analytics, or tracking; no data leaves the device. All code is first-party and unminified; no remote code.
```

---

## Privacy
- Does this extension collect data? **No.**
