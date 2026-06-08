# MD-RetroGlass

[English](README.md) | Chinese

一款基于 Material Design 3 毛玻璃美学的 Hexo 主题。

**演示：** [blog.x-leehe.ccwu.cc](https://blog.x-leehe.ccwu.cc)

## 特性

- **Material Design 3** — 从背景图片动态提取配色方案的色彩令牌
- **Glassmorphism 毛玻璃** — `backdrop-filter: blur()` 半透明表面
- **Dark / Light / Auto / Time-based 四态切换** — 单击按钮循环切换（状态持久化至 `localStorage`）
- **htmx v2 无刷新导航** — 基于 [htmx](https://htmx.org) 的页面切换（音乐不中断，侧边栏不受影响）
- **动态 JS 加载** — 使用 `import()` 非阻塞并行加载（借鉴 hexo-theme-whirlwind）
- **APlayer + MetingJS** — 内嵌音乐播放器，支持网易云歌单
- **Markdown-it 渲染器** — 扩展 Markdown 语法（脚注、emoji、高亮、插入、上下标、任务列表、定义列表、缩写）
- **双评论系统** — 一行配置在 Gitalk 和 [utterances](https://utteranc.es) 之间切换
- **Win10 开始菜单磁贴** — 标签页/分类页采用磁贴网格布局
- **代码块增强** — 自动识别语言标签（30+ 语言） + 一键复制，已做短代码干扰保护
- **文章导航** — 每篇文章底部显示上一篇 / 下一篇导航链接
- **短代码** — `{{Tip|desc|…}}` / `{% tip desc %}…{% endtip %}` 警示框、折叠块、剧透文字（行内 + Nunjucks 双语法）
- **双背景层** — 视差效果 + 交叉淡入淡出轮播
- **本地 SVG 图标** — Material Symbols 精灵图（约 7KB，图标零 CDN 依赖）
- **焦点标题** — 用户切走标签页时动态改变标题
- **响应式布局** — 桌面端侧边栏 + 主体双栏，移动端全宽自适应

## 快速开始

### 前置依赖

在你的 Hexo 站点根目录安装以下插件：

```bash
# SCSS 渲染器（必需 — 主题样式使用 SCSS 编写）
npm install hexo-renderer-dartsass

# Markdown-it 渲染器（必需 — 扩展 Markdown 语法支持）
npm install hexo-renderer-markdown-it
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

### 主题模式（暗色 / 亮色 / 跟随系统 / 跟随时间）

主题在顶栏内置了四态主题切换按钮。点击循环：**暗色 → 亮色 → 自动（跟随系统）→ 定时（6:00–18:00 亮色）→ 暗色 …**

当前模式持久化在 `localStorage` 的 `color-scheme` 键中。`<head>` 中的内联脚本会先于 CSS 执行以防止 FOUC。同时触发 `themechange` 自定义事件供其他脚本响应。

### 代码高亮

```yaml
syntax_highlighter: prismjs
```

主题使用 Hexo 内置的 [PrismJS](https://prismjs.com) 支持，服务端预处理。暗色（`prism-tomorrow`）与亮色（`prism`）两套主题自动跟随主题管理器切换。

### Comment System / 评论系统

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

> 使用 [APlayer](https://github.com/DIYgod/APlayer) + MetingJS

### 多张背景图轮播

```yaml
backgrounds:
  - /images/bg-01.jpg
  - /images/bg-02.jpg
  - /images/bg-03.jpg
```

背景图每 15 秒自动交叉淡入淡出轮播。用户也可通过屏幕箭头按钮、圆点指示器或键盘 <kbd>←</kbd> / <kbd>→</kbd> 方向键手动切换。桌面端支持鼠标移动视差效果。

### 目录（TOC）

```yaml
toc:
  enable: true
  list_number: false
  max_depth: 4
```

目录渲染为可折叠面板，具有基于 CSS Grid 的平滑展开/收起动画。桌面端（≥1025px）默认展开，移动端默认折叠。点击目录链接可平滑滚动到目标标题并带有短暂高亮闪烁效果。

### 文章显示

```yaml
post:
  date_format: YYYY-MM-DD
  reading_time: true       # 估算阅读时间（~500 字符/分钟）
```

每篇文章显示发布日期、最后更新日期（如有修改）、估算阅读时间和字数统计。文章底部自动显示上一篇 / 下一篇导航链接。

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

### 回到顶部按钮

```yaml
scroll_to_top: true
```

### Markdown 扩展语法

主题使用 [markdown-it](https://github.com/markdown-it/markdown-it)（通过 `hexo-renderer-markdown-it`），启用了以下插件：

| 插件 | 语法 | 渲染效果 |
|------|------|----------|
| `markdown-it-footnote` | `[^1]` | 脚注（带双向跳转） |
| `markdown-it-emoji` | `:rocket:` | 🚀（快捷方式） |
| `markdown-it-mark` | `==文字==` | `<mark>` 高亮 |
| `markdown-it-ins` | `++文字++` | `<ins>` 插入线 |
| `markdown-it-sub` | `~文字~` | `<sub>` 下标 |
| `markdown-it-sup` | `^文字^` | `<sup>` 上标 |
| `markdown-it-abbr` | `*[HTML]: …` | 缩写提示 |
| `markdown-it-deflist` | `术语\n: 定义` | 定义列表 |
| `markdown-it-task-lists` | `- [ ]` | 任务复选框 |

定义列表会附加带边框的框体以便与正文区分。脚注锚点带有 `scroll-margin-top` 偏移量，避免被固定顶栏遮挡。

## 短代码

所有短代码支持**两种语法**：

| 风格 | 语法 | 适用场景 |
|------|------|----------|
| **行内** | `{{Function|描述|内容}}` | 单行、快速使用 |
| **Nunjucks** | `{% function 描述 %}内容{% endfunction %}` | 多行、正文使用完整 Markdown |

两者均不区分大小写。`描述` 字段可选 — 留空（行内：`||`，Nunjucks：省略）则使用默认标签。

> **代码块保护：** 围栏代码块（`` ``` ``）内的短代码**永远不会**被处理——渲染前通过占位符替换进行保护。你可以放心在代码块中演示短代码语法。

#### Spoiler — 点击揭示（黑幕/剧透）

```
{{Spoiler||蛋糕是个谎言。}}

{% spoiler %}
蛋糕是个**谎言**。
{% endspoiler %}
```

文字在被点击或悬停前为纯黑遮盖。适合隐藏剧透内容。

#### Hidden — 折叠块

```
{{Hidden|点击展开|一些 **Markdown** 内容。}}

{% hidden 点击展开 %}
一些 **Markdown** 内容。
{% endhidden %}
```

渲染为 `<details>` / `<summary>` 可折叠区域。

#### Tip / Info — 提示框

```
{{Tip|注意|这是一条有用的**提示**，支持格式。}}

{% tip 注意 %}
这是一条有用的**提示**，支持格式。
{% endtip %}
```

蓝色主题的提示框，用于补充说明和备注。（`Info` / `info` 等效。）

#### Warn — 警告框

```
{{Warn||此操作**不可逆**。}}

{% warn %}
此操作**不可逆**。
{% endwarn %}
```

黄色主题的警示框，用于提醒注意事项。

#### Critical — 严重警告

```
{{Critical|免责声明|**使用前请自行评估风险。**}}

{% critical 免责声明 %}
**使用前请自行评估风险。**
{% endcritical %}
```

红色主题的严重警示框，用于免责声明等重要警告。

#### 短代码配置

在 `_config.yml` 中自定义默认标签：

```yaml
shortcodes:
  spoiler_default: 你知道的太多了
  hidden_default: 展开
  tip_default: 提示
  warn_default: 警告
  critical_default: 严重警告
```

无需额外插件 — `{{}}` 语法由 `before_post_render` 过滤器处理，`{% %}` 语法在 `scripts/shortcodes.js` 中注册为原生 Hexo/Nunjucks 标签。

### 代码块头部

每个代码块自动显示**语言标签**（自动识别 30+ 种语言，包括 JavaScript、TypeScript、Python、Rust、Go、Docker、YAML 等）和**一键复制按钮**。未知语言则首字母大写显示。htmx 页面切换后自动重新初始化。

## 导航机制

页面使用 [htmx](https://htmx.org) v2 的 `hx-boost` 实现无刷新导航。仅替换 `<main>` 内容区域——背景、侧边栏、APlayer 等持久元素不受影响。历史记录通过 `hx-history-elt` 限定在 `.main-content` 范围内，避免整页替换。JavaScript 模块（`pjax.js`、`theme-manager.js`、`dynamic-color.js`、`focus-title.js`）从单一入口 `main.js` 通过动态 `import()` 异步加载。

## 浏览器支持

所有支持 `backdrop-filter` 的现代浏览器（Chrome 76+、Edge 79+、Safari 9+、Firefox 103+）。

## 致谢

- **[HarmonyOS Sans SC](https://github.com/huawei-fonts/HarmonyOS-Sans)** — 华为出品的优雅中文字体，用作默认正文字体。
- **[JetBrainsMapleMono](https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono)** — 融合 JetBrains Mono 与 Maple Mono 的优美等宽字体，用于代码块。
- **[萌娘百科](https://mzh.moegirl.org.cn/)** — `{{Spoiler|text}}` 语法灵感来源于萌娘百科的剧透标签约定。
- **[hexo-theme-whirlwind](https://github.com/SakuraKoi/Hexo-theme-Whirlwind)** — 部分架构模式（评论系统切换、侧边栏布局、动态 JS 加载）借鉴自该主题。
- **[GitHub Copilot](https://copilot.github.com/)** — 代码片段和文档撰写过程中得到的 AI 辅助。

## 许可证

MIT
