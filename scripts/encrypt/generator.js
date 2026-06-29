'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

const HASH_BYTES = 5;

function hex10(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, HASH_BYTES * 2);
}

/**
 * Build the v4 Hexo generator function.
 *
 * Returns a `generate()` function for Hexo's generator pipeline that yields
 * routes. The same function carries a `.getSRI()` method so the filter can
 * embed the SRI hash on the `<script>` tag without re-reading the bundle.
 *
 * @param {object}  opts
 * @param {string}  opts.bundlePath      Absolute path to the browser bundle JS.
 * @param {string}  opts.cssPath         Absolute path to the plugin stylesheet.
 * @param {string} [opts.sourcemapPath]  Absolute path to the bundle sourcemap.
 * @returns {function}
 */
function createGenerator(opts) {
  if (!opts || typeof opts.bundlePath !== 'string' || !opts.bundlePath) {
    throw new Error('createGenerator: bundlePath is required');
  }
  if (typeof opts.cssPath !== 'string' || !opts.cssPath) {
    throw new Error('createGenerator: cssPath is required');
  }

  const bundlePath = opts.bundlePath;
  const cssPath = opts.cssPath;
  const sourcemapPath = typeof opts.sourcemapPath === 'string' && opts.sourcemapPath
    ? opts.sourcemapPath
    : null;

  // Memoization cell — populated on first call and refreshed when the
  // bundle file's mtime/size changes.
  let cache = null;

  function populateCache() {
    const stat = fs.statSync(bundlePath);
    if (cache === null || cache.mtimeMs !== stat.mtimeMs || cache.size !== stat.size) {
      const bundleBytes = fs.readFileSync(bundlePath);
      const sriHash = 'sha384-' +
        crypto.createHash('sha384').update(bundleBytes).digest('base64');
      cache = {
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        bytes: bundleBytes,
        hash: hex10(bundleBytes),
        sriHash,
      };
    }
    return cache;
  }

  function generate() {
    const { bytes: bundleBytes, hash } = populateCache();
    const jsRoutePath = `lib/hbe.${hash}.js`;

    const routes = [
      {
        path: 'css/hbe.style.css',
        data: () => fs.createReadStream(cssPath),
      },
      {
        path: jsRoutePath,
        data: () => bundleBytes,
      },
    ];

    if (sourcemapPath && fs.existsSync(sourcemapPath)) {
      const mapBytes = fs.readFileSync(sourcemapPath);
      routes.push({
        path: `lib/hbe.${hash}.js.map`,
        data: () => mapBytes,
      });
    }

    return routes;
  }

  // Expose the SRI hash so the filter can embed integrity="sha384-..."
  // on the <script> tag without re-reading the bundle file.
  generate.getSRI = function getSRI() {
    return populateCache().sriHash;
  };

  return generate;
}

module.exports = { createGenerator };
