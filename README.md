# Yichen Yang 的博客

个人博客：[xj22yangyichen.github.io](https://xj22yangyichen.github.io/)

GitHub：[xj22yangyichen](https://github.com/xj22yangyichen)

基于 Next.js、HeroUI 和 Tailwind CSS 的中英文静态博客，使用 GitHub Actions 自动部署到 GitHub Pages，内容以本地 Markdown 管理。广告、统计、评论、赞赏和服务器接口默认关闭。

## 本地运行

安装 Node.js 22 和 pnpm 10.21.0。在此文件夹运行 pnpm install --frozen-lockfile，然后运行 pnpm dev，打开 http://localhost:3000 。

生产构建前，在 PowerShell 设置：

    $env:NEXT_PUBLIC_SITE_URL = "https://xj22yangyichen.github.io"
    pnpm build
    pnpm preview

## 部署

仓库名为 xj22yangyichen.github.io，公开可见。在仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。推送到 main 后，.github/workflows/deploy.yml 自动检查、构建和发布。也可在 Actions → Deploy to GitHub Pages → Run workflow 手动启动。

首次手动上传时，在 https://github.com/new 创建上述同名空仓库，不勾选 README、License 和 .gitignore，然后在此文件夹运行：

    git init -b main
    git add .
    git commit -m "Set up Yichen Yang's personal blog"
    git remote add origin https://github.com/xj22yangyichen/xj22yangyichen.github.io.git
    git push -u origin main

若 Git 提示缺少身份，请设置自己的 git config user.name 和 git config user.email。若已经连接仓库，先查看 git status 和 git remote -v，不要重复初始化或强制推送。

## 写文章

中文文章放在 content/posts/zh/，英文文章放在 content/posts/en/。例如新建 content/posts/zh/my-first-post.md：

    ---
    title: 我的第一篇文章
    description: 文章的简短介绍。
    published: "2026-10-27"
    locale: zh-CN
    tags: [随笔]
    draft: false
    ---

    正文从这里开始。

文件名使用小写字母、数字或汉字，用连字符分词。draft: true 的文章不会发布。中英文内容使用相同的 translationKey 可关联翻译。添加或修改内容后，提交并推送即可更新网站。

`published` 和 `updated` 也支持带时区的完整时间，例如 `"2023-09-09T10:17:09+08:00"`。文章页显示原时区的时间，RSS 保留同一时刻；原有的纯日期写法继续可用。正文支持 GFM 表格、代码块，以及 `$...$` 和 `$$...$$` 数学公式。

## 博客园迁移

已迁移 [原博客](https://www.cnblogs.com/xj22yangyichen) 的全部 7 篇公开随笔，未迁移其 10 篇“文章”。原分类转为本站标签，发布时间保留到秒及 `+08:00` 时区。文件使用 `cnblogs-原随笔ID.md` 命名，来源地址、原分类、时间和正文校验摘要记录在 `migrations/cnblogs/manifest.json`。

`pnpm exec tsx scripts/import-cnblogs.ts` 可重新读取公开随笔列表，并核对随笔类型、总数、正文文字和全部代码块。默认拒绝覆盖已编辑的内容；仅在确实需要用原站内容覆盖时添加 `--overwrite`。原站部分更新时间精度只有分钟，早于精确发布时间时不写入本站的 `updated`，原值仍保存在迁移清单中。

站点姓名、头像、简介和社交链接在 site.config.ts 中配置。友链在 data/friends.json 中维护。图书栏目已暂时移除，不出现在导航、页面或站点索引中。文章页面采用按年份分组的时间线和主题列表；原归档地址会自动跳转到文章页面。

个人介绍显示在首页标题下方，不再单独设置“关于”页面；原 `/about/` 和 `/en/about/` 地址会跳转到对应语言的首页。

## 检查

    pnpm lint
    pnpm typecheck
    pnpm test:unit
    pnpm build

构建会检查本地链接、双语元数据、RSS、站点地图和搜索索引。GitHub Pages 提供静态托管；AI 搜索、在线友链申请和实时活动面板需要服务器支持，因此本站不显示这些入口。普通全文搜索、语言切换、主题切换、RSS 和文章阅读保持可用。
