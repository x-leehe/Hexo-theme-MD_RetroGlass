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
 *
 * Also normalizes non-standard syntax:
 *   {%Spoiler%} → {% spoiler %}
 *   {%endspoiler%} → {% endspoiler %}
 */
(function () {
    var sc = (hexo.theme.config && hexo.theme.config.shortcodes) || {};

    function md(text) {
        return hexo.render.renderSync({ text: text, engine: 'markdown' }) || '';
    }

    // Normalize Nunjucks tag syntax (case-insensitive, adds spaces):
    // {%Spoiler%} → {% spoiler %}, {%endspoiler%} → {% endspoiler %}
    hexo.extend.filter.register('before_post_render', function (data) {
        if (!data.content) return data;
        data.content = data.content.replace(
            /\{%\s*(\/?)(spoiler|hidden|tip|info|warn|critical)\s*%\}/ig,
            function (_, slash, tag) {
                return '{% ' + slash + tag.toLowerCase() + ' %}';
            }
        );
        return data;
    });

    // ---- Spoiler ----
    ['spoiler', 'Spoiler'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            var desc = args.join(' ') || sc.spoiler_default || '你知道的太多了';
            return '<span class="spoiler" title="' + desc + '">' + md(content).replace(/<\/?p>/g, '') + '</span>';
        }, { ends: true });
    });

    // ---- Hidden ----
    ['hidden', 'Hidden'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            var desc = args.join(' ') || sc.hidden_default || '展开';
            return '<details class="hidden-block"><summary class="hidden-summary"><svg class="sym-icon hidden-arrow" aria-hidden="true"><use href="#chevron_right"/></svg><span>' + desc + '</span></summary><div class="hidden-content">' + md(content) + '</div></details>';
        }, { ends: true });
    });

    // ---- Tip / Info ----
    ['tip', 'Tip', 'info', 'Info'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            var desc = args.join(' ') || sc.tip_default || '提示';
            return '<div class="admonition tip"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#info"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });

    // ---- Warn ----
    ['warn', 'Warn'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            var desc = args.join(' ') || sc.warn_default || '警告';
            return '<div class="admonition warn"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#warning"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });

    // ---- Critical ----
    ['critical', 'Critical'].forEach(function (name) {
        hexo.extend.tag.register(name, function (args, content) {
            var desc = args.join(' ') || sc.critical_default || '严重警告';
            return '<div class="admonition critical"><div class="admonition-head"><svg class="sym-icon admonition-icon" aria-hidden="true"><use href="#report"/></svg><strong>' + desc + '</strong></div><div class="admonition-body">' + md(content) + '</div></div>';
        }, { ends: true });
    });
})();
