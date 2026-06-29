/**
 * ============================================================
 * MD-RetroGlass — MD3 Dynamic Color Engine
 * ============================================================
 * Extracts the dominant color from the background image,
 * then generates a full Material Design 3 color scheme,
 * updating CSS custom properties globally.
 *
 * Also syncs the extracted colors with APlayer theme.
 * ============================================================
 */

(function () {
  'use strict';

  /**
   * RGB → HSL conversion (returns [H, S%, L%])
   */
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  // Cache last extracted RGB for re-apply on theme change
  let _lastR = 0, _lastG = 0, _lastB = 0;
  let _hasExtracted = false;

  /**
   * Check if light mode is currently active
   */
  function isLightMode() {
    return document.documentElement.classList.contains('light-mode');
  }

  /**
   * Update CSS custom properties with generated MD3 colors
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {boolean} [isLight] — force light/dark; auto-detected if omitted
   */
  function updateColors(r, g, b, isLight) {
    if (isLight === undefined) {
      isLight = isLightMode();
    }

    _lastR = r;
    _lastG = g;
    _lastB = b;
    _hasExtracted = true;

    const hsl = rgbToHsl(r, g, b);
    const h = hsl[0],
      rawS = hsl[1];

    // Boost saturation for vivid theme
    let s = rawS < 10 ? 55 : Math.min(rawS * 1.6, 100);
    s = Math.max(s, 45);

    const root = document.documentElement;

    if (isLight) {
      // ---- Light scheme ----
      const primary = 'hsl(' + h + ', ' + s + '%, 35%)';
      const onPrimary = 'hsl(' + h + ', ' + s + '%, 100%)';
      const primaryContainer = 'hsl(' + h + ', ' + Math.min(s + 10, 100) + '%, 90%)';
      const onPrimaryContainer = 'hsl(' + h + ', ' + s + '%, 10%)';
      const surface = 'hsl(' + h + ', ' + Math.min(s * 0.15, 15) + '%, 98%)';
      const onSurface = 'hsl(' + h + ', ' + Math.min(s * 0.15, 15) + '%, 10%)';
      const surfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.2, 20) + '%, 90%)';
      const onSurfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.2, 20) + '%, 30%)';
      const outline = 'hsl(' + h + ', ' + Math.min(s * 0.25, 25) + '%, 50%)';

      root.style.setProperty('--md-sys-color-primary', primary);
      root.style.setProperty('--md-sys-color-on-primary', onPrimary);
      root.style.setProperty('--md-sys-color-primary-container', primaryContainer);
      root.style.setProperty('--md-sys-color-on-primary-container', onPrimaryContainer);
      root.style.setProperty('--md-sys-color-surface', surface);
      root.style.setProperty('--md-sys-color-on-surface', onSurface);
      root.style.setProperty('--md-sys-color-surface-variant', surfaceVariant);
      root.style.setProperty('--md-sys-color-on-surface-variant', onSurfaceVariant);
      root.style.setProperty('--md-sys-color-outline', outline);
      syncAPlayerTheme(primary);
    } else {
      // ---- Dark scheme (original) ----
      const primary = 'hsl(' + h + ', ' + s + '%, 72%)';
      const onPrimary = 'hsl(' + h + ', ' + s + '%, 12%)';
      const primaryContainer = 'hsl(' + h + ', ' + s + '%, 32%)';
      const onPrimaryContainer = 'hsl(' + h + ', ' + Math.min(s + 5, 100) + '%, 95%)';
      const surface = 'hsl(' + h + ', ' + Math.min(s * 0.25, 25) + '%, 10%)';
      const onSurface = 'hsl(' + h + ', ' + Math.min(s * 0.2, 20) + '%, 90%)';
      const surfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.35, 35) + '%, 22%)';
      const onSurfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.25, 25) + '%, 82%)';
      const outline = 'hsl(' + h + ', ' + Math.min(s * 0.3, 30) + '%, 58%)';

      root.style.setProperty('--md-sys-color-primary', primary);
      root.style.setProperty('--md-sys-color-on-primary', onPrimary);
      root.style.setProperty('--md-sys-color-primary-container', primaryContainer);
      root.style.setProperty('--md-sys-color-on-primary-container', onPrimaryContainer);
      root.style.setProperty('--md-sys-color-surface', surface);
      root.style.setProperty('--md-sys-color-on-surface', onSurface);
      root.style.setProperty('--md-sys-color-surface-variant', surfaceVariant);
      root.style.setProperty('--md-sys-color-on-surface-variant', onSurfaceVariant);
      root.style.setProperty('--md-sys-color-outline', outline);
      syncAPlayerTheme(primary);
    }
  }

  /**
   * Sync the extracted primary color to APlayer
   */
  function syncAPlayerTheme(primaryColor) {
    const metingEl = document.querySelector('meting-js');
    if (!metingEl || !metingEl.aplayer) return;

    const playedBar = metingEl.querySelector('.aplayer-played');
    const thumb = metingEl.querySelector('.aplayer-thumb');
    if (playedBar) playedBar.style.background = primaryColor;
    if (thumb) {
      thumb.style.background = primaryColor;
      thumb.style.borderColor = primaryColor;
    }
  }

  /**
   * Initialize the background color extraction engine
   */
  function initBackgroundEngine() {
    const img = document.getElementById('bg-canvas');
    if (!img) return;

    img.onerror = function () {
      this.style.opacity = '0';
    };

    function extractColor() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        const centerX = (img.naturalWidth - sampleSize) / 2;
        const centerY = (img.naturalHeight - sampleSize) / 2;

        ctx.drawImage(img, centerX, centerY, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;
        const pixelCount = data.length / 4;

        // Weighted average: higher saturation pixels get higher weight
        let totalWeight = 0;
        let wr = 0, wg = 0, wb = 0;

        for (let i = 0; i < data.length; i += 4) {
          const ri = data[i], gi = data[i + 1], bi = data[i + 2];
          const maxC = Math.max(ri, gi, bi);
          const minC = Math.min(ri, gi, bi);
          const chroma = maxC - minC;
          const weight = chroma * chroma + 1;

          wr += ri * weight;
          wg += gi * weight;
          wb += bi * weight;
          totalWeight += weight;
        }

        let r = Math.round(wr / totalWeight);
        let g = Math.round(wg / totalWeight);
        let b = Math.round(wb / totalWeight);

        // If the weighted result is still too gray, fall back to simple average
        const hsl = rgbToHsl(r, g, b);
        if (hsl[1] < 10) {
          let ar = 0, ag = 0, ab = 0;
          for (let j = 0; j < data.length; j += 4) {
            ar += data[j]; ag += data[j + 1]; ab += data[j + 2];
          }
          r = Math.round(ar / pixelCount);
          g = Math.round(ag / pixelCount);
          b = Math.round(ab / pixelCount);
        }

        updateColors(r, g, b);
      } catch (e) {
        // CORS or canvas taint — use default palette
        console.error('[dynamic-color] extractColor:', e);
      }
    }

    img.onload = extractColor;

    // If already loaded (cached)
    if (img.complete) {
      extractColor();
    }
  }

  /**
   * Watch for APlayer creation (MetingJS is async) and sync colors
   */
  function watchAPlayerCreation() {
    let aplayerSynced = false;

    function applyAndMark() {
      if (aplayerSynced) return;
      const metingEl = document.querySelector('meting-js');
      if (metingEl && metingEl.aplayer) {
        const style = getComputedStyle(document.documentElement);
        const primary = style.getPropertyValue('--md-sys-color-primary').trim();
        if (primary) {
          syncAPlayerTheme(primary);
          aplayerSynced = true;
        }
      }
    }

    // Immediate attempt
    setTimeout(applyAndMark, 500);
    // Delayed retry for slow meting loads
    setTimeout(applyAndMark, 2000);
    // Final retry
    setTimeout(applyAndMark, 5000);
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBackgroundEngine();
      watchAPlayerCreation();
    });
  } else {
    initBackgroundEngine();
    watchAPlayerCreation();
  }

  // Re-apply colors on theme change (light ↔ dark)
  document.documentElement.addEventListener('themechange', function (e) {
    if (_hasExtracted) {
      updateColors(_lastR, _lastG, _lastB, e.detail && e.detail.isLight);
    }
  });
})();
