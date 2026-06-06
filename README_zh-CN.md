# MD-RetroGlass

[English](README.md) | Chinese

一款基于 Material Design 3 毛玻璃美学的 Hexo 主题。

**演示：** [blog.x-leehe.ccwu.cc](https://blog.x-leehe.ccwu.cc)

## 特性

- **Material Design 3** — 从背景图片动态提取配色方案的色彩令牌
- **Glassmorphism 毛玻璃** — `backdrop-filter: blur()` 半透明表面
- **htmx 无刷新导航** — 基于 [htmx](https://htmx.org) 的页面切换
- **APlayer + MetingJS** — 内嵌音乐播放器，支持网易云歌单
- **双评论系统** — 一行配置在 Gitalk 和 [utterances](https://utteranc.es) 之间切换
- **Win10 开始菜单磁贴** — 标签页/分类页采用磁贴网格布局
- **代码块增强** — 语言标签 + 一键复制按钮 + PrismJS 高亮
- **剧透文字** — `{{Spoiler|隐藏内容}}` 语法，点击揭示
- **双背景层** — 视差效果 + 交叉淡入淡出轮播
- **本地 SVG 图标** — Material Symbols 精灵图（约 7KB，图标零 CDN 依赖）
- **响应式布局** — 桌面端侧边栏 + 主体双栏，移动端全宽自适应

## 快速开始

### 前置依赖

在你的 Hexo 站点根目录安装以下插件：

```bash
# SCSS 渲染器（必需 — 主题样式使用 SCSS 编写）
npm install hexo-renderer-sass

# PrismJS 代码高亮（服务端预处理）
npm install hexo-prism-plugin
```

**注意：** 主题通过 `@font-face` 自托管 [HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans)（正文字体）和 [JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono)（代码字体）。请将字体文件放入 Hexo 站点的 `source/fonts/` 目录，或编辑 `source/css/_variables.scss` 使用你自己的字体。

### 安装主题

```bash
cd your-hexo-site
git clone https://github.com/x-leehe/Hexo-theme-MD_RetroGlass themes/md-retroglass
```

编辑 Hexo 根目录的 `_config.yml`：

```yaml
theme: md-retroglass
```

然后编辑 `themes/md-retroglass/_config.yml` 进行主题配置。

## 配置

### 必须：替换示例图片

替换 `source/images/` 中的以下文件：
- `avatar.jpg` — 头像
- `bg-default.png` — 背景图
- `favicon.png` — 网站图标

### 站点标识与导航

```yaml
# 站点标识
avatar: /images/avatar.jpg
favicon: /images/favicon.png

# 导航菜单
menu:
  首页: /
  归档: /archives
  标签: /tags
  分类: /categories
  关于: /about
  友链: /friends

# 社交链接（显示在侧边栏）
social:
  GitHub: https://github.com/yourname
  Telegram: https://t.me/yourname
  Email: mailto:yourname@example.com
  Steam: https://steamcommunity.com/id/yourname
```

### 毛玻璃外观

```yaml
glass:
  blur: 24px            # backdrop-filter 模糊量
  opacity: 0.7          # 表面不透明度
  border_radius: 28px   # 卡片圆角半径
  border_opacity: 0.15  # 表面边框可见度
```

### 字体排版

```yaml
font:
  body: "'HarmonyOS Sans', 'Noto Sans SC', sans-serif"
  code: "'JetBrains Mono', 'Fira Code', monospace"
  size: 16px
  line_height: 1.75
```

> 主题内置了 HarmonyOS Sans SC（6 种字重）和 JetBrainsMapleMono 的 `@font-face` 声明。将 `.ttf` 文件放入 Hexo 站点的 `source/fonts/` 目录。你也可以在 `_config.yml` 和 `source/css/_variables.scss` 中更换为任意字体栈。

### 代码高亮

```yaml
syntax_highlighter: prismjs
```

主题使用 [PrismJS](https://prismjs.com) 并通过 `hexo-prism-plugin` 进行服务端预处理。请确保已安装该插件（见前置依赖）。

### 评论系统

通过 `comment_system` 选择评论后端：

```yaml
# -------------------------------
# 评论系统（二选一：gitalk | utterances）
# -------------------------------
comment_system: utterances
```

#### 方案 A：Utterances（轻量、无需 OAuth，但难以自定义）

1. 在目标仓库安装 [utterances GitHub App](https://github.com/apps/utterances)
2. 配置：

```yaml
utterances:
  enable: true
  repo: 'your-username/your-repo'  # 格式：owner/repo
  issue_term: pathname             # pathname | url | title | og:title
  label: 'comment'                 # 可选 Issue 标签
  theme: github-dark               # github-light | github-dark | preferred-color-scheme | icy-dark | photon-dark
```

#### 方案 B：Gitalk（自定义程度高，需要配置OAuth，可能不安全）

1. 创建 [GitHub OAuth App](https://github.com/settings/developers)
2. 配置：

```yaml
comment_system: gitalk

gitalk:
  enable: true
  clientID: '你的-github-oauth-app-client-id'
  clientSecret: '你的-github-oauth-app-client-secret'
  repo: '评论仓库名'
  owner: '你的-github-用户名'
  admin:
    - '你的-github-用户名'
```

### 音乐播放器（APlayer + MetingJS）

```yaml
music:
  enable: true
  server: netease          # netease | tencent | kugou | xiami | baidu
  type: playlist           # playlist | song | album | artist
  id: '你的歌单ID'
  api: ''                  # 自定义 MetingJS API，留空使用默认
  list_folded: true        # 默认折叠播放列表
  autoplay: false
  order: list              # list | random
  preload: auto            # auto | metadata | none
```

> 使用 [APlayer](https://github.com/DIYgod/APlayer) + [@xizeyoupan/meting](https://github.com/xizeyoupan/meting)（MetingJS 的维护分支）。

### 多张背景图轮播

```yaml
backgrounds:
  - /images/bg-01.jpg
  - /images/bg-02.jpg
  - /images/bg-03.jpg
```

背景图每 15 秒自动交叉淡入淡出轮播。用户也可通过箭头按钮和圆点指示器手动切换。桌面端支持鼠标移动视差效果。

### 目录（TOC）

```yaml
toc:
  enable: true
  list_number: false
  max_depth: 4
```

### 文章显示

```yaml
post:
  date_format: YYYY-MM-DD
  reading_time: true       # 估算阅读时间（~500 字符/分钟）
```

### 页脚

```yaml
footer:
  since: 2025
  copyright: 你的名字
  powered_by: true         # 显示 "Powered by Hexo" 致谢
  icp: ''                  # ICP备案号，支持HTML
  custom_html: ''          # 页脚自定义HTML（如公安备案徽章）
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

> 需要在 Hexo 站点中安装 `hexo-generator-feed` 插件。

### 回到顶部按钮

```yaml
scroll_to_top: true
```

### 剧透文字

在 Markdown 文章中使用 `{{Spoiler|隐藏内容}}` 语法创建点击揭示的剧透文字。文本在被点击前会模糊处理。

例：`{{Spoiler|蛋糕是个谎言。}}` → <span style="filter:blur(4px);cursor:pointer">蛋糕是个谎言。</span>

无需额外插件 — 由主题内置的 `scripts/spoiler.js` 过滤器处理。

## 导航机制

页面通过 [htmx](https://htmx.org) 的 `hx-boost` 属性实现无刷新导航，仅替换 `<main>` 内容区域。背景、侧边栏、APlayer 等持久元素不受影响。替换内容中的 `<script>` 标签会被自动执行——无需手动处理 PJAX 兼容。

## 浏览器支持

所有支持 `backdrop-filter` 的现代浏览器（Chrome 76+、Edge 79+、Safari 9+、Firefox 103+）。

## 致谢

- **[HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans)** — 华为出品的优雅中文字体，用作默认正文字体。
- **[JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono)** — 融合 JetBrains Mono 与 Maple Mono 的优美等宽字体，用于代码块。
- **[萌娘百科](https://mzh.moegirl.org.cn/)**(或[moegirlICU](https://moegirl.icu/)) — `{{Spoiler|text}}` 语法灵感来源于萌娘百科的剧透标签约定。
- **[hexo-theme-whirlwind](https://github.com/SakuraKoi/Hexo-theme-Whirlwind)** — 部分架构模式（评论系统切换、侧边栏布局）借鉴自该主题。

## 许可证

MIT
