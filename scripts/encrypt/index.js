'use strict';

const crypto = require('node:crypto');
const path = require('node:path');

const { resolve } = require('./config');
const { encrypt } = require('./crypto');
const { createRenderer } = require('./template');
const { createGenerator } = require('./generator');
const { createLogger } = require('./logger');
const {
  computePwdCheck,
  encryptForLevels,
  loadSecretFile,
  resolveLevelPasswords,
} = require('./multi-level');

const THEME_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE_DIR = path.join(THEME_ROOT, 'layout', 'encrypt');
const CSS_PATH = path.join(THEME_ROOT, 'source', 'css', 'hbe.style.css');
const BUNDLE_PATH = path.join(THEME_ROOT, 'source', 'js', 'hbe.bundle.js');
const BUNDLE_SOURCEMAP_PATH = path.join(THEME_ROOT, 'source', 'js', 'hbe.bundle.js.map');

const FORMAT_VERSION = '4';
const STABLE_SALT_NAMESPACE = 'hexo-blog-encrypt:v4:stableSalt:';

// Per-instance Symbol so user front-matter keys can never collide with our
// idempotence marker. We deliberately do NOT use Symbol.for(...) (a global
// registry) — a per-process Symbol guarantees external code cannot fabricate
// the marker even by accident.
const HBE_ENCRYPTED = Symbol('hexo-blog-encrypt.v4.encrypted');

function normalizeRoot(root) {
  if (typeof root !== 'string') return '/';
  return root.endsWith('/') ? root : root + '/';
}

function normalizePostTags(postTags) {
  // Real Hexo posts: `data.tags` is a Warehouse Query (NOT a plain array).
  // `Array.isArray(query) === false`, but `query.toArray()` and
  // `query.forEach(tag => …)` both work. v3 used `data.tags.forEach(…)`;
  // we replicate that contract here while ALSO accepting plain arrays so
  // synthetic test data and other plugins that pre-flatten still work.
  // Returning [] means "no tag-encryption applies" — the post is left
  // unencrypted IFF it also has no front-matter password (which is the
  // correct behaviour for a post that genuinely has no tags).
  if (postTags == null) return [];
  if (Array.isArray(postTags)) return postTags;
  if (typeof postTags.toArray === 'function') return postTags.toArray();
  if (typeof postTags.forEach === 'function') {
    const out = [];
    postTags.forEach((t) => out.push(t));
    return out;
  }
  return [];
}

function stableSaltFromPermalink(permalink) {
  return crypto.createHash('sha256')
    .update(STABLE_SALT_NAMESPACE)
    .update('\0')
    .update(permalink)
    .digest();
}

function resolveTagPassword(hexoEncrypt, postTags) {
  if (!hexoEncrypt || !Array.isArray(hexoEncrypt.tags)) return null;
  const tags = normalizePostTags(postTags);
  if (tags.length === 0) return null;
  const map = Object.create(null);
  for (const t of hexoEncrypt.tags) {
    if (t && typeof t.name === 'string') map[t.name] = t.password;
  }
  for (const t of tags) {
    if (t && typeof t.name === 'string' && Object.prototype.hasOwnProperty.call(map, t.name)) {
      return { name: t.name, password: map[t.name] };
    }
  }
  return null;
}

