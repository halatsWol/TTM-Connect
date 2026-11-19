# Chrome Web Store — listing text (TTM Connect)

Copy each block into the matching field in the Chrome Web Store Developer Dashboard.

---

## Name
```
TTM Connect
```

## Summary  (max 132 characters)
```
Insert TextTemplateManager templates into any editable field from the right-click menu. Requires the free desktop app.
```

## Category
Workflow & Planning

## Language
English

---

## Description
```
TTM Connect brings your Marflow Software - TextTemplateManager templates into the browser. Right-click inside any editable field — a Jira comment, an email, a web form, a support ticket — and insert a saved template at the cursor, with its formatting intact.

FEATURES
• Your full template tree appears as a nested right-click menu, mirroring the folders in the desktop app. Folders are shown in bold and templates carry a document icon, so you can tell them apart at a glance.
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

## Single purpose description
```
TTM Connect has a single purpose: to move text templates between the browser and the user's Marflow Software - TextTemplateManager desktop application. From the right-click menu the user can insert a saved template into an editable field, save the current page selection as a new template, or add the selection to an existing template as another language. In every case the extension communicates only with the desktop app over a local loopback connection (127.0.0.1) — fetching template content to insert, or sending the selected text to be saved. It does nothing else: no browsing data is collected, no remote servers are contacted, and it acts on a page only to perform the insert or the selection capture the user explicitly requested.
```

## "Are you using remote code?"
**No** — all code is bundled in the package; nothing is loaded from a URL.

---

## Permission justifications  (one box per permission)

**contextMenus**
```
The right-click context menu is the extension's only user interface. This permission adds the "TTM Connect" submenu of the user's templates to editable fields, which is how the user selects a template to insert.
```

**storage**
```
Stores the user's settings — the desktop app's port and token, the default paste mode, and the RTF-warning toggle — via chrome.storage.local so they persist between sessions. When the user chooses "Save selection as language of…", the captured selection is held in chrome.storage.session (memory only, cleared when the browser closes) so the picker window can read it. This data stays on the device and is never transmitted anywhere except to the local desktop app.
```

**scripting**
```
When the user clicks an item in the context menu, the extension uses chrome.scripting.executeScript to run a one-shot script in the right-clicked tab and frame — either to paste the selected template into the focused editable field, or to read the current text selection so it can be saved as a new template or as a language of an existing one. It is never used to inject code on page load or proactively.
```

**activeTab**
```
Used together with scripting so the paste or selection read runs only in the tab the user is acting on, and only in response to their context-menu click. This lets the extension avoid requesting broad access to all websites.
```

**alarms**
```
Periodically refreshes the template menu from the desktop app so it stays in sync when the user adds or renames templates. It performs no background network or tracking activity.
```

**Host permission — http://127.0.0.1/***
```
The extension's only network access is to the user's own TextTemplateManager desktop application, which exposes a token-protected API on the local loopback address (127.0.0.1). This permission is required to fetch the list of templates and the content of the template the user selects, and to save the page selection as a new template or as a language of an existing template. No external or remote hosts are contacted.
```

---

## Privacy — data usage disclosures
- Does this item collect user data? **No.**
- Certify compliance: it does **not** collect or transmit user data; no data is sold or transferred; usage complies with the Developer Program Policies.
