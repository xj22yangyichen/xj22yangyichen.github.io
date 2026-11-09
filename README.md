# Yichen Yang 的博客

个人博客：[xj22yangyichen.github.io](https://xj22yangyichen.github.io/)

基于 Next.js、React、HeroUI 和 Tailwind CSS 的中英文静态博客，内容以 Markdown 管理，使用 GitHub Actions 构建并部署到 GitHub Pages。

## 功能

- 中英文界面、明暗主题和适配手机的页面布局。
- 首页个人介绍、文章时间线、标签分类和友链。
- 文章目录、代码高亮、GFM 表格和数学公式。
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

中文文章位于 `content/posts/zh/`，英文译文位于 `content/posts/en/`。文章示例：

```markdown
---
title: 我的第一篇文章
description: 文章的简短介绍。
published: "2026-10-27"
locale: zh-CN
tags: [随笔]
draft: false
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

当前部署为静态托管。广告、统计、评论和赞赏默认关闭；AI 搜索、在线友链申请和实时活动接口是需要服务器及相应配置的可选功能。

## 检查

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm test:e2e
```

构建会校验内容、生成双语搜索索引，并检查静态页面、本地链接、RSS 和站点地图。浏览器测试使用构建后的 `out/` 目录。
