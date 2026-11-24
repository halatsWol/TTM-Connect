# Changelog

## 1.2.2 — 2026-11-24
- Menu: folder names use the regular menu font again. The bold look came from substitute Unicode characters that Windows draws from fallback fonts, which looked blurry and uneven, most of all in Firefox.
- Firefox: folders and templates get real menu icons in the icon column, so names line up and render crisp.
- Chrome/Edge: more space after the folder/template glyph, and folder and template names now line up.

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2

## 1.2.1 — 2026-11-19
- New TextTemplateManager logo for the extension icon.
- Firefox: now needs Firefox 142 or newer, the first version (desktop and Android) that supports the add-on's "no data collected" declaration. Together with a small internal change this clears the Firefox Add-ons validator warnings; nothing changes in use.

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2

## 1.2.0 — 2026-11-19
- Multi-language templates (needs TextTemplateManager 2.8+, API protocol 3): a template held in several languages opens as a submenu — insert any language, default first.
- Menu: folders and templates now carry distinct icons, and folder names are shown in bold, so a multi-language template (which opens as a submenu, like a folder) is easy to tell apart at a glance.
- Save selection as language of… — save a page selection onto an existing template as one of its languages via a picker window (choose the template from a collapsible folder tree, then pick the language or Detect it from the selection); the template's default text is never changed.
- Firefox: Shift+F10 now inserts into the focused field. This adds the access-your-data-on-all-websites permission to the Firefox build only; Chrome/Edge are unchanged.
- Asks the app for API protocol 3 and falls back silently to protocol 2 on older apps; the settings Test reports when language features are available.

Requires the free TextTemplateManager desktop app (Windows) — Microsoft Store (https://apps.microsoft.com/detail/9NMBSZLLLN6V) or https://github.com/halatsWol/TextTemplateManager-v2

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
