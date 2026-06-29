/**
 * MD-RetroGlass — Encrypt Filter Registration
 *
 * Bootstraps the multi-group encryption filter.
 * The encrypt engine lives in scripts/encrypt/ (server modules),
 * layout/encrypt/ (HTML templates), source/js/ (browser bundle),
 * and source/css/ (styles).
 *
 * This script is auto-loaded by Hexo when the theme is active.
 */
'use strict';

try {
  require('./encrypt').register(hexo);
} catch (e) {
  hexo.log.warn('[MD-RetroGlass] Failed to register encrypt filter: ' + e.message);
  hexo.log.warn('[MD-RetroGlass] User-group encryption will NOT be available.');
}
