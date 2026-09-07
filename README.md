# Anti New-Tab Ads

A lightweight userscript that prevents video streaming & general sites from opening unwanted ad tabs when you interact with the player (volume, seek bar, clicks, etc.).

## Why this exists

Traditional ad blockers (uBlock Origin, Brave Shields, AdGuard, etc.) are excellent, but they often miss a specific type of aggressive ad:

- The site loads JavaScript from its own domain
- That script waits for a normal action (changing volume, dragging the progress bar, clicking the player)
- Then it forces a new tab with an advertisement

This userscript works by directly overriding `window.open`, catching many of these cases that normal ad blockers miss.  
It is meant to be used **together with** your regular ad blocker.

## Features

- Blocks unwanted new tabs opened by video players
- Keyboard shortcuts for easy control
- On-screen notifications
- Blocked counter
- Hold `Ctrl` (or `Cmd` on Mac) to temporarily allow a new tab
- Extremely lightweight

## Keyboard Shortcuts

| Shortcut            | Action                          |
|---------------------|---------------------------------|
| `Alt + Shift + A`   | Toggle protection ON / OFF      |
| `Alt + Shift + D`   | Toggle debug notifications      |
| `Alt + Shift + S`   | Show current status + blocked count |

## Installation

1. Install a userscript manager:
   - [Violentmonkey](https://violentmonkey.github.io/) (recommended)
   - or [Tampermonkey](https://www.tampermonkey.net/)

2. Install the script:  
   **[Click here to install](https://raw.githubusercontent.com/samwritessecurity/anti-new-tab-ads/main/anti-new-tab-ads.user.js)**

3. Refresh any video streaming page or website in use.

## Configuration

You can edit these options at the top of the script:

```js
const CONFIG = {
    debug: true,               // Show notifications + console logs
    allowWithCtrl: true,       // Allow new tabs when holding Ctrl/Cmd
    defaultEnabled: true,      // Start with protection enabled
};
