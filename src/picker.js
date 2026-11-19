// TTM Connect — "Save selection as language" picker.
//
// Opened as a popup window from the context-menu item. The background script stashes the page
// selection in storage.session; here the user picks a target template and a language, and the
// selection is saved onto that template as one of its languages via POST /template/language
// (protocol 3). The picker does the request itself so it can show the app's refusals and let the
// user retry without reopening.
const api = globalThis.browser ?? globalThis.chrome;
const PROTOCOL = "3";
const DEFAULTS = { port: "", token: "" };

const $ = (id) => document.getElementById(id);
const gateEl = $("gate");
const formEl = $("form");
const langEl = $("language");
const treeEl = $("tree");
const saveEl = $("save");
const cancelEl = $("cancel");
const statusEl = $("status");

let cfg = null;
let selection = null;         // { html, text }
let selectedTemplate = null;  // { id, name }

function setStatus(text, kind) {
  statusEl.textContent = text || "";
  statusEl.className = "status" + (kind ? " " + kind : "");
}

function showGate(msg) {
  gateEl.textContent = msg;
  gateEl.hidden = false;
  formEl.hidden = true;
}

function baseUrl() { return `http://127.0.0.1:${cfg.port}`; }
function headers(extra) { return { "x-ttm-token": cfg.token, "x-ttm-protocol": PROTOCOL, ...extra }; }

// ---- languages ----
// The ISO 639-1 two-letter set the connector accepts, minus "zh" (listed as the Simplified/Traditional
// variants the app expects). Names are rendered in the browser's UI language.
const ISO_639_1 = (
  "aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de " +
  "dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id " +
  "ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu " +
  "lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu " +
  "rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr " +
  "ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zu"
).split(" ").concat(["zh-Hans", "zh-Hant"]);

let langNames;
function languageLabel(code) {
  if (!code) return "(unknown)";
  try {
    langNames = langNames || new Intl.DisplayNames(undefined, { type: "language" });
    return langNames.of(code) || code;
  } catch {
    return code;
  }
}

