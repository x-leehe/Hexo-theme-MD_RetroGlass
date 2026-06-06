# MD-RetroGlass

English | [Chinese](README_zh-CN.md)

A Hexo theme with Material Design 3 glassmorphism aesthetics.

**Demo:** [blog.x-leehe.ccwu.cc](https://blog.x-leehe.ccwu.cc)

## Features

- **Material Design 3** — Dynamic Color tokens extracted from background images
- **Glassmorphism** — `backdrop-filter: blur()` with semi-transparent surfaces
- **htmx Navigation** — Seamless page switching via [htmx](https://htmx.org) (music never stops)
- **APlayer + MetingJS** — Embedded music player with Netease playlist support
- **Dual Comment System** — Switch between Gitalk and [utterances](https://utteranc.es) via one config line
- **Win10 Start Menu Tiles** — Tag/category pages with tile grid layout
- **Code Blocks** — Language labels + copy-to-clipboard buttons with PrismJS
- **Shortcodes** — `{{Tip|…}}` `{{Warn|…}}` `{{Critical|…}}` admonitions, `{{Hidden|…}}` foldable blocks, `{{Spoiler|…}}` click-to-reveal text
- **Dual Background** — Parallax effect + cross-fade rotation
- **Local SVG Icons** — Material Symbols sprite (~7KB, zero CDN dependencies for icons)
- **Responsive** — Desktop sidebar layout, full-width mobile adaptive

## Quick Start

### Prerequisites

Install the following Hexo plugins in your Hexo site root:

```bash
# SCSS renderer (required — theme styles are written in SCSS)
npm install hexo-renderer-sass

# PrismJS code highlighting (server-side preprocess)
npm install hexo-prism-plugin
```

**Note:** The theme self-hosts [HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans) (body) and [JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono) (code) fonts via `@font-face`. Place the font files in your Hexo site's `source/fonts/` directory, or edit `source/css/_variables.scss` to use your own fonts.

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
- `avatar.jpg` — your avatar
- `bg-default.png` — your background
- `favicon.png` — your favicon

### Site Identity & Navigation

```yaml
# Site Identity
avatar: /images/avatar.jpg
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

> The theme bundles `@font-face` declarations for HarmonyOS Sans SC (6 weights) and JetBrainsMapleMono. Place the `.ttf` files under `source/fonts/` in your Hexo site. You can change these to any font stack in `_config.yml` and `source/css/_variables.scss`.

### Syntax Highlighting

```yaml
syntax_highlighter: prismjs
```

The theme uses [PrismJS](https://prismjs.com) with server-side preprocessing via `hexo-prism-plugin`. Ensure the plugin is installed (see Prerequisites).

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

> Uses [APlayer](https://github.com/DIYgod/APlayer) + @xizeyoupan/meting.

### Multiple Backgrounds

```yaml
backgrounds:
  - /images/bg-01.jpg
  - /images/bg-02.jpg
  - /images/bg-03.jpg
```

Backgrounds rotate automatically every 15 seconds with a cross-fade transition. Users can also manually switch via arrow buttons and dot indicators. A parallax effect tracks mouse movement on desktop.

### Table of Contents (TOC)

```yaml
toc:
  enable: true
  list_number: false
  max_depth: 4
```

### Post Display

```yaml
post:
  date_format: YYYY-MM-DD
  reading_time: true       # Estimate reading time (~500 chars/min)
```

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

### RSS

```yaml
rss:
  enable: true
```

> Requires `hexo-generator-feed` plugin installed in your Hexo site.

### Scroll to Top

```yaml
scroll_to_top: true
```

### Shortcodes

All shortcodes use the syntax `{{Function|Description|content}}`. The `Description` field is optional — leave it empty to use the default label. All support **multi-line content** with full Markdown formatting.

#### Spoiler — Click-to-reveal text

```
{{Spoiler||The cake is a lie.}}
```

Text is blacked out until clicked or hovered. Ideal for hiding spoilers.

#### Hidden — Foldable block

```
{{Hidden|Click to expand|Some **Markdown** content here.}}
```

Renders as a `<details>` / `<summary>` collapsible section.

#### Tip / Info — Information box

```
{{Tip|Note|This is a helpful **tip** with formatting.}}
```

Blue-themed admonition for hints, notes, and supplementary info.

#### Warn — Warning box

```
{{Warn||This action is **irreversible**.}}
```

Yellow-themed admonition for cautionary notes.

#### Critical — Critical alert

```
{{Critical|Disclaimer|**Use at your own risk.**}}
```

Red-themed admonition for severe warnings or disclaimers.

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

No extra plugins needed — handled by the theme's built-in `scripts/shortcodes.js` filter.

## Navigation

Pages are navigated via [htmx](https://htmx.org) (`hx-boost` on `<body>`), which swaps only the `<main>` content area. Persistent elements (background, sidebar, APlayer) are never interrupted. All inline `<script>` tags in swapped content are automatically executed — no manual PJAX handling needed.

## Browser Support

All modern browsers that support `backdrop-filter` (Chrome 76+, Edge 79+, Safari 9+, Firefox 103+).

## Acknowledgments

- **[HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans)** — Elegant Chinese typeface by Huawei, used as the default body font.
- **[JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono)** — A beautiful monospace font blending JetBrains Mono with Maple Mono, used for code blocks.
- **[Moegirl Wiki](https://mzh.moegirl.org.cn/)**(or [moegirlICU](https://moegirl.icu/))** — The `{{Spoiler|text}}` syntax was inspired by Moegirl Wiki's spoiler tag convention.
- **[hexo-theme-whirlwind](https://github.com/SakuraKoi/Hexo-theme-Whirlwind)** — Partial architectural patterns (comment system switching, sidebar layout) were adapted from this theme.

## License

MIT
