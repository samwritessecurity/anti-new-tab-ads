// ==UserScript==
// @name         Anti New-Tab Ads
// @namespace    https://github.com/samwritessecurity/anti-new-tab-ads
// @version      0.6.0
// @description  Prevents video streaming sites from opening unwanted ad tabs when you interact with the player (volume, seek, clicks, etc.). Includes keyboard shortcuts and notifications.
// @author       samwritessecurity
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ====================== CONFIG ======================
    const CONFIG = {
        debug: true,                      // Show detailed logs in console
        allowWithCtrl: true,              // Hold Ctrl/Cmd to allow new tab
        defaultEnabled: true,             // Protection starts enabled
        shortcutToggle: 'Alt+Shift+A',    // Toggle protection
        shortcutDebug: 'Alt+Shift+D',     // Toggle debug mode
        shortcutStatus: 'Alt+Shift+S',    // Show status
    };
    // ====================================================

    // State
    let enabled = localStorage.getItem('antiNewTabEnabled');
    enabled = enabled === null ? CONFIG.defaultEnabled : enabled === 'true';
    let blockedCount = 0;
    let debug = CONFIG.debug;

    // Notification helper
    function showNotification(message, duration = 2500) {
        const existing = document.getElementById('anti-newtab-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'anti-newtab-toast';
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1a1a1a',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            zIndex: '999999',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            opacity: '0',
            transition: 'opacity 0.25s ease',
            pointerEvents: 'none'
        });

        document.documentElement.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function log(...args) {
        if (debug) {
            console.log('%c[Anti-NewTab]', 'color:#ff6b6b;font-weight:bold', ...args);
        }
    }

    // Core protection
    const originalOpen = window.open;

    window.open = function (url, target, features) {
        if (!enabled) {
            return originalOpen.apply(this, arguments);
        }

        // Allow when holding Ctrl/Cmd
        if (CONFIG.allowWithCtrl && window.event && (window.event.ctrlKey || window.event.metaKey)) {
            log('Allowed (Ctrl/Cmd held):', url);
            return originalOpen.apply(this, arguments);
        }

        blockedCount++;
        log('Blocked new tab/window →', url || '(no url)');

        if (debug) {
            showNotification(`Blocked ad tab (${blockedCount})`);
        }

        return null;
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Alt + Shift + A → Toggle protection
        if (e.altKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            enabled = !enabled;
            localStorage.setItem('antiNewTabEnabled', enabled);
            showNotification(enabled ? 'Anti New-Tab: ON' : 'Anti New-Tab: OFF');
            log('Protection is now', enabled ? 'ENABLED' : 'DISABLED');
        }

        // Alt + Shift + D → Toggle debug
        if (e.altKey && e.shiftKey && e.code === 'KeyD') {
            e.preventDefault();
            debug = !debug;
            showNotification(debug ? 'Debug logs: ON' : 'Debug logs: OFF');
        }

        // Alt + Shift + S → Show status
        if (e.altKey && e.shiftKey && e.code === 'KeyS') {
            e.preventDefault();
            showNotification(`Status: ${enabled ? 'ON' : 'OFF'} | Blocked: ${blockedCount}`);
        }
    }, true);

    // Initial log
    log(`Anti New-Tab Ads v0.6 loaded | Protection: ${enabled ? 'ON' : 'OFF'}`);
})();
