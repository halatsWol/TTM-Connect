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

## Single purpose description
```
TTM Connect has a single purpose: to insert text templates from the user's Marflow Software - TextTemplateManager desktop application into editable fields on web pages. When the user right-clicks an editable field and picks a template, the extension fetches that template from the desktop app over a local loopback connection (127.0.0.1) and pastes it into the focused field. It does nothing else — no browsing data is collected, no remote servers are contacted, and no code runs on pages except to perform the paste the user requested.
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
Stores the user's settings — the desktop app's port and token, the default paste mode, and the RTF-warning toggle — via chrome.storage.local so they persist between sessions. This data stays on the device and is never transmitted anywhere except, for the port and token, to the local desktop app.
```

**scripting**
```
When the user clicks a template in the context menu, the extension uses chrome.scripting.executeScript to run a one-shot script in the tab and frame that was right-clicked, which pastes the template into the focused editable field. It is never used to inject code on page load or proactively.
```

**activeTab**
```
Used together with scripting so the paste runs only in the tab the user is acting on, and only in response to their context-menu click. This lets the extension avoid requesting broad access to all websites.
```

**alarms**
```
Periodically refreshes the template menu from the desktop app so it stays in sync when the user adds or renames templates. It performs no background network or tracking activity.
```

**Host permission — http://127.0.0.1/***
```
The extension's only network access is to the user's own TextTemplateManager desktop application, which exposes a token-protected API on the local loopback address (127.0.0.1). This permission is required to fetch the list of templates and the content of the template the user selects. No external or remote hosts are contacted.
```

---

## Privacy — data usage disclosures
- Does this item collect user data? **No.**
- Certify compliance: it does **not** collect or transmit user data; no data is sold or transferred; usage complies with the Developer Program Policies.
