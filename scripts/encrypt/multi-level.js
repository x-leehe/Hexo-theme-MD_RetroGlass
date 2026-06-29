'use strict';

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const { encrypt, decrypt } = require('./crypto');

/**
 * Compute an HMAC-SHA256 password fingerprint for client-side pre-verification.
 *
 * The fingerprint lets the browser distinguish "wrong password" from "corrupted
 * ciphertext" BEFORE attempting the expensive PBKDF2 derivation. It leaks at
 * most 1 bit of information about the password (whether a guess matches),
 * which is an acceptable trade-off for the UX improvement.
 *
 * @param {string} password
 * @param {Buffer} salt - 32-byte PBKDF2 salt
 * @returns {string} 64-char hex HMAC
 */
function computePwdCheck(password, salt) {
  const hmac = crypto.createHmac('sha256', Buffer.from(String(password), 'utf8'));
  hmac.update(salt);
  hmac.update(Buffer.from(':hexo-blog-encrypt:v4:pwdcheck'));
  return hmac.digest('hex');
}

/**
 * Compute a content integrity hash so the browser can detect post-build
 * tampering with the ciphertext/salt/nonce before attempting decryption.
 *
 * SHA-256(ciphertext || salt || nonce || pwdcheck)
 *
 * @param {Buffer} ciphertext
 * @param {Buffer} salt
 * @param {Buffer} nonce
 * @param {string} pwdcheck - hex string
 * @returns {string} 64-char hex digest
 */
function computeIntegrityHash(ciphertext, salt, nonce, pwdcheck) {
  const hash = crypto.createHash('sha256');
  hash.update(ciphertext);
  hash.update(salt);
  hash.update(nonce);
  hash.update(Buffer.from(pwdcheck, 'hex'));
  return hash.digest('hex');
}

/**
 * Compute the SRI (Subresource Integrity) hash for the browser bundle.
 * Uses SHA-384 as recommended by the SRI spec.
 *
 * @param {Buffer} bundleBytes
 * @returns {string} base64-encoded SHA-384 digest, prefixed with "sha384-"
 */
function computeSRIHash(bundleBytes) {
  const digest = crypto.createHash('sha384').update(bundleBytes).digest('base64');
  return 'sha384-' + digest;
}

/**
 * Load and parse the external secret file.
 *
 * The secret file path is resolved relative to `baseDir` (the Hexo site root).
 * YAML parsing uses Hexo's built-in renderer so no extra dependency is needed.
 *
 * @param {string} secretFilePath - path from encrypt.secret_file config
 * @param {string} baseDir - hexo.base_dir
 * @param {object} hexo - the Hexo instance (for render)
 * @returns {object} parsed secret data
 */
function loadSecretFile(secretFilePath, baseDir, hexo) {
  const resolved = path.isAbsolute(secretFilePath)
    ? secretFilePath
    : path.resolve(baseDir, secretFilePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(
      'hexo-blog-encrypt: secret_file "' + secretFilePath +
      '" not found at "' + resolved + '". ' +
      'Create it from the .encrypt-secret.yml template (see theme docs) ' +
      'or check the encrypt.secret_file path in _config.yml.'
    );
  }

  let secretData;
  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    // Use Hexo's built-in YAML renderer (no extra dependency)
    secretData = hexo.render.renderSync({ text: raw, engine: 'yaml' });
  } catch (e) {
    throw new Error(
      'hexo-blog-encrypt: failed to parse secret_file "' +
      resolved + '": ' + e.message
    );
  }

  if (!secretData || typeof secretData !== 'object') {
    throw new Error(
      'hexo-blog-encrypt: secret_file "' + resolved +
      '" must contain a YAML mapping with a `levels` key.'
    );
  }

  return secretData;
}

/**
 * Deep-merge secret file passwords into the configured level structure.
 *
 * `groupsConfig.levels` has the structure { N: { name, label } }.
 * `secretData.levels` has { N: { password } }.
 * After merging, each level gets its password from the secret file.
 *
 * Level 0 (guest) is always present and never has a password.
 *
 * @param {object} groupsConfig - encrypt.groups from config
 * @param {object} secretData - parsed secret file
 * @returns {Map<number, {name: string, label: string, password: string|null}>}
 */
