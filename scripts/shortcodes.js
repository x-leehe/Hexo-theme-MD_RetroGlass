/**
 * MD-RetroGlass — Shortcodes filter
 * Syntax: {{Function|Description|text}}
 *   Description is optional; leave empty (e.g. {{Tip||text}}) to use default.
 * All support multi-line content with full Markdown formatting inside.
 * Runs before Nunjucks rendering to avoid template conflicts.
 */
hexo.extend.filter.register('before_post_render', function (data) {
    if (!data.content) return data;
    var hexo = this;

    // Default labels from theme config, with hardcoded fallbacks
    var sc = (hexo.theme.config && hexo.theme.config.shortcodes) || {};

    // Helper: render inline Markdown → HTML (preserves code spans, bold, links etc.)
    function mdInline(text) {
        return hexo.render.renderSync({ text: text, engine: 'markdown' });
    }

    // ---- Spoiler (黑幕/剧透文本) ----
    // Spoiler is inline-only, no Markdown rendering — keep raw text but preserve newlines.
    data.content = data.content.replace(
        /\{\{Spoiler\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<span class="spoiler" title="' + (desc || sc.spoiler_default || '你知道的太多了') + '">' + text.replace(/\n/g, '<br>') + '</span>'
    );

    // ---- Hidden (折叠文本) ----
    data.content = data.content.replace(
        /\{\{Hidden\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<details class="hidden-block"><summary class="hidden-summary"><svg class="sym-icon hidden-arrow" aria-hidden="true"><use href="#chevron_right"/></svg><span>' + (desc || sc.hidden_default || '展开') + '</span></summary><div class="hidden-content">' + mdInline(text) + '</div></details>'
    );

    // ---- Tip / Info (提示框) ----
    data.content = data.content.replace(
        /\{\{(?:Tip|Info)\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition tip"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#info"/></svg><strong>' + (desc || sc.tip_default || '提示') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    // ---- Warn (警告框) ----
    data.content = data.content.replace(
        /\{\{Warn\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition warn"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#warning"/></svg><strong>' + (desc || sc.warn_default || '警告') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    // ---- Critical (严重警告/免责声明) ----
    data.content = data.content.replace(
        /\{\{Critical\|([\s\S]*?)\|([\s\S]+?)\}\}/g,
        (_, desc, text) =>
            '<div class="admonition critical"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#report"/></svg><strong>' + (desc || sc.critical_default || '严重警告') + '</strong></div><div class="admonition-body">' + mdInline(text) + '</div></div>'
    );

    return data;
});
