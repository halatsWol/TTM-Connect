// TTM Connect — content script (injected on demand via scripting.executeScript).
//
// Inserts rendered template content into the focused editable element. Kept idempotent so repeated
// injection doesn't stack listeners.
(() => {
  if (window.__ttmConnectLoaded) return;
  window.__ttmConnectLoaded = true;

  const api = globalThis.browser ?? globalThis.chrome;

  api.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.type === "ttm-insert") handleInsert(msg.payload);
    else if (msg.type === "ttm-toast") toast(msg.message);
  });

  function handleInsert(payload) {
    const { content, contentType, mode, rtfWarnings } = payload;
    const el = document.activeElement;

    if (!isEditable(el)) {
      toast("TTM Connect: click into a text field first, then pick a template.");
      return;
    }

    let ok;
    if (contentType === "text/html") {
      // Defense in depth: strip anything executable before inserting app HTML into the page, in case
      // the target is a plain contenteditable (which, unlike Jira's editor, won't sanitize on paste).
      const safe = sanitizeHtml(content);
      ok = pasteRich(el, safe, htmlToPlain(safe));
    } else if (contentType === "application/rtf") {
      ok = pasteRtf(el, content);
      if (rtfWarnings) {
        toast("Pasted as RTF — many web editors can't render RTF and may show plain text instead.");
      }
    } else {
      // text/plain, text/markdown — insert the source as plain text.
      ok = insertPlain(el, content);
    }

    if (!ok) toast("TTM Connect: couldn't insert into this field.");
  }

  // ---- editability ----
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA") return !el.disabled && !el.readOnly;
    if (tag === "INPUT") {
      if (el.disabled || el.readOnly) return false;
      return /^(text|search|url|tel|email|password|number|)$/i.test(el.type || "text");
    }
    return el.isContentEditable;
  }

  // ---- rich (HTML) ----
  function pasteRich(el, html, plain) {
    const dt = new DataTransfer();
    dt.setData("text/html", html);
    dt.setData("text/plain", plain);
    if (firePaste(el, dt)) return true;

    // Fallbacks: contenteditable -> insertHTML; input/textarea -> plain text.
    if (el.isContentEditable) {
      if (execInsert("insertHTML", html)) return true;
      return insertPlain(el, plain);
    }
    return insertPlain(el, plain);
  }

  // ---- RTF (kept as RTF; text/plain fallback is a best-effort strip) ----
  function pasteRtf(el, rtf) {
    const dt = new DataTransfer();
    dt.setData("text/rtf", rtf);
    const plain = stripRtf(rtf);
    dt.setData("text/plain", plain);
    if (firePaste(el, dt)) return true;
    return insertPlain(el, plain);
  }

  // ---- plain text ----
  function insertPlain(el, text) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      if (typeof el.setRangeText === "function") {
        el.setRangeText(text, start, end, "end");
      } else {
        el.value = el.value.slice(0, start) + text + el.value.slice(end);
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    // contenteditable
    const dt = new DataTransfer();
    dt.setData("text/plain", text);
    if (firePaste(el, dt)) return true;
    return execInsert("insertText", text);
  }

  // ---- low-level insertion helpers ----
  function firePaste(el, dataTransfer) {
    el.focus();
    let ev;
    try {
      ev = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dataTransfer });
    } catch {
      ev = null;
    }
    // Some engines drop clipboardData passed to the constructor; force it on.
    if (ev && ev.clipboardData !== dataTransfer) {
      try {
        Object.defineProperty(ev, "clipboardData", { value: dataTransfer });
      } catch {
        ev = null;
      }
    }
    if (!ev) return false;
    // dispatchEvent returns false when a listener called preventDefault — i.e. the editor consumed it.
    const notCancelled = el.dispatchEvent(ev);
    return !notCancelled;
  }

  function execInsert(command, value) {
    try {
      return document.execCommand(command, false, value);
    } catch {
      return false;
    }
  }

  // ---- text utilities ----
  function htmlToPlain(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body ? doc.body.textContent || "" : "";
  }

  // Remove executable/loadable constructs from HTML before it is inserted into the page.
  // DOMParser builds an INERT document (no script execution, no resource loading), so it is safe to
  // parse untrusted HTML here; we strip and then re-serialize.
  const URL_ATTRS = /^(href|src|xlink:href|srcset|background|action|formaction|poster|data)$/;
  function sanitizeHtml(html) {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    const body = doc.body;
    if (!body) return "";
    body.querySelectorAll("script, iframe, object, embed, link, meta, base, noscript, template, form")
      .forEach((el) => el.remove());
    body.querySelectorAll("*").forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        // Drop inline event handlers (onclick, onerror, …).
        if (name.startsWith("on")) { el.removeAttribute(attr.name); continue; }
        // Drop javascript:/data: (script) URLs from URL-bearing attributes.
        if (URL_ATTRS.test(name) && /^\s*(javascript|data|vbscript):/i.test(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }
    });
    return body.innerHTML;
  }

  function stripRtf(rtf) {
    // Best-effort RTF -> text: drop hidden groups, control words, and braces, unescape hex bytes.
    return rtf
      .replace(/\{\\\*[^{}]*\}/g, "")
      .replace(/\\'[0-9a-fA-F]{2}/g, "")
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\tab/g, "\t")
      .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
      .replace(/[{}]/g, "")
      .replace(/\r?\n{3,}/g, "\n\n")
      .trim();
  }

  // ---- toast ----
  let toastEl = null;
  let toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.setAttribute("role", "status");
      Object.assign(toastEl.style, {
        position: "fixed",
        zIndex: "2147483647",
        right: "16px",
        bottom: "16px",
        maxWidth: "320px",
        padding: "10px 14px",
        background: "#323130",
        color: "#fff",
        font: "13px/1.4 system-ui, sans-serif",
        borderRadius: "6px",
        boxShadow: "0 2px 12px rgba(0,0,0,.35)",
        opacity: "0",
        transition: "opacity .15s ease",
        pointerEvents: "none",
      });
      document.documentElement.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(() => { toastEl.style.opacity = "1"; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { if (toastEl) toastEl.style.opacity = "0"; }, 4000);
  }
})();
