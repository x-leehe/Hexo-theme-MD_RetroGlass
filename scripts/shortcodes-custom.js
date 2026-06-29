/**
 * MD-RetroGlass — {{ }} Custom Shortcodes
 * Custom inline syntax: {{Function|Description|text}}
 *
 * Description is optional; leave empty to use config defaults.
 * All block-level shortcodes support full Markdown formatting inside.
 *
 * Runs before Nunjucks rendering to avoid {{ }} conflicts.
 */
hexo.extend.filter.register('before_post_render', function (data) {
    if (!data.content) return data;
    const hexo = this;

    // ---- Protect fenced code blocks from shortcode processing ----
    const protectedBlocks = [];
    data.content = data.content.replace(
        /```[\s\S]*?```/g,
        function (match) {
            protectedBlocks.push(match);
            return '<!--CB' + (protectedBlocks.length - 1) + '-->';
        }
    );

    // ---- Protect inline code containing Nunjucks syntax ----
    // Hexo's escapeAllSwigTags (post.js) walks the raw Markdown character by
    // character looking for {% %}, {{ }}, and {# #} patterns.  It does not
    // understand Markdown backtick quoting, so `{% group 2 %}` inside inline
    // code is still seen as a live Nunjucks tag.  When the post also contains
    // a matching {% endgroup %}, the state machine enters "full tag" mode and
    // wraps everything between them into a single swig placeholder — restoring
    // raw Markdown into the rendered HTML later, which then trips up Nunjucks.
    //
    // Fix: convert backtick code that contains {% / {{ / {# to an HTML <code>
    // tag with entity-escaped braces.  Markdown-it (html:true) passes the
    // <code> through verbatim, and tag.render() later re-escapes it via
    // rCodeTag, so Nunjucks never sees a bare {.
    data.content = data.content.replace(
        /`([^`\n]*?\{[%{#][^`\n]*?)`/g,
        function (_, code) {
            return '<code>' + code.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;') + '</code>';
        }
    );

    // Default labels from theme config, with hardcoded fallbacks
    const sc = (hexo.theme.config && hexo.theme.config.shortcodes) || {};

    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function mdInline(text) {
        return hexo.render.renderSync({ text: text, engine: 'markdown' });
    }

    // ---- Spoiler (inline-only; raw text, \n → <br>) ----
    data.content = data.content.replace(
        /\{\{Spoiler\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<span class="spoiler" tabindex="0" title="' + escapeHtml(desc || sc.spoiler_default || '你知道的太多了') + '">' + text.replace(/\n/g, '<br>') + '</span>'
    );

    // ---- Hidden ----
    data.content = data.content.replace(
        /\{\{Hidden\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<details class="hidden-block"><summary class="hidden-summary"><svg class="sym-icon hidden-arrow" aria-hidden="true"><use href="#chevron_right"/></svg><span>' + (desc || sc.hidden_default || '展开') + '</span></summary><div class="hidden-content">' + mdInline(text) + '</div></details>'
    );

    // ---- Tip / Info ----
    data.content = data.content.replace(
        /\{\{(?:Tip|Info)\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition tip"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#info"/></svg><strong>' + (desc || sc.tip_default || '提示') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    // ---- Warn ----
    data.content = data.content.replace(
        /\{\{Warn\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition warn"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#warning"/></svg><strong>' + (desc || sc.warn_default || '警告') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    // ---- Critical ----
    data.content = data.content.replace(
        /\{\{Critical\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition critical"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#report"/></svg><strong>' + (desc || sc.critical_default || '严重警告') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    // ---- Blur (inline-only; raw text, \n → <br>) ----
    data.content = data.content.replace(
        /\{\{Blur\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<span class="blur" tabindex="0" title="' + escapeHtml(desc || sc.blur_default || '你知道的太多了') + '">' + text.replace(/\n/g, '<br>') + '</span>'
    );

    // ---- Restore protected code blocks ----
    data.content = data.content.replace(
        /<!--CB(\d+)-->/g,
        function (_, i) { return protectedBlocks[+i]; }
    );

    return data;
});

// Post-render: insert <br> between consecutive spoiler spans
// that were on separate lines, but leave inline spoilers alone.
hexo.extend.filter.register('after_post_render', function (data) {
    if (!data.content) return data;
    data.content = data.content.replace(
        /<\/span>(?:<\/p>)?(\n+)<span class="spoiler"/g,
        '</span><br>$1<span class="spoiler"'
    );
    return data;
});
