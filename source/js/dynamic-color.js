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
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      var d = max - min;
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

  /**
   * Update CSS custom properties with generated MD3 colors
   */
  function updateColors(r, g, b) {
    var hsl = rgbToHsl(r, g, b);
    var h = hsl[0],
      rawS = hsl[1];

    // Boost saturation for vivid theme
    var s = rawS < 10 ? 55 : Math.min(rawS * 1.6, 100);
    s = Math.max(s, 45);

    var root = document.documentElement;

    // Primary colors
    var primary = 'hsl(' + h + ', ' + s + '%, 72%)';
    var onPrimary = 'hsl(' + h + ', ' + s + '%, 12%)';
    var primaryContainer = 'hsl(' + h + ', ' + s + '%, 32%)';
    var onPrimaryContainer = 'hsl(' + h + ', ' + Math.min(s + 5, 100) + '%, 95%)';

    // Surface colors (tinted with the hue)
    var surface = 'hsl(' + h + ', ' + Math.min(s * 0.25, 25) + '%, 10%)';
    var onSurface = 'hsl(' + h + ', ' + Math.min(s * 0.2, 20) + '%, 90%)';
    var surfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.35, 35) + '%, 22%)';
    var onSurfaceVariant = 'hsl(' + h + ', ' + Math.min(s * 0.25, 25) + '%, 82%)';
    var outline = 'hsl(' + h + ', ' + Math.min(s * 0.3, 30) + '%, 58%)';

    root.style.setProperty('--md-sys-color-primary', primary);
    root.style.setProperty('--md-sys-color-on-primary', onPrimary);
    root.style.setProperty('--md-sys-color-primary-container', primaryContainer);
    root.style.setProperty('--md-sys-color-on-primary-container', onPrimaryContainer);
    root.style.setProperty('--md-sys-color-surface', surface);
    root.style.setProperty('--md-sys-color-on-surface', onSurface);
    root.style.setProperty('--md-sys-color-surface-variant', surfaceVariant);
    root.style.setProperty('--md-sys-color-on-surface-variant', onSurfaceVariant);
    root.style.setProperty('--md-sys-color-outline', outline);

    // Sync APlayer theme
    syncAPlayerTheme(primary);
  }

  /**
   * Sync the extracted primary color to APlayer
   */
  function syncAPlayerTheme(primaryColor) {
    var metingEl = document.querySelector('meting-js');
    if (!metingEl || !metingEl.aplayer) return;

    var playedBar = metingEl.querySelector('.aplayer-played');
    var thumb = metingEl.querySelector('.aplayer-thumb');
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
    var img = document.getElementById('bg-canvas');
    if (!img) return;

    img.onerror = function () {
      this.style.opacity = '0';
    };

    function extractColor() {
      try {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        var centerX = (img.naturalWidth - sampleSize) / 2;
        var centerY = (img.naturalHeight - sampleSize) / 2;

        ctx.drawImage(img, centerX, centerY, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);

        var imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        var data = imageData.data;
        var pixelCount = data.length / 4;

        // Weighted average: higher saturation pixels get higher weight
        var totalWeight = 0;
        var wr = 0, wg = 0, wb = 0;

        for (var i = 0; i < data.length; i += 4) {
          var ri = data[i], gi = data[i + 1], bi = data[i + 2];
          var maxC = Math.max(ri, gi, bi);
          var minC = Math.min(ri, gi, bi);
          var chroma = maxC - minC;
          var weight = chroma * chroma + 1;

          wr += ri * weight;
          wg += gi * weight;
          wb += bi * weight;
          totalWeight += weight;
        }

        var r = Math.round(wr / totalWeight);
        var g = Math.round(wg / totalWeight);
        var b = Math.round(wb / totalWeight);

        // If the weighted result is still too gray, fall back to simple average
        var hsl = rgbToHsl(r, g, b);
        if (hsl[1] < 10) {
          var ar = 0, ag = 0, ab = 0;
          for (var j = 0; j < data.length; j += 4) {
            ar += data[j]; ag += data[j + 1]; ab += data[j + 2];
          }
          r = Math.round(ar / pixelCount);
          g = Math.round(ag / pixelCount);
          b = Math.round(ab / pixelCount);
        }

        updateColors(r, g, b);
      } catch (e) {
        // CORS or canvas taint — use default palette
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
    var aplayerSynced = false;

    function applyAndMark() {
      if (aplayerSynced) return;
      var metingEl = document.querySelector('meting-js');
      if (metingEl && metingEl.aplayer) {
        var style = getComputedStyle(document.documentElement);
        var primary = style.getPropertyValue('--md-sys-color-primary').trim();
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
})();
