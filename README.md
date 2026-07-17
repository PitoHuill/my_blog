# 个人博客

一个使用 Astro 构建的静态个人博客，包含双栏首页、日间/夜间主题、文章与项目页面、RSS 以及 GitHub Pages 工作流。

## 本地运行

```powershell
npm install
npm run dev
```

## 发布到 GitHub Pages

1. 创建 GitHub 仓库并将本项目推送到 `main` 或 `master`。
2. 在仓库 **Settings → Pages** 选择 **GitHub Actions**。
3. 推送后工作流会自动识别仓库类型：`用户名.github.io` 使用根路径，普通项目仓库使用 `/仓库名` 路径，无需手动填写 `SITE_URL` 或 `BASE_PATH`。

如果使用自定义域名，请在仓库的 Pages 设置中绑定域名，并将工作流中的 `SITE_URL` 改成你的域名。

个人资料与项目维护在 `src/data/site.ts`，文章维护在 `src/content/posts/`。

## 新建文章

复制一篇现有的 `.md` 文件，修改文件名和 frontmatter：

```markdown
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-07-18
updatedDate: 2026-07-20
tags:
  - Astro
featured: false
draft: false
series: Astro 博客实践
seriesOrder: 2
---

## 第一节

从这里开始使用 Markdown 写正文。
```

- 文件名就是文章 URL，例如 `my-note.md` 对应 `/posts/my-note/`。
- 设置 `draft: true` 后，文章不会出现在页面、搜索和 RSS 中。
- `pubDate` 晚于构建时间时，文章也不会发布；到达日期后需要重新运行一次 GitHub Actions。
- `series` 与 `seriesOrder` 用于显示系列名称和篇次。
- 支持 `.md` 和 `.mdx`、标题、列表、引用、图片和带语言标记的代码块。
- 文章图片可以放在 `src/content/posts/images/`，然后使用相对路径：`![图片说明](./images/example.jpg)`。

提交前建议运行：

```powershell
npm run test:unit
npm run test:e2e
npm run build
```
