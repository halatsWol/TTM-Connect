// TTM Connect — options page.
const api = globalThis.browser ?? globalThis.chrome;

// Protocol this extension speaks (see background.js). /ping reports the version actually negotiated.
const PROTOCOL = "3";

const DEFAULTS = { port: "", token: "", defaultMode: "default", rtfWarnings: true };

// Fallback list if the app isn't reachable to serve /pastemodes. Order/ids match the app.
const FALLBACK_MODES = [
  { id: "Auto", label: "Auto" },
  { id: "Jira", label: "HTML/Jira" },
  { id: "HTML", label: "HTML" },
  { id: "RTF", label: "RTF" },
  { id: "Markdown", label: "Markdown" },
  { id: "Plaintext", label: "Plaintext" },
];

const $ = (id) => document.getElementById(id);
const portEl = $("port");
const tokenEl = $("token");
const modeEl = $("defaultMode");
const rtfWarnEl = $("rtfWarn");
const rtfWarningsEl = $("rtfWarnings");
const statusEl = $("status");

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

function currentConfig() {
  return {
    port: portEl.value.trim(),
    token: tokenEl.value.trim(),
    defaultMode: modeEl.value || "default",
    rtfWarnings: rtfWarningsEl.checked,
  };
}

function fillModes(modes, selected) {
  modeEl.innerHTML = "";
  const appDefault = document.createElement("option");
  appDefault.value = "default";
  appDefault.textContent = "App default (per template)";
  modeEl.appendChild(appDefault);
  for (const m of modes) {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.label;
    modeEl.appendChild(opt);
  }
  modeEl.value = selected || "default";
  updateRtfNotice();
}

function updateRtfNotice() {
  rtfWarnEl.hidden = modeEl.value !== "RTF";
}

async function fetchModes(cfg) {
  if (!cfg.port || !cfg.token) return FALLBACK_MODES;
  try {
    const res = await fetch(`http://127.0.0.1:${cfg.port}/pastemodes`, {
      headers: { "x-ttm-token": cfg.token, "x-ttm-protocol": PROTOCOL },
    });
    if (!res.ok) return FALLBACK_MODES;
    const modes = await res.json();
    return Array.isArray(modes) && modes.length ? modes : FALLBACK_MODES;
  } catch {
    return FALLBACK_MODES;
  }
}

async function load() {
  const cfg = { ...DEFAULTS, ...(await api.storage.local.get(DEFAULTS)) };
  portEl.value = cfg.port;
  tokenEl.value = cfg.token;
  rtfWarningsEl.checked = cfg.rtfWarnings;
  const modes = await fetchModes(cfg);
  fillModes(modes, cfg.defaultMode);
}

async function save() {
  await api.storage.local.set(currentConfig());
  setStatus("Saved.", "ok");
  // Refresh the mode list now that credentials may have changed.
  const modes = await fetchModes(currentConfig());
  fillModes(modes, modeEl.value);
}

async function test() {
  const cfg = currentConfig();
  if (!cfg.port || !cfg.token) {
    setStatus("Enter a port and token first.", "err");
    return;
  }
  setStatus("Testing…");
  try {
    const res = await fetch(`http://127.0.0.1:${cfg.port}/ping`, {
      headers: { "x-ttm-token": cfg.token, "x-ttm-protocol": PROTOCOL },
    });
    if (res.status === 401) return setStatus("Unauthorized — check the token.", "err");
    if (!res.ok) return setStatus("Error: HTTP " + res.status, "err");
    const info = await res.json();
    // Accept protocol 1–3. 3 means template languages are available; 2 is a silent fall-back (an app
    // older than 2.8). Only an unreadable/newer protocol than we know is worth warning about.
    const p = info.protocol;
    let proto = "";
    if (p === 3) proto = " — multi-language templates supported";
    else if (!(p === 1 || p === 2)) proto = ` — ⚠ protocol ${p} (this extension speaks up to 3)`;
    const warn = proto.includes("⚠");
    setStatus(`Connected: ${info.app} ${info.version}${proto}`, warn ? "err" : "ok");
    // A successful test means the app is reachable; refresh modes from it.
    fillModes(await fetchModes(cfg), modeEl.value);
  } catch {
    setStatus("Can't reach the app — is it running and the connector enabled?", "err");
  }
}

modeEl.addEventListener("change", updateRtfNotice);
$("save").addEventListener("click", save);
$("test").addEventListener("click", test);

load();
