/**
 * ============================================================
 * MD-RetroGlass — Vitest Configuration
 * ============================================================
 *
 * Test strategy:
 *   All tests run in a pure Node.js environment with no browser or
 *   jsdom dependency. They verify the pure logic of build-time scripts
 *   (link-preview.js, shortcodes-*.js, font-convert.js) — HTML escaping
 *   correctness, regex matching, and file path resolution.
 *
 * Test directory layout:
 *   test/
 *   ├── shortcode-render.test.js     Shortcode rendering & HTML escaping
 *   ├── link-preview-escape.test.js  Link preview card XSS protection
 *   └── font-paths.test.js           Font pipeline path integrity
 *
 * How to run:
 *   npm test                        → Single run (vitest run)
 *   npx vitest                       → Watch mode, auto-rerun on changes
 *   npx vitest run path/to/file      → Run a specific file only
 *
 * Notes:
 *   - Test files must mock `global.hexo`, since link-preview.js and
 *     shortcodes-*.js reference the Hexo global at module top-level.
 *   - font-convert.js constants are parsed from source via fs.readFileSync,
 *     so no modules are mocked — only file existence and config validity
 *     are verified.
 *   - `hexo generate` is NOT run in this repo — Hexo build verification
 *     should be done in the consuming blog site directory.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /** Only collect .test.js files under the test/ directory */
    include: ['test/**/*.test.js'],

    /**
     * environment: 'node'
     * Runs all tests in Node.js — no jsdom or happy-dom needed.
     * Avoids unnecessary browser polyfills, keeping tests lean and fast.
     */
    environment: 'node'

    /**
     * Possible future extensions (not yet enabled):
     *   globals: true            — Inject describe/it/expect globally
     *   coverage: { ... }        — Coverage reports via @vitest/coverage-v8
     *   setupFiles: ['./test/setup.js'] — Global mock init (e.g. hexo)
     */
  }
});
