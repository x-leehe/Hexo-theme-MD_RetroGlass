/**
 * ============================================================
 * MD-RetroGlass — htmx Navigation Hooks
 * ============================================================
 * All link interception, history, caching, and content swap
 * are handled by htmx (hx-boost). This file only contains
 * post-swap re-initialization logic.
 * ============================================================
 */

(function () {
  'use strict';

  // ==========================================================
  // 0. One-time cleanup: purge old htmx history cache entries
  //    (from before hx-history-elt was moved from <body> to .main-content)
  // ==========================================================
  (function clearLegacyCache() {
    var FLAG = 'htmx-cache-cleared-v2';
    if (sessionStorage && !sessionStorage.getItem(FLAG)) {
      try {
        Object.keys(localStorage).forEach(function (key) {
          if (/^htmx-history-/.test(key)) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.setItem(FLAG, '1');
      } catch (e) { /* ignore */ }
    }
  })();

  // ==========================================================
  // 1. Update nav active state after navigation
  // ==========================================================
  function updateActiveNav(path) {
    const cleanPath = path.replace(/\/$/, '') || '/';

    document.querySelectorAll('.nav-desktop .nav-item').forEach(function (el) {
      const href = el.getAttribute('href').replace(/\/$/, '') || '/';
      const isActive = (cleanPath === href ||
        (href !== '/' && cleanPath.indexOf(href) === 0));
      el.classList.toggle('active', isActive);
    });
    document.querySelectorAll('.nav-item-mobile').forEach(function (el) {
      const href = el.getAttribute('href').replace(/\/$/, '') || '/';
      const isActive = (cleanPath === href ||
        (href !== '/' && cleanPath.indexOf(href) === 0));
      el.classList.toggle('active', isActive);
    });

    const mobileNav = document.getElementById('nav-mobile');
    if (mobileNav) mobileNav.classList.remove('active');

    // NOTE: _initNavIndicator() is NOT called here — indicator reposition
    // is deferred to the call site (htmx:afterSettle / onContentReady / etc.)
    // via rAF so the browser has time to recalc layout after class changes.
  }

  // ==========================================================
  // 2. Re-initialize after content swap
  // ==========================================================
  function onContentReady() {
    if (typeof Prism !== 'undefined') {
      document.querySelectorAll('.main-content pre.line-numbers > code').forEach(function (block) {
        Prism.highlightElement(block);
      });
    }

    document.querySelectorAll('.main-content a[href^="http"]').forEach(function (link) {
      if (!link.hostname.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    if (typeof window._initCodeHeaders === 'function') {
      window._initCodeHeaders();
    }

    // Defer indicator reposition until after browser layout
    if (typeof window._initNavIndicator === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(window._initNavIndicator);
      });
    }

    if (typeof window._initGitalk === 'function') {
      setTimeout(window._initGitalk, 100);
    }

    if (typeof window._initUtterances === 'function') {
      setTimeout(window._initUtterances, 150);
    }

    document.querySelectorAll('.__cf_email__[data-cfemail]').forEach(function(el) {
      const encoded = el.getAttribute('data-cfemail');
      if (!encoded) return;
      const bytes = [];
      for (let i = 0; i < encoded.length; i += 2) {
        bytes.push(parseInt(encoded.substr(i, 2), 16));
      }
      const key = bytes[0];
      let email = '';
      for (let j = 1; j < bytes.length; j++) {
        email += String.fromCharCode(bytes[j] ^ key);
      }
      if (el.tagName === 'A') {
        el.textContent = email;
        el.setAttribute('href', 'mailto:' + email);
        el.classList.remove('__cf_email__');
        el.removeAttribute('data-cfemail');
        return;
      }
      const parentLink = el.closest('a');
      if (parentLink) {
        el.textContent = email;
        parentLink.setAttribute('href', 'mailto:' + email);
        parentLink.classList.remove('__cf_email__');
        parentLink.removeAttribute('data-cfemail');
        el.classList.remove('__cf_email__');
        el.removeAttribute('data-cfemail');
        return;
      }
      const a = document.createElement('a');
      a.href = 'mailto:' + email;
      a.textContent = email;
      a.className = el.className.replace(/\b__cf_email__\b/g, '').trim();
      el.parentNode.replaceChild(a, el);
    });

    if (typeof window._initToc === 'function') {
      window._initToc();
    }
  }

  // ==========================================================
  // 3. htmx event hooks
  // ==========================================================

  // Track if a server request was made (vs. pure cache restore)
  let pendingRequestPath = null;

  // Helper: extract request path from htmx v2 event detail (v2 uses requestConfig, v1 uses pathInfo)
  function getRequestPath(detail) {
    if (!detail) return null;
    if (detail.requestConfig && detail.requestConfig.path) return detail.requestConfig.path;
    if (detail.pathInfo && detail.pathInfo.path) return detail.pathInfo.path;
    return null;
  }

  document.body.addEventListener('htmx:beforeRequest', function (evt) {
    if (!evt.detail) return;
    // Record the path for any real server request (boosted or history cache miss)
    pendingRequestPath = getRequestPath(evt.detail) || location.pathname;
    // Only add leaving animation for boosted link clicks (not history restore requests)
    if (evt.detail.boosted) {
      const main = document.querySelector('.main-content');
      if (main) {
        main.classList.add('is-leaving');
      }
    }
  });

  document.body.addEventListener('htmx:afterSettle', function (evt) {
    if (!evt.detail) return;
    // Handle both boosted navigations AND history cache misses (real server requests)
    if (evt.detail.boosted || pendingRequestPath) {
      const path = pendingRequestPath || getRequestPath(evt.detail) || location.pathname;
      pendingRequestPath = null;
      updateActiveNav(path);
      onContentReady();
      // Scroll to top after content swap (htmx show:window:top may not fire on history misses)
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  // Handle history cache HIT (content restored from cache, no server request)
  document.body.addEventListener('htmx:historyRestore', function () {
    updateActiveNav(location.pathname);
    // Scroll to top after history restore
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Defer indicator reposition until after browser layout
    if (typeof window._initNavIndicator === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(window._initNavIndicator);
      });
    }
    // Cached content was already initialized before snapshot,
    // but Gitalk iframe is lost — re-init if needed
    if (typeof window._initGitalk === 'function') {
      setTimeout(window._initGitalk, 100);
    }
  });

  // --- Initial page load ---
  function onInitialLoad() {
    if (typeof splitCodeLines === 'function') {
      splitCodeLines();
    }
    updateActiveNav(location.pathname);
    // Defer indicator reposition until after browser layout
    if (typeof window._initNavIndicator === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(window._initNavIndicator);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onInitialLoad);
  } else {
    onInitialLoad();
  }

})();
