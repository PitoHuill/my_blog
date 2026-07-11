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

写作内容目前统一维护在 `src/data/site.ts`：替换个人资料、文章、项目与链接即可生成新页面。
