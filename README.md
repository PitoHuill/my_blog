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
3. 在 Actions 环境变量中设置 `SITE_URL`（例如 `https://用户名.github.io`）。若使用项目仓库路径，再设置 `BASE_PATH`（例如 `/仓库名`）。

写作内容目前统一维护在 `src/data/site.ts`：替换个人资料、文章、项目与链接即可生成新页面。
