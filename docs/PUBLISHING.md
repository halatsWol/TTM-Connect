# Publishing & credential rotation

How releases are published, and how to update/renew the store credentials when they change or expire.

Store listing text lives in [`store-assets/`](../store-assets/) (`listing-chrome.md`,
`listing-edge.md`, `listing-firefox.md`). This doc is about the **keys**.

---

## How a release is published

1. Bump `version` in [`manifest.json`](../manifest.json).
2. Commit, then tag and push:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
3. [`.github/workflows/package.yml`](../.github/workflows/package.yml) builds both zips, attaches
   them to a GitHub Release, then runs the three publish jobs.
4. Each publish job waits on the **`store-release`** GitHub Environment. Approve it under
   **Settings ▸ Environments ▸ store-release** (add yourself as a required reviewer once) and it goes
   live. A tag whose secrets are missing simply fails that one job; the others still run.

> The tag version and `manifest.json` version must match, and each new release must have a **higher**
> version than what is already live on every store.

---

## Secrets reference

Stored in **GitHub ▸ repo ▸ Settings ▸ Secrets and variables ▸ Actions**. The names are referenced
verbatim in `package.yml` — if you rename a secret, update the workflow too.

| Secret | Store | Source | Expires? |
| --- | --- | --- | --- |
| `CWS_EXTENSION_ID` | Chrome | Web Store item ID (from the dashboard URL) | No |
| `CWS_CLIENT_ID` | Chrome | Google Cloud OAuth client | No |
| `CWS_CLIENT_SECRET` | Chrome | Google Cloud OAuth client | No |
| `CWS_REFRESH_TOKEN` | Chrome | OAuth Playground / manual exchange | Only if consent screen is in **Testing** (7 days) |
| `EDGE_PRODUCT_ID` | Edge | Partner Center → extension Overview | No |
| `EDGE_CLIENT_ID` | Edge | Partner Center → Publish API | No |
| `EDGE_API_KEY` | Edge | Partner Center → Publish API | **Yes — has an expiry date** |
| `AMO_JWT_ISSUER` | Firefox | AMO → Manage API Keys | No (until revoked) |
| `AMO_JWT_SECRET` | Firefox | AMO → Manage API Keys | No (until revoked) |

### Updating a secret in GitHub
Settings ▸ Secrets and variables ▸ Actions ▸ click the secret ▸ **Update** ▸ paste the new value ▸
save. No code change needed. Re-run the failed publish job (or push a new tag).

---

## Chrome Web Store

**When the refresh token stops working** (`invalid_grant`): usually because the OAuth consent screen
is in **Testing** mode, which expires refresh tokens after 7 days.

1. Google Cloud Console ▸ **APIs & Services ▸ OAuth consent screen** ▸ set **Publishing status =
   In production** (do this once; it stops the 7-day expiry).
2. Regenerate the token:
   - `https://developers.google.com/oauthplayground` ▸ gear ▸ **Use your own OAuth credentials** ▸
     paste `CWS_CLIENT_ID` + `CWS_CLIENT_SECRET`.
   - Scope: `https://www.googleapis.com/auth/chromewebstore` ▸ **Authorize APIs** ▸ sign in as the
     extension owner ▸ **Exchange authorization code for tokens**.
   - Copy the **Refresh token** → update `CWS_REFRESH_TOKEN`.
- `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` only change if you delete the OAuth client and make a new one
  (then update all three plus re-authorize).
- `CWS_EXTENSION_ID` never changes.

## Microsoft Edge Add-ons

**The `EDGE_API_KEY` expires.** Renew before or when it lapses:

1. Partner Center ▸ **Microsoft Edge ▸ Publish API**.
2. Click **Create API credentials** (or the renew action). A new **API key** is generated; the
   **Client ID** stays the same.
3. Update `EDGE_API_KEY` in GitHub. (`EDGE_CLIENT_ID` and `EDGE_PRODUCT_ID` are unchanged.)

The publish step calls the Edge Add-ons API v1.1 directly with `curl` — no third-party action. If the
API path or auth scheme ever changes, the fix is in the `edge-add-ons` job in `package.yml`.

## Firefox / AMO

**To rotate `AMO_JWT_ISSUER` / `AMO_JWT_SECRET`:**

1. `https://addons.mozilla.org/developers/addon/api/key/`
2. **Revoke** the old credentials, then **Generate new credentials**.
3. Copy the **JWT issuer** → `AMO_JWT_ISSUER` and the **JWT secret** (shown once) → `AMO_JWT_SECRET`.

- The add-on ID `ttm-connect@kmarflow.com` is permanent for the listing — do not change it in the
  manifest, or AMO treats it as a different add-on.
- Listed submissions go through AMO review after upload; signing happens automatically.

---

## One-time prerequisites (per store)

These jobs publish **updates**; the initial listing must be created by hand once, which is also how
you obtain the non-secret IDs:

- **Chrome** — pay the one-time $5 fee, create the item to get `CWS_EXTENSION_ID`, set up the Cloud
  OAuth client for the rest.
- **Edge** — register (free) as an **Individual** developer, submit once to get `EDGE_PRODUCT_ID`,
  enable the Publish API for `EDGE_CLIENT_ID` + `EDGE_API_KEY`.
- **Firefox** — create the listed add-on once on AMO, then Manage API Keys for the JWT pair.
