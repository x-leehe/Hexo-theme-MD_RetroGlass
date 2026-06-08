/**
 * MD-RetroGlass — Link Preview Auto-Fetch
 *
 * When a post has `show-preview: true` in front-matter,
 * this after_post_render filter scans external <a> links,
 * fetches their og:description & og:image, and replaces
 * them with Telegram-style preview cards.
 *
 * Caching: in-memory Map, one fetch per unique URL per build.
 * Async-safe: returns Promise<data> so Hexo awaits completion.
 */
(function () {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');

    const linkConfig = (hexo.theme.config && hexo.theme.config.link_preview) || {};
    const ENABLED = linkConfig.enable !== false;       // master switch: false → skip ALL
    const AUTO_FETCH = linkConfig.auto_fetch !== false; // auto-fetch switch
    const TIMEOUT = linkConfig.timeout || 5000;
    const CACHE = new Map();

    /**
     * Fetch a URL and return the body as a string (Promise).
     */
    function fetchBody(targetUrl) {
        return new Promise(function (resolve, reject) {
            const mod = targetUrl.startsWith('https') ? https : http;
            const req = mod.get(targetUrl, {
                timeout: TIMEOUT,
                headers: { 'User-Agent': 'Hexo-MD-RetroGlass/1.0' }
            }, function (res) {
                if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location) {
                    const redirectUrl = new URL(res.headers.location, targetUrl).href;
                    return fetchBody(redirectUrl).then(resolve).catch(reject);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error('HTTP ' + res.statusCode));
                }
                const chunks = [];
                res.on('data', function (chunk) { chunks.push(chunk); });
                res.on('end', function () {
                    resolve(Buffer.concat(chunks).toString('utf8'));
                });
            });
            req.setTimeout(TIMEOUT);
            req.on('error', reject);
            req.on('timeout', function () { req.destroy(); reject(new Error('Timeout')); });
        });
    }

    /**
     * Parse HTML and extract og:description, og:image & <title>.
     */
    function parseOG(html) {
        const ogDesc = (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)
                     || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i)
                     || [])[1] || '';
        const ogImg = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i)
                    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i)
                    || [])[1] || '';
        const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
        return { description: ogDesc, image: ogImg, title: title.trim() };
    }

    /**
     * Build preview card HTML string.
     */
    function buildCardHTML(href, title, description, image, host) {
        const imgHTML = image
            ? '<img class="preview-favicon" src="' + image + '" alt="" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'block\'" onload="this.parentElement.classList.add(\'has-image\')">'
              + '<svg class="sym-icon preview-icon-fallback" aria-hidden="true"><use href="#link"/></svg>'
            : '<svg class="sym-icon preview-icon-fallback" aria-hidden="true"><use href="#link"/></svg>';

        return '<a class="link-preview-card" href="' + href + '" target="_blank" rel="noopener">'
            + '<div class="preview-url-top">' + (host || '') + '</div>'
            + '<div class="preview-body">'
            + '<div class="preview-thumb">' + imgHTML + '</div>'
            + '<div class="preview-info">'
            + '<div class="preview-title">' + (title || host || '外部链接') + '</div>'
            + '<div class="preview-desc">' + (description || '') + '</div>'
            + '</div>'
            + '</div>'
            + '</a>';
    }

    hexo.extend.filter.register('after_post_render', function (data) {
        if (!ENABLED) return data;                        // master switch off — skip ALL
        if (!data['show-preview']) return data;           // per-post opt-in
        if (!data.content) return data;
        if (!AUTO_FETCH) return data;                     // auto-fetch disabled

        // Find standalone external <a> links (only child of <p> or <li>) — NOT inline
        // Standalone: <p><a href="...">text</a></p> or <li><a href="...">text</a></li>
        // Inline (skipped): <p>some text <a href="...">link</a> more text</p>
        const linkRegex = /<(p|li)>\s*<a\s+(?![^>]*class="[^"]*link-preview-card[^"]*")[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/(p|li)>/g;

        const matches = [];
        let m;
        while ((m = linkRegex.exec(data.content)) !== null) {
            const href = m[2];
            let host = '';
            try { host = new URL(href).hostname; } catch (e) { host = ''; }
            if (!host) continue;
            matches.push({ fullMatch: m[0], href: href, linkText: m[3], host: host, tag: m[1] });
        }

        if (matches.length === 0) return data;

        // Fetch all unique URLs, then replace
        const uniqueHrefs = [...new Set(matches.map(function (m) { return m.href; }))];

        const fetchTasks = uniqueHrefs.map(function (href) {
            if (CACHE.has(href)) return Promise.resolve(CACHE.get(href));
            return fetchBody(href).then(function (body) {
                const og = parseOG(body);
                CACHE.set(href, og);
                return og;
            }).catch(function () {
                const fallback = { description: '', image: '', title: '' };
                CACHE.set(href, fallback);
                return fallback;
            });
        });

        return Promise.all(fetchTasks).then(function (results) {
            const ogMap = {};
            uniqueHrefs.forEach(function (href, i) { ogMap[href] = results[i]; });

            let result = data.content;
            matches.forEach(function (match) {
                const og = ogMap[match.href] || { description: '', image: '', title: '' };
                const cardHTML = buildCardHTML(
                    match.href,
                    og.title || match.linkText,
                    og.description,
                    og.image,
                    match.host
                );
                // Preserve <li> wrapper for list items; <p> is replaced entirely
                const replacement = match.tag === 'li' ? '<li>' + cardHTML + '</li>' : cardHTML;
                result = result.replace(match.fullMatch, replacement);
            });

            data.content = result;
            return data;
        });
    }, 20);
})();
