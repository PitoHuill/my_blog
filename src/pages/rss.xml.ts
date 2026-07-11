import type { APIRoute } from 'astro';
import { posts } from '../data/site';
export const GET: APIRoute = ({ site }) => new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>你的名字</title><link>${site ?? ''}</link><description>个人博客</description>${posts.map((post) => `<item><title>${post.title}</title><link>${site ?? ''}posts/${post.slug}/</link><description>${post.description}</description><pubDate>${new Date(post.date).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
