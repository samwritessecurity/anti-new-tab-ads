# Anti New-Tab Ads

A lightweight userscript that prevents unwanted new tabs and related browsing-context behaviour, especially when interacting with video players and streaming websites.

Anti New-Tab Ads started as a small JavaScript userscript that intercepted unwanted `window.open()` calls.

It has since grown into a more complete browser utility with iframe-aware protection, new-tab link and form handling, persistent settings, keyboard shortcuts, and a small desktop control panel.

> **Current version: 0.8.4**

---

## Why Anti New-Tab Ads?

Some websites open unwanted tabs when you interact with a video player.

You click the volume button.

You move the timeline.

You click the player.

Instead of simply performing the action, the website may attempt to open another tab or browsing context.

Traditional ad blockers can address many forms of advertising, but Anti New-Tab Ads focuses on a narrower problem:

> **Preventing unwanted new-tab and related browsing-context behaviour.**

It is designed to work alongside a normal content blocker rather than replace one.

---

## What's New in 0.8.4?

Version 0.8.4 represents a significant evolution of the project.

### 🛡️ New Desktop UI

Anti New-Tab Ads now has a small shield button and control panel on the top-level page.

The interface provides access to:

- Protection status
- Blocked activity for the current tab
- Last blocked destination
- Debug mode
- Ctrl/Cmd popup exception
- Shield position
- UI visibility

The UI can be hidden without disabling the protection.

### 🖼️ iframe-Aware Protection

Video players and other content can run inside iframes.

Anti New-Tab Ads now detects frame contexts and attempts to apply its protection to iframe windows as well.

The script also monitors dynamically created iframes and communicates protection state and blocked events between iframe and top-level contexts.

### 🔗 More Than `window.open()`

The original implementation focused primarily on `window.open()`.

The current version also handles additional mechanisms that can result in unwanted new browsing contexts, including:

- `window.open()`
- Links using `_blank`
- Links using `_new`
- Forms targeting `_blank`
- Forms targeting `_new`
- Dynamically created iframe contexts

### 💾 Persistent Settings

User preferences are stored in browser storage.

The following settings can persist between page loads:

- Protection state
- UI visibility
- Debug mode
- Ctrl/Cmd exception
- Shield position

Blocked activity is tracked separately for the current browser session.

### 🧩 Shadow DOM UI

The control panel is created inside a closed Shadow DOM.

This helps isolate the Anti New-Tab Ads interface from the CSS and DOM styling of the website where the userscript is running.

---

## Features

### New-Tab Protection

The primary purpose of the project is to prevent unwanted new tabs and related browsing-context actions.

When protection is enabled, the script intercepts supported attempts before the unwanted browsing context is opened.

### iframe Support

Many video players are embedded inside iframes.

Anti New-Tab Ads can operate inside frame contexts and communicate with the top-level page.

The UI itself is displayed only on the top-level page.

### Link Protection

The script monitors interactions with links and checks for new-tab targets such as:

```html
<a href="https://example.com" target="_blank">
    Open something
</a>
