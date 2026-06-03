/**
 * ============================================================
 * MD-RetroGlass — PJAX (Seamless Page Navigation)
 * ============================================================
 * Intercepts internal link clicks, fetches new pages via
 * XMLHttpRequest, and swaps only the <main> content so that
 * persistent elements (APlayer, background, sidebar) are
 * never interrupted.
 * ============================================================
 */

(function () {
  'use strict';

  // Cache fetched pages so back/forward is instant
  var CACHE = {};

  // Selectors for content that changes between pages
  var MAIN_SEL = '.main-content';
  var TITLE_TAG = 'title';

  // ==========================================================
  // 1. Extract meaningful content from a fetched HTML string
  // ==========================================================
  function parseDoc(html) {
    var doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html;
    return doc;
  }

  function getMain(doc) {
    return doc.querySelector(MAIN_SEL);
  }

  // ==========================================================
  // 2. Swap content in-place
  // ==========================================================
  function swapContent(html, url, title, pushState) {
    var doc = parseDoc(html);
    var newMain = getMain(doc);
    var currentMain = getMain(document);

    if (!newMain || !currentMain) return false;

    // Swap main content
    currentMain.innerHTML = newMain.innerHTML;

    // Update document title
    if (title) document.title = title;

    // Update active nav link
    updateActiveNav(url);

    // Push history state
    if (pushState) {
      history.pushState({ url: url, html: html, title: title }, title, url);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-initialize page-specific features
    onContentReady();

    return true;
  }

  // ==========================================================
  // 3. Update header nav active state
  // ==========================================================
  function updateActiveNav(url) {
    var path = new URL(url, location.origin).pathname;
    // Desktop nav
    document.querySelectorAll('.nav-desktop .nav-item').forEach(function (el) {
      el.classList.remove('active');
    });
    // Mobile nav
    document.querySelectorAll('.nav-item-mobile').forEach(function (el) {
      el.classList.remove('active');
    });

    // Match the link whose href ends with this path
    var match = document.querySelector(
      '.nav-desktop .nav-item[href="' + path + '"], ' +
      '.nav-item-mobile[href="' + path + '"]'
    );
    if (match) match.classList.add('active');

    // Home special case: "/" or "/index.html"
    if (path === '/' || path === '/index.html') {
      var home = document.querySelector(
        '.nav-desktop .nav-item[href="/"], ' +
        '.nav-item-mobile[href="/"]'
      );
      if (home) home.classList.add('active');
    }
  }

  // ==========================================================
  // 4. Re-initialize after content swap
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

    // Re-init code block headers (language label + copy button)
    if (typeof window._initCodeHeaders === 'function') {
      window._initCodeHeaders();
    }

    // Re-init Gitalk comments
    if (typeof window._initGitalk === 'function') {
      // Delay slightly so the DOM is settled
      setTimeout(window._initGitalk, 100);
    }

    // Decode Cloudflare email obfuscation (after PJAX swap)
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
      // If element is already an <a>, just fix it
      if (el.tagName === 'A') {
        el.textContent = email;
        el.setAttribute('href', 'mailto:' + email);
        el.classList.remove('__cf_email__');
        el.removeAttribute('data-cfemail');
        return;
      }
      // If inside a parent <a>, fix the parent
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
      // Standalone <span>: wrap it in a mailto link
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
  // 5. Click interceptor
  // ==========================================================
  function isInternalLink(link) {
    if (!link || !link.href) return false;
    var url;
    try {
      url = new URL(link.href, location.origin);
    } catch (e) {
      return false;
    }
    // Same origin only
    if (url.origin !== location.origin) return false;
    // Skip anchors on the same path
    if (url.hash && url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) return false;
    // Skip explicitly external / download / admin links
    if (link.hasAttribute('download')) return false;
    if (link.getAttribute('target') === '_blank') return false;
    if (link.getAttribute('rel') === 'external') return false;
    // Skip RSS / feed links
    if (link.getAttribute('type') === 'application/rss+xml') return false;
    if (url.pathname === '/atom.xml') return false;
    return true;
  }

  function onClick(e) {
    // Find closest anchor (could be nested inside SVGs, spans, etc.)
    var link = e.target.closest('a[href]');
    if (!link) return;

    if (!isInternalLink(link)) return;

    var targetUrl = link.href;

    // Same URL → prevent and do nothing
    if (targetUrl === location.href) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    // Serve from cache if available
    if (CACHE[targetUrl]) {
      var c = CACHE[targetUrl];
      swapContent(c.html, targetUrl, c.title, true);
      return;
    }

    // Fetch the new page
    var xhr = new XMLHttpRequest();
    xhr.open('GET', targetUrl);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        var html = xhr.responseText;
        var doc = parseDoc(html);
        var title = doc.title;
        CACHE[targetUrl] = { html: html, title: title };
        swapContent(html, targetUrl, title, true);
      } else {
        // Fallback to full navigation on error
        window.location.href = targetUrl;
      }
    };
    xhr.onerror = function () {
      window.location.href = targetUrl;
    };
    xhr.send();
  }

  // ==========================================================
  // 6. Browser back / forward
  // ==========================================================
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.html) {
      swapContent(e.state.html, e.state.url, e.state.title, false);
    } else {
      // No state → full reload
      window.location.reload();
    }
  });

  // ==========================================================
  // Boot
  // ==========================================================
  document.addEventListener('click', onClick);
})();
