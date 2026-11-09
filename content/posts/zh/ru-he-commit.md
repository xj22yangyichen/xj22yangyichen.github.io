---
title: "如何 commit"
description: "常用 Git commit 类型、含义与示例，包括 feat、fix、docs、style、refactor、perf、test、chore、ci、build 和 revert。"
published: "2026-02-25T18:59:00+08:00"
updated: "2026-10-13T19:52:00+08:00"
locale: zh-CN
tags: ["git"]
draft: false
---

| 类型         | 含义                          | 示例                                         |
| ------------ | ----------------------------- | -------------------------------------------- |
| **feat**     | ✨ 新功能                     | `feat(ui): add dark mode support`            |
| **fix**      | 🐛 修复 bug                   | `fix(auth): correct token refresh logic`     |
| **docs**     | 📝 文档更新                   | `docs: update README with setup guide`       |
| **style**    | 💅 代码格式调整（不影响逻辑） | `style: fix indentation and spacing`         |
| **refactor** | ♻️ 重构代码（功能不变）       | `refactor(core): simplify data structure`    |
| **perf**     | ⚡ 性能优化                   | `perf(db): reduce query time`                |
| **test**     | ✅ 添加或修改测试             | `test(parser): add edge case for null input` |
| **chore**    | 🔧 构建、依赖或工具相关的修改 | `chore(deps): update eslint version`         |
| **ci**       | 🤖 持续集成相关配置           | `ci: update GitHub Actions workflow`         |
| **build**    | 🏗️ 构建系统或依赖项变更       | `build: switch from npm to pnpm`             |
| **revert**   | ⏪ 回退提交                   | `revert: revert "feat: add login page"`      |
