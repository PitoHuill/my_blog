import { expect, test } from '@playwright/test';

test('home navigation has only the primary destinations and a theme control', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation');
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link')).toHaveText(['首页', '文章', '项目', '关于']);
  await expect(page.getByRole('button', { name: /切换.*主题|主题.*切换/i })).toBeVisible();
});

test('featured post keeps its URL and renders Markdown sections', async ({ page }) => {
  await page.goto('/posts/building-a-lasting-blog/');

  await expect(page).toHaveURL(/\/posts\/building-a-lasting-blog\/$/);
  await expect(page.getByRole('heading', { name: '为什么选择静态博客' })).toBeVisible();
});

test('article exposes reading metadata, table of contents, code, and adjacent posts', async ({ page }) => {
  await page.goto('/posts/building-a-lasting-blog/');

  await expect(page.getByText(/\d+ 分钟阅读/)).toBeVisible();
  await expect(page.getByText('系列：Astro 博客实践 · 第 1 篇')).toBeVisible();
  const toc = page.getByRole('navigation', { name: '文章目录' });
  await expect(toc).toBeVisible();
  await expect(toc.getByRole('link', { name: '为什么选择静态博客' })).toHaveAttribute('href', '#为什么选择静态博客');
  await expect(page.locator('pre.astro-code')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '文章导航' }).getByText('读书笔记：把复杂问题写得更清楚')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '文章导航' }).getByText('用更小的系统，完成更长的思考')).toBeVisible();
});
