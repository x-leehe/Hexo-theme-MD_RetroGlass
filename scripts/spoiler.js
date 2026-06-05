/**
 * MD-RetroGlass — Spoiler filter
 * Converts {{Spoiler|Spoiler Text}} to spoiler <span>
 * Runs before Nunjucks rendering to avoid template conflicts.
 */
hexo.extend.filter.register('before_post_render', function (data) {
  // Only process Markdown posts/pages
  if (!data.content) return data;

  data.content = data.content.replace(
    /\{\{Spoiler\|(.+?)\}\}/g,
    '<span class="spoiler" title="你知道的太多了">$1</span>'
  );

  return data;
});
