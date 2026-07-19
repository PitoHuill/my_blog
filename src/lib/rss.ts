import { profile } from '../data/site';
import type { Locale } from '../i18n/config';
import { ui } from '../i18n/ui';
import { localizedPath } from './paths';
import { getPublicSlug } from './post-utils';

type FeedPost = {
  id: string;
  data: {
    locale: Locale;
    title: string;
    description: string;
    pubDate: Date;
  };
};

type RenderRssOptions = {
  locale: Locale;
  siteUrl: URL;
  base?: string;
};

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
})[character] ?? character);

export function renderLocalizedRss(
  posts: readonly FeedPost[],
  { locale, siteUrl, base = import.meta.env.BASE_URL }: RenderRssOptions,
): string {
  const channelLink = new URL(localizedPath('', locale, base), siteUrl).toString();
  const items = posts
    .filter((post) => post.data.locale === locale)
    .map((post) => {
      const path = localizedPath(`posts/${getPublicSlug(post.id)}/`, locale, base);
      const link = new URL(path, siteUrl).toString();
      return `<item><title>${escapeXml(post.data.title)}</title><link>${escapeXml(link)}</link><description>${escapeXml(post.data.description)}</description><pubDate>${post.data.pubDate.toUTCString()}</pubDate></item>`;
    })
    .join('');

  const title = `${profile.name} — ${ui[locale].posts.title}`;
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(title)}</title><link>${escapeXml(channelLink)}</link><description>${escapeXml(profile.tagline[locale])}</description>${items}</channel></rss>`;
}
