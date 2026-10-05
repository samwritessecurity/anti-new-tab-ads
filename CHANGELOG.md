# Changelog

All notable changes to Anti New-Tab Ads are documented in this file.

---

## [0.8.4] - 2026-10-05

### Added

- Desktop control panel.
- Shield button for opening the Anti New-Tab Ads controls.
- Protection status display.
- Blocked activity display for the current tab.
- Last blocked destination display.
- Debug mode toggle.
- Ctrl/Cmd popup exception toggle.
- Shield position selector.
- Shield visibility control.
- `Alt + Shift + U` shortcut for restoring the shield.
- iframe-aware protection.
- Communication between iframe and top-level contexts using `postMessage()`.
- Protection for supported links using `_blank` and `_new`.
- Protection for supported forms targeting `_blank` and `_new`.
- Persistent UI settings using `localStorage`.
- Session-based blocked activity using `sessionStorage`.
- Shadow DOM isolation for the desktop UI.

### Improved

- Protection now covers more than `window.open()`.
- Dynamically created iframes are monitored and patched where possible.
- `window.open()` protection is reapplied defensively.
- Protection state can be synchronised between browsing contexts.
- The user interface can be hidden without disabling protection.

### Changed

- The UI is displayed only on the top-level page.
- The script explicitly uses page-context injection.
- The project has evolved from a simple popup-interception script into a broader browser utility.

### Known Limitations

- Anti New-Tab Ads is not a complete ad blocker.
- Websites can use popup, redirect, navigation, or advertising mechanisms that are outside the current interception paths.
- Ctrl/Cmd gesture detection currently relies on `window.event` and may require improvement in a future version.

---

## [0.7.x]

Development versions leading toward the expanded browser protection and user interface.

The 0.7.x development cycle focused on improving browser-context injection, experimenting with a more usable control interface, and expanding protection beyond the original implementation.

---

## [0.6.0]

### Added

- `window.open()` interception.
- Protection toggle.
- Persistent protection state.
- Debug mode.
- Debug notifications.
- Ctrl/Cmd popup exception.
- Keyboard shortcuts.
- Blocked-event counter.

### Original Purpose

The project was created to prevent unwanted advertising tabs from opening while interacting with video players and streaming websites.

---

## Earlier Versions

Earlier development versions focused on the original popup-interception concept and experimentation with browser userscript behaviour.
