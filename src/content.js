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

  // Two-stage HTML sanitizer, ported from the desktop app's HtmlSanitizer so both sides of the
  // connector treat template HTML identically. Stage 1 is an allow-list (only known-good formatting
  // elements/attributes survive; active/remote-loading elements are dropped with their contents,
  // everything else is unwrapped keeping its text). Stage 2 is an independent deny-list pass over the
  // re-parsed output, catching anything a serialization round-trip could resurrect (mutation-XSS).
  // Parsing is done with DOMParser, which builds an INERT document (no script/resource loading), and
  // text nodes are never touched, so escaped code samples in <pre>/<code> pass through unchanged.
  const ALLOWED_TAGS = new Set([
    "p", "div", "span", "br", "hr", "blockquote", "pre", "code",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "mark",
    "sub", "sup", "small", "abbr", "cite", "q", "kbd", "samp", "var", "wbr",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "colgroup", "col",
    "a",
  ]);
  const DROP_WITH_CONTENT = new Set([
    "script", "style", "iframe", "object", "embed", "applet", "noscript", "template",
    "link", "meta", "base", "title", "head", "form", "input", "button", "select", "option",
    "optgroup", "textarea", "frame", "frameset", "svg", "math", "canvas", "video", "audio",
    "source", "track", "img", "picture", "map", "area", "portal",
    "xmp", "plaintext", "listing", "noembed", "noframes",
  ]);
  const GLOBAL_ATTRS = new Set(["class", "style", "title", "dir", "lang", "align"]);
  const TAG_ATTRS = {
    a: new Set(["href", "target", "rel"]),
    ol: new Set(["start", "type"]),
    td: new Set(["colspan", "rowspan", "colwidth", "headers", "scope", "valign", "width"]),
    th: new Set(["colspan", "rowspan", "colwidth", "headers", "scope", "valign", "width"]),
    col: new Set(["span", "width"]),
    colgroup: new Set(["span", "width"]),
  };
  const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"];
  const SAFE_STYLE_PROPS = new Set([
    "color", "background-color", "text-align", "width", "height",
    "font-weight", "font-style", "text-decoration", "text-decoration-line", "vertical-align",
  ]);
  const DANGEROUS_STYLE = /expression\s*\(|javascript\s*:|vbscript\s*:|-moz-binding|behavior\s*:|@import|url\s*\(\s*['"]?\s*(?:javascript|vbscript|data)\s*:/i;
  const DENY_TAGS = new Set([
    "script", "style", "iframe", "frame", "frameset", "object", "embed", "applet", "base",
    "basefont", "meta", "link", "form", "svg", "math", "noscript", "template", "title", "head",
    "xml", "isindex", "marquee", "blink", "listing", "xmp", "plaintext", "portal",
  ]);
  const DANGEROUS_SCHEMES = [
    "javascript:", "vbscript:", "livescript:", "mocha:",
    "data:text/html", "data:application", "data:image/svg",
  ];

  function sanitizeHtml(html) {
    if (!html) return html || "";
    return denyListPass(allowListPass(html));
  }

  // ---- Stage 1: allow-list ----
  function allowListPass(html) {
    let doc;
    try { doc = new DOMParser().parseFromString(html, "text/html"); } catch { return ""; }
    if (!doc || !doc.body) return "";
    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  }

  function sanitizeNode(parent) {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
      } else if (child.nodeType === Node.TEXT_NODE) {
        // keep — code samples live here
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const name = child.tagName.toLowerCase();
        if (DROP_WITH_CONTENT.has(name)) {
          child.remove();
        } else if (ALLOWED_TAGS.has(name)) {
          filterAttributes(child, name);
          sanitizeNode(child);
        } else {
          sanitizeNode(child);   // clean subtree first
          unwrap(parent, child); // then strip the tag, keeping its text
        }
      } else {
        child.remove(); // CDATA / processing instructions etc.
      }
    }
  }

  function unwrap(parent, element) {
    while (element.firstChild) parent.insertBefore(element.firstChild, element);
    element.remove();
  }

  function filterAttributes(el, tag) {
    for (const attr of Array.from(el.attributes)) {
      const an = attr.name.toLowerCase();
      if (!isAttrAllowed(tag, an)) { el.removeAttribute(attr.name); continue; }
      if (an === "style") {
        const cleaned = sanitizeStyle(attr.value);
        if (cleaned.length === 0) el.removeAttribute(attr.name); else el.setAttribute("style", cleaned);
        continue;
      }
      if (an === "href" && !isAllowedUrl(attr.value)) { el.removeAttribute(attr.name); continue; }
    }
    // Links opening a new context get rel="noopener noreferrer" (reverse tab-nabbing).
    if (tag === "a" && el.hasAttribute("target")) ensureSafeRel(el);
  }

  function isAttrAllowed(tag, attr) {
    if (attr.startsWith("on")) return false;
    if (attr.startsWith("data-")) return true;
    if (GLOBAL_ATTRS.has(attr)) return true;
    const set = TAG_ATTRS[tag];
    return !!set && set.has(attr);
  }

  function isAllowedUrl(value) {
    if (!value || !value.trim()) return true;
    let v = decodeEntities(value).replace(/[\s\x00-\x1f\x7f-\x9f]/g, "");
    const colon = v.indexOf(":");
    if (colon < 0) return true;               // relative / anchor / query
    const slash = v.indexOf("/");
    if (slash >= 0 && slash < colon) return true; // ':' is in the path, not a scheme
    const lower = v.toLowerCase();
    return ALLOWED_SCHEMES.some((s) => lower.startsWith(s));
  }

  function sanitizeStyle(style) {
    if (!style || !style.trim()) return "";
    const kept = [];
    for (const decl of style.split(";")) {
      if (!decl.trim()) continue;
      const colon = decl.indexOf(":");
      if (colon <= 0) continue;
      const prop = decl.slice(0, colon).trim().toLowerCase();
      const val = decl.slice(colon + 1).trim();
      if (!val || !SAFE_STYLE_PROPS.has(prop) || hasUnsafeStyleValue(val)) continue;
      kept.push(prop + ": " + val);
    }
    return kept.join("; ");
  }

  function hasUnsafeStyleValue(val) {
    if (/["'<>\\{}]/.test(val)) return true;
    const v = val.toLowerCase();
    return v.includes("url(") || v.includes("expression") || v.includes("javascript:") ||
      v.includes("vbscript:") || v.includes("-moz-binding") || v.includes("behavior:") ||
      v.includes("@import") || v.includes("/*");
  }

  function ensureSafeRel(a) {
    const tokens = (a.getAttribute("rel") || "").split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());
    if (!tokens.includes("noopener")) tokens.push("noopener");
    if (!tokens.includes("noreferrer")) tokens.push("noreferrer");
    a.setAttribute("rel", tokens.join(" "));
  }

  // ---- Stage 2: deny-list hardening ----
  function denyListPass(html) {
    if (!html) return "";
    let doc;
    try { doc = new DOMParser().parseFromString(html, "text/html"); } catch { return ""; }
    if (!doc || !doc.body) return "";

    // Remove denied elements (with contents) and comments — re-parse deliberately catches markup a
    // round-trip could revive.
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
    const remove = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === Node.COMMENT_NODE) remove.push(n);
      else if (DENY_TAGS.has(n.tagName.toLowerCase())) remove.push(n);
    }
    for (const n of remove) n.remove();

    // Strip dangerous attributes from whatever remains.
    for (const el of Array.from(doc.body.querySelectorAll("*"))) {
      for (const attr of Array.from(el.attributes)) {
        const an = attr.name.toLowerCase();
        if (an.startsWith("on")) { el.removeAttribute(attr.name); continue; }
        if (an === "style" && DANGEROUS_STYLE.test(attr.value || "")) { el.removeAttribute(attr.name); continue; }
        if (startsWithDangerousScheme(decodeForScan(attr.value))) el.removeAttribute(attr.name);
      }
    }
    return doc.body.innerHTML;
  }

  // Decode entities (via an unattached, RCDATA <textarea> — never parses tags, so it's inert) and
  // strip whitespace/control/NUL so an obfuscated scheme can't hide from the checks.
  function decodeEntities(str) {
    const ta = document.createElement("textarea");
    ta.innerHTML = str;
    return ta.value;
  }
  function decodeForScan(value) {
    if (!value) return "";
    return decodeEntities(value).replace(/[\s\x00-\x1f\x7f-\x9f]/g, "");
  }
  function startsWithDangerousScheme(decoded) {
    const d = decoded.toLowerCase();
    return DANGEROUS_SCHEMES.some((s) => d.startsWith(s));
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
