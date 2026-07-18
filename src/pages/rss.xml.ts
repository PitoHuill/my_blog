import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { renderLocalizedRss } from '../lib/rss';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts('en');
  return new Response(
    renderLocalizedRss(posts, { locale: 'en', siteUrl: site ?? new URL('https://example.github.io') }),
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
