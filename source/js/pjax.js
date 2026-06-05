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

  /**
   * Split code block tables from single-row into per-line rows.
   * Fixes gutter line numbers staying aligned when long lines wrap.
   */
  function splitCodeLines() {
    document.querySelectorAll('.main-content figure.highlight table').forEach(function (table) {
      if (table.hasAttribute('data-split')) return; // already processed
      table.setAttribute('data-split', '1');

      var gutterTd = table.querySelector('.gutter');
      var codeTd = table.querySelector('.code');
      if (!gutterTd || !codeTd) return;

      // Collect gutter <span> elements (line numbers)
      var gutterSpans = Array.from(gutterTd.querySelectorAll('pre .line'));
      // Collect code <span> elements (code lines) — inside .code pre code
      var codePre = codeTd.querySelector('pre');
      var codeEl = codeTd.querySelector('code');
      if (!codePre || !codeEl || gutterSpans.length === 0) return;

      // Each code line is separated by <br> inside <code>
      // Gather child nodes of <code>, splitting at <br>
      var codeLines = [];
      var buf = [];
      Array.from(codeEl.childNodes).forEach(function (node) {
        if (node.nodeName === 'BR') {
          codeLines.push(buf);
          buf = [];
        } else {
          buf.push(node);
        }
      });
      if (buf.length > 0) codeLines.push(buf);

      if (gutterSpans.length !== codeLines.length) return;

      var tbody = table.querySelector('tbody') || table;
      var oldTr = table.querySelector('tr');
      if (!oldTr) return;

      // Build new rows: one <tr> per line
      var frag = document.createDocumentFragment();
      gutterSpans.forEach(function (gSpan, i) {
        var tr = document.createElement('tr');

        var gTd = document.createElement('td');
        gTd.className = 'gutter';
        var gPre = document.createElement('pre');
        gPre.appendChild(gSpan.cloneNode(true));
        gTd.appendChild(gPre);
        tr.appendChild(gTd);

        var cTd = document.createElement('td');
        cTd.className = 'code';
        var cPre = document.createElement('pre');
        var cCode = document.createElement('code');
        cCode.className = codeEl.className;
        codeLines[i].forEach(function (n) { cCode.appendChild(n.cloneNode(true)); });
        cPre.appendChild(cCode);
        cTd.appendChild(cPre);
        tr.appendChild(cTd);

        frag.appendChild(tr);
      });

      // Replace old single-row structure
      if (tbody !== table) {
        tbody.innerHTML = '';
        tbody.appendChild(frag);
      } else {
        oldTr.remove();
        table.appendChild(frag);
      }
    });
  }

  // ==========================================================
  // 3. Re-initialize after swap → renamed section
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

    // Split code block table into per-line rows (fixes gutter alignment on wrap)
    splitCodeLines();

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
    var path = evt.detail.pathInfo ? evt.detail.pathInfo.path : location.pathname;
    updateActiveNav(path);
    onContentReady();
  });

  // --- Run on initial page load (not just htmx navigations) ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      splitCodeLines();
    });
  } else {
    splitCodeLines();
  }

})();
