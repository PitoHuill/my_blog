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

test('search pages expose accessible language controls for equivalent routes', async ({ page }) => {
  await page.goto('/search/');

  const languageControl = page.getByRole('link', { name: '切换到中文' });
  await expect(languageControl).toHaveAttribute('href', '/zh/search/');

  await page.goto('/zh/search/');
  await expect(page.getByRole('link', { name: 'Switch to English' })).toHaveAttribute('href', '/search/');
});

test('search datasets, labels, results, and post links stay within the active locale', async ({ page }) => {
  await page.goto('/search/');
  await expect(page.locator('.search-page .eyebrow')).toHaveText('SEARCH');
  await expect(page.getByRole('heading', { level: 1, name: 'Search posts' })).toBeVisible();
  const englishInput = page.getByRole('searchbox', { name: 'Enter a keyword' });
  await expect(englishInput).toHaveAttribute('placeholder', 'Title, description, or tag');
  await englishInput.fill('that lasts');
  await expect(page.getByText('1 post found')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Building a Personal Blog That Lasts' })).toHaveAttribute(
    'href',
    '/posts/building-a-lasting-blog/',
  );
  await expect(page.getByText('从零搭建一个可长期维护的个人博客')).toHaveCount(0);

  await page.goto('/zh/search/');
  await expect(page.locator('.search-page .eyebrow')).toHaveText('搜索');
  await expect(page.getByRole('heading', { level: 1, name: '搜索文章' })).toBeVisible();
  const chineseInput = page.getByRole('searchbox', { name: '输入关键词' });
  await expect(chineseInput).toHaveAttribute('placeholder', '标题、摘要或标签');
  await chineseInput.fill('可长期维护');
  await expect(page.getByText('找到 1 篇文章')).toBeVisible();
  await expect(page.getByRole('link', { name: '从零搭建一个可长期维护的个人博客' })).toHaveAttribute(
    'href',
    '/zh/posts/building-a-lasting-blog/',
  );
  await expect(page.getByText('Building a Personal Blog That Lasts')).toHaveCount(0);
});

test('English and Chinese RSS feeds contain only their locale', async ({ request }) => {
  const englishFeed = await (await request.get('/rss.xml')).text();
  expect(englishFeed).toContain('<title>Pitohui — Posts</title>');
  expect(englishFeed).toContain('Building a Personal Blog That Lasts');
  expect(englishFeed).not.toContain('从零搭建一个可长期维护的个人博客');
  expect(englishFeed).toContain('https://example.github.io/posts/building-a-lasting-blog/');

  const chineseFeed = await (await request.get('/zh/rss.xml')).text();
  expect(chineseFeed).toContain('<title>Pitohui — 文章</title>');
  expect(chineseFeed).toContain('从零搭建一个可长期维护的个人博客');
  expect(chineseFeed).not.toContain('Building a Personal Blog That Lasts');
  expect(chineseFeed).toContain('https://example.github.io/zh/posts/building-a-lasting-blog/');
});

test('English header remains usable without horizontal overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');

  const header = page.locator('.site-header');
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });
  const themeControl = page.getByRole('button', { name: /switch to (dark|light) theme/i });
  const languageControl = page.getByRole('link', { name: '切换到中文' });

  await expect(header).toBeVisible();
  await expect(navigation).toBeVisible();
  await expect(themeControl).toBeVisible();
  await expect(languageControl).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  for (const element of [navigation, themeControl, languageControl]) {
    const box = await element.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
});

test('language controls preserve equivalent home, post, project, and about routes', async ({ page }) => {
  const routes = [
    ['/', '/zh/', '切换到中文'],
    ['/search/', '/zh/search/', '切换到中文'],
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

test('representative localized pages contain no doubled or broken internal links', async ({ page, request }) => {
  for (const route of ['/', '/search/', '/zh/', '/zh/search/']) {
    await page.goto(route);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => (
      links.map((link) => link.getAttribute('href')).filter((href): href is string => Boolean(href))
    ));

    for (const href of new Set(hrefs)) {
      expect(href).not.toMatch(/\/zh\/zh\/|\/my_blog\/my_blog\//);
      expect((await request.get(href)).ok(), `Expected ${href} from ${route} to resolve`).toBe(true);
    }
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
  for (const link of await page.getByRole('navigation', { name: 'Article navigation' }).getByRole('link').all()) {
    await expect(link).toHaveAttribute('href', /^\/posts\//);
  }

  await page.goto('/zh/posts/building-a-lasting-blog/');

  await expect(page.getByRole('heading', { level: 1, name: '从零搭建一个可长期维护的个人博客' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '为什么选择静态博客' })).toBeVisible();
  await expect(page.getByText(/阅读时间：\d+ 分钟/)).toBeVisible();
  await expect(page.getByText('系列：Astro 博客实践 · 第 1 篇')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '文章导航' }).getByRole('link')).toHaveCount(2);
  for (const link of await page.getByRole('navigation', { name: '文章导航' }).getByRole('link').all()) {
    await expect(link).toHaveAttribute('href', /^\/zh\/posts\//);
  }
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

test('tag query filters work on prerendered English and Chinese post listings', async ({ page }) => {
  await page.goto('/posts/?tag=Blogging');
  await expect(page.getByRole('heading', { level: 1, name: 'Tags: Blogging' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Building a Personal Blog That Lasts' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Smaller Systems for Longer Thinking' })).toBeHidden();

  await page.goto('/zh/posts/?tag=%E5%8D%9A%E5%AE%A2');
  await expect(page.getByRole('heading', { level: 1, name: '标签：博客' })).toBeVisible();
  await expect(page.getByRole('link', { name: '从零搭建一个可长期维护的个人博客' })).toBeVisible();
  await expect(page.getByRole('link', { name: '用更小的系统，完成更长的思考' })).toBeHidden();
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
});
