# Changelog

## 1.1.0 — 2026-10-23
- Settings: added a Help & documentation link to the online docs (software.kmarflow.com/TTM-Connect).

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2

## 1.0.0 — 2026-07-21
First public release.

Insert templates
- Open the **TTM Connect** menu from any editable field (mouse right-click or the keyboard
  context-menu key) — a nested mirror of your template tree from the desktop app — and insert a
  template at the cursor.
- Templates paste with the right formatting: rich HTML (including Jira-tuned output), Markdown, plain
  text, or RTF.
- Set a default paste mode for everything, or let each template use its own.
- Firefox: Ctrl+click a template to paste it as plain text.

Create templates
- Select text on a page and choose **Create template from selection** to save it as a new template in
  the desktop app, keeping HTML formatting where possible (requires connector API protocol 2+).

Live updates
- The menu refreshes the moment it opens (Firefox) or when you return to the browser / switch tabs
  (Chrome & Edge), with a 15-second refresh during active use, so new or renamed templates appear
  right away.

Privacy & security
- Communicates only with the desktop app over local loopback (127.0.0.1); no account, no analytics,
  no data collection.
- Template HTML is sanitized before insertion using the same two-stage allow-list + deny-list
  sanitizer as the desktop app: only known-safe formatting elements/attributes survive, and scripts,
  inline event handlers, and dangerous URLs/CSS are removed (defense in depth).

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store
(https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2
