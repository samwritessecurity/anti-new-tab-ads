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

and:

<a href="https://example.com" target="_new">
    Open something
</a>

Supported unwanted navigation attempts can then be blocked before they complete.

Form Protection

Forms can also target another browsing context.

For example:

<form action="/something" target="_blank">
    <button type="submit">Continue</button>
</form>

Anti New-Tab Ads monitors supported form submissions targeting _blank or _new and can prevent them while protection is enabled.

Desktop Control Panel

Click the Anti New-Tab Ads shield to open the control panel.

The panel provides controls for:

Protection
Debug toasts
Allow Ctrl/Cmd popups
Shield position
Hiding the shield

It also displays current protection status, blocked activity, and the last blocked destination.

Shield Position

The shield can be positioned in any of four corners:

Top-left
Top-right
Bottom-left
Bottom-right

The selected position is saved.

Hide the Shield

If you don't want the interface visible while browsing, you can hide it.

Hiding the shield does not disable Anti New-Tab Ads.

Use:

Alt + Shift + U

to show the shield again.

Debug Mode

Debug mode provides additional information through the browser console and optional notifications.

It can be enabled or disabled from the UI or with:

Alt + Shift + D
Ctrl/Cmd Exception

When enabled, holding Ctrl on Windows/Linux or Cmd on macOS can allow a supported popup action through.

This setting can be changed from the UI.

Keyboard Shortcuts
Shortcut	Action
Alt + Shift + A	Toggle protection
Alt + Shift + D	Toggle debug mode
Alt + Shift + S	Show current status
Alt + Shift + U	Show the Anti New-Tab Ads shield
Installation

Anti New-Tab Ads is a userscript.

You need a userscript manager such as Violentmonkey or Tampermonkey.

Install from GitHub

Open:

anti-new-tab-ads.user.js

If your userscript manager is configured to handle .user.js files, it should offer to install the script.

Manual Installation
Install a compatible userscript manager.
Open the userscript manager dashboard.
Create a new userscript.
Copy the contents of anti-new-tab-ads.user.js.
Save the script.
Open or refresh the website where you want to use it.
Using Anti New-Tab Ads

After installation, open a website where the userscript is active.

On the top-level page, you should see the Anti New-Tab Ads shield.

Click the shield to open the control panel.

From there you can:

Check whether protection is ON or OFF.
See blocked activity for the current tab.
See the most recent blocked destination.
Enable or disable debug notifications.
Enable or disable the Ctrl/Cmd exception.
Move the shield to another corner.
Hide the shield.

Protection can continue running even when the shield is hidden.

How It Works

Anti New-Tab Ads works by intercepting several browser and DOM mechanisms that can result in unwanted new browsing contexts.

window.open()

The script saves the native browser implementation before installing its own handler.

When protection is enabled, supported calls can be intercepted before a new window or tab is created.

When protection is disabled, the original browser implementation is used.

New-Target Links

The script also listens for relevant pointer interactions and checks whether the target is a link or area element using a new browsing target.

This covers cases where a website does not call window.open() at all.

Forms

The script also monitors form submission paths that target new browsing contexts.

This provides another protection layer for websites that use forms rather than JavaScript popup calls.

Iframes

When an iframe is created, Anti New-Tab Ads attempts to apply its protection to the iframe's browsing context.

The script also watches for dynamically inserted iframes.

This is particularly useful for pages where the video player is not part of the top-level document.

Communication Between Contexts

When a block happens inside an iframe, the iframe can communicate the event to the top-level page using postMessage().

This allows the top-level UI to reflect activity that happened inside another browsing context.

Browser Context

The userscript uses:

@run-at document-start
@grant none
@inject-into page

Page-context injection is important because the project needs to interact with page-level browser APIs such as window.open().

Storage

Anti New-Tab Ads uses browser storage for its settings.

Persistent Settings

Stored using localStorage:

Protection state
UI visibility
Debug mode
Ctrl/Cmd exception
Shield position
Current-Session Information

Stored using sessionStorage:

Blocked count
Last blocked destination

This keeps temporary browsing information separate from user preferences.

What Anti New-Tab Ads Is Not

Anti New-Tab Ads is not a complete ad blocker.

It does not attempt to remove:

Banner advertisements
Tracking scripts
Every advertising network
Every redirect
Every popup mechanism
Every form of unwanted navigation
All website advertising

Its purpose is narrower:

Prevent unwanted new tabs and related browsing-context behaviour.

For broader advertising and tracking protection, use a dedicated content blocker alongside Anti New-Tab Ads.

Limitations

No userscript can assume that every website implements the same behaviour.

Anti New-Tab Ads targets specific browser and DOM mechanisms.

A website may use another mechanism that is not currently covered by the project.

For that reason, protection should not be considered universal.

If a website continues opening something unwanted, the behaviour may be caused by a mechanism that Anti New-Tab Ads does not currently intercept.

Troubleshooting
The shield does not appear

Check that:

Your userscript manager is enabled.
Anti New-Tab Ads is enabled.
The page was refreshed after installation.
You are looking at the top-level page rather than inside an iframe.

The UI is intentionally created only on the top-level page.

The script does not block something

First, make sure Protection is ON.

Then enable Debug Mode and inspect the browser console.

If the website still opens something unwanted, it may be using a mechanism that the current version does not intercept.

I want the protection but not the UI

Open the Anti New-Tab Ads panel and select:

Hide shield

The protection continues running.

Use:

Alt + Shift + U

to restore the shield.

I accidentally blocked something I wanted

If the Ctrl/Cmd exception is enabled, holding Ctrl on Windows/Linux or Cmd on macOS can allow supported popup actions.

This behaviour can be changed from the control panel.

Development

The project is intentionally kept as a single userscript.

The main source file is:

anti-new-tab-ads.user.js

The script currently uses standard browser APIs including:

window.open
DOM event listeners
localStorage
sessionStorage
postMessage
Shadow DOM
iframe browsing contexts

No backend or external service is required.

Project Structure
anti-new-tab-ads/
├── anti-new-tab-ads.user.js
├── CHANGELOG.md
├── LICENSE
└── README.md
Roadmap

Possible future improvements include:

More reliable modifier-key detection
Additional popup/navigation detection
Improved browser compatibility
More testing across video players and streaming websites
Additional UI improvements
Better diagnostics for unsupported popup mechanisms

The roadmap is intentionally flexible because browser behaviour varies significantly between websites.

Contributing

Found a website where Anti New-Tab Ads does not behave as expected?

Open an issue with:

The browser you are using
Your userscript manager
Anti New-Tab Ads version
A description of what happened
Whether protection was enabled
Whether debug mode provided any useful information

Avoid posting personal information, account credentials, private URLs, or other sensitive data.

Pull requests and technical improvements are welcome.

License

Anti New-Tab Ads is released under the MIT License.

See LICENSE.

Author

Created and maintained by samwritessecurity.

The project started as a small personal solution to an annoying browsing problem and has gradually evolved into a more capable browser utility.

Follow the Project

I write about the ideas, problems, experiments, and technical lessons behind projects like Anti New-Tab Ads on Medium.

Medium: Sam Writes Security

Support the Project

If you find Anti New-Tab Ads useful and want to support the continued development of projects like this, you can support my work on Patreon.

Patreon: Support Sam Writes Security

If you find the project useful, consider giving the repository a ⭐ star or following its development.
