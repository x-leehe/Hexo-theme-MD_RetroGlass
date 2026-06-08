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
- **APlayer + MetingJS** — Embedded music player with Netease playlist support
- **Markdown-it Renderer** — Extended Markdown syntax (footnotes, emoji, highlight, insert, sub/superscript, task lists, definition lists, abbreviations)
- **Dual Comment System** — Switch between Gitalk and [utterances](https://utteranc.es) via one config line
- **Win10 Start Menu Tiles** — Tag/category pages with tile grid layout
- **Code Blocks** — Auto-detected language labels (30+ languages) + copy-to-clipboard, protected from shortcode interference
- **Post Navigation** — Previous / Next post links at the bottom of each post
- **Shortcodes** — `{{Tip|desc|…}}` / `{% tip desc %}…{% endtip %}` admonitions, foldable blocks, spoiler text (inline + Nunjucks dual syntax)
- **Dual Background** — Parallax effect + cross-fade rotation
- **Local SVG Icons** — Material Symbols sprite (~7KB, zero CDN dependencies for icons)
- **Focus Title** — Dynamic tab title that changes when the user switches away
- **Responsive** — Desktop sidebar layout, full-width mobile adaptive

## Quick Start

### Prerequisites

Install the following Hexo plugins in your Hexo site root:

```bash
# SCSS renderer (required — theme styles are written in SCSS)
npm install hexo-renderer-dartsass

# Markdown-it renderer (required — extended Markdown syntax support)
npm install hexo-renderer-markdown-it
```

**Note:** The theme self-hosts [HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans) (body, 3 weights) and [JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono) (code) fonts via `@font-face`, in subsetted WOFF2 format. Place the `.woff2` files in your Hexo site's `source/fonts/` directory, or edit `source/css/_variables.scss` to use your own fonts.

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

> The theme bundles `@font-face` declarations for HarmonyOS Sans SC (3 weights, subsetted) and JetBrainsMapleMono, using WOFF2 format. Place the `.woff2` files under `source/fonts/` in your Hexo site. You can change these to any font stack in `_config.yml` and `source/css/_variables.scss`.
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
