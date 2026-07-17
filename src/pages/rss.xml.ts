import type { APIRoute } from 'astro';
import { profile } from '../data/site';
import { getPublishedPosts } from '../lib/posts';
import { withBase } from '../lib/paths';

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
})[character] ?? character);

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  const siteUrl = site ?? new URL('https://example.github.io');
  const base = withBase('');
  const items = posts.map((post) => {
    const link = new URL(`${base}posts/${post.id}/`, siteUrl).toString();
    return `<item><title>${escapeXml(post.data.title)}</title><link>${link}</link><description>${escapeXml(post.data.description)}</description><pubDate>${post.data.pubDate.toUTCString()}</pubDate></item>`;
  }).join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(profile.name)}</title><link>${siteUrl}</link><description>${escapeXml(profile.tagline)}</description>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
