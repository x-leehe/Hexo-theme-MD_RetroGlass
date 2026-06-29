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
- **页面加载器** — 全屏加载覆盖层，显示进度百分比，8 秒后显示慢速加载提示及跳过按钮
- **APlayer + MetingJS** — 内嵌音乐播放器，支持网易云歌单
- **Markdown-it 渲染器** — 扩展 Markdown 语法（脚注、emoji、高亮、插入、上下标、任务列表、定义列表、缩写）
- **双评论系统** — 一行配置在 Gitalk 和 [utterances](https://utteranc.es) 之间切换
- **Win10 开始菜单磁贴** — 标签页/分类页/友链页采用磁贴网格布局，色相哈希着色，支持客户端搜索过滤
- **链接预览卡片** — 自动抓取外部链接的 OG 元数据；支持 `{% preview %}` 短代码手动创建 Telegram 风格预览卡片
- **代码块增强** — 自动识别语言标签（30+ 语言） + 行号 + 一键复制，已做短代码干扰保护
- **文章导航** — 每篇文章底部显示上一篇 / 下一篇导航链接
- **短代码** — `{{Tip|desc|…}}` / `{% tip desc %}…{% endtip %}` 警示框、折叠块、剧透文字、模糊文字、链接预览卡片（行内 + Nunjucks 双语法）
- **文章级控制** — 通过 Front-matter 标志隐藏日期、标题、分类、标签、目录、阅读时间、字数统计，或将文章从列表页隐藏
- **双背景层** — 视差效果 + 交叉淡入淡出轮播
- **本地 SVG 图标** — Material Symbols 精灵图（约 7KB，图标零 CDN 依赖）
- **焦点标题** — 用户切走标签页时动态改变标题
- **防 FOUC 与字体回退** — `<head>` 内联脚本防止无样式内容闪烁；自定义字体 1.5 秒未加载自动回退至系统字体
- **响应式布局** — 桌面端侧边栏 + 主体双栏，平板端紧凑侧边栏，移动端全宽自适应含汉堡菜单

## (并非快速的) 快速开始

### 前置依赖

在你的 Hexo 站点根目录安装以下插件：

```bash
# SCSS 渲染器（必需 — 主题样式使用 SCSS 编写）
npm install hexo-renderer-dartsass

# Markdown-it 渲染器（必需 — 扩展 Markdown 语法支持）
npm install hexo-renderer-markdown-it

# 字体子集化（必需 — 自动将字体精简至仅包含用到的字符）
npm install subset-font --save-dev
```

然后将主题 `misc-scripts/` 中的字体转换脚本复制到 Hexo 站点的 `scripts/` 目录：

```bash
cp themes/md-retroglass/misc-scripts/font-convert.js scripts/
```

**字体工作流：** 主题在 `fonts-src/` 中提供 TTF 源字体文件（HarmonyOS Sans SC、JetBrainsMapleMono、AaCute）。将主题 `misc-scripts/` 中的字体转换脚本复制到 Hexo 站点的 `scripts/` 目录——Hexo 在启动时会自动加载它，并在每次 `hexo generate` 完成后通过 `generateAfter` hook 自动运行字体子集化，无需手动执行额外步骤：

```bash
cp themes/md-retroglass/misc-scripts/font-convert.js scripts/
```

构建时，`font-convert.js` 扫描所有 HTML 和 Markdown 文件收集唯一字符，通过 [subset-font](https://www.npmjs.com/package/subset-font)（基于 harfbuzz WASM）将每种字体子集化为仅包含这些字形，并输出压缩 WOFF2 至 `public/fonts/`。只需运行：

```bash
hexo generate
```

或使用 npm 脚本：`npm run build`。如需手动独立重新运行字体子集化，请使用 `npm run subset-fonts`。

如需更换字体，替换 `fonts-src/` 中的 TTF 文件，更新 `scripts/font-convert.js` 中的 `FONT_MAP`，并编辑 `source/css/_variables.scss` 中的 `@font-face` 声明。

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
- `avatar.webp` — 头像
- `bg-default.webp` — 背景图
- `favicon.png` — 网站图标

### 站点标识与导航

```yaml
# 站点标识
avatar: /images/avatar.webp
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

> 字体栈配置在 `source/css/_variables.scss` 中 — 编辑 `--font-body`、`--font-code` 和 `--font-spoiler` CSS 自定义属性。`@font-face` 声明指向 `/fonts/`（由子集化构建步骤输出至 `public/fonts/` 后提供服务）。
>
> `_config.yml` 中的字体相关值为信息参考；如需更换字体，请直接编辑 `_variables.scss` 和 `fonts-src/`。
>
> 若字体在 1.5 秒内未加载完成，会自动回退至系统字体；字体在后台继续加载，就绪后自动切换。

### 主题模式（暗色 / 亮色 / 跟随系统 / 跟随时间）

主题在顶栏内置了四态主题切换按钮。点击循环：**暗色 → 亮色 → 自动（跟随系统）→ 定时（6:00–18:00 亮色）→ 暗色 …**

当前模式持久化在 `localStorage` 的 `color-scheme` 键中。`<head>` 中的内联脚本会先于 CSS 执行以防止 FOUC。同时触发 `themechange` 自定义事件供其他脚本响应。

### 代码高亮

```yaml
syntax_highlighter: prismjs
```

主题使用 Hexo 内置的 [PrismJS](https://prismjs.com) 支持，服务端预处理。暗色（`prism-tomorrow`）与亮色（`prism`）两套主题自动跟随主题管理器切换。

### Comment System / 评论系统

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
  - /images/bg-01.webp
  - /images/bg-02.webp
  - /images/bg-03.webp
```

背景图每 15 秒自动交叉淡入淡出轮播。用户也可通过屏幕箭头按钮、圆点指示器或键盘 <kbd>←</kbd> / <kbd>→</kbd> 方向键手动切换。桌面端支持鼠标移动视差效果。

### 链接预览卡片

```yaml
link_preview:
  enable: true                 # 链接预览卡片总开关
  auto_fetch: true             # 自动抓取外部链接的 og:description 和 og:image
  timeout: 5000                # 请求超时时间（毫秒）
```

当 `auto_fetch` 启用时，任何在 Front-matter 中设置了 `show-preview: true` 的文章，其中的独立外部链接将被替换为 Telegram 风格的预览卡片，显示链接的 OG 标题、描述和图片。

你也可以使用 Nunjucks 短代码手动创建预览卡片：

```
{% preview %}
title: 示例站点
url: https://example.com
desc: 站点描述
icon: https://example.com/favicon.ico
{% endpreview %}
```

`desc` 和 `icon` 字段为可选项 — 若留空，将从目标 URL 的 OG 元数据自动抓取。

### 文章级 Front-matter 控制

每篇文章支持以下可选的 Front-matter 标志来选择性隐藏元素：

| 标志 | 效果 |
|------|------|
| `hide_date: true` | 隐藏发布日期 |
| `hide_updated: true` | 隐藏最后更新日期 |
| `hide_title: true` | 隐藏文章标题 |
| `hide_categories: true` | 隐藏分类链接 |
| `hide_tags: true` | 隐藏标签徽章 |
| `hide_toc: true` | 隐藏目录 |
| `hide_reading_time: true` | 隐藏估算阅读时间 |
| `hide_word_count: true` | 隐藏字数统计 |
| `hide_post: true` | 从首页列表、归档、标签、分类中隐藏文章（文章页面本身仍可通过直接 URL 访问） |
| `toc: false` | 针对该文章禁用目录 |
| `comments: false` | 针对该文章禁用评论 |
| `show-preview: true` | 为该文章启用自动抓取链接预览卡片 |

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

> ⚠️ **重要：** 默认配置为 `noindex, nofollow`，禁止搜索引擎收录。如要公开你的博客，请务必修改 `_config.yml` 中的 `seo.robots` 为 `index, follow`。

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

短代码支持**两种语法**。推荐优先使用 Nunjucks 风格（`{% %}`）——支持多行内容、完整 Markdown，且不会与模板引擎分隔符混淆：

| 风格 | 语法 | 推荐场景 |
|------|------|----------|
| **Nunjucks** | `{% function 描述 %}内容{% endfunction %}` | 所有短代码——**默认使用此语法** |
| **行内** | ` {{Function\|描述\|内容}} ` | 仅限快速单行 Spoiler / Blur |

两者均不区分大小写。`描述` 字段可选——留空（行内：`||`，Nunjucks：省略）则使用默认标签。

> ⚠️ 行内 `{{}}` 语法在 Hidden、Tip、Warn、Critical 等块级短代码中也可使用，但**不推荐**：行内 Markdown 渲染可能产生非预期结果，且与模板引擎标记混用时容易造成歧义。建议块级内容统一使用 `{% %}`。

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
{% hidden 点击展开 %}
一些 **Markdown** 内容。
{% endhidden %}
```

渲染为 `<details>` / `<summary>` 可折叠区域。

#### Tip / Info — 提示框

```
{% tip 注意 %}
这是一条有用的**提示**，支持格式。
{% endtip %}
```

蓝色主题的提示框，用于补充说明和备注。（`Info` / `info` 等效。）

#### Warn — 警告框

```
{% warn %}
此操作**不可逆**。
{% endwarn %}
```

黄色主题的警示框，用于提醒注意事项。

#### Critical — 严重警告

```
{% critical 免责声明 %}
**使用前请自行评估风险。**
{% endcritical %}
```

红色主题的严重警示框，用于免责声明等重要警告。

#### Blur — 模糊文字（点击揭示）

```
{{Blur||此处为剧透内容。}}

{% blur %}
此处为剧透内容。
{% endblur %}
```

文字以 CSS `blur()` 滤镜模糊显示。点击或悬停可消除模糊，揭示内容。

#### Preview — 手动链接预览卡片

```
{% preview %}
title: 示例站点
url: https://example.com
desc: 站点描述（可选）
icon: https://example.com/favicon.ico（可选）
{% endpreview %}
```

渲染为 Telegram 风格的链接预览卡片。若省略 `desc` 或 `icon`，将在构建时从目标 URL 的 OG 元数据自动抓取。

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

无需额外插件 — `{{}}` 语法由 `before_post_render` 过滤器处理，`{% %}` 语法在 `scripts/shortcodes-custom.js` 和 `scripts/shortcodes-nunjucks.js` 中注册为原生 Hexo/Nunjucks 标签。

### 代码块头部

每个代码块自动显示**语言标签**（自动识别 30+ 种语言，包括 JavaScript、TypeScript、Python、Rust、Go、Docker、YAML 等）和**一键复制按钮**。未知语言则首字母大写显示。htmx 页面切换后自动重新初始化。

## 用户组加密

MD-RetroGlass 内置基于 [hexo-blog-encrypt](https://github.com/D0n9X1n/hexo-blog-encrypt) v4.0.2 的零信任多用户组加密系统（PBKDF2-SHA256 + AES-256-GCM）。可以为文章定义多个**访问等级**（如访客/好友/VIP/管理员），每等级独立密码，对文章或段落进行加密。

### 架构

```
文章 Front-matter           _config.yml                  .encrypt-secret.yml
(encrypt.min_level: 2)  →   encrypt.groups.levels      → levels: { N: password }
                             （仅名称+标签，              （仅密码，
                              可安全提交至 Git）           必须自行 gitignore）
                                     │
                                     ▼
                              构建时深度合并
                              PBKDF2 + AES-256-GCM
                              逐等级加密 + 往返验证
                                     │
                                     ▼
                              部署产物
                              （仅 salt + nonce + 密文）
```

### 配置

在你的 Hexo 站点 `_config.yml` 中（或主题 `_config.yml` 中）：

```yaml
encrypt:
  enable: true
  secret_file: .encrypt-secret.yml    # 外置密码文件
  tips:
    password_incorrect: "密码错误！请你重新输入。"
    page_corrupt: "这不是你的问题——数据可能被破坏了！快告诉主人有坏人在撬锁！"
  groups:
    levels:
      0:
        name: guest
        label: 访客
        # 无需密码 — 公开访问
      1:
        name: friend
        label: 好友
      2:
        name: vip
        label: VIP
      3:
        name: admin
        label: 管理员
```

创建 `.encrypt-secret.yml`（从主题提供的模板复制）：

```yaml
levels:
  1:
    password: "你的好友密码"
  2:
    password: "你的VIP密码"
  3:
    password: "你的管理员密码"
```

> ⚠️ **重要：** 在你的 Hexo 站点中，**必须**将 `.encrypt-secret.yml` 加入 `.gitignore`！主题仓库中包含此文件仅作为**模板**（密码为占位符 `CHANGE_ME`），以便你了解格式——在你的站点中，它包含真实密码，绝对不可提交至 Git。

### Front-matter 用法

**全页加密** — 整篇文章需要验证：

```yaml
---
title: 秘密文章
encrypt:
  min_level: 2    # 仅 Lv.2（VIP）及以上可读
---
```

**段落内联加密** — 指定段落需要验证：

```nunjucks
所有人都能看到的公开内容。

{% group 2 %}
此段落需要 Lv.2（VIP）及以上等级验证。
{% endgroup %}

更多公开内容。
```

### 三种场景对比

| | 完全加密 | 部分加密 | 不加密 |
|---|---|---|---|
| 触发条件 | `encrypt.min_level` ≥ 1 | `{% group N %}` 短代码 | 无 encrypt / 无 group |
| 访客看到 | 全屏密码弹窗 | 公开内容 + 展开式验证块 | 全部内容 |
| 加密范围 | 整篇正文 | 仅 `{% group %}` 段落 | 无 |
| sessionStorage | ✅ 同标签页自动解 | ✅ 同标签页自动解 | N/A |

### 工作原理

- **构建时：** 每篇文章/段落按等级分别加密，每等级使用独立的 salt/nonce。加密后立即执行往返验证（`encrypt → decrypt`），验证通过才会部署。内容完整性哈希（`SHA-256(密文||salt||nonce||pwdcheck)`）嵌入页面，用于运行时检测部署后篡改。
- **客户端：** Web Crypto API（`PBKDF2` + `AES-GCM`）。用户选择用户组，输入密码。HMAC 指纹在昂贵的 PBKDF2 派生**之前**预校验密码正确性。解密后的内容绝不会发送到服务器。
- **sessionStorage：** 解密成功后，派生密钥缓存至 `sessionStorage`——同标签页浏览同等级文章自动解密，无需重复输入密码。关闭标签页即清除缓存。
- **htmx 安全：** `htmx:beforeHistorySave` 监听器在缓存前将已解密内容替换回加密外壳，确保明文不会泄露到 htmx 的 localStorage 历史缓存中。

### ⚠️ 安全警告与免责声明

本加密为**浏览器端 AES-GCM 对称加密**——提高阅读门槛，但**并非军事级安全**。以下风险客观存在：

- 密码泄露（窥屏、键盘记录器、`.encrypt-secret.yml` 被他人获取）
- 中间人攻击（务必使用 **HTTPS**）
- 浏览器恶意扩展
- Cloudflare Pages / Vercel 等远程构建部署：如 `.encrypt-secret.yml` 被 gitignore 排除，远端构建将失败。需确保仓库为 **Private**，或通过平台环境变量/Secrets 功能在构建时注入密码。

**如内容因任何原因泄漏，本主题概不负责。** 请将加密视为「增加阅读门槛」而非「绝对保密」。

### 依赖

| 来源 | 说明 |
|------|------|
| Node.js `crypto` | 服务端 PBKDF2 + AES-GCM（零 npm 依赖） |
| Web Crypto API | 客户端解密（所有现代浏览器原生支持） |
| [hexo-blog-encrypt](https://github.com/D0n9X1n/hexo-blog-encrypt) v4.0.2 | 加密插件基础（扩展而非替换） |

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
