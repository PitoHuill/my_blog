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
