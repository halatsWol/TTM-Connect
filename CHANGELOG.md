# Changelog

## 0.2.0 — 2026-07-18
- Create templates from the browser. Select text on a page, then
  **TTM Connect ▸ Create template from selection** to save it as a new template in the desktop app,
  keeping HTML formatting where possible. Requires TextTemplateManager with connector API protocol 2
  or newer.

## 0.1.1 — 2026-07-18
- Faster template menu updates. The menu now refreshes the moment it opens (Firefox) or when you
  return to the browser / switch tabs (Chrome & Edge), plus a 15-second refresh during active use.
  New or renamed templates appear right away instead of after up to a minute.

## 0.1.0
- Initial release.
- Insert Marflow Software - TextTemplateManager templates into editable fields (Jira comments,
  emails, web forms) from the right-click menu.
- Nested template menu mirroring the folders in the desktop app.
- Configurable default paste mode (Auto, HTML/Jira, HTML, Markdown, Plaintext, RTF), or per-template.
- Ctrl+click a template to paste as plain text (Firefox).
- Connects only to the desktop app over local loopback (127.0.0.1); no account, analytics, or
  data collection.
