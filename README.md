# Anti New-Tab Ads

A Violentmonkey userscript that stops video sites from opening **ad tabs** when you play, change volume, or seek.

It is **not** a general ad blocker. It does not hide banners. It blocks the hijack: a new tab (or popunder) that fires because you touched the player.

## Why this still matters if you already use an ad blocker

Brave Shields and uBlock Origin block **known ad addresses**.

Streaming sites often:

- put the player in a **different domain iframe**
- wait for your **click**
- then call `window.open`, a fake `_blank` link, or a `_blank` form

The browser treats that as “the user asked for a tab.” Filter lists never see a classic ad URL. This script hooks those open/link/form tricks, including inside the player frame.

## Install (desktop)

1. Install [Violentmonkey](https://violentmonkey.github.io/) in Brave (or Chrome / Firefox).
2. Open Violentmonkey → **+** → **New**.
3. Paste [`anti-new-tab-ads.user.js`](anti-new-tab-ads.user.js).
4. Save, then hard-refresh the video page.

You should see a small **shield** (bottom-left). Click it for status, or hide it.

Do not run an unpacked copy of this and the userscript at the same time.

## Config

At the top of the script:

```javascript
const CONFIG = {
  debug: true,
  allowWithCtrl: true,
  defaultEnabled: true,
  showShield: true,          // false = no on-page shield; blocking still runs
  defaultPosition: "bottom-left",
};

## Shortcuts

| Keys | Action |
|---|---|
| Alt+Shift+A | Protection on/off |
| Alt+Shift+D | Debug toasts |
| Alt+Shift+S | Status |
| Alt+Shift+U | Show shield |
| Ctrl/Cmd + click | Allow that one new tab (if the switch is on) |
