# Blog Publisher Desktop

用于管理当前 Astro 双语博客的 Windows 桌面应用。文章、首页配置和图片仍保存在 Git 仓库中，不引入数据库或远程 CMS。

## 当前能力

- 浏览、搜索、新建和编辑中英文 Markdown 文章
- 编辑 Frontmatter、草稿、精选、标签和系列信息
- 使用相同 `translationKey` 创建或切换译文
- 导入文章图片并生成正确的相对路径
- 编辑双语个人资料、首页模块显示状态和主内容顺序
- 启动 Astro 开发服务器并进行真实网站预览
- 运行单元测试与生产构建
- 在 `main`/`master` 分支安全提交并推送允许范围内的内容文件

## 开发运行

前提：Node.js、Rust stable、Microsoft C++ Build Tools 和 WebView2。

```powershell
cd desktop
npm.cmd install --cache ..\.npm-cache
npm.cmd run test
npm.cmd run build
npm.cmd run tauri dev
```

## Windows 打包

```powershell
cd desktop
npm.cmd run tauri build
```

安装包输出位于 `desktop/src-tauri/target/release/bundle/`。

## 发布安全边界

桌面端原生命令只接受经过校验的博客路径，不使用 Shell 字符串拼接。文章写入限制在 `src/content/posts/`，配置写入限制在 `src/data/`。线上发布只允许以下内容：

- `src/content/posts/`
- `src/data/site-content.json`
- `src/data/home-config.json`
- `src/assets/avatar.jpg`

发现其他未提交修改时，桌面端会停止自动发布。
