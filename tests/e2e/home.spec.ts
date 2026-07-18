import { expect, test } from '@playwright/test';

test('English and Chinese home pages render localized navigation and profile copy', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link')).toHaveText([
    'Home',
    'Posts',
    'Projects',
    'About',
  ]);
  await expect(page.getByText('Research, making, and long-term thinking.')).toBeVisible();
  await expect(page.getByText('A record of questions, tools, and work worth keeping.')).toBeVisible();

  await page.goto('/zh/');

  await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link')).toHaveText([
    '首页',
    '文章',
    '项目',
    '关于',
  ]);
  await expect(page.getByText('研究、创作与长期思考。')).toBeVisible();
  await expect(page.getByText('在这里记录值得留下的问题、工具与作品。')).toBeVisible();
});

test('theme and language controls are available in both locales', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /switch to (dark|light) theme/i })).toBeVisible();
  await expect(page.getByRole('link', { name: '切换到中文' })).toHaveText('中');

  await page.goto('/zh/');

  await expect(page.getByRole('button', { name: /切换至(日间|夜间)主题/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Switch to English' })).toHaveText('EN');
});

test('language controls preserve equivalent home, post, project, and about routes', async ({ page }) => {
  const routes = [
    ['/', '/zh/', '切换到中文'],
    ['/posts/building-a-lasting-blog/', '/zh/posts/building-a-lasting-blog/', '切换到中文'],
    ['/projects/knowledge-garden/', '/zh/projects/knowledge-garden/', '切换到中文'],
    ['/about/', '/zh/about/', '切换到中文'],
  ] as const;

  for (const [englishRoute, chineseRoute, label] of routes) {
    await page.goto(englishRoute);
    await expect(page.getByRole('link', { name: label })).toHaveAttribute('href', chineseRoute);

    await page.goto(chineseRoute);
    await expect(page.getByRole('link', { name: 'Switch to English' })).toHaveAttribute('href', englishRoute);
  }
});

test('paired article routes render matching authored content and locale-only navigation', async ({ page }) => {
  await page.goto('/posts/building-a-lasting-blog/');

  await expect(page.getByRole('heading', { level: 1, name: 'Building a Personal Blog That Lasts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why Choose a Static Blog' })).toBeVisible();
  await expect(page.getByText(/Reading time: \d+ min/)).toBeVisible();
  await expect(page.getByText('Series: Astro Blog Practice · 1')).toBeVisible();
  await expect(page.locator('pre.astro-code')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Article navigation' }).getByRole('link')).toHaveCount(2);
  await expect(page.getByRole('navigation', { name: 'Article navigation' }).getByRole('link').first()).not.toHaveAttribute('href', /\/zh\//);

  await page.goto('/zh/posts/building-a-lasting-blog/');

  await expect(page.getByRole('heading', { level: 1, name: '从零搭建一个可长期维护的个人博客' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '为什么选择静态博客' })).toBeVisible();
  await expect(page.getByText(/阅读时间：\d+ 分钟/)).toBeVisible();
  await expect(page.getByText('系列：Astro 博客实践 · 第 1 篇')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '文章导航' }).getByRole('link')).toHaveCount(2);
  await expect(page.getByRole('navigation', { name: '文章导航' }).getByRole('link').first()).toHaveAttribute('href', /^\/zh\/posts\//);
});

test('post and project listings are localized', async ({ page }) => {
  await page.goto('/posts/');
  await expect(page.getByRole('heading', { level: 1, name: 'Posts' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Building a Personal Blog That Lasts' })).toBeVisible();

  await page.goto('/zh/posts/');
  await expect(page.getByRole('heading', { level: 1, name: '文章' })).toBeVisible();
  await expect(page.getByRole('link', { name: '从零搭建一个可长期维护的个人博客' })).toBeVisible();

  await page.goto('/projects/');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Personal Knowledge Garden' })).toBeVisible();

  await page.goto('/zh/projects/');
  await expect(page.getByRole('heading', { level: 1, name: '项目' })).toBeVisible();
  await expect(page.getByRole('link', { name: '个人知识花园' })).toBeVisible();
});

test('project and about pages render locale-specific data', async ({ page }) => {
  await page.goto('/projects/knowledge-garden/');
  await expect(page.getByRole('heading', { level: 1, name: 'Personal Knowledge Garden' })).toBeVisible();
  await expect(page.getByText('Turning scattered notes into paths of knowledge I can revisit.')).toBeVisible();

  await page.goto('/zh/projects/knowledge-garden/');
  await expect(page.getByRole('heading', { level: 1, name: '个人知识花园' })).toBeVisible();
  await expect(page.getByText('把零散笔记整理成可以回访的知识路径。')).toBeVisible();

  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: 'Hello, I am Pitohui.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'This site' })).toBeVisible();

  await page.goto('/zh/about/');
  await expect(page.getByRole('heading', { level: 1, name: '你好，我是 Pitohui。' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '这个网站' })).toBeVisible();
});

test('documents expose locale, canonical URL, and complete alternate links', async ({ page }) => {
  await page.goto('/posts/building-a-lasting-blog/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://example.github.io/posts/building-a-lasting-blog/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    'https://example.github.io/posts/building-a-lasting-blog/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
    'href',
    'https://example.github.io/zh/posts/building-a-lasting-blog/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    'https://example.github.io/posts/building-a-lasting-blog/',
  );

  await page.goto('/zh/posts/building-a-lasting-blog/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://example.github.io/zh/posts/building-a-lasting-blog/',
  );
});
