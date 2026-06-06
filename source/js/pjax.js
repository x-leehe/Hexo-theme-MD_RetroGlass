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
  // 1. Update nav active state after navigation
  // ==========================================================
  function updateActiveNav(path) {
    // Strip trailing slash for consistent matching
    var cleanPath = path.replace(/\/$/, '') || '/';

    document.querySelectorAll('.nav-desktop .nav-item').forEach(function (el) {
      var href = el.getAttribute('href').replace(/\/$/, '') || '/';
      var isActive = (cleanPath === href ||
        (href !== '/' && cleanPath.indexOf(href) === 0));
      el.classList.toggle('active', isActive);
    });
    document.querySelectorAll('.nav-item-mobile').forEach(function (el) {
      var href = el.getAttribute('href').replace(/\/$/, '') || '/';
      var isActive = (cleanPath === href ||
        (href !== '/' && cleanPath.indexOf(href) === 0));
      el.classList.toggle('active', isActive);
    });

    // Close mobile menu
    var mobileNav = document.getElementById('nav-mobile');
    if (mobileNav) mobileNav.classList.remove('active');

    // Reposition nav indicator after active state changes
    if (typeof window._initNavIndicator === 'function') {
      window._initNavIndicator();
    }
  }

  // ==========================================================
  // 2. Re-initialize after content swap
  // ==========================================================
  function onContentReady() {
    // Re-highlight code blocks (PrismJS with preprocess:true does server-side
    // highlighting; client-side re-init for dynamically loaded content)
    if (typeof Prism !== 'undefined') {
      document.querySelectorAll('.main-content pre.line-numbers > code').forEach(function (block) {
        Prism.highlightElement(block);
      });
    }

    // Re-apply external link attributes
    document.querySelectorAll('.main-content a[href^="http"]').forEach(function (link) {
      if (!link.hostname.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Re-init code block headers
    if (typeof window._initCodeHeaders === 'function') {
      window._initCodeHeaders();
    }

    // Re-init nav indicator (MD3 sliding pill)
    if (typeof window._initNavIndicator === 'function') {
      window._initNavIndicator();
    }

    // Re-init Gitalk comments
    if (typeof window._initGitalk === 'function') {
      setTimeout(window._initGitalk, 100);
    }

    // Re-init Utterances comments
    if (typeof window._initUtterances === 'function') {
      setTimeout(window._initUtterances, 150);
    }

    // Decode Cloudflare email obfuscation
    document.querySelectorAll('.__cf_email__[data-cfemail]').forEach(function(el) {
      var encoded = el.getAttribute('data-cfemail');
      if (!encoded) return;
      var bytes = [];
      for (var i = 0; i < encoded.length; i += 2) {
        bytes.push(parseInt(encoded.substr(i, 2), 16));
      }
      var key = bytes[0];
      var email = '';
      for (var j = 1; j < bytes.length; j++) {
        email += String.fromCharCode(bytes[j] ^ key);
      }
      if (el.tagName === 'A') {
        el.textContent = email;
        el.setAttribute('href', 'mailto:' + email);
        el.classList.remove('__cf_email__');
        el.removeAttribute('data-cfemail');
        return;
      }
      var parentLink = el.closest('a');
      if (parentLink) {
        el.textContent = email;
        parentLink.setAttribute('href', 'mailto:' + email);
        parentLink.classList.remove('__cf_email__');
        parentLink.removeAttribute('data-cfemail');
        el.classList.remove('__cf_email__');
        el.removeAttribute('data-cfemail');
        return;
      }
      var a = document.createElement('a');
      a.href = 'mailto:' + email;
      a.textContent = email;
      a.className = el.className.replace(/\b__cf_email__\b/g, '').trim();
      el.parentNode.replaceChild(a, el);
    });

    // Re-init Table of Contents (custom toggle + animation)
    if (typeof window._initToc === 'function') {
      window._initToc();
    }
  }

  // ==========================================================
  // 3. htmx event hooks
  // ==========================================================

  // --- Page transition: fade out old content before swap ---

  document.body.addEventListener('htmx:beforeRequest', function (evt) {
    if (!evt.detail || !evt.detail.boosted) return;
    var main = document.querySelector('.main-content');
    if (main) {
      main.classList.add('is-leaving');
    }
  });

  document.body.addEventListener('htmx:afterSettle', function (evt) {
    if (!evt.detail || !evt.detail.boosted) return;
    var path = (evt.detail.pathInfo && evt.detail.pathInfo.path) || location.pathname;
    updateActiveNav(path);
    onContentReady();
  });

  // --- Run on initial page load (not just htmx navigations) ---
  function onInitialLoad() {
    splitCodeLines();
    updateActiveNav(location.pathname);
    if (typeof window._initNavIndicator === 'function') {
      window._initNavIndicator();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onInitialLoad);
  } else {
    onInitialLoad();
  }

})();
