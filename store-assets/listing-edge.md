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
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app.
• Templates insert with the right formatting for the target — rich HTML (including Jira-tuned output), Markdown, plain text, or RTF.
• Choose a default paste mode for everything, or let each template use its own.
• The menu refreshes automatically as you add or rename templates in the app.

REQUIREMENTS
TTM Connect is a companion for the TextTemplateManager desktop app — it does nothing on its own. You need:
1. The TextTemplateManager desktop application (Windows), available here:
   https://github.com/halatsWol/TextTemplateManager
2. In the app, enable Settings > General > Browser extensions, then copy the shown port and token into this extension's options and click "Test connection".

HOW IT WORKS & PRIVACY
The extension communicates only with the desktop app running on your own computer, over a local loopback connection (127.0.0.1). Nothing is sent to the internet, no account or login is involved, and there is no analytics or tracking of any kind. Your settings stay on your device.
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
The extension talks only to the desktop app over loopback (http://127.0.0.1:<port>). Without it running, the extension cannot connect and only shows a "Configure..." prompt. Download the app (Windows only):
https://github.com/halatsWol/TextTemplateManager/releases/tag/v0.9.12-beta

FULL TEST (Windows)
1. Run the app; open Settings > General > Browser extensions > enable. It shows a Port (default 47615) and a Token.
2. In the extension's Options, enter the Port + Token and click "Test connection" (expect "Connected: TextTemplateManager <version>").
3. Right-click a web text field > TTM Connect > pick a template > it inserts at the cursor.

WITHOUT THE APP
The Options page loads; "Test connection" reports the app is unreachable (expected); right-clicking a text field shows "TTM Connect > Configure...". The extension does nothing on any page until the user clicks a template.

PERMISSIONS
- 127.0.0.1 host: reach the local desktop app only; no internet host is contacted.
- scripting/activeTab: insert the chosen template into the right-clicked field, only on click.
- contextMenus: the template menu. storage: local settings only. alarms: refresh the menu.

PRIVACY
No account, analytics, or tracking; no data leaves the device. All code is first-party and unminified; no remote code.
```

---

## Privacy
- Does this extension collect data? **No.**