function fillLanguages() {
  const detect = document.createElement("option");
  detect.value = "__detect__";
  detect.textContent = "Detect from selection";
  langEl.appendChild(detect);

  const items = ISO_639_1
    .map((code) => ({ code, label: languageLabel(code) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  for (const it of items) {
    const o = document.createElement("option");
    o.value = it.code;
    o.textContent = `${it.label} (${it.code})`;
    langEl.appendChild(o);
  }
}

// Fold a BCP-47-ish code down to what the connector wants: a bare ISO 639-1 code, with Chinese mapped
// to the script variants the app uses.
function normalizeLang(code) {
  if (!code) return "";
  const c = code.toLowerCase().replace(/_/g, "-");
  if (c === "zh" || c.startsWith("zh-")) {
    return /hant|tw|hk|mo/.test(c) ? "zh-Hant" : "zh-Hans";
  }
  return c.split("-")[0];
}

// Guess the selection's language via the i18n detector (no extra permission). Promise form on both
// engines, with a callback fallback for safety.
async function detectLanguage(text) {
  if (!text || !api.i18n || typeof api.i18n.detectLanguage !== "function") return null;
  try {
    const maybe = api.i18n.detectLanguage(text);
    if (maybe && typeof maybe.then === "function") return await maybe;
  } catch { /* fall through to callback form */ }
  return new Promise((resolve) => {
    try { api.i18n.detectLanguage(text, resolve); } catch { resolve(null); }
  });
}

// ---- template tree ----
// A WAI-ARIA tree: folders expand/collapse (click, Enter/Space, arrow keys), templates are the
// selectable leaves. Focus is roving, so exactly one item is tabbable at a time.
const FOLDER_ICON = "🗀";
const TEMPLATE_ICON = "🗎";
const treeNodes = new WeakMap(); // template <li> -> tree node
let labelSeq = 0;

function renderTree(nodes, container, level) {
  const ul = document.createElement("ul");
  ul.setAttribute("role", level === 1 ? "none" : "group");
  for (const node of nodes) {
    ul.appendChild(node.type === "folder" ? folderItem(node, level) : templateItem(node, level));
  }
  container.appendChild(ul);
}

function treeItem(level, icon, label) {
  const li = document.createElement("li");
  li.setAttribute("role", "treeitem");
  li.setAttribute("aria-level", String(level));
  li.tabIndex = -1;

  const row = document.createElement("div");
  row.className = "row";
  const twisty = document.createElement("span");
  twisty.className = "twisty";
  twisty.setAttribute("aria-hidden", "true");
  const ico = document.createElement("span");
  ico.className = "ico";
  ico.setAttribute("aria-hidden", "true");
  ico.textContent = icon;
  const name = document.createElement("span");
  name.className = "name";
  name.id = `tree-label-${++labelSeq}`;
  name.textContent = label;
  row.append(twisty, ico, name);

  li.setAttribute("aria-labelledby", name.id);
  li.appendChild(row);
  return { li, row, name };
}

function folderItem(node, level) {
  const { li } = treeItem(level, FOLDER_ICON, node.name || "(unnamed)");
  li.classList.add("folder");
  if (node.children && node.children.length) {
    li.setAttribute("aria-expanded", "false");
    renderTree(node.children, li, level + 1);
  }
  return li;
}

function templateItem(node, level) {
  const { li, row, name } = treeItem(level, TEMPLATE_ICON, node.name || "(unnamed)");
  li.classList.add("tpl");
  li.setAttribute("aria-selected", "false");

  // Hint which languages the template already pastes (protocol 3 tree data).
  const existing = Array.isArray(node.languages) && node.languages.length
    ? node.languages.map((l) => l.language)
    : node.language ? [node.language] : [];
  if (existing.length) {
    const span = document.createElement("span");
    span.className = "langs";
    span.id = `tree-label-${++labelSeq}`;
    span.textContent = existing.join(", ");
    row.appendChild(span);
    li.setAttribute("aria-labelledby", `${name.id} ${span.id}`);
  }

  treeNodes.set(li, node);
  return li;
}

// Items not hidden inside a collapsed folder, in document order.
function visibleItems() {
  return [...treeEl.querySelectorAll('[role="treeitem"]')].filter(
    (el) => !el.parentElement.closest('[role="treeitem"][aria-expanded="false"]')
  );
}

function focusItem(item) {
  if (!item) return;
  for (const el of treeEl.querySelectorAll('[role="treeitem"][tabindex="0"]')) el.tabIndex = -1;
  item.tabIndex = 0;
  item.focus({ preventScroll: true });
  item.querySelector(".row").scrollIntoView({ block: "nearest" });
}

function toggleFolder(item, open = item.getAttribute("aria-expanded") !== "true") {
  if (!item.hasAttribute("aria-expanded")) return;
  item.setAttribute("aria-expanded", String(open));
  // Collapsing a folder that holds the focused item would leave focus on a hidden element.
  if (!open && item !== document.activeElement && item.contains(document.activeElement)) focusItem(item);
}

function selectTemplate(item) {
  const node = treeNodes.get(item);
  if (!node) return;
  for (const el of treeEl.querySelectorAll('[aria-selected="true"]')) {
    el.setAttribute("aria-selected", "false");
  }
  item.setAttribute("aria-selected", "true");
  selectedTemplate = { id: node.id, name: node.name || "(unnamed)" };
  saveEl.disabled = false;
  setStatus("");
}

treeEl.addEventListener("click", (e) => {
  const row = e.target.closest(".row");
  if (!row || !treeEl.contains(row)) return;
  const item = row.parentElement;
  focusItem(item);
  if (item.hasAttribute("aria-expanded")) toggleFolder(item);
  else selectTemplate(item);
});

treeEl.addEventListener("keydown", (e) => {
  const item = e.target.closest('[role="treeitem"]');
  if (!item) return;
  const items = visibleItems();
  const i = items.indexOf(item);
  const expandable = item.hasAttribute("aria-expanded");
  const open = item.getAttribute("aria-expanded") === "true";

  switch (e.key) {
    case "ArrowDown": focusItem(items[i + 1]); break;
    case "ArrowUp": focusItem(items[i - 1]); break;
    case "Home": focusItem(items[0]); break;
    case "End": focusItem(items[items.length - 1]); break;
    case "ArrowRight":
      if (expandable && !open) toggleFolder(item, true);
      else if (expandable) focusItem(items[i + 1]); // first child
      break;
    case "ArrowLeft":
      if (expandable && open) toggleFolder(item, false);
      else focusItem(item.parentElement.closest('[role="treeitem"]'));
      break;
    case "Enter":
    case " ":
      if (expandable) toggleFolder(item);
      else selectTemplate(item);
      break;
    default:
      return;
  }
  e.preventDefault();
});

// ---- save ----
async function doSave() {
  if (!selectedTemplate) return;
  saveEl.disabled = true;

  let language = langEl.value;
  if (language === "__detect__") {
    setStatus("Detecting language…");
    const det = await detectLanguage(selection.text || "");
    const top = det && Array.isArray(det.languages) ? det.languages[0] : null;
    const code = top && top.language && top.language !== "und" ? normalizeLang(top.language) : "";
    if (!code) {
      setStatus("Couldn't detect the language — pick one from the list.", "err");
      saveEl.disabled = false;
      return;
    }
    language = code;
  }

  const content = selection.html && selection.html.trim() ? selection.html : selection.text;
  setStatus("Saving…");
  let res;
  try {
    res = await fetch(`${baseUrl()}/template/language`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: selectedTemplate.id, language, content }),
    });
  } catch {
    setStatus("Can't reach the app — couldn't save.", "err");
    saveEl.disabled = false;
    return;
  }

  if (!res.ok) {
    setStatus(saveError(res.status, await errorReason(res)), "err");
    saveEl.disabled = false;
    return;
  }

  let out = {};
  try { out = await res.json(); } catch { /* ignore */ }
  const name = languageLabel(out.language || language);
  const verb = out.added === false ? "Updated" : "Saved";
  setStatus(`${verb} ${name} on “${selectedTemplate.name}”.`, "ok");
  setTimeout(() => window.close(), 1300);
}

