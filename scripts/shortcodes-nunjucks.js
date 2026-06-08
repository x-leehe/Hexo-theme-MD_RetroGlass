/**
 * MD-RetroGlass — Nunjucks {% tag %} Shortcodes
 * Hexo-native tag plugins. Fully Nunjucks-compatible.
 *
 * Usage:
 *   {% spoiler Description %}text{% endspoiler %}
 *   {% hidden Description %}text{% endhidden %}
 *   {% tip Description %}text{% endtip %}
 *   {% info Description %}text{% endinfo %}
 *   {% warn Description %}text{% endwarn %}
 *   {% critical Description %}text{% endcritical %}
 *   {% blur Description %}text{% endblur %}
 *   {% preview %}
 *   title: page title
 *   url: https://...
 *   desc: description (optional)
 *   icon: icon URL (optional)
 *   {% endpreview %}
 *
 * Also normalizes non-standard syntax:
 *   {%Spoiler%} → {% spoiler %}
 *   {%endspoiler%} → {% endspoiler %}
 */
(function () {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    const sc = (hexo.theme.config && hexo.theme.config.shortcodes) || {};

    function md(text) {
        return hexo.render.renderSync({ text: text, engine: 'markdown' }) || '';
    }

    // Normalize Nunjucks tag syntax (case-insensitive, adds spaces):
    // {%Spoiler%} → {% spoiler %}, {%endspoiler%} → {% endspoiler %}
    hexo.extend.filter.register('before_post_render', function (data) {
        if (!data.content) return data;
        data.content = data.content.replace(
            /\{%\s*(\/?)(spoiler|hidden|tip|info|warn|critical|blur|preview)\s*%\}/ig,
            function (_, slash, tag) {
                return '{% ' + slash + tag.toLowerCase() + ' %}';
            }
        );
        return data;
    });

    // ---- Spoiler ----
    ['spoiler', 'Spoiler'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.spoiler_default || '你知道的太多了';
            return '<span class="spoiler" tabindex="0" title="' + desc + '">' + md(content).replace(/<\/?p>/g, '') + '</span>';
        }, { ends: true });
    });

    // ---- Hidden ----
    ['hidden', 'Hidden'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.hidden_default || '展开';
            return '<details class="hidden-block"><summary class="hidden-summary"><svg class="sym-icon hidden-arrow" aria-hidden="true"><use href="#chevron_right"/></svg><span>' + desc + '</span></summary><div class="hidden-content">' + md(content) + '</div></details>';
        }, { ends: true });
    });

    // ---- Tip / Info ----
    ['tip', 'Tip', 'info', 'Info'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.tip_default || '提示';
            return '<div class="admonition tip"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#info"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });

    // ---- Warn ----
    ['warn', 'Warn'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.warn_default || '警告';
            return '<div class="admonition warn"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#warning"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });

    // ---- Critical ----
    ['critical', 'Critical'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.critical_default || '严重警告';
            return '<div class="admonition critical"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#report"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });

    // ---- Blur ----
    ['blur', 'Blur'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            const desc = args.join(' ') || sc.blur_default || '你知道的太多了';
            return '<span class="blur" tabindex="0" title="' + desc + '">' + md(content).replace(/<\/?p>/g, '') + '</span>';
        }, { ends: true });
    });

    // ---- OG metadata fetcher (used by Preview tag) ----
    function fetchOG(url, depth) {
        depth = depth || 0;
        if (depth > 5) return Promise.resolve({ image: '', description: '', title: '' });
        return new Promise(function (resolve) {
            const result = { image: '', description: '', title: '' };
            const lib = url.startsWith('https') ? https : http;
            const req = lib.get(url, { timeout: 5000, headers: { 'User-Agent': 'Hexo-MD-RetroGlass/1.0' } }, function (res) {
                // Follow redirects (resolve relative URLs)
                if ([301, 302, 307, 308].indexOf(res.statusCode) >= 0 && res.headers.location) {
                    const redirectUrl = new URL(res.headers.location, url).href;
                    fetchOG(redirectUrl, depth + 1).then(resolve);
                    return;
                }
                let body = '';
                res.on('data', function (chunk) { body += chunk; });
                res.on('end', function () {
                    const imgMatch = body.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
                    if (imgMatch) result.image = imgMatch[1];
                    const descMatch = body.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
                    if (descMatch) result.description = descMatch[1];
                    const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
                    if (titleMatch) result.title = titleMatch[1].trim();
                    resolve(result);
                });
            });
            req.on('error', function () { resolve(result); });
            req.on('timeout', function () { req.destroy(); resolve(result); });
        });
    }

    // ---- Preview (link preview card; YAML-like block syntax) ----
    // Usage:
    //   {% preview %}
    //   title: page title (required)
    //   url: https://... (required)
    //   desc: description (optional, falls back to og:description)
    //   icon: https://... (optional, falls back to og:image)
    //   {% endpreview %}
    // auto-fetches OG metadata for missing desc/icon.
    ['preview', 'Preview'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            // Parse YAML-like key:value pairs from content block
            const parsed = {};
            const lines = (content || '').split(/\n/);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const m = line.match(/^(title|url|desc|icon)\s*:\s*(.+)$/i);
                if (m) parsed[m[1].toLowerCase()] = m[2].trim();
            }
            const title = parsed.title || '';
            const desc  = parsed.desc  || '';
            const icon  = parsed.icon  || '';
            const url   = parsed.url   || '';

            // Validate required fields
            if (!url || !title) {
                let host = '';
                try { host = new URL(url).hostname; } catch(e) {}
                return '<div class="link-preview-card" data-no-link>' +
                    '<div class="preview-url-top">' + (host || '预览卡片') + '</div>' +
                    '<div class="preview-body">' +
                    '<div class="preview-thumb">' +
                    '<svg class="sym-icon preview-icon-fallback" aria-hidden="true"><use href="#link"/></svg>' +
                    '</div>' +
                    '<div class="preview-info">' +
                    '<div class="preview-title">' + (title || host || '链接预览') + '</div>' +
                    (desc ? '<div class="preview-desc">' + desc + '</div>' : '') +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }

            let host = '';
            try { host = new URL(url).hostname; } catch(e) { host = ''; }

            // If icon already provided, no need to fetch
            if (icon) {
                return '<a class="link-preview-card" href="' + url + '" target="_blank" rel="noopener">' +
                    '<div class="preview-url-top">' + (host || '链接预览') + '</div>' +
                    '<div class="preview-body">' +
                    '<div class="preview-thumb has-image">' +
                    '<img class="preview-favicon" src="' + icon + '" alt="" loading="lazy" onerror="this.parentElement.classList.remove(\'has-image\')">' +
                    '<svg class="sym-icon preview-icon-fallback" aria-hidden="true"><use href="#link"/></svg>' +
                    '</div>' +
                    '<div class="preview-info">' +
                    '<div class="preview-title">' + title + '</div>' +
                    (desc ? '<div class="preview-desc">' + desc + '</div>' : '') +
                    '</div>' +
                    '</div>' +
                    '</a>';
            }

            // Async: fetch OG metadata for missing desc/icon
            return fetchOG(url).then(function (og) {
                const imgSrc = icon || og.image || '';
                const finalDesc = desc || og.description || '';
                const hasImg = !!imgSrc;
                return '<a class="link-preview-card" href="' + url + '" target="_blank" rel="noopener">' +
                    '<div class="preview-url-top">' + (host || '链接预览') + '</div>' +
                    '<div class="preview-body">' +
                    '<div class="preview-thumb' + (hasImg ? ' has-image' : '') + '">' +
                    (hasImg ? '<img class="preview-favicon" src="' + imgSrc + '" alt="" loading="lazy" onerror="this.parentElement.classList.remove(\'has-image\')">' : '') +
                    '<svg class="sym-icon preview-icon-fallback" aria-hidden="true"><use href="#link"/></svg>' +
                    '</div>' +
                    '<div class="preview-info">' +
                    '<div class="preview-title">' + title + '</div>' +
                    (finalDesc ? '<div class="preview-desc">' + finalDesc + '</div>' : '') +
                    '</div>' +
                    '</div>' +
                    '</a>';
            });
        }, { ends: true, async: true });
    });
})();
