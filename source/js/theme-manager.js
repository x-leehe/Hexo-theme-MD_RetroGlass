/**
 * ============================================================
 * MD-RetroGlass — Theme Manager (Dark/Light/Auto/Time-based)
 * ============================================================
 * 四态循环切换：dark → light → auto → time-based → dark …
 * Persisted in localStorage key `color-scheme`.
 * Dispatches `themechange` custom event for other scripts.
 * ============================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'color-scheme';
  const STATES = ['dark', 'light', 'auto', 'time'];
  const TIME_LIGHT_START = 6;  // 6:00
  const TIME_LIGHT_END = 18;   // 18:00

  let btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // ==========================================================
  // 1. Read current mode
  // ==========================================================
  function getMode() {
    try {
      let v = localStorage.getItem(STORAGE_KEY);
      // Migrate old 'time-based' value
      if (v === 'time-based') v = 'time';
      if (STATES.indexOf(v) !== -1) return v;
    } catch (e) { console.error('[theme] getMode:', e); }
    return 'auto';
  }

  function saveMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) { console.error('[theme] saveMode:', e); }
  }

  // ==========================================================
  // 2. Determine whether light mode should be active
  // ==========================================================
  function shouldBeLight(mode) {
    switch (mode) {
      case 'dark':
        return false;
      case 'light':
        return true;
      case 'auto':
        return window.matchMedia &&
               window.matchMedia('(prefers-color-scheme: light)').matches;
      case 'time':
        const h = new Date().getHours();
        return h >= TIME_LIGHT_START && h < TIME_LIGHT_END;
      default:
        return false;
    }
  }

  // ==========================================================
  // 3. Apply theme to DOM
  // ==========================================================
  function applyTheme(mode) {
    const light = shouldBeLight(mode);

    if (light) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    // Toggle PrismJS theme
    const prismDark = document.getElementById('prism-dark');
    const prismLight = document.getElementById('prism-light');
    if (prismDark && prismLight) {
      prismDark.disabled = light;
      prismLight.disabled = !light;
    }

    // Update button icon state
    updateButtonState(mode);

    // Dispatch custom event for other scripts
    document.documentElement.dispatchEvent(new CustomEvent('themechange', {
      bubbles: true,
      detail: { mode: mode, isLight: light }
    }));
  }

  // ==========================================================
  // 4. Update button icon visibility
  // ==========================================================
  function updateButtonState(mode) {
    // Remove all state classes
    btn.classList.remove('light-mode-dark', 'light-mode-light', 'light-mode-auto', 'light-mode-time');

    const stateClass = 'light-mode-' + mode;
    btn.classList.add(stateClass);

    // Update title attribute (hint for next state)
    const nextIndex = (STATES.indexOf(mode) + 1) % STATES.length;
    const nextMode = STATES[nextIndex];
    const titles = {
      'dark': '切换配色方案（当前：暗色 → 下一步：亮色）',
      'light': '切换配色方案（当前：亮色 → 下一步：跟随系统）',
      'auto': '切换配色方案（当前：跟随系统 → 下一步：跟随时间）',
      'time': '切换配色方案（当前：跟随时间 → 下一步：暗色）'
    };
    btn.setAttribute('title', titles[mode] || '切换配色方案');
  }

  // ==========================================================
  // 5. Button click handler — cycle through states
  // ==========================================================
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const current = getMode();
    let currentIndex = STATES.indexOf(current);
    if (currentIndex === -1) currentIndex = 0;
    const nextIndex = (currentIndex + 1) % STATES.length;
    const nextMode = STATES[nextIndex];
    saveMode(nextMode);
    applyTheme(nextMode);
  });

  // ==========================================================
  // 6. React to system preference changes (auto mode only)
  // ==========================================================
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (getMode() === 'auto') {
        applyTheme('auto');
      }
    });
  }

  // ==========================================================
  // 7. Time-based mode: check every minute
  // ==========================================================
  let timeCheckTimer = null;

  function startTimeCheck() {
    stopTimeCheck();
    timeCheckTimer = setInterval(function () {
      try {
        if (getMode() === 'time') {
          applyTheme('time');
        }
      } catch (e) { console.error('[theme] timeCheck:', e); }
    }, 60000); // every 60 seconds
  }

  function stopTimeCheck() {
    if (timeCheckTimer) {
      clearInterval(timeCheckTimer);
      timeCheckTimer = null;
    }
  }

  // ==========================================================
  // 8. Initialization
  // ==========================================================
  function init() {
    const mode = getMode();
    applyTheme(mode);
    startTimeCheck();

    // Mark body as loaded to reveal content (anti-FOUC)
    document.body.classList.add('loaded');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================
  // 9. Re-init after PJAX navigation
  // ==========================================================
  document.addEventListener('htmx:afterSwap', function () {
    // Re-bind button reference (it may have been replaced)
    btn = document.getElementById('theme-toggle');
    if (btn) {
      // Remove old listener by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      btn = newBtn;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const current = getMode();
        let currentIndex = STATES.indexOf(current);
        if (currentIndex === -1) currentIndex = 0;
        const nextIndex = (currentIndex + 1) % STATES.length;
        const nextMode = STATES[nextIndex];
        saveMode(nextMode);
        applyTheme(nextMode);
      });

      // Re-apply current state to the new button
      updateButtonState(getMode());
    }
  });

})();
