import type { Locale } from '../i18n/config';
import { localizedPath } from './paths';
import { getPublicSlug } from './post-utils';

type SearchablePost = {
  id: string;
  data: {
    locale: Locale;
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
  };
};

export type SearchEntry = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  url: string;
};

export function serializeSearchPayload(payload: unknown): string {
  return (JSON.stringify(payload) ?? 'null').replace(/</g, '\\u003c');
}

export function buildSearchIndex(
  posts: readonly SearchablePost[],
  locale: Locale,
  base = import.meta.env.BASE_URL,
): SearchEntry[] {
  return posts
    .filter((post) => post.data.locale === locale)
    .map((post) => ({
      title: post.data.title,
      date: post.data.pubDate.toISOString().slice(0, 10),
      description: post.data.description,
      tags: post.data.tags,
      url: localizedPath(`posts/${getPublicSlug(post.id)}/`, locale, base),
    }));
}
