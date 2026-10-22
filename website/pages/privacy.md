# Privacy

TTM Connect is built to keep your data on your own computer. It collects nothing, has no account or login, and contains no analytics or tracking of any kind.

## What it stores

The extension saves only your settings, in the browser's local storage (`storage.local`), on your device:

- the desktop app's **port** and **token** (your local pairing secret),
- the **default paste mode**,
- the **Show RTF paste warnings** toggle.

These persist across browser and extension updates and are never sent anywhere except, for the port and token, to the desktop app on your own PC.

## What it sends, and where

The extension's only network access is to your **TextTemplateManager** desktop app, which exposes a token-protected API on the local loopback address (`127.0.0.1`). Over that local connection it:

- fetches your template tree and the content of the template you pick, to insert it, and
- sends the text you selected when you choose **Create template from selection**, to save it as a new template.

**No internet host is ever contacted.** Nothing is sent to Marflow Software or any third party.

## When it touches a page

TTM Connect acts on a web page only in response to **your** click in its context menu — to insert the chosen template into the field you opened the menu in, or to read the selection you asked to save. It never injects code on page load, and it doesn't read, monitor or collect your browsing.

## Permissions

| Permission | Why it's needed |
| --- | --- |
| `contextMenus` | Adds the **TTM Connect** submenu — the extension's only interface. |
| `storage` | Saves your settings locally (above). |
| `scripting` + `activeTab` | Runs a one-shot paste, or reads the selection, only in the tab you acted on and only on your click. |
| `alarms` | Refreshes the template menu so it stays in sync with the app. |
| host `http://127.0.0.1/*` | Reaches the desktop app on your own machine — the only network access. |

All code ships in the package; nothing is loaded from a remote URL.

## Questions

Write to [contact@kmarflow.com](mailto:contact@kmarflow.com).
