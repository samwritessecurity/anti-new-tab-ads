// ==UserScript==
// @name         Anti New-Tab Ads
// @namespace    https://github.com/samwritessecurity/anti-new-tab-ads
// @version      0.8.4
// @description  Blocks ad tabs on video sites, including iframe players. Desktop UI on the top page only.
// @author       samwritessecurity
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @inject-into  page
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = "0.8.4";
  const MSG = "anti-newtab-ads";
  const inFrame = window !== window.top;

  const CONFIG = {
    debug: true,
    allowWithCtrl: true,
    defaultEnabled: true,
    showShield: true,
    defaultPosition: "bottom-left",
  };

  function readBool(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "true";
  }

  let enabled = readBool("antiNewTabEnabled", CONFIG.defaultEnabled);
  let uiVisible = CONFIG.showShield && readBool("antiNewTabUiVisible", true);
  let debug = readBool("antiNewTabDebug", CONFIG.debug);
  CONFIG.allowWithCtrl = readBool("antiNewTabAllowCtrl", CONFIG.allowWithCtrl);
  let position = localStorage.getItem("antiNewTabUiPosition") || CONFIG.defaultPosition;
  let blockedCount = Number(sessionStorage.getItem("antiNewTabBlocked") || 0) || 0;
  let lastBlocked = sessionStorage.getItem("antiNewTabLast") || "";
  let panelOpen = false;

  const nativeOpen = Window.prototype.open;
  const nativeCreate = Document.prototype.createElement;
  const nativeAppend = Node.prototype.appendChild;
  const nativeInsert = Node.prototype.insertBefore;
  const nativeSubmit = HTMLFormElement.prototype.submit;

  let uiHost = null;
  let shadow = null;
  let uiRefs = null;

  function log() {
    if (!debug) return;
    console.log.apply(console, ["%c[Anti-NewTab]", "color:#4da3ff;font-weight:bold"].concat([].slice.call(arguments)));
  }

  function toast(message) {
    if (inFrame) {
      pingTop({ type: "toast", message: message });
      return;
    }
    try {
      const old = document.getElementById("anti-newtab-toast");
      if (old) old.remove();
      const el = nativeCreate.call(document, "div");
      el.id = "anti-newtab-toast";
      el.textContent = message;
      Object.assign(el.style, {
        position: "fixed",
        bottom: "72px",
        right: "24px",
        background: "#151922",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        zIndex: "2147483647",
        boxShadow: "0 6px 24px rgba(0,0,0,.35)",
        pointerEvents: "none",
      });
      (document.body || document.documentElement).appendChild(el);
      setTimeout(function () { el.remove(); }, 2500);
    } catch (e) {}
  }

  function pingTop(payload) {
    payload.source = MSG;
    try { window.postMessage(payload, "*"); } catch (e) {}
    try { if (window.top && window.top !== window) window.top.postMessage(payload, "*"); } catch (e) {}
  }

  function pingFrames(payload) {
    payload.source = MSG;
    try { window.postMessage(payload, "*"); } catch (e) {}
    const list = document.getElementsByTagName("iframe");
    for (let i = 0; i < list.length; i++) {
      try { list[i].contentWindow.postMessage(payload, "*"); } catch (e) {}
    }
  }

  function saveEnabled() {
    localStorage.setItem("antiNewTabEnabled", enabled);
    pingFrames({ type: "enabled", enabled: enabled });
  }

  function noteBlock(kind, url) {
    blockedCount += 1;
    lastBlocked = String(url || kind || "").slice(0, 120);
    try {
      sessionStorage.setItem("antiNewTabBlocked", String(blockedCount));
      sessionStorage.setItem("antiNewTabLast", lastBlocked);
    } catch (e) {}
    log("Blocked", kind, "→", url || "(no url)", location.host);
    if (debug) toast("Blocked ad " + kind + " (" + blockedCount + ")");
    if (inFrame) {
      pingTop({
        type: "blocked",
        kind: kind,
        url: lastBlocked,
        host: location.host,
      });
    }
    refreshUI();
  }

  function allowByGesture() {
    if (!CONFIG.allowWithCtrl) return false;
    const evt = window.event;
    return Boolean(evt && (evt.ctrlKey || evt.metaKey));
  }

  function hookedOpen(url, target, features) {
    if (!enabled) return nativeOpen.call(this, url, target, features);
    if (allowByGesture()) {
      log("Allowed (Ctrl/Cmd):", url);
      return nativeOpen.call(this, url, target, features);
    }
    noteBlock("tab", url);
    return null;
  }

  function lockOpen(win) {
    if (!win) return;
    try {
      const desc = Object.getOwnPropertyDescriptor(win, "open");
      if (desc && desc.get && desc.get.__antiNewTab) return;
      const getter = function () { return hookedOpen; };
      getter.__antiNewTab = true;
      Object.defineProperty(win, "open", {
        configurable: true,
        enumerable: true,
        get: getter,
        set: function () { log("Ignored restore of window.open"); },
      });
    } catch (e) {
      try { win.open = hookedOpen; } catch (e2) {}
    }
  }

  function lockPrototype() {
    try {
      Object.defineProperty(Window.prototype, "open", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: hookedOpen,
      });
    } catch (e) {
      try { Window.prototype.open = hookedOpen; } catch (e2) {}
    }
  }

  function patchIframe(el) {
    if (!el || el.tagName !== "IFRAME") return;
    const tryLock = function () {
      try { lockOpen(el.contentWindow); } catch (e) {}
      try { el.contentWindow.postMessage({ source: MSG, type: "enabled", enabled: enabled }, "*"); } catch (e) {}
    };
    tryLock();
    try { el.addEventListener("load", tryLock); } catch (e) {}
  }

  Document.prototype.createElement = function (tag, opts) {
    const el = nativeCreate.call(this, tag, opts);
    try {
      if (String(tag).toLowerCase() === "iframe") patchIframe(el);
    } catch (e) {}
    return el;
  };

  Node.prototype.appendChild = function (child) {
    const out = nativeAppend.call(this, child);
    try { patchIframe(child); } catch (e) {}
    return out;
  };

  Node.prototype.insertBefore = function (child, ref) {
    const out = nativeInsert.call(this, child, ref);
    try { patchIframe(child); } catch (e) {}
    return out;
  };

  function isBlankTarget(value) {
    const t = String(value || "").toLowerCase();
    return t === "_blank" || t === "_new" || (inFrame && (t === "_parent" || t === "_top"));
  }

  HTMLFormElement.prototype.submit = function () {
    if (enabled && isBlankTarget(this.target) && !allowByGesture()) {
      noteBlock("form", this.action);
      return;
    }
    return nativeSubmit.call(this);
  };

  function onSubmit(event) {
    if (!enabled) return;
    const form = event.target;
    if (!form || form.tagName !== "FORM" || !isBlankTarget(form.target)) return;
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    noteBlock("form", form.action);
  }

  function onPointer(event) {
    if (!enabled) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return;
    const path = event.composedPath ? event.composedPath() : [];
    if (uiHost && path.indexOf(uiHost) !== -1) return;
    const link = event.target && event.target.closest && event.target.closest("a[href], area[href]");
    if (!link || !isBlankTarget(link.target)) return;
    if (!inFrame) {
      try {
        if (new URL(link.href, location.href).origin === location.origin) return;
      } catch (e) {}
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    noteBlock("link", link.href);
  }

  function positionStyles() {
    const gap = "16px";
    const map = {
      "bottom-left": { bottom: gap, left: gap, top: "auto", right: "auto" },
      "bottom-right": { bottom: gap, right: gap, top: "auto", left: "auto" },
      "top-left": { top: gap, left: gap, bottom: "auto", right: "auto" },
      "top-right": { top: gap, right: gap, bottom: "auto", left: "auto" },
    };
    return map[position] || map["bottom-left"];
  }

  function refreshUI() {
    if (!uiRefs) return;
    Object.assign(uiRefs.root.style, positionStyles());
    uiRefs.enabled.checked = enabled;
    uiRefs.debug.checked = debug;
    uiRefs.ctrl.checked = CONFIG.allowWithCtrl;
    uiRefs.position.value = position;
    uiRefs.status.textContent = enabled ? "ON" : "OFF";
    uiRefs.status.className = "status-value " + (enabled ? "on" : "off");
    uiRefs.count.textContent = String(blockedCount);
    uiRefs.badge.textContent = blockedCount > 99 ? "99+" : String(blockedCount);
    uiRefs.badge.hidden = blockedCount < 1;
    uiRefs.last.textContent = lastBlocked || "None yet";
    uiRefs.shield.style.opacity = enabled ? "0.92" : "0.5";
    uiRefs.panel.hidden = !panelOpen;
    if (uiHost) uiHost.style.display = uiVisible ? "block" : "none";
  }

  function createUI() {
    if (inFrame || uiHost || !document.documentElement) return;

    uiHost = nativeCreate.call(document, "div");
    uiHost.id = "anti-newtab-ui";
    uiHost.setAttribute("aria-label", "Anti New-Tab Ads");
    Object.assign(uiHost.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "0",
      left: "0",
      width: "0",
      height: "0",
      overflow: "visible",
      pointerEvents: "none",
    });
    shadow = uiHost.attachShadow({ mode: "closed" });

    const style = nativeCreate.call(document, "style");
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .root {
        position: fixed;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        font-size: 13px;
        color: #f4f7fb;
        user-select: none;
        pointer-events: auto;
      }
      .shield {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 12px;
        background: rgba(18, 23, 33, .92);
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,.28);
        position: relative;
      }
      .shield:hover { background: rgba(25, 31, 44, .98); }
      .shield svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; }
      .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: #2d9cdb;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
      }
      .panel {
        width: 268px;
        margin-top: 8px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
        background: rgba(16, 20, 29, .97);
        box-shadow: 0 12px 40px rgba(0,0,0,.38);
      }
      .header { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
      .title { font-weight: 700; }
      .version { font-size: 10px; opacity: .5; margin-top: 2px; }
      .close, .hide-ui {
        border: 0; background: transparent; color: #fff; cursor: pointer; font: inherit;
      }
      .close { opacity: .55; font-size: 18px; }
      .status, .stat, .last {
        display: flex; justify-content: space-between; gap: 8px;
        padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.06); margin-bottom: 8px;
      }
      .status-value.on { color: #75d69c; font-weight: 700; }
      .status-value.off { color: #ff8d8d; font-weight: 700; }
      .last { display: block; }
      .last span { display: block; opacity: .55; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
      .last code { display: block; margin-top: 4px; font-size: 11px; word-break: break-all; opacity: .85; }
      .toggle-row, .select-row, .shortcut {
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
        padding: 8px 0; border-top: 1px solid rgba(255,255,255,.08);
      }
      .switch { position: relative; width: 40px; height: 22px; flex: none; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; inset: 0; border-radius: 999px; background: #4b5260; cursor: pointer; }
      .slider:before { content: ""; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; border-radius: 50%; background: #fff; transition: .18s; }
      input:checked + .slider { background: #2d9cdb; }
      input:checked + .slider:before { transform: translateX(18px); }
      select {
        max-width: 120px; border: 1px solid rgba(255,255,255,.14); border-radius: 7px;
        padding: 5px 7px; background: #202632; color: #fff; font: inherit; font-size: 12px;
      }
      .shortcuts-title { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; opacity: .45; margin-top: 6px; }
      kbd { font: 10px inherit; padding: 2px 5px; border-radius: 4px; background: rgba(255,255,255,.08); }
      .hide-ui {
        width: 100%; margin-top: 10px; border-radius: 8px; padding: 8px;
        background: rgba(255,255,255,.06); color: rgba(255,255,255,.72);
      }
    `;

    const root = nativeCreate.call(document, "div");
    root.className = "root";
    root.innerHTML = `
      <button class="shield" title="Anti New-Tab Ads" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.6-2.9 8.3-7 10-4.1-1.7-7-5.4-7-10V6l7-3z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span class="badge" hidden>0</span>
      </button>
      <div class="panel" hidden>
        <div class="header">
          <div>
            <div class="title">Anti New-Tab Ads</div>
            <div class="version">v${VERSION} · desktop</div>
          </div>
          <button class="close" type="button" title="Close">×</button>
        </div>
        <div class="status">
          <span>Protection</span>
          <span class="status-value on">ON</span>
        </div>
        <div class="stat">
          <span>Blocked this tab</span>
          <strong class="count">0</strong>
        </div>
        <div class="last">
          <span>Last block</span>
          <code class="last-url">None yet</code>
        </div>
        <div class="toggle-row">
          <label for="enabled">Protection</label>
          <label class="switch"><input id="enabled" type="checkbox"><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <label for="debug">Debug toasts</label>
          <label class="switch"><input id="debug" type="checkbox"><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <label for="ctrl">Allow Ctrl/Cmd</label>
          <label class="switch"><input id="ctrl" type="checkbox"><span class="slider"></span></label>
        </div>
        <div class="select-row">
          <label for="position">Corner</label>
          <select id="position">
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
          </select>
        </div>
        <div class="shortcuts-title">Shortcuts</div>
        <div class="shortcut"><span>Protection</span><kbd>Alt+Shift+A</kbd></div>
        <div class="shortcut"><span>Debug</span><kbd>Alt+Shift+D</kbd></div>
        <div class="shortcut"><span>Status</span><kbd>Alt+Shift+S</kbd></div>
        <div class="shortcut"><span>Show shield</span><kbd>Alt+Shift+U</kbd></div>
        <button class="hide-ui" type="button">Hide shield</button>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(root);

    uiRefs = {
      root: root,
      shield: root.querySelector(".shield"),
      panel: root.querySelector(".panel"),
      close: root.querySelector(".close"),
      enabled: root.querySelector("#enabled"),
      debug: root.querySelector("#debug"),
      ctrl: root.querySelector("#ctrl"),
      position: root.querySelector("#position"),
      status: root.querySelector(".status-value"),
      count: root.querySelector(".count"),
      badge: root.querySelector(".badge"),
      last: root.querySelector(".last-url"),
      hide: root.querySelector(".hide-ui"),
    };

    uiRefs.shield.addEventListener("click", function () {
      panelOpen = !panelOpen;
      refreshUI();
    });
    uiRefs.close.addEventListener("click", function () {
      panelOpen = false;
      refreshUI();
    });
    uiRefs.enabled.addEventListener("change", function () {
      enabled = uiRefs.enabled.checked;
      saveEnabled();
      toast(enabled ? "Anti New-Tab: ON" : "Anti New-Tab: OFF");
      refreshUI();
    });
    uiRefs.debug.addEventListener("change", function () {
      debug = uiRefs.debug.checked;
      localStorage.setItem("antiNewTabDebug", debug);
      toast(debug ? "Debug toasts: ON" : "Debug toasts: OFF");
    });
    uiRefs.ctrl.addEventListener("change", function () {
      CONFIG.allowWithCtrl = uiRefs.ctrl.checked;
      localStorage.setItem("antiNewTabAllowCtrl", CONFIG.allowWithCtrl);
      pingFrames({ type: "ctrl", allowWithCtrl: CONFIG.allowWithCtrl });
      toast(CONFIG.allowWithCtrl ? "Ctrl/Cmd exception: ON" : "Ctrl/Cmd exception: OFF");
    });
    uiRefs.position.addEventListener("change", function () {
      position = uiRefs.position.value;
      localStorage.setItem("antiNewTabUiPosition", position);
      refreshUI();
    });
    uiRefs.hide.addEventListener("click", function () {
      uiVisible = false;
      panelOpen = false;
      localStorage.setItem("antiNewTabUiVisible", "false");
      refreshUI();
      toast("Shield hidden · Alt+Shift+U to show");
    });

    refreshUI();
  }

  function mountUI() {
    if (inFrame) return;
    if (!CONFIG.showShield && !uiVisible) return;
    if (!document.documentElement) return;
    if (!uiHost) createUI();
    if (!uiHost) return;
    const parent = document.body || document.documentElement;
    if (parent && uiHost.parentNode !== parent) {
      nativeAppend.call(parent, uiHost);
    }
    refreshUI();
  }

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (!data || data.source !== MSG) return;
    if (data.type === "enabled") {
      enabled = Boolean(data.enabled);
      refreshUI();
    }
    if (data.type === "ctrl") {
      CONFIG.allowWithCtrl = Boolean(data.allowWithCtrl);
      refreshUI();
    }
    if (data.type === "blocked" && !inFrame) {
      blockedCount += 1;
      lastBlocked = data.url || data.host || lastBlocked;
      try {
        sessionStorage.setItem("antiNewTabBlocked", String(blockedCount));
        sessionStorage.setItem("antiNewTabLast", lastBlocked);
      } catch (e) {}
      refreshUI();
    }
    if (data.type === "toast" && !inFrame) toast(data.message);
  });

  document.addEventListener("click", onPointer, true);
  document.addEventListener("auxclick", onPointer, true);
  document.addEventListener("pointerdown", onPointer, true);
  document.addEventListener("submit", onSubmit, true);

  document.addEventListener("keydown", function (e) {
    if (e.code === "Escape" && panelOpen) {
      panelOpen = false;
      refreshUI();
    }
    if (!(e.altKey && e.shiftKey)) return;
    if (e.code === "KeyA") {
      e.preventDefault();
      enabled = !enabled;
      saveEnabled();
      toast(enabled ? "Anti New-Tab: ON" : "Anti New-Tab: OFF");
      refreshUI();
    }
    if (e.code === "KeyD") {
      e.preventDefault();
      debug = !debug;
      localStorage.setItem("antiNewTabDebug", debug);
      toast(debug ? "Debug toasts: ON" : "Debug toasts: OFF");
      refreshUI();
    }
    if (e.code === "KeyS") {
      e.preventDefault();
      toast("Status: " + (enabled ? "ON" : "OFF") + " | Blocked: " + blockedCount + " | " + location.host);
    }
    if (e.code === "KeyU") {
      e.preventDefault();
      uiVisible = true;
      localStorage.setItem("antiNewTabUiVisible", "true");
      mountUI();
      toast("Shield visible");
    }
  }, true);

  lockPrototype();
  lockOpen(window);

  document.addEventListener("DOMContentLoaded", mountUI, { once: true });
  window.addEventListener("load", mountUI, { once: true });
  if (document.body) mountUI();

  setInterval(function () {
    lockOpen(window);
    lockPrototype();
    try {
      const list = document.getElementsByTagName("iframe");
      for (let i = 0; i < list.length; i++) patchIframe(list[i]);
    } catch (e) {}
    if (!inFrame) mountUI();
  }, 200);

  log("v" + VERSION, "on", location.host, inFrame ? "(iframe)" : "(top)", enabled ? "ON" : "OFF");
})();
