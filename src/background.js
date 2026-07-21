// TTM Connect — background service worker.
//
// Builds the context menu from the desktop app's Browser Connector API (/tree), and on click
// fetches the rendered template (/template) and injects it into the focused editable field.
//
// Cross-browser: `browser` exists on Firefox (promise-based), `chrome` on Chromium (promise-based
// under MV3). Picking whichever is present gives one promise-based API for both engines with no
// polyfill. `menus` is Firefox's richer namespace (it carries `info.modifiers`); Chromium only has
// `contextMenus`.
const api = globalThis.browser ?? globalThis.chrome;
const menus = api.menus ?? api.contextMenus;

const ROOT_ID = "ttm-root";
const CONFIG_ID = "ttm-config";
const ERROR_ID = "ttm-error";
const CREATE_ID = "ttm-create";
const SEP_ID = "ttm-sep";

// The menu appears in editable fields (to insert a template) and on any text selection (to create a
// new template from it).
const MENU_CONTEXTS = ["editable", "selection"];

const DEFAULTS = { port: "", token: "", defaultMode: "default", rtfWarnings: true };

// ---- config ----
async function getConfig() {
  const stored = await api.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

// ---- API layer ----
function baseUrl(cfg) {
  return `http://127.0.0.1:${cfg.port}`;
}

async function apiGet(cfg, path) {
  let res;
  try {
    res = await fetch(baseUrl(cfg) + path, { headers: { "x-ttm-token": cfg.token } });
  } catch {
    // fetch rejects (connection refused / app not running / wrong port)
    const err = new Error("offline");
    err.kind = "offline";
    throw err;
  }
  if (!res.ok) {
    const err = new Error("http " + res.status);
    err.kind = "http";
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function apiPost(cfg, path, body) {
  let res;
  try {
    res = await fetch(baseUrl(cfg) + path, {
      method: "POST",
      headers: { "x-ttm-token": cfg.token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    const err = new Error("offline");
    err.kind = "offline";
    throw err;
  }
  if (!res.ok) {
    const err = new Error("http " + res.status);
    err.kind = "http";
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function describeError(err) {
  if (err.kind === "offline") return "App not running — check settings";
  if (err.status === 401) return "Invalid token — check settings";
  if (err.status === 403) return "Forbidden origin";
  return "Connection error — check settings";
}

// ---- menu building ----
let rebuilding = false;
let rebuildQueued = false;

async function rebuildMenu() {
  // Serialize rebuilds: concurrent create() calls with the same ids throw "duplicate id".
  if (rebuilding) {
    rebuildQueued = true;
    return;
  }
  rebuilding = true;
  try {
    await doRebuild();
  } finally {
    rebuilding = false;
    if (rebuildQueued) {
      rebuildQueued = false;
      rebuildMenu();
    }
  }
}

async function doRebuild() {
  await menus.removeAll();
  const cfg = await getConfig();

  if (!cfg.port || !cfg.token) {
    menus.create({ id: CONFIG_ID, title: "⚙ Configure TTM Connect…", contexts: MENU_CONTEXTS });
    return;
  }

  let tree;
  try {
    tree = await apiGet(cfg, "/tree");
  } catch (err) {
    menus.create({ id: ERROR_ID, title: "⚠ " + describeError(err), contexts: MENU_CONTEXTS, enabled: false });
    menus.create({ id: CONFIG_ID, title: "⚙ Open settings…", contexts: MENU_CONTEXTS });
    return;
  }

  menus.create({ id: ROOT_ID, title: "TTM Connect", contexts: MENU_CONTEXTS });
  if (tree.length) {
    addNodes(tree, ROOT_ID);
  } else {
    menus.create({ id: "ttm-empty", parentId: ROOT_ID, title: "(no templates)", contexts: MENU_CONTEXTS, enabled: false });
  }
  // "Create template from selection" sits at the bottom of the submenu, after a separator, and only
  // shows when text is selected.
  menus.create({ id: SEP_ID, parentId: ROOT_ID, type: "separator", contexts: ["selection"] });
  menus.create({ id: CREATE_ID, parentId: ROOT_ID, title: "Create template from selection", contexts: ["selection"] });
}

function addNodes(nodes, parentId) {
  for (const node of nodes) {
    const title = node.name || "(unnamed)";
    if (node.type === "folder") {
      const id = "fld:" + node.id;
      menus.create({ id, parentId, title, contexts: MENU_CONTEXTS });
      if (node.children && node.children.length) addNodes(node.children, id);
    } else {
      menus.create({ id: "tpl:" + node.id, parentId, title, contexts: MENU_CONTEXTS });
    }
  }
}

// ---- click handling ----
menus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId;

  if (id === CONFIG_ID) {
    api.runtime.openOptionsPage();
    return;
  }
  if (id === CREATE_ID) {
    await createTemplateFromSelection(tab, info);
    return;
  }
  if (typeof id !== "string" || !id.startsWith("tpl:")) return;

  const guid = id.slice(4);
  const cfg = await getConfig();

  let mode = cfg.defaultMode || "default";
  // Firefox provides modifier keys on menu clicks; Chromium does not (info.modifiers is undefined),
  // so Ctrl+click -> Plaintext lights up only where the browser supports it.
  if (info.modifiers && info.modifiers.includes("Ctrl")) mode = "Plaintext";

  let tpl;
  try {
    tpl = await apiGet(cfg, `/template?id=${encodeURIComponent(guid)}&mode=${encodeURIComponent(mode)}`);
  } catch (err) {
    await notify(tab, info.frameId, "TTM Connect: " + describeError(err));
    rebuildMenu(); // reflect the new state (e.g. app went offline) in the menu
    return;
  }

  await insertIntoPage(tab.id, info.frameId, {
    content: tpl.content,
    contentType: tpl.contentType,
    mode: tpl.mode,
    rtfWarnings: cfg.rtfWarnings,
  });
});

async function insertIntoPage(tabId, frameId, payload) {
  const target = { tabId };
  if (frameId != null) target.frameIds = [frameId];

  try {
    await api.scripting.executeScript({ target, files: ["src/content.js"] });
  } catch {
    // Restricted page (chrome://, addons store, PDF viewer, etc.) — nothing we can do.
    return;
  }
  try {
    const opts = frameId != null ? { frameId } : {};
    await api.tabs.sendMessage(tabId, { type: "ttm-insert", payload }, opts);
  } catch {
    /* frame gone / no receiver */
  }
}

// Create a template from the page's current selection, preserving formatting (HTML) where possible.
async function createTemplateFromSelection(tab, info) {
  if (!tab || tab.id == null) return;
  const cfg = await getConfig();
  const sel = await getSelectionHtml(tab.id, info.frameId);
  // Prefer the selection's HTML (keeps formatting); fall back to plain text.
  const content = sel.html && sel.html.trim() ? sel.html : sel.text || info.selectionText || "";
  if (!content.trim()) {
    await notify(tab, info.frameId, "TTM Connect: select some text first.");
    return;
  }
  try {
    const created = await apiPost(cfg, "/template", { content });
    await notify(tab, info.frameId, `TTM Connect: saved template “${created.name}”.`);
    rebuildMenu(); // the new template shows up in the menu
  } catch (err) {
    const msg = err.status === 404
      ? "creating templates needs a newer TextTemplateManager"
      : describeError(err);
    await notify(tab, info.frameId, "TTM Connect: " + msg);
  }
}

// Reads the current selection as HTML (and plain text) from the page/frame that was right-clicked.
async function getSelectionHtml(tabId, frameId) {
  const target = { tabId };
  if (frameId != null) target.frameIds = [frameId];
  try {
    const results = await api.scripting.executeScript({
      target,
      func: () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return { html: "", text: "" };
        const div = document.createElement("div");
        for (let i = 0; i < sel.rangeCount; i++) div.appendChild(sel.getRangeAt(i).cloneContents());
        return { html: div.innerHTML, text: sel.toString() };
      },
    });
    return results?.[0]?.result ?? { html: "", text: "" };
  } catch {
    return { html: "", text: "" };
  }
}

async function notify(tab, frameId, message) {
  if (!tab || tab.id == null) return;
  const target = { tabId: tab.id };
  if (frameId != null) target.frameIds = [frameId];
  try {
    await api.scripting.executeScript({ target, files: ["src/content.js"] });
    const opts = frameId != null ? { frameId } : {};
    await api.tabs.sendMessage(tab.id, { type: "ttm-toast", message }, opts);
  } catch {
    /* ignore */
  }
}

// ---- rebuild triggers ----
// Keeping the menu fresh without polling hard:
//  - Firefox exposes menus.onShown, so we rebuild the instant the menu opens — always current.
//  - Chromium has no such event, so there we rebuild on window focus and tab switch (which almost
//    always happen between editing templates in the app and right-clicking in the browser), plus a
//    slow alarm as a backstop. Focus/tab events are debounced so rapid switching doesn't spam the app.

let lastRebuildAt = 0;
function requestRebuild() {
  const now = Date.now();
  if (now - lastRebuildAt < 1500) return;
  lastRebuildAt = now;
  rebuildMenu();
}

api.runtime.onInstalled.addListener(rebuildMenu);
api.runtime.onStartup?.addListener?.(rebuildMenu);
api.storage.onChanged.addListener((_changes, area) => {
  if (area === "local") rebuildMenu();
});

if (menus.onShown) {
  // Firefox: refresh right before the menu is displayed, then push the update to the open menu.
  menus.onShown.addListener(async (info) => {
    if (!info.contexts || !info.contexts.includes("editable")) return;
    await rebuildMenu();
    try { menus.refresh(); } catch { /* menu already closed */ }
  });
} else {
  // Chromium: approximate "just opened" freshness from user activity (no extra permissions needed).
  api.windows?.onFocusChanged?.addListener((winId) => {
    if (winId !== api.windows.WINDOW_ID_NONE) requestRebuild();
  });
  api.tabs?.onActivated?.addListener(requestRebuild);
}

// Backstop. A published MV3 extension can't run an alarm faster than ~1 min (shorter periods are
// clamped), so the alarm's only job is to wake a sleeping service worker. While the worker is alive
// (i.e. during active use) a 15s interval gives the faster refresh; it re-arms on every worker start.
api.alarms.create("ttm-refresh", { periodInMinutes: 1 });
api.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "ttm-refresh") rebuildMenu();
});
setInterval(rebuildMenu, 15000);

// Build once when the worker spins up.
rebuildMenu();
