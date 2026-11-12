# Yichen Yang 的博客

个人博客：[xj22yangyichen.github.io](https://xj22yangyichen.github.io/)

基于 Next.js、React、HeroUI 和 Tailwind CSS 的中英文静态博客，内容以 Markdown 管理，使用 GitHub Actions 构建并部署到 GitHub Pages。

## 功能

- 中英文界面、明暗主题和适配手机的页面布局。
- 首页个人介绍、文章时间线、标签分类和友链。
- 文章目录、代码高亮、GFM 表格和数学公式。
- 文章阅读页显示阅读量，默认使用不蒜子的公共计数服务。
- 标题、标签和正文全文搜索，以及 RSS、站点地图和文章元数据。
- 英文界面展示全部已发布的中文文章，标签使用英文，标题和正文保留中文。没有英文版的文章会在阅读页顶部显示提示；已有英文译文时优先展示译文。

## 本地运行

需要 Node.js 22.14 或更高版本，以及 pnpm 10.21.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开 [localhost:3000](http://localhost:3000)。构建和预览：

```sh
pnpm build
pnpm preview
```

## 仓库结构

| 目录或文件       | 内容                                       |
| ---------------- | ------------------------------------------ |
| `app/`           | 页面路由、RSS、站点地图和爬虫入口          |
| `features/`      | 文章、搜索、友链、主题等功能组件           |
| `components/`    | 通用布局和界面组件                         |
| `content/posts/` | 中文和英文 Markdown 文章                   |
| `data/`          | 友链与阅读状态数据                         |
| `lib/`           | 内容读取、国际化、搜索、SEO 和数据同步逻辑 |
| `public/`        | 图片、字体和静态资源                       |
| `scripts/`       | 内容校验、索引生成、数据同步和构建检查     |
| `functions/`     | 可选的服务器接口                           |
| `tests/`         | 单元测试和浏览器测试                       |
| `site.config.ts` | 站点身份、导航和功能配置                   |
| `.env.example`   | 环境变量说明                               |

## 内容维护

### 项目页面

项目资料维护在 `features/projects/project-data.ts`，中文报告正文位于 `content/projects/<slug>.md`，对应英文译文位于 `content/projects/en/<slug>.md`。两种语言共用同一项目短名和日期。英文界面读取英文报告，并使用项目资料中的 `en` 字段展示英文副标题、简介、课程和标签；修改内容时应同步维护中英文版本。

- 项目按 `date` 从新到旧自动排序，中英文页面使用相同顺序；同一天的项目按 `slug` 升序排列。
- `date` 使用补齐位数的 `YYYY-MM-DD` 格式，表示项目开始日期。现有四个项目使用 GitHub 仓库的创建日期作为依据，不使用最近更新时间。
- 添加项目时，在 `projectEntries` 中填写日期和其他资料，并添加对应的 Markdown 报告即可，无需手动调整数组中的位置。后续修改报告内容也不需要更改项目日期。

### 博客文章

中文文章位于 `content/posts/zh/`，英文译文位于 `content/posts/en/`。文章示例：

```markdown
---
title: 我的第一篇文章
description: 文章的简短介绍。
published: "2026-10-27"
locale: zh-CN
tags: [随笔]
draft: false
commentId: wo-de-di-yi-pian-wen-zhang
---

正文从这里开始。
```

`draft: true` 的文章不会发布。`published` 和 `updated` 支持纯日期和带时区的完整时间，例如 `"2023-09-09T10:17:09+08:00"`。正文支持 GFM 表格、代码块，以及 `$...$` 和 `$$...$$` 数学公式。

### 文章文件名和 URL

新写和迁移的文章都按 `title` 逐字转写成短名（slug）。例如，`如何 commit` 对应 `ru-he-commit.md`，中文 URL 为 `/posts/ru-he-commit/`。

- 中文按标题中的读音逐字写成不带声调的拼音，一个汉字对应一个音节，`ü` 写作 `v`。
- 英文词和数字沿用标题中的顺序，英文字母统一小写。连续的英文和数字作为一段，例如 `POJ2411` 写作 `poj2411`。
- 用单个连字符分隔各段。空白和括号等标点只作分隔，保留括号内的文字。词内撇号省略，例如 `Mondriaan's` 写作 `mondriaans`。短名只含 `a–z`、`0–9` 和段间连字符。
- 文件名为 `<slug>.md`。英文界面展示同一篇文章时沿用该短名，URL 为 `/en/posts/<slug>/`。通过 Notion 同步新文章时，在 `Slug` 字段填写按这套规则转写的短名。
- 转写后若重名，先确认如何区分标题。改标题导致短名变化时，在 `redirects.config.ts` 中登记旧短名到新短名的映射，让原链接直接跳到最新地址。

中文文章会自动出现在英文界面，无需复制正文。中文标签的英文名称在 `lib/content/article-localization.ts` 中维护。提供英文译文时，将其放入英文目录并设置 `locale: en`；中英文文章使用相同的 `translationKey` 关联。

站点姓名、头像、简介和社交链接在 `site.config.ts` 中配置，友链在 `data/friends.json` 中维护。仓库还提供 Notion 文章与友链同步、微信读书同步脚本，所需配置见 `.env.example`。

## 部署

GitHub Pages 使用 `.github/workflows/deploy.yml` 自动部署。仓库的 Settings → Pages → Build and deployment → Source 选择 GitHub Actions 后，推送到 `main` 即可触发检查、构建和发布，也可手动运行工作流。

生产站点地址由 `NEXT_PUBLIC_SITE_URL` 配置。当前工作流使用 `https://xj22yangyichen.github.io`，本地 PowerShell 可这样指定：

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://xj22yangyichen.github.io"
pnpm build
```

当前部署为静态托管。文章阅读量和 GitHub 评论已开启；广告、其他统计和赞赏默认关闭；AI 搜索、在线友链申请和实时活动接口是需要服务器及相应配置的可选功能。

### GitHub 评论（Giscus）

文章底部已接入并启用 Giscus，读者通过 GitHub 登录授权后发表评论，评论公开保存在 `xj22yangyichen/Blog-Comments` 仓库的 `Comments` 分类中。可通过 `integrations.comments.enabled` 关闭。

首次启用：

1. 在 GitHub 创建独立的公开仓库，例如 `xj22yangyichen/blog-comments`，在 Settings → General → Features 中启用 Discussions。
2. 安装 [Giscus GitHub App](https://github.com/apps/giscus)，只授权评论仓库。
3. 在 Discussions 中创建 `Comments` 分类，类型选 Announcements。
4. 打开 [Giscus 配置页](https://giscus.app/zh-CN)，填写仓库并选择分类。从生成的脚本中复制 `data-repo`、`data-repo-id`、`data-category` 和 `data-category-id`。
5. 将四项分别填入 `site.config.ts` 的 `integrations.comments.repo`、`repoId`、`category`、`categoryId`，并将 `enabled` 改为 `true`。这些都是公开标识，无需配置私人令牌。
6. 检查并重新构建部署。配置在构建时读取，仅修改 GitHub 设置不会更新已发布网页。

页面映射由组件统一设为 `specific`，匹配字符串为 `post:<commentId>`，启用严格匹配。无需把配置页生成的脚本手动插入页面，也不要改成 pathname 映射。首条评论或回应会自动创建讨论。

每篇文章在 frontmatter 中保存 `commentId`，使用小写英文字母、数字和连字符。首次可使用文章短名，之后即使改标题或文件名也不要改变这个值。中英文译文使用同一个 `commentId`；自动生成的英文界面会继承中文原文的值。启用评论后，缺少标识的已发布文章会使构建报错；内容校验会阻止无关文章共用标识或译文使用不同标识。

Notion 首次同步可从可选的 `Comment ID` 文本字段读取标识，未填写时采用原有短名或新文章短名（旧短名含中文时改用 Notion 页面 ID）。后续同步优先保留本地已保存的 `commentId`，不会随着 Notion 标题或 Slug 的修改重新生成。创建译文时请指定原文的标识。

组件支持中英文文案、明暗主题、靠近页尾时加载、15 秒加载超时与重试。GitHub 讨论入口在取得讨论信息后直达对应讨论，未取得时打开该仓库的讨论搜索页；首次讨论尚未创建时，搜索可能没有结果。

本地模拟验证（不登录、不向 GitHub 发布评论）：

```powershell
$env:PLAYWRIGHT_TEST_COMMENTS = "1"
pnpm build
pnpm exec playwright test tests/e2e/comments.spec.ts
Remove-Item Env:PLAYWRIGHT_TEST_COMMENTS
pnpm build
```

该环境变量仅供测试，不能用于正式部署。生产启用后仍需实际验证一次 GitHub 登录、发表评论和回复，以及中英文是否显示同一条评论。

### 文章阅读量

阅读页的日期、字数和阅读时长旁显示“阅读量”。默认使用[不蒜子](https://busuanzi.ibruce.info/)公共服务，无需账号或服务器，打开文章时请求并累加该页面的访问次数（不是独立访客数）。服务通过完整页面 Referer 识别文章，因此会收到当前文章网址；中英文地址分别计数，不会补算接入前的历史访问。

加载时显示省略号，请求失败或超过 8 秒显示破折号，不影响正文阅读。可在 `site.config.ts` 中将 `integrations.articleReadCount.enabled` 设为 `false` 关闭默认计数。若配置并开启现有 Umami 的 `showPageViews`，则优先显示 Umami 数据。

## 检查

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
```

构建会校验内容、生成双语搜索索引，并检查静态页面、本地链接、RSS 和站点地图。浏览器测试使用构建后的 `out/` 目录。
