# MD-RetroGlass

A Hexo theme with Material Design 3 glassmorphism aesthetics.

**Demo:** [blog.x-leehe.ccwu.cc](https://blog.x-leehe.ccwu.cc)

## Features

- **Material Design 3** — Dynamic Color tokens extracted from background images
- **Glassmorphism** — `backdrop-filter: blur()` with semi-transparent surfaces
- **PJAX Navigation** — Seamless page switching without interrupting music playback
- **APlayer + MetingJS** — Embedded music player with Netease playlist support
- **Gitalk Comments** — GitHub Issues-based comment system
- **Win10 Start Menu Tiles** — Tag/category pages with tile grid layout
- **Code Blocks** — Language labels + copy-to-clipboard buttons
- **Dual Background** — Parallax effect + cross-fade rotation
- **Local SVG Icons** — Material Symbols sprite (~7KB, zero CDN dependencies)
- **Responsive** — Desktop sidebar layout, tablet/mobile adaptive

## Quick Start

```bash
cd your-hexo-site
git clone https://github.com/x-leehe/hexo-theme-md-retroglass themes/md-retroglass
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

### Optional: Enable Gitalk

```yaml
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

## Browser Support

All modern browsers that support `backdrop-filter` (Chrome 76+, Edge 79+, Safari 9+, Firefox 103+).

## License

MIT
