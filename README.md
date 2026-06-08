# MD-RetroGlass

English | [Chinese](README_zh-CN.md)

A Hexo theme with Material Design 3 glassmorphism aesthetics.

**Demo:** [blog.x-leehe.ccwu.cc](https://blog.x-leehe.ccwu.cc)

## Features

- **Material Design 3** — Dynamic Color tokens extracted from background images
- **Glassmorphism** — `backdrop-filter: blur()` with semi-transparent surfaces
- **Dark / Light / Auto / Time-based** — Four-state theme toggle (cycled via a single button, persisted in `localStorage`)
- **htmx v2 Navigation** — Seamless page switching via [htmx](https://htmx.org) (music never stops, sidebar untouched)
- **Dynamic JS Loading** — Non-blocking parallel `import()` calls (inspired by hexo-theme-whirlwind)
- **Page Loader** — Full-screen loading overlay with progress percentage, slow-loading prompt after 8s, skip button
- **APlayer + MetingJS** — Embedded music player with Netease playlist support
- **Markdown-it Renderer** — Extended Markdown syntax (footnotes, emoji, highlight, insert, sub/superscript, task lists, definition lists, abbreviations)
- **Dual Comment System** — Switch between Gitalk and [utterances](https://utteranc.es) via one config line
- **Win10 Start Menu Tiles** — Tag/category/friends pages with tile grid layout, color-hash accents, and client-side search filtering
- **Link Preview Cards** — Auto-fetch OG metadata for external links; Telegram-style preview cards with `{% preview %}` shortcode
- **Code Blocks** — Auto-detected language labels (30+ languages) + line numbers + copy-to-clipboard, protected from shortcode interference
- **Post Navigation** — Previous / Next post links at the bottom of each post
- **Shortcodes** — `{{Tip|desc|…}}` / `{% tip desc %}…{% endtip %}` admonitions, foldable blocks, spoiler, blur text, link preview cards (inline + Nunjucks dual syntax)
- **Per-post Controls** — Front-matter flags to hide date, title, categories, tags, TOC, reading time, word count, or entire post from listing
- **Dual Background** — Parallax effect + cross-fade rotation
- **Local SVG Icons** — Material Symbols sprite (~7KB, zero CDN dependencies for icons)
- **Focus Title** — Dynamic tab title that changes when the user switches away
- **Anti-FOUC & Font Fallback** — Inline `<head>` scripts prevent flash of unstyled content; fonts fall back to system stack after 1.5s if custom fonts haven't loaded
- **Responsive** — Desktop sidebar layout, tablet with compact sidebar, full-width mobile with hamburger menu

## (Not So) Quick Start

### Prerequisites

Install the following Hexo plugins in your Hexo site root:

```bash
# SCSS renderer (required — theme styles are written in SCSS)
npm install hexo-renderer-dartsass

# Markdown-it renderer (required — extended Markdown syntax support)
npm install hexo-renderer-markdown-it

# Font subsetting (required — auto-subsets fonts to only used characters)
npm install subset-font --save-dev
```

Then copy the font conversion script from the theme's `misc-scripts/` to your Hexo site's `scripts/` directory:

```bash
cp themes/md-retroglass/misc-scripts/font-convert.js scripts/
```

**Font workflow:** The theme ships TTF source fonts in `fonts-src/` (HarmonyOS Sans SC, JetBrainsMapleMono, AaCute). At build time, `font-convert.js` scans all HTML and Markdown for unique characters, subsets each font to only those glyphs via [subset-font](https://www.npmjs.com/package/subset-font) (harfbuzz WASM), and outputs compressed WOFF2 to `public/fonts/`. Run:

```bash
hexo generate && node scripts/font-convert.js
```

Or simply use the bundled npm script: `npm run build`.

To use different fonts, replace the TTF files in `fonts-src/`, update `FONT_MAP` in `scripts/font-convert.js`, and edit the `@font-face` declarations in `source/css/_variables.scss`.

### Install Theme

```bash
cd your-hexo-site
git clone https://github.com/x-leehe/Hexo-theme-MD_RetroGlass themes/md-retroglass
```

Edit `_config.yml` in your Hexo site root:

```yaml
theme: md-retroglass
```

Then configure the theme by editing `themes/md-retroglass/_config.yml`.

## Configuration

### Required: Replace Example Images

Replace these files in `source/images/`:
- `avatar.webp` — your avatar
- `bg-default.webp` — your background
- `favicon.png` — your favicon

### Site Identity & Navigation

```yaml
# Site Identity
avatar: /images/avatar.webp
favicon: /images/favicon.png

# Navigation Menu
menu:
  首页: /
  归档: /archives
  标签: /tags
  分类: /categories
  关于: /about
  友链: /friends

# Social Links (displayed in sidebar)
social:
  GitHub: https://github.com/yourname
  Telegram: https://t.me/yourname
  Email: mailto:yourname@example.com
  Steam: https://steamcommunity.com/id/yourname
```

### Glassmorphism Appearance

```yaml
glass:
  blur: 24px            # backdrop-filter blur amount
  opacity: 0.7          # surface opacity
  border_radius: 28px   # card corner radius
  border_opacity: 0.15  # surface border visibility
```

### Typography

```yaml
font:
  body: "'HarmonyOS Sans', 'Noto Sans SC', sans-serif"
  code: "'JetBrains Mono', 'Fira Code', monospace"
  size: 16px
  line_height: 1.75
```

> Font stack configuration is in `source/css/_variables.scss` — edit the `--font-body`, `--font-code`, and `--font-spoiler` CSS custom properties. The `@font-face` declarations point to `/fonts/` (served from `public/fonts/` after the subsetting build step).
>
> The font-related values in `_config.yml` are informational; to change fonts, edit `_variables.scss` and `fonts-src/` directly.
>
> If custom fonts fail to load within 1.5s, the theme automatically falls back to system fonts. Fonts continue loading in the background and swap in when ready.

### Theme Mode (Dark / Light / Auto / Time-based)

The theme includes a four-state theme toggle button in the header. Click to cycle: **dark → light → auto (follows system) → time-based (6:00–18:00 light) → dark …**

The current mode is persisted in `localStorage` under key `color-scheme`. An anti-FOUC inline script in `<head>` applies the correct theme before CSS paints. A `themechange` custom event is dispatched for other scripts to react.

### Syntax Highlighting

```yaml
syntax_highlighter: prismjs
```

The theme uses Hexo's built-in [PrismJS](https://prismjs.com) support with server-side preprocessing. Both dark (`prism-tomorrow`) and light (`prism`) themes are loaded and toggled automatically via the theme manager.

### Comment System

Choose your comment backend via `comment_system`:

```yaml
# -------------------------------
# Comment System (choose one: gitalk | utterances)
# -------------------------------
comment_system: utterances
```

#### Option A: Utterances (Lightweight, no OAuth, but less customizable)

1. Install the [utterances GitHub App](https://github.com/apps/utterances) on your target repo
2. Configure:

```yaml
utterances:
  enable: true
  repo: 'your-username/your-repo'  # format: owner/repo
  issue_term: pathname             # pathname | url | title | og:title
  label: 'comment'                 # optional issue label
  theme: github-dark               # github-light | github-dark | preferred-color-scheme | icy-dark | photon-dark
```

#### Option B: Gitalk (OAuth required, more customizable but potentially less secure)

1. Create a [GitHub OAuth App](https://github.com/settings/developers)
2. Configure:

```yaml
comment_system: gitalk

gitalk:
  enable: true
  clientID: 'your-github-oauth-app-client-id'
  clientSecret: 'your-github-oauth-app-client-secret'
  repo: 'your-comments-repo'
  owner: 'your-github-username'
  admin:
    - 'your-github-username'
```

### Music Player (APlayer + MetingJS)

```yaml
music:
  enable: true
  server: netease          # netease | tencent | kugou | xiami | baidu
  type: playlist           # playlist | song | album | artist
  id: 'your-playlist-id'
  api: ''                  # Custom MetingJS API, leave empty for default
  list_folded: true        # Collapse playlist by default
  autoplay: false
  order: list              # list | random
  preload: auto            # auto | metadata | none
```

> Uses [APlayer](https://github.com/DIYgod/APlayer) + MetingJS

### Multiple Backgrounds

```yaml
backgrounds:
  - /images/bg-01.webp
  - /images/bg-02.webp
  - /images/bg-03.webp
```

Backgrounds rotate automatically every 15 seconds with a cross-fade transition. Users can also manually switch via on-screen arrow buttons, dot indicators, or keyboard <kbd>←</kbd> / <kbd>→</kbd> arrow keys. A parallax effect tracks mouse movement on desktop.

### Link Preview Cards

```yaml
link_preview:
  enable: true                 # Master switch for link preview cards
  auto_fetch: true             # Auto-fetch og:description & og:image for external links
  timeout: 5000                # Request timeout in ms
```

When `auto_fetch` is enabled, any post with `show-preview: true` in its front-matter will have standalone external links replaced with Telegram-style preview cards showing the link's OG title, description, and image.

You can also manually create preview cards with the Nunjucks shortcode:

```
{% preview %}
title: Example Site
url: https://example.com
desc: A description of the site
icon: https://example.com/favicon.ico
{% endpreview %}
```

The `desc` and `icon` fields are optional — if omitted, they will be auto-fetched from the target URL's OG metadata.

### Per-post Front-matter Controls

Each post supports these optional front-matter flags to selectively hide elements:

| Flag | Effect |
|------|--------|
| `hide_date: true` | Hide publish date |
| `hide_updated: true` | Hide last-updated date |
| `hide_title: true` | Hide post title |
| `hide_categories: true` | Hide category links |
| `hide_tags: true` | Hide tag chips |
| `hide_toc: true` | Hide table of contents |
| `hide_reading_time: true` | Hide estimated reading time |
| `hide_word_count: true` | Hide word count |
| `hide_post: true` | Exclude post from homepage listing, archive, tags, and categories (the post page itself remains accessible via direct URL) |
| `toc: false` | Disable TOC for this specific post |
| `comments: false` | Disable comments for this post |
| `show-preview: true` | Enable auto-fetch link preview cards for this post |

### Table of Contents (TOC)

```yaml
toc:
  enable: true
  list_number: false
  max_depth: 4
```

The TOC is rendered as a collapsible panel with a smooth grid-based expand/collapse animation. On desktop (≥1025px) it auto-expands; on mobile it stays collapsed by default. Clicking a TOC link scrolls smoothly to the target heading with a brief highlight flash.

### Post Display

```yaml
post:
  date_format: YYYY-MM-DD
  reading_time: true       # Estimate reading time (~500 chars/min)
```

Each post shows the published date, last updated date (if different), estimated reading time, and word count. The Previous / Next post navigation appears at the bottom of every post.

### Footer

```yaml
footer:
  since: 2025
  copyright: Your Name
  powered_by: true         # Show "Powered by Hexo" credit
  icp: ''                  # ICP备案号, supports HTML
  custom_html: ''          # Custom footer HTML (e.g., 公安备案 badge)
```

### SEO

```yaml
seo:
  robots: noindex, nofollow
  google_site_verification: ''
  bing_site_verification: ''
```

### Scroll to Top

```yaml
scroll_to_top: true
```

### Markdown Extensions

The theme uses [markdown-it](https://github.com/markdown-it/markdown-it) (via `hexo-renderer-markdown-it`) with the following plugins enabled:

| Plugin | Syntax | Renders as |
|--------|--------|------------|
| `markdown-it-footnote` | `[^1]` | Footnotes with backlinks |
| `markdown-it-emoji` | `:rocket:` | 🚀 (shortcodes) |
| `markdown-it-mark` | `==text==` | `<mark>` highlighted |
| `markdown-it-ins` | `++text++` | `<ins>` inserted |
| `markdown-it-sub` | `~text~` | `<sub>` subscript |
| `markdown-it-sup` | `^text^` | `<sup>` superscript |
| `markdown-it-abbr` | `*[HTML]: …` | Abbreviation tooltips |
| `markdown-it-deflist` | `Term\n: Def` | Definition lists |
| `markdown-it-task-lists` | `- [ ]` | Task checkboxes |

Definition lists are visually wrapped in a bordered box to distinguish them from body text. Footnote anchors include `scroll-margin-top` offsets to avoid being hidden behind the fixed header.

## Shortcodes

All shortcodes support **two syntaxes**:

| Style | Syntax | Best for |
|-------|--------|----------|
| **Inline** | ` {{Function\|Description\|content}} ` | Single-line, quick usage |
| **Nunjucks** | ` {% function Description %}content{% endfunction %} ` | Multi-line, full Markdown in body |

Both are case-insensitive. The `Description` field is optional — leave it empty (inline: `||`, Nunjucks: omit) to use the default label.

> **Code block protection:** Shortcodes inside fenced code blocks (`` ``` ``) are **never** processed — they are protected by placeholder substitution before shortcode rendering. You can safely demonstrate shortcode syntax in code blocks.

#### Spoiler — Click-to-reveal text

```
{{Spoiler||The cake is a lie.}}

{% spoiler %}
The cake is a **lie**.
{% endspoiler %}
```

Text is blacked out until clicked or hovered. Ideal for hiding spoilers.

#### Hidden — Foldable block

```
{{Hidden|Click to expand|Some **Markdown** content here.}}

{% hidden Click to expand %}
Some **Markdown** content here.
{% endhidden %}
```

Renders as a `<details>` / `<summary>` collapsible section.

#### Tip / Info — Information box

```
{{Tip|Note|This is a helpful **tip** with formatting.}}

{% tip Note %}
This is a helpful **tip** with formatting.
{% endtip %}
```

Blue-themed admonition for hints, notes, and supplementary info. (`Info` / `info` works identically.)

#### Warn — Warning box

```
{{Warn||This action is **irreversible**.}}

{% warn %}
This action is **irreversible**.
{% endwarn %}
```

Yellow-themed admonition for cautionary notes.

#### Critical — Critical alert

```
{{Critical|Disclaimer|**Use at your own risk.**}}

{% critical Disclaimer %}
**Use at your own risk.**
{% endcritical %}
```

Red-themed admonition for severe warnings or disclaimers.

#### Blur — Blurred text (click to reveal)

```
{{Blur||Spoiler content here.}}

{% blur %}
Spoiler content here.
{% endblur %}
```

Text is rendered with a CSS `blur()` filter. Click or hover to un-blur and reveal the content.

#### Preview — Manual link preview card

```
{% preview %}
title: Example Site
url: https://example.com
desc: A description (optional)
icon: https://example.com/favicon.ico (optional)
{% endpreview %}
```

Renders a Telegram-style link preview card. If `desc` or `icon` are omitted, they are auto-fetched from the target URL's OG metadata at build time.

#### Shortcodes Configuration

Customize default labels in `_config.yml`:

```yaml
shortcodes:
  spoiler_default: 你知道的太多了
  hidden_default: 展开
  tip_default: 提示
  warn_default: 警告
  critical_default: 严重警告
```

No extra plugins needed — the `{{}}` syntax is handled by `before_post_render` filter, and the `{% %}` syntax is registered as native Hexo/Nunjucks tags in `scripts/shortcodes.js`.

### Code Block Headers

Each code block automatically displays a **language label** (auto-detected from 30+ languages including JavaScript, TypeScript, Python, Rust, Go, Docker, YAML, etc.) and a **copy-to-clipboard button**. Unknown languages are capitalized by name. Fully re-initialized on htmx page transitions.

## Navigation

Pages use [htmx](https://htmx.org) v2 `hx-boost` for seamless navigation. Only the `<main>` content area is swapped — the background, sidebar, and APlayer persist untouched. History is managed via `hx-history-elt` scoped to `.main-content` to avoid full-body replacement. JavaScript modules (`pjax.js`, `theme-manager.js`, `dynamic-color.js`, `focus-title.js`) are loaded asynchronously via dynamic `import()` from a single `main.js` entry point.

## Browser Support

All modern browsers that support `backdrop-filter` (Chrome 76+, Edge 79+, Safari 9+, Firefox 103+).

## Credits

- **[HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans)** — Elegant Chinese font by Huawei, used as the default body font.
- **[JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono)** — Beautiful monospace font merging JetBrains Mono and Maple Mono, used for code blocks.
- **[Moegirl Wiki](https://mzh.moegirl.org.cn/)** — The `{{Spoiler|text}}` syntax is inspired by Moegirl Wiki's spoiler tag convention.
- **[hexo-theme-whirlwind](https://github.com/SakuraKoi/Hexo-theme-Whirlwind)** — Some architectural patterns (comment system switching, sidebar layout, dynamic JS loading) are borrowed from this theme.
- **[GitHub Copilot](https://copilot.github.com/)** — AI assistance during code and documentation writing.

## License

MIT
