# Help & troubleshooting

Answers to common questions. The [user manual](manual.md) has the full details.

## Pairing and connection

### "Test connection" fails, or the menu shows "Configure…"

The extension talks only to the desktop app over the local loopback, so all of these have to line up:

1. **The app is running.** TextTemplateManager must be open on the same PC as the browser.
2. **The connector is on.** In the app: **Settings ▸ General ▸ Browser extensions (beta)** — turn it on.
3. **The port matches.** Copy the port shown there (default `47615`) into the extension's options exactly.
4. **The token matches.** Copy the token too; it's sent as `x-ttm-token`. If you regenerated it in the app, update the extension.

Then click **Test connection** again — it should report **Connected: TextTemplateManager**, with the app's version. A security tool that blocks loopback connections can also get in the way; allow the app's local port if you use one.

### The submenu shows only "Configure…"

That means the extension isn't paired yet, or it lost the connection to the app. Open the options page and follow [Pair it with the app](manual.md#pair-it-with-the-app). The submenu fills with your template tree as soon as the connection succeeds.

### "Create template from selection" isn't offered, or does nothing

Saving a selection needs TextTemplateManager with **API protocol 2 or newer**. Update the desktop app to the current version, then try again.

## Inserting templates

### I picked a template but nothing was pasted

- **RTF into a web editor.** Most web editors ignore RTF. Set the template (or the default paste mode) to **HTML** or **Jira** for rich web paste — see [Paste modes](manual.md#paste-modes).
- **SHIFT+F10 on Firefox.** Opening the menu with **SHIFT+F10** on Firefox is **not yet supported** — that path doesn't expose the target field to the extension, so nothing is inserted. Use the keyboard **context-menu key** or the mouse there instead.
- **The field lost focus.** Insertion goes to the field you opened the menu in. If focus moved, click back into the field and open the menu again.

### Ctrl+click → plain text does nothing on Chrome or Edge

That's expected. **Ctrl+click to force plain text works on Firefox only.** Chromium doesn't pass modifier keys to context-menu clicks, so on Chrome/Edge a click always uses the configured default mode. To paste plain text there, set the template's mode (or the default paste mode) to plain text.

### A new or renamed template isn't in the menu yet

The menu refreshes on its own — when the menu opens on Firefox, when you switch back to or change tabs on Chrome/Edge, and on a short timer during active use. If it still lags, switch tabs (or reopen the menu) to trigger a refresh, or reopen the browser.

## Reporting a problem

Report it by e-mail, or as an issue on GitHub if you have an account. Both open with the questions below; GitHub issues are public, so don't post private text there. For a security vulnerability, use [Reporting a security vulnerability](#reporting-a-security-vulnerability) instead.

[:material-email-outline: Report by e-mail][mail-problem]{ .md-button .md-button--primary } [:fontawesome-brands-github: Report on GitHub](https://github.com/halatsWol/TTM-Connect/issues/new){ .md-button }

The more exactly you describe what happened, the faster it can be fixed:

- **Which browser and version** (Chrome, Edge or Firefox), and the **extension version**.
- **The desktop app version** (**Help ▸ About**), and whether the connector is enabled.
- **What you did**, step by step: which site and field, which template, and the paste mode.
- **What you expected** and **what happened instead** — with the exact text of any message.
- For a connection problem, what **Test connection** reports on the options page.

## Suggesting a feature

Ideas are welcome, by e-mail or, with a GitHub account, on GitHub. Both open with a short form: what you'd like to get done, how you do it today, and how it could work.

[:material-email-outline: Suggest by e-mail][mail-feature]{ .md-button .md-button--primary } [:fontawesome-brands-github: Suggest on GitHub](https://github.com/halatsWol/TTM-Connect/issues/new){ .md-button }

## Reporting a security vulnerability

Report a vulnerability privately, never as a public issue: by e-mail (no account needed), or on GitHub with an account through the repository's private vulnerability reporting. Include the extension version, the browser, what is affected and how to reproduce it. A fix ships as an update to each store.

[:material-email-outline: Report by e-mail][mail-security]{ .md-button .md-button--primary } [:fontawesome-brands-github: Report on GitHub](https://github.com/halatsWol/TTM-Connect/security/advisories/new){ .md-button }

[mail-problem]: mailto:contact@kmarflow.com?subject=TTM%20Connect%3A%20problem%20report&body=Browser%20and%20version%3A%0D%0AExtension%20version%3A%0D%0ATextTemplateManager%20app%20version%20%28Help%20%3E%20About%29%3A%0D%0A%0D%0AWhen%20did%20it%20happen%20%28date%2C%20time%29%3F%0D%0A%0D%0AHow%20often%20%28every%20time%20%2F%20sometimes%20%2F%20once%29%3F%0D%0A%0D%0AWhat%20did%20you%20do%2C%20step%20by%20step%2C%20right%20before%3F%0D%0A1.%0D%0A2.%0D%0A3.%0D%0A%0D%0AWhat%20did%20you%20expect%3F%0D%0A%0D%0AWhat%20happened%20instead%20%28exact%20message%20text%2C%20error%20code%29%3F%0D%0A%0D%0AWhat%20does%20Test%20connection%20report%20on%20the%20options%20page%3F%0D%0A
[mail-feature]: mailto:contact@kmarflow.com?subject=TTM%20Connect%3A%20feature%20request&body=What%20would%20you%20like%20to%20do%20that%20TTM%20Connect%20doesn%27t%20support%20today%2C%20or%20makes%20hard%3F%0D%0A%0D%0AHow%20do%20you%20do%20it%20today%20%28workaround%29%3F%0D%0A%0D%0AHow%20could%20it%20work%20%28idea%2C%20example%2C%20how%20another%20tool%20does%20it%29%3F%0D%0A%0D%0AHow%20often%20would%20you%20use%20it%20%28daily%20%2F%20weekly%20%2F%20rarely%29%3F%0D%0A%0D%0ABrowser%20and%20extension%20version%3A%0D%0A
[mail-security]: mailto:contact@kmarflow.com?subject=TTM%20Connect%3A%20security%20report&body=Please%20do%20NOT%20file%20this%20as%20a%20public%20issue.%0D%0A%0D%0AExtension%20version%3A%0D%0ABrowser%20and%20version%3A%0D%0AWhat%20is%20affected%3A%0D%0AHow%20to%20reproduce%20it%20%28step%20by%20step%29%3A%0D%0AImpact%3A%0D%0A