async function errorReason(res) {
  try { const j = await res.json(); return j && j.error ? String(j.error).toLowerCase() : ""; }
  catch { return ""; }
}

// Map POST /template/language failures to a readable line (reasons per the connector spec).
function saveError(status, reason) {
  const r = reason || "";
  if (status === 400 && r.includes("unknown language")) return "The app doesn't recognise that language code.";
  if (status === 400) return "The app rejected the request" + (r ? ` (${r})` : "") + ".";
  if (status === 401) return "Invalid token — check the extension settings.";
  if (status === 403) return "That template is read-only (it's in a read-only synced folder).";
  if (status === 404 && r.includes("language")) return "That language is no longer on the template — reopen the picker.";
  if (status === 404) return "Template not found — it may have been deleted.";
  if (status === 409 && r.includes("no default")) return "Set the template's language in the app first.";
  if (status === 409 && r.includes("default")) return "That's the template's default language — change the default text in the app.";
  if (status === 409 && r.includes("unsaved")) return "The template has unsaved edits in the app — save it there first.";
  if (status === 409 && r.includes("sync file")) return "The template's synced file is missing.";
  if (status === 409) return "Can't save right now" + (r ? ` (${r})` : "") + ".";
  if (status === 503) return "The app is busy (a guided tour is running) — try again shortly.";
  return `Error: HTTP ${status}` + (r ? ` (${r})` : "") + ".";
}

// ---- init ----
async function init() {
  cfg = { ...DEFAULTS, ...(await api.storage.local.get(DEFAULTS)) };
  if (!cfg.port || !cfg.token) {
    showGate("TTM Connect isn't set up yet. Open the extension settings, enter the port and token, then try again.");
    return;
  }

  let pending = null;
  try { pending = (await api.storage.session.get("pendingLanguageSelection")).pendingLanguageSelection; }
  catch { /* ignore */ }
  if (!pending || (!pending.html && !(pending.text || "").trim())) {
    showGate("No selection was captured. Select text on the page, then choose “Save selection as language of…”.");
    return;
  }
  selection = pending;

  let info;
  try {
    const res = await fetch(`${baseUrl()}/ping`, { headers: headers() });
    if (res.status === 401) return showGate("Invalid token — check the extension settings.");
    if (!res.ok) return showGate(`The app answered with an error (HTTP ${res.status}).`);
    info = await res.json();
  } catch {
    return showGate("Can't reach the app — is TextTemplateManager running with the connector enabled?");
  }
  if (!(info.protocol >= 3)) {
    return showGate(
      `Saving a selection as a language needs TextTemplateManager 2.8 or newer (API protocol 3). ` +
      `This app answered with protocol ${info.protocol}.`
    );
  }

  let tree;
  try {
    const res = await fetch(`${baseUrl()}/tree`, { headers: headers() });
    if (!res.ok) return showGate(`Couldn't load your templates (HTTP ${res.status}).`);
    tree = await res.json();
  } catch {
    return showGate("Can't reach the app — is it still running?");
  }

  fillLanguages();
  treeEl.textContent = "";
  if (Array.isArray(tree) && tree.length) {
    renderTree(tree, treeEl, 1);
    treeEl.querySelector('[role="treeitem"]').tabIndex = 0;
  } else {
    treeEl.innerHTML = '<div class="empty">No templates yet — create one in the app first.</div>';
  }

  gateEl.hidden = true;
  formEl.hidden = false;
}

saveEl.addEventListener("click", doSave);
cancelEl.addEventListener("click", () => window.close());
init();