function register(hexo) {
  if (!hexo) throw new Error('hexo-blog-encrypt: hexo instance is required');

  const logger = createLogger({ hexo, silent: false });
  const renderer = createRenderer({ templateDir: TEMPLATE_DIR, logger });
  // Single shared generator instance — used by both the filter (for
  // computing the script src hash) and Hexo's generator pipeline (for
  // emitting the bytes). The generator memoizes the bundle bytes/hash by
  // mtime, so all calls within one generation cycle agree on the same
  // content hash, eliminating the per-call disk re-read AND the
  // hash-mismatch window between filter and generator (see
  // `src/server/generator.js`).
  const assetGenerator = createGenerator({
    bundlePath: BUNDLE_PATH,
    cssPath: CSS_PATH,
    sourcemapPath: BUNDLE_SOURCEMAP_PATH,
  });

  hexo.extend.filter.register('after_post_render', function v4Filter(data) {
    // Idempotence: stamp a per-instance Symbol on `data` after a successful
    // pass so re-entry on the same object is a no-op. We deliberately do NOT
    // use `data.encrypt === true` (a user-set "please encrypt" front-matter
    // signal) or `data.origin` (a generic property name another plugin or
    // user could legitimately populate) as the marker — both have caused
    // silent-skip footguns in earlier designs.
    if (data[HBE_ENCRYPTED] === true) {
      return data;
    }

    // ── Multi-level encryption branch ──────────────────────────────
    // Activated when post front-matter has `encrypt.levels` (explicit
    // per-post level passwords) or `encrypt.min_level` (use passwords
    // from config + secret file). Falls through to single-password
    // logic when neither is present.
    const postEncrypt = data.encrypt;
    if (postEncrypt && typeof postEncrypt === 'object' && !Array.isArray(postEncrypt)) {
      const hasExplicitLevels = postEncrypt.levels && typeof postEncrypt.levels === 'object';
      const hasMinLevel = typeof postEncrypt.min_level === 'number' && postEncrypt.min_level >= 0;

      if (hasExplicitLevels || hasMinLevel) {
        // Merge theme config → site config for the encrypt block.
        const themeEncrypt = (hexo.theme && hexo.theme.config &&
          typeof hexo.theme.config.encrypt === 'object' && !Array.isArray(hexo.theme.config.encrypt)
        ) ? hexo.theme.config.encrypt : {};
        const siteEncrypt = (hexo.config &&
          typeof hexo.config.encrypt === 'object' && !Array.isArray(hexo.config.encrypt)
        ) ? hexo.config.encrypt : {};

        // Master switch: encrypt.enable === false disables all encryption.
        if (siteEncrypt.enable === false || themeEncrypt.enable === false) {
          return data;
        }

        // Resolve tips for error messages.
        const tips = {
          password_incorrect: siteEncrypt.tips && siteEncrypt.tips.password_incorrect ||
            themeEncrypt.tips && themeEncrypt.tips.password_incorrect ||
            '密码错误！请你重新输入。',
          page_corrupt: siteEncrypt.tips && siteEncrypt.tips.page_corrupt ||
            themeEncrypt.tips && themeEncrypt.tips.page_corrupt ||
            '这不是你的问题——数据可能被破坏了！快告诉主人有坏人在撬锁！',
        };

        // Resolve group level structure from config.
        const groupsConfig = siteEncrypt.groups || themeEncrypt.groups || {};

        // Load external secret file if configured.
        const secretFilePath = siteEncrypt.secret_file || themeEncrypt.secret_file || null;
        let secretData = {};
        if (secretFilePath) {
          try {
            secretData = loadSecretFile(secretFilePath, hexo.base_dir, hexo);
          } catch (e) {
            logger.error(e.message);
            throw e;
          }
        }

        // Resolve level passwords: config structure + secret file passwords.
        const resolvedLevels = resolveLevelPasswords(groupsConfig, secretData);

        // Override with explicit per-post level passwords if present.
        if (hasExplicitLevels) {
          for (const key of Object.keys(postEncrypt.levels)) {
            const levelNum = Number(key);
            if (!Number.isInteger(levelNum) || levelNum < 0) continue;
            const levelInfo = resolvedLevels.get(levelNum);
            if (levelInfo) {
              levelInfo.password = String(postEncrypt.levels[key]);
            } else {
              resolvedLevels.set(levelNum, {
                name: 'level_' + levelNum,
                label: 'Level ' + levelNum,
                password: String(postEncrypt.levels[key]),
              });
            }
          }
        }

        const minLevel = hasMinLevel ? postEncrypt.min_level : 0;

        // Resolve KDF iterations for the encryption opts.
        const kdfIters = (siteEncrypt.kdf && siteEncrypt.kdf.iterations) ||
          (themeEncrypt.kdf && themeEncrypt.kdf.iterations) ||
          undefined;

        // Preserve original plaintext.
        data.origin = data.content;
        const plaintext = String(data.content == null ? '' : data.content);

        const titleText = (typeof data.title === 'string') ? data.title.trim() : '(untitled)';
        logger.info(
          `hexo-blog-encrypt: encrypting "${titleText}" with ${resolvedLevels.size} ` +
          `levels (min_level=${minLevel}) via multi-group theme.`
        );

        // Encrypt for each level, with round-trip verification.
        const encResult = encryptForLevels(plaintext, resolvedLevels, minLevel, tips, {
          iterations: kdfIters,
        });

        if (!encResult.ok) {
          // Round-trip verification failed — render static error page.
          data.content = encResult.errorHTML;
          data.encrypt = true;
          data.excerpt = data.more = tips.page_corrupt;
          data[HBE_ENCRYPTED] = true;
          return data;
        }

        // Build the levels JSON for data-hbe-levels.
        const levelsForAttr = encResult.levels.map((l) => ({
          level: l.level,
          name: l.name,
          label: l.label,
          salt: l.salt,
          nonce: l.nonce,
          pwdcheck: l.pwdcheck,
          integrity: l.integrity,
        }));

        // Build per-level ciphertext <script> blocks.
        const levelCiphersHTML = encResult.levels.map((l) =>
          '<script type="application/x-hbe-cipher" data-level="' + l.level + '">' +
          l.ciphertext +
          '</script>'
        ).join('\n');

        // Render the multi-group theme template.
        const themeName = 'md-retroglass';
        const resolvedWpm = tips.password_incorrect;
        const resolvedCorruptMsg = tips.page_corrupt;

        const rendered = renderer.render({
          theme: themeName,
          format: FORMAT_VERSION,
          // Single-password placeholders (kept for template compatibility):
          ciphertext: encResult.levels[0].ciphertext,
          salt: encResult.levels[0].salt,
          nonce: encResult.levels[0].nonce,
          message: siteEncrypt.message || themeEncrypt.message || '选择你的用户组并输入密码',
          wpm: resolvedWpm,
          whm: resolvedWpm, // GCM unifies both under v4
          kdfIterations: kdfIters || 250000,
          autoSave: false,
          buttonClass: '',
          buttonText: '解密',
          // Multi-level placeholders:
          levelsJSON: JSON.stringify(levelsForAttr),
          minLevel: String(minLevel),
          levelCiphers: levelCiphersHTML,
          integrityJSON: JSON.stringify(
            encResult.levels.reduce((obj, l) => { obj[l.level] = l.integrity; return obj; }, {})
          ),
          corruptMsg: resolvedCorruptMsg,
          levelPassMsg: resolvedWpm,
        });

        const root = normalizeRoot(hexo.config && hexo.config.root);
        const routes = assetGenerator();
        const jsRoute = routes.find((r) => /^lib\/hbe\.[0-9a-f]{10}\.js$/.test(r.path));
        const cssRoute = routes.find((r) => r.path === 'css/hbe.style.css');
        const jsHref = root + jsRoute.path;
        const cssHref = root + cssRoute.path;
        const sriHash = assetGenerator.getSRI();

        // Note: CSS is handled by the theme's _encrypt.scss — we do NOT
        // inject hbe.style.css here to avoid overriding the theme styles.
        data.content = rendered +
          '<script data-pjax src="' + jsHref + '" integrity="' + sriHash + '" crossorigin="anonymous"></script>' +
          // Post-load visibility guard: if the form is still hidden after the
          // bundle runs (e.g. a runtime integrity-check failure on an otherwise
          // valid page), force it visible so the user can at least try to unlock.
          '<script>' +
          '(function(){' +
            'function guard(){' +
              'var f=document.getElementById("hbeForm");' +
              'if(!f) return;' +
              'var wasHidden=false;' +
              'if(f.style.display==="none"){' +
                'f.style.display="flex";' +
                'f.removeAttribute("style");' +
                'wasHidden=true;' +
              '}' +
              'var sw=document.querySelector(".hbe-level-select-wrapper");' +
              'if(sw&&sw.style.display==="none"){' +
                'sw.style.display="block";' +
                'sw.removeAttribute("style");' +
              '}' +
              // Clear corruption error — this is a false positive if we are
              // showing the form, because the server already verified integrity.
              'var errs=document.querySelectorAll("#hexo-blog-encrypt .hbe-error");' +
              'for(var i=0;i<errs.length;i++){' +
                'if(errs[i].textContent.indexOf("数据可能被破坏")!==-1||' +
                   'errs[i].textContent.indexOf("tampered")!==-1||' +
                   'errs[i].textContent.indexOf("corrupt")!==-1||' +
                   'errs[i].textContent.indexOf("完整性")!==-1){' +
                  'errs[i].textContent="";' +
                '}' +
              '}' +
              // Remove hbe-corrupt class from error elements
              'var co=document.querySelectorAll(".hbe-corrupt");' +
              'for(var j=0;j<co.length;j++){co[j].classList.remove("hbe-corrupt");}' +
              'if(wasHidden){' +
                'console.warn("[encrypt] form was hidden by integrity check — forcibly shown. " +' +
                  '"crypto.subtle="+!!(window.crypto&&window.crypto.subtle)+", " +' +
                  '"secure="+!!(window.isSecureContext));' +
              '}' +
            '}' +
            'setTimeout(guard, 0);' +
            'setTimeout(guard, 50);' +
            'setTimeout(guard, 200);' +
            'setTimeout(guard, 1000);' +
            'document.addEventListener("DOMContentLoaded", function(){setTimeout(guard, 10);});' +
            'window.addEventListener("load", function(){setTimeout(guard, 50);});' +
          '})();' +
          '</script>';
        data.encrypt = true;
        data.excerpt = data.more = (siteEncrypt.abstract || themeEncrypt.abstract ||
          "Here's something encrypted, password is required to continue reading.");
        data[HBE_ENCRYPTED] = true;

        return data;
      }
    }
    // ── End multi-level encryption branch ──────────────────────────

    // Resolve effective password from front-matter > tag > nothing.
    const fmPassword = data.password;
    if (fmPassword === '') {
      // Empty FM password explicitly disables encryption (criterion 4).
      return data;
    }

    let effectivePostData = data;
    if (fmPassword === undefined || fmPassword === null) {
      const tagMatch = resolveTagPassword(hexo.config && hexo.config.encrypt, data.tags);
      if (!tagMatch || tagMatch.password === undefined || tagMatch.password === null) {
        return data;
      }
      effectivePostData = Object.assign({}, data, { password: tagMatch.password });
      effectivePostData.__tagName = tagMatch.name;
    }

    // resolve() throws on misconfiguration (e.g. kdf.iterations below floor).
    // Let it propagate — the original stack is the most actionable thing for
    // the user, and Hexo will surface the error through its own logger.
    const cfg = resolve(hexo.config, effectivePostData, logger);
    if (cfg === null) {
      // Defensive: resolve() returns null when the resolved password collapses
      // to undefined/empty (e.g. a tag entry with `password: ''`). Bypass.
      return data;
    }

    logger.updateSilent(!!cfg.silent);

    const tagName = effectivePostData.__tagName;
    const titleText = (typeof data.title === 'string') ? data.title.trim() : '(untitled)';
    if (tagName) {
      logger.info(`hexo-blog-encrypt: encrypting "${titleText}" via tag "${tagName}" with theme ${cfg.theme}.`);
    } else {
      logger.info(`hexo-blog-encrypt: encrypting "${titleText}" via front-matter password with theme ${cfg.theme}.`);
    }

    // Preserve original plaintext so themes (TOC, etc.) can still introspect it.
    data.origin = data.content;

    const plaintext = String(data.content == null ? '' : data.content);
    const stableSaltEnabled = cfg.stableSalt === true
      && typeof data.permalink === 'string'
      && data.permalink.length > 0;
    const { salt, nonce, ciphertext } = encrypt(plaintext, cfg.password, {
      iterations: cfg.kdf.iterations,
      salt: stableSaltEnabled ? stableSaltFromPermalink(data.permalink) : undefined,
    });

    const buttonShow = !cfg.decryptButton || cfg.decryptButton.show !== false;
    const buttonText = (cfg.decryptButton && typeof cfg.decryptButton.text === 'string')
      ? cfg.decryptButton.text
      : 'Decrypt';

    const themeName = String(cfg.theme || 'default').trim().toLowerCase();
    const rendered = renderer.render({
      theme: themeName,
      format: FORMAT_VERSION,
      ciphertext: ciphertext.toString('hex'),
      salt: salt.toString('hex'),
      nonce: nonce.toString('hex'),
      message: cfg.message,
      wpm: cfg.wrong_pass_message,
      whm: cfg.wrong_hash_message,
      buttonClass: buttonShow ? '' : ' hbe-button-hidden',
      buttonText,
      kdfIterations: cfg.kdf.iterations,
      autoSave: !!cfg.autoSave,
    });

    const root = normalizeRoot(hexo.config && hexo.config.root);
    const routes = assetGenerator();
    const jsRoute = routes.find((r) => /^lib\/hbe\.[0-9a-f]{10}\.js$/.test(r.path));
    const cssRoute = routes.find((r) => r.path === 'css/hbe.style.css');
    const jsHref = root + jsRoute.path;
    const cssHref = root + cssRoute.path;
    const sriHash = assetGenerator.getSRI();

    // CSS handled by theme's _encrypt.scss — skip hbe.style.css to
    // avoid overriding the MD3 glassmorphism styles.
    data.content = rendered +
      `<script data-pjax src="${jsHref}" integrity="${sriHash}" crossorigin="anonymous"></script>`;
    data.encrypt = true;
    data.excerpt = data.more = cfg.abstract;
    data[HBE_ENCRYPTED] = true;

    return data;
  }, 1000);

  hexo.extend.generator.register('hexo-blog-encrypt', assetGenerator);
}

module.exports = { register };