function resolveLevelPasswords(groupsConfig, secretData) {
  const levels = new Map();

  // Ensure level 0 (guest) always exists
  levels.set(0, {
    name: 'guest',
    label: '访客',
    password: null,
  });

  if (!groupsConfig || !groupsConfig.levels) return levels;

  const configLevels = groupsConfig.levels;
  const secretLevels = (secretData && secretData.levels) || {};

  for (const key of Object.keys(configLevels)) {
    const levelNum = Number(key);
    if (!Number.isInteger(levelNum) || levelNum < 0) continue;

    const cfg = configLevels[key] || {};
    const sec = secretLevels[key] || {};

    levels.set(levelNum, {
      name: cfg.name || ('level_' + levelNum),
      label: cfg.label || ('Level ' + levelNum),
      password: sec.password || cfg.password || null,
    });
  }

  return levels;
}

/**
 * Encrypt plaintext for multiple levels.
 *
 * For each level >= minLevel (that has a password), encrypts the plaintext
 * with independent salt/nonce, computes pwdcheck fingerprint, runs round-trip
 * verification, and computes integrity hash.
 *
 * @param {string} plaintext
 * @param {Map<number, object>} levels - resolved level passwords
 * @param {number} minLevel
 * @param {object} tips - error message strings
 * @param {object} opts - encryption options (iterations)
 * @returns {object} { ok, levels: Array, errorHTML }
 */
function encryptForLevels(plaintext, levels, minLevel, tips, opts) {
  const iterations = (opts && opts.iterations) || undefined;
  const results = [];

  for (const [levelNum, levelInfo] of levels) {
    if (levelNum < minLevel) continue;
    if (!levelInfo.password) continue;

    let encResult;
    try {
      encResult = encrypt(plaintext, levelInfo.password, { iterations });
    } catch (e) {
      throw new Error(
        'hexo-blog-encrypt: encryption failed for level ' + levelNum +
        ' ("' + levelInfo.label + '"): ' + e.message
      );
    }

    const { salt, nonce, ciphertext } = encResult;

    // Round-trip verification: encrypt → decrypt with same password
    try {
      const decrypted = decrypt(salt, nonce, ciphertext, levelInfo.password, { iterations });
      if (decrypted !== plaintext) {
        throw new Error('round-trip content mismatch');
      }
    } catch (e) {
      // Round-trip failed — encryption engine is compromised.
      // Render static error page, no form, no decrypt.js.
      const errorMsg = tips.page_corrupt ||
        'Content encryption verification failed. This is not your fault — the data may have been corrupted during build.';
      return {
        ok: false,
        levels: [],
        errorHTML: '<div class="hbe hbe-container hbe-corrupt" id="hexo-blog-encrypt">' +
          '<div class="hbe hbe-content">' +
          '<p class="hbe hbe-error" role="alert">' + escapeHTML(errorMsg) + '</p>' +
          '</div></div>',
      };
    }

    const pwdcheck = computePwdCheck(levelInfo.password, salt);
    const integrity = computeIntegrityHash(ciphertext, salt, nonce, pwdcheck);

    results.push({
      level: levelNum,
      name: levelInfo.name,
      label: levelInfo.label,
      salt: salt.toString('hex'),
      nonce: nonce.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
      pwdcheck,
      integrity,
    });
  }

  if (results.length === 0) {
    throw new Error(
      'hexo-blog-encrypt: no levels with passwords found for min_level=' +
      minLevel + '. Check encrypt.groups.levels and your secret file.'
    );
  }

  return { ok: true, levels: results, errorHTML: null };
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  computePwdCheck,
  computeIntegrityHash,
  computeSRIHash,
  loadSecretFile,
  resolveLevelPasswords,
  encryptForLevels,
  escapeHTML,
};
