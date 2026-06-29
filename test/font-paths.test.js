/**
 * ============================================================
 * Font Pipeline Path Integrity Tests
 * ============================================================
 *
 * Purpose:
 *   Verify that the font path configuration defined in
 *   misc-scripts/font-convert.js is correct and complete, ensuring
 *   the font subsetting pipeline can produce WOFF2 files after
 *   hexo generate.
 *
 * Font pipeline overview:
 *   1. fonts-src/            → TTF source fonts (provided by the theme)
 *   2. font-convert.js       → Scans public/*.html for unique characters,
 *                              calls subset-font (harfbuzz WASM) to subset
 *   3. public/fonts/         → Outputs compressed WOFF2 (referenced by
 *                              CSS @font-face declarations)
 *
 * When it runs:
 *   After being copied to the site's scripts/ directory, font-convert.js
 *   is auto-loaded by Hexo and triggered via the generateAfter hook
 *   after every hexo generate. Can also be run manually via
 *   npm run subset-fonts.
 *
 * Test strategy:
 *   - Do NOT actually run font subsetting (requires harfbuzz WASM and
 *     a full Hexo environment)
 *   - Parse constant configuration from source via fs.readFileSync
 *   - Verify file existence + all FONT_MAP dest entries end with .woff2
 *   - Verify PUBLIC_FONTS path contains the 'fonts' directory name
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve, join } from 'path';

/** Theme repository root directory */
const ROOT = resolve(__dirname, '..');

/** Absolute path to font-convert.js */
const fontConvertPath = join(ROOT, 'misc-scripts', 'font-convert.js');

describe('Font Path Resolution', () => {
  // ---- File existence checks ----

  it('should have font-convert.js in misc-scripts/', () => {
    // This is the entry point for the font pipeline — must exist
    expect(existsSync(fontConvertPath)).toBe(true);
  });

  it('should have TTF source fonts directory fonts-src/', () => {
    // Source font directory containing HarmonyOS Sans SC, JetBrainsMapleMono, AaCute
    const fontsSrcDir = join(ROOT, 'fonts-src');
    expect(existsSync(fontsSrcDir)).toBe(true);
  });

  // ---- Configuration integrity checks ----

  it('should have all FONT_MAP dest entries ending with .woff2', () => {
    // Extract dest fields from the FONT_MAP array in source
    // FONT_MAP format: { src: 'xxx.ttf', dest: 'xxx.woff2' }
    const fs = require('fs');
    const content = fs.readFileSync(fontConvertPath, 'utf-8');

    // Extract all dest: '...' values
    const destMatches = content.match(/dest:\s*['"]([^'"]+)['"]/g);
    expect(destMatches).not.toBeNull();

    if (destMatches) {
      destMatches.forEach(function (destLine) {
        const valMatch = destLine.match(/['"]([^'"]+)['"]/);
        if (valMatch) {
          // Every target filename must end with .woff2 (subset-font output format)
          expect(valMatch[1]).toMatch(/\.woff2$/);
        }
      });
    }
  });

  it('should have PUBLIC_FONTS path referencing fonts output directory', () => {
    // PUBLIC_FONTS is built via path.join(ROOT, 'public', 'fonts')
    const fs = require('fs');
    const content = fs.readFileSync(fontConvertPath, 'utf-8');

    // Source must contain the PUBLICS_FONTS variable and 'fonts' path segment
    expect(content).toContain('PUBLIC_FONTS');
    expect(content).toContain('fonts');
  });
});
