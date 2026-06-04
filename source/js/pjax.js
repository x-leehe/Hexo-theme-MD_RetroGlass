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
    document.querySelectorAll('.nav-desktop .nav-item').forEach(function (el) {
      el.classList.remove('active');
    });
    document.querySelectorAll('.nav-item-mobile').forEach(function (el) {
      el.classList.remove('active');
    });

    var match = document.querySelector(
      '.nav-desktop .nav-item[href="' + path + '"], ' +
      '.nav-item-mobile[href="' + path + '"]'
    );
    if (match) match.classList.add('active');

    if (path === '/' || path === '/index.html') {
      var home = document.querySelector(
        '.nav-desktop .nav-item[href="/"], ' +
        '.nav-item-mobile[href="/"]'
      );
      if (home) home.classList.add('active');
    }

    // Close mobile menu
    var mobileNav = document.getElementById('nav-mobile');
    if (mobileNav) mobileNav.classList.remove('active');
  }

  // ==========================================================
  // 2. Re-initialize after content swap
  // ==========================================================
  function onContentReady() {
    // Re-highlight code blocks
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('.main-content pre code').forEach(function (block) {
        hljs.highlightElement(block);
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

    // Re-open ToC on desktop
    var details = document.querySelector('.toc-details');
    if (details && window.innerWidth >= 1025) {
      details.setAttribute('open', '');
    }
  }

  // ==========================================================
  // 3. htmx event hooks
  // ==========================================================
  document.body.addEventListener('htmx:afterSettle', function (evt) {
    if (!evt.detail || !evt.detail.boosted) return;
    var path = evt.detail.pathInfo ? evt.detail.pathInfo.path : location.pathname;
    updateActiveNav(path);
    onContentReady();
  });

})();
