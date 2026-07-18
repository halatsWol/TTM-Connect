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
    menus.create({ id: CONFIG_ID, title: "⚙ Configure TTM Connect…", contexts: ["editable"] });
    return;
  }

  let tree;
  try {
    tree = await apiGet(cfg, "/tree");
  } catch (err) {
    menus.create({ id: ERROR_ID, title: "⚠ " + describeError(err), contexts: ["editable"], enabled: false });
    menus.create({ id: CONFIG_ID, title: "⚙ Open settings…", contexts: ["editable"] });
    return;
  }

  menus.create({ id: ROOT_ID, title: "TTM Connect", contexts: ["editable"] });
  if (!tree.length) {
    menus.create({ id: "ttm-empty", parentId: ROOT_ID, title: "(no templates)", contexts: ["editable"], enabled: false });
    return;
  }
  addNodes(tree, ROOT_ID);
}

function addNodes(nodes, parentId) {
  for (const node of nodes) {
    const title = node.name || "(unnamed)";
    if (node.type === "folder") {
      const id = "fld:" + node.id;
      menus.create({ id, parentId, title, contexts: ["editable"] });
      if (node.children && node.children.length) addNodes(node.children, id);
    } else {
      menus.create({ id: "tpl:" + node.id, parentId, title, contexts: ["editable"] });
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

// ---- rebuild triggers (identical on both engines) ----
api.runtime.onInstalled.addListener(rebuildMenu);
api.runtime.onStartup?.addListener?.(rebuildMenu);
api.storage.onChanged.addListener((_changes, area) => {
  if (area === "local") rebuildMenu();
});

api.alarms.create("ttm-refresh", { periodInMinutes: 1 });
api.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "ttm-refresh") rebuildMenu();
});

// Build once when the worker spins up.
rebuildMenu();
