/**
 * MD-RetroGlass — Inline Group Decrypt Handler
 *
 * Handles the {% group N %} inline encrypted blocks.
 * Uses event delegation on document, so it works with
 * dynamically added content (PJAX / htmx navigation).
 *
 * Crypto: PBKDF2-SHA256 → AES-256-GCM (same as hbe.bundle.js)
 */
(function () {
  'use strict';

  var ITERATIONS = 250000;

  // ── hex-to-bytes ──────────────────────────────────────────────
  function hexToBytes(hex) {
    var len = hex.length;
    if (len % 2 !== 0) throw new Error('odd hex length');
    var bytes = new Uint8Array(len / 2);
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  // ── HMAC-SHA256 password check ─────────────────────────────────
  async function computePwdCheck(password, saltBytes) {
    var key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    var checkMsg = new TextEncoder().encode(':hexo-blog-encrypt:v4:pwdcheck');
    var combined = new Uint8Array(saltBytes.length + checkMsg.length);
    combined.set(saltBytes, 0);
    combined.set(checkMsg, saltBytes.length);
    var sig = await crypto.subtle.sign('HMAC', key, combined);
    return Array.from(new Uint8Array(sig))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  // ── PBKDF2 + AES-GCM decrypt ───────────────────────────────────
  async function tryDecrypt(password, saltHex, nonceHex, ciphertextHex, iterations) {
    var salt = hexToBytes(saltHex);
    var nonce = hexToBytes(nonceHex);
    var ciphertext = hexToBytes(ciphertextHex);
    if (ciphertext.length < 16) return null;

    try {
      var rawKey = new TextEncoder().encode(password);
      var baseKey = await crypto.subtle.importKey(
        'raw', rawKey, { name: 'PBKDF2' }, false, ['deriveKey']
      );
      var aesKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['decrypt']
      );
      var plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: nonce, tagLength: 128 },
        aesKey,
        ciphertext
      );
      return new TextDecoder('utf-8', { fatal: true }).decode(plainBuf);
    } catch (e) {
      return null;
    }
  }

  // ── Handle a decrypt attempt ───────────────────────────────────
  async function handleDecrypt(container) {
    var select = container.querySelector('.group-select');
    var passwordInput = container.querySelector('.group-password');
    var errorSpan = container.querySelector('.group-error');
    var button = container.querySelector('.group-unlock-btn');
    var ciphers = container.querySelectorAll('script[type="application/x-hbe-cipher"]');

    if (!select || !passwordInput || !button) return;

    var selectedLevel = parseInt(select.value, 10);
    var password = passwordInput.value;

    if (!password) {
      if (errorSpan) errorSpan.textContent = '请输入密码';
      return;
    }

    // Find the ciphertext for the selected level
    var cipherHex = null;
    for (var i = 0; i < ciphers.length; i++) {
      if (parseInt(ciphers[i].dataset.level, 10) === selectedLevel) {
        cipherHex = ciphers[i].textContent.trim();
        break;
      }
    }

    if (!cipherHex) {
      if (errorSpan) errorSpan.textContent = '未找到对应等级的加密数据';
      return;
    }

    // Find level metadata from data-hbe-levels
    var levelsData = null;
    try {
      levelsData = JSON.parse(container.getAttribute('data-hbe-levels') || '[]');
    } catch (e) {
      levelsData = [];
    }

    var levelMeta = null;
    for (var j = 0; j < levelsData.length; j++) {
      if (levelsData[j].level === selectedLevel) {
        levelMeta = levelsData[j];
        break;
      }
    }

    if (!levelMeta) {
      if (errorSpan) errorSpan.textContent = '未找到对应等级的密钥信息';
      return;
    }

    // Set busy state
    button.disabled = true;
    button.textContent = '解密中…';
    if (errorSpan) errorSpan.textContent = '';

    try {
      // Pre-check: verify password with pwdcheck (HMAC)
      // Note: pwdcheck is NOT in the inline shortcode data —
      // we skip pre-check and go straight to decryption attempt.
      var plaintext = await tryDecrypt(
        password,
        levelMeta.salt,
        levelMeta.nonce,
        cipherHex,
        ITERATIONS
      );
    } finally {
      button.disabled = false;
      button.textContent = '解密';
    }

    if (plaintext === null) {
      if (errorSpan) errorSpan.textContent = '密码错误，请重试';
      passwordInput.value = '';
      passwordInput.focus();
      return;
    }

    // Success — replace details content with decrypted HTML
    var details = container.querySelector('.group-locked-details');
    if (details) {
      var div = document.createElement('div');
      div.className = 'group-decrypted';
      div.innerHTML = plaintext;
      details.parentNode.replaceChild(div, details);
    }
  }

  // ── Event delegation ──────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.group-unlock-btn');
    if (!btn) return;
    e.preventDefault();
    var container = btn.closest('.group-locked');
    if (container) handleDecrypt(container);
  });

  // Also handle Enter key in password field
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var input = e.target.closest('.group-password');
    if (!input) return;
    e.preventDefault();
    var container = input.closest('.group-locked');
    if (container) handleDecrypt(container);
  });
})();
