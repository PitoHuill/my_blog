import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../lib/posts';
import { renderLocalizedRss } from '../../lib/rss';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts('zh');
  return new Response(
    renderLocalizedRss(posts, { locale: 'zh', siteUrl: site ?? new URL('https://example.github.io') }),
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
