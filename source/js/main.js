/**
 * ============================================================
 * MD-RetroGlass — Theme Interaction Script
 * ============================================================
 * Handles:
 *   - Background image rotation (cross-fade)
 *   - Background parallax on mouse move
 *   - Mobile menu toggle
 *   - Scroll-to-top button
 *   - Smooth transitions
 * ============================================================
 */

(function () {
  'use strict';

  // ==========================================================
  // 1. Background Rotation (cross-fade)
  // ==========================================================

  var BG_IMAGES = [];
  var bgConfigEl = document.getElementById('bg-config');
  if (bgConfigEl) {
    try {
      BG_IMAGES = JSON.parse(bgConfigEl.textContent || '[]');
    } catch (e) {
      BG_IMAGES = [];
    }
  }

  var currentBgIndex = 0;
  var autoRotateTimer = null;
  var AUTO_ROTATE_INTERVAL = 15000; // 15s auto rotation

  function initBgRotation() {
    var bgCanvas = document.getElementById('bg-canvas');
    var bgBack = document.getElementById('bg-canvas-back');
    var prevBtn = document.getElementById('bg-prev');
    var nextBtn = document.getElementById('bg-next');
    var dotsContainer = document.getElementById('bg-dots');
    var controls = document.getElementById('bg-controls');

    if (!bgCanvas || BG_IMAGES.length <= 1) {
      if (controls) controls.style.display = 'none';
      return;
    }

    function renderDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      BG_IMAGES.forEach(function (_, i) {
        var dot = document.createElement('div');
        dot.className = 'bg-dot' + (i === currentBgIndex ? ' active' : '');
        dot.addEventListener('click', function () { switchToBg(i); });
        dotsContainer.appendChild(dot);
      });
    }

    function switchToBg(index) {
      if (index === currentBgIndex || index < 0 || index >= BG_IMAGES.length) return;
      currentBgIndex = index;
      var nextSrc = BG_IMAGES[index];

      var preload = new Image();
      preload.src = nextSrc;

      function doCrossfade() {
        // 将当前视差同步到后层，避免交叉淡入淡出时出现错位
        var t = 'translate(' + bgParallaxX + 'px, ' + bgParallaxY + 'px)';
        bgBack.style.transform = t;
        bgBack.src = nextSrc;
        bgBack.style.opacity = '1';
        bgCanvas.style.opacity = '0';

        setTimeout(function () {
          bgCanvas.src = nextSrc;
          bgCanvas.style.transform = t;
          bgCanvas.style.opacity = '1';
          bgBack.style.opacity = '0';
        }, 850);
      }

      if (preload.complete) {
        doCrossfade();
      } else {
        preload.onload = doCrossfade;
      }

      renderDots();
      resetAutoRotate();
    }

    function prevBg() {
      switchToBg((currentBgIndex - 1 + BG_IMAGES.length) % BG_IMAGES.length);
    }

    function nextBg() {
      switchToBg((currentBgIndex + 1) % BG_IMAGES.length);
    }

    function startAutoRotate() {
      if (AUTO_ROTATE_INTERVAL <= 0 || BG_IMAGES.length <= 1) return;
      autoRotateTimer = setInterval(nextBg, AUTO_ROTATE_INTERVAL);
    }

    function resetAutoRotate() {
      if (autoRotateTimer) clearInterval(autoRotateTimer);
      startAutoRotate();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevBg);
    if (nextBtn) nextBtn.addEventListener('click', nextBg);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') prevBg();
      if (e.key === 'ArrowRight') nextBg();
    });

    renderDots();
    startAutoRotate();
  }

  // ==========================================================
  // 2. Background Parallax (matches PageProj exactly)
  //    Moves both bg-canvas and bg-canvas-back in sync so the
  //    cross-fade never reveals a misaligned layer underneath.
  // ==========================================================
  var bgParallaxX = 0, bgParallaxY = 0;

  function initParallax() {
    var bgCanvas = document.getElementById('bg-canvas');
    var bgBack = document.getElementById('bg-canvas-back');
    if (!bgCanvas) return;

    document.addEventListener('mousemove', function (e) {
      var clientX = e.clientX, clientY = e.clientY;
      var centerX = window.innerWidth / 2;
      var centerY = window.innerHeight / 2;
      // 最大偏移 10px（与 PageProj 一致）
      bgParallaxX = (clientX - centerX) / centerX * 10;
      bgParallaxY = (clientY - centerY) / centerY * 10;
      var t = 'translate(' + bgParallaxX + 'px, ' + bgParallaxY + 'px)';
      bgCanvas.style.transform = t;
      if (bgBack) bgBack.style.transform = t;
    });
  }

  // ==========================================================
  // 3. Mobile Menu Toggle
  // ==========================================================
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('nav-mobile');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('active');
      var icon = toggle.querySelector('.sym-icon use');
      if (icon) {
        icon.setAttribute('href', isOpen ? '#close' : '#menu');
      }
    });

    // Close menu when clicking a nav link
    menu.querySelectorAll('.nav-item-mobile').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        var icon = toggle.querySelector('.sym-icon use');
        if (icon) icon.setAttribute('href', '#menu');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('active')) return;
      if (!menu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        menu.classList.remove('active');
        var icon = toggle.querySelector('.sym-icon use');
        if (icon) icon.setAttribute('href', '#menu');
      }
    });
  }

  // ==========================================================
  // 4. Scroll to Top Button
  // ==========================================================
  function initScrollToTop() {
    var btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    var ticking = false;

    function updateVisibility() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================
  // 5. Table of Contents — custom toggle with animation
  // ==========================================================
  function initToc() {
    var toggle = document.getElementById('toc-toggle');
    var body = document.getElementById('toc-body');
    if (!toggle || !body) return;

    // Toggle open/close
    toggle.addEventListener('click', function () {
      var isOpen = body.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // TOC link click → smooth scroll to heading + background flash
    body.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var raw = link.getAttribute('href');
        var id = decodeURIComponent(raw.substring(1));
        var target = document.getElementById(id);
        if (!target) return;

        // Remove flash from any previously-flashed heading
        var prev = document.querySelector('.toc-flash');
        if (prev) prev.classList.remove('toc-flash');

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add flash class after scroll completes
        setTimeout(function () {
          // Force reflow so animation restarts if same heading clicked twice
          void target.offsetWidth;
          target.classList.add('toc-flash');

          // Remove after animation ends
          target.addEventListener('animationend', function handler() {
            target.classList.remove('toc-flash');
            target.removeEventListener('animationend', handler);
          });
        }, 400);
      });
    });

    // Auto-open on desktop
    if (window.innerWidth >= 1025) {
      body.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  // Expose for PJAX re-init
  window._initToc = initToc;

  // ==========================================================
  // 6. Code Block Headers — language label + copy button
  // ==========================================================
  var LANG_NAMES = {
    js: 'JavaScript', javascript: 'JavaScript',
    ts: 'TypeScript', typescript: 'TypeScript',
    css: 'CSS',
    html: 'HTML', xml: 'XML', svg: 'SVG',
    json: 'JSON',
    bash: 'Bash', shell: 'Shell', sh: 'Shell', zsh: 'Zsh',
    python: 'Python', py: 'Python',
    java: 'Java',
    c: 'C', cpp: 'C++', 'c++': 'C++', cs: 'C#', csharp: 'C#',
    go: 'Go', rust: 'Rust', rs: 'Rust',
    php: 'PHP', ruby: 'Ruby', rb: 'Ruby',
    sql: 'SQL',
    yaml: 'YAML', yml: 'YAML', toml: 'TOML',
    markdown: 'Markdown', md: 'Markdown',
    plaintext: 'Text', plain: 'Text', text: 'Text',
    diff: 'Diff', dockerfile: 'Docker', docker: 'Docker',
    nginx: 'Nginx', ini: 'INI', conf: 'Config',
    makefile: 'Makefile', cmake: 'CMake',
  };

  function langDisplay(cls) {
    if (!cls) return '';
    var lower = cls.toLowerCase();
    if (LANG_NAMES[lower]) return LANG_NAMES[lower];
    // Capitalize first letter for unknown languages
    return cls.charAt(0).toUpperCase() + cls.slice(1);
  }

  function initCodeHeaders() {
    var figures = document.querySelectorAll('.post-full-content figure.highlight, .page-full-content figure.highlight');
    figures.forEach(function (fig) {
      // Already has header
      if (fig.querySelector('.highlight-header')) return;

      // Extract language from class list (second class, e.g. "highlight css")
      var classes = fig.className.split(/\s+/);
      var langCls = classes.length > 1 ? classes[1] : '';
      var label = langDisplay(langCls);

      // Build header
      var header = document.createElement('div');
      header.className = 'highlight-header';

      // Left: icon + language name
      var langSpan = document.createElement('span');
      langSpan.className = 'highlight-lang';
      langSpan.innerHTML = '<svg class="sym-icon" aria-hidden="true"><use href="#code"/></svg><span>' + label + '</span>';

      // Right: copy button
      var copyBtn = document.createElement('button');
      copyBtn.className = 'highlight-copy-btn';
      copyBtn.title = 'Copy code';
      copyBtn.innerHTML = '<svg class="sym-icon" aria-hidden="true"><use href="#content_copy"/></svg><span>Copy</span>';

      copyBtn.addEventListener('click', function () {
        // Collect all code lines (supports per-row split layout)
        var codeEls = fig.querySelectorAll('.code code');
        var text;
        if (codeEls.length > 0) {
          text = Array.from(codeEls).map(function (el) { return el.textContent || ''; }).join('\n');
        } else {
          var single = fig.querySelector('code');
          text = single ? single.textContent || '' : '';
        }

        // Use Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showCopied(copyBtn);
          }).catch(function () {
            fallbackCopy(text, copyBtn);
          });
        } else {
          fallbackCopy(text, copyBtn);
        }
      });

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      // Insert at top of figure
      fig.insertBefore(header, fig.firstChild);
    });

    function fallbackCopy(text, btn) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        var ok = document.execCommand('copy');
        if (ok) showCopied(btn);
      } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }

    function showCopied(btn) {
      btn.classList.add('copied');
      btn.innerHTML = '<svg class="sym-icon" aria-hidden="true"><use href="#check"/></svg><span>Copied!</span>';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<svg class="sym-icon" aria-hidden="true"><use href="#content_copy"/></svg><span>Copy</span>';
      }, 1800);
    }
  }

  // Expose for PJAX re-init
  window._initCodeHeaders = initCodeHeaders;

  // ==========================================================
  // 6. Navigation Indicator — MD3 sliding pill
  //     Only visible on top-level pages (hides on blog posts).
  // ==========================================================
  function initNavIndicator() {
    var indicator = document.getElementById('nav-indicator');
    var nav = document.querySelector('.nav-desktop');
    if (!indicator || !nav) return;

    var activeItem = nav.querySelector('.nav-item.active');

    if (!activeItem) {
      indicator.style.opacity = '0';
      return;
    }

    var itemRect = activeItem.getBoundingClientRect();
    var navRect = nav.getBoundingClientRect();

    indicator.style.left = (itemRect.left - navRect.left) + 'px';
    indicator.style.width = itemRect.width + 'px';
    indicator.style.opacity = '1';
  }

  // Expose for PJAX re-init
  window._initNavIndicator = initNavIndicator;

  // Recalculate on resize (debounced)
  var _navResizeTimer = null;
  window.addEventListener('resize', function () {
    if (_navResizeTimer) clearTimeout(_navResizeTimer);
    _navResizeTimer = setTimeout(initNavIndicator, 150);
  });

  // ==========================================================
  // 7. External Links — target="_blank" + noopener
  // ==========================================================
  function initExternalLinks() {
    var contentAreas = document.querySelectorAll('.post-full-content, .page-full-content');
    contentAreas.forEach(function (area) {
      area.querySelectorAll('a[href^="http"]').forEach(function (link) {
        if (!link.hostname.includes(window.location.hostname)) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    });
  }

  // ==========================================================
  // 8. Spoiler — click to toggle reveal
  // ==========================================================
  function initSpoiler() {
    document.querySelectorAll('.spoiler').forEach(function (el) {
      if (el.dataset.spoilerBound) return;
      el.dataset.spoilerBound = '1';
      el.addEventListener('click', function () {
        this.classList.toggle('revealed');
      });
    });
  }

  // ==========================================================
  // Boot
  // ==========================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBgRotation();
      initParallax();
      initMobileMenu();
      initScrollToTop();
      initToc();
      initCodeHeaders();
      initNavIndicator();
      initExternalLinks();
      initSpoiler();
      initSpoiler();
    });
  } else {
    initBgRotation();
    initParallax();
    initMobileMenu();
    initScrollToTop();
    initToc();
    initCodeHeaders();
    initNavIndicator();
    initExternalLinks();
    initSpoiler();
  }
})();
