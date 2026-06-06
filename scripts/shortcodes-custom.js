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
    var hexo = this;

    // Default labels from theme config, with hardcoded fallbacks
    var sc = (hexo.theme.config && hexo.theme.config.shortcodes) || {};

    function mdInline(text) {
        return hexo.render.renderSync({ text: text, engine: 'markdown' });
    }

    // ---- Spoiler (inline-only; raw text, \n → <br>) ----
    data.content = data.content.replace(
        /\{\{Spoiler\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<span class="spoiler" title="' + (desc || sc.spoiler_default || '你知道的太多了') + '">' + text.replace(/\n/g, '<br>') + '</span>'
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
