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
- **Code Blocks** — Language labels + copy-to-clipboard buttons with highlight.js
- **Dual Background** — Parallax effect + cross-fade rotation
- **Local SVG Icons** — Material Symbols sprite (~7KB, zero CDN dependencies for icons)
- **Responsive** — Desktop sidebar layout, full-width mobile adaptive

## Quick Start

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

### Comment System

Choose your comment backend via `comment_system`:

```yaml
# -------------------------------
# Comment System (choose one: gitalk | utterances)
# -------------------------------
comment_system: utterances
```

#### Option A: Utterances

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

#### Option B: Gitalk

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

### Optional: Enable Music Player

```yaml
music:
  enable: true
  id: 'your-netease-playlist-id'
```

### Optional: Multiple Backgrounds

```yaml
backgrounds:
  - /images/bg-01.jpg
  - /images/bg-02.jpg
  - /images/bg-03.jpg
```

## Navigation

Pages are navigated via [htmx](https://htmx.org) (`hx-boost` on `<body>`), which swaps only the `<main>` content area. Persistent elements (background, sidebar, APlayer) are never interrupted. All inline `<script>` tags in swapped content are automatically executed — no manual PJAX handling needed.

## Browser Support

All modern browsers that support `backdrop-filter` (Chrome 76+, Edge 79+, Safari 9+, Firefox 103+).

## License

MIT
