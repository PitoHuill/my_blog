import { type Locale } from '../i18n/config';

export type PublishablePost = {
  id: string;
  data: {
    pubDate: Date;
    draft?: boolean;
    locale: Locale;
    translationKey: string;
  };
};

export function filterPublishedPosts<T extends PublishablePost>(posts: readonly T[], now?: Date): T[];
export function filterPublishedPosts<T extends PublishablePost>(posts: readonly T[], locale: Locale, now?: Date): T[];
export function filterPublishedPosts<T extends PublishablePost>(posts: readonly T[], localeOrNow: Locale | Date = new Date(), maybeNow = new Date()): T[] {
  const locale = typeof localeOrNow === 'string' ? localeOrNow : undefined;
  const now = locale ? maybeNow : localeOrNow;
  return posts
    .filter((post) => !post.data.draft && post.data.pubDate.getTime() <= now.getTime() && (!locale || post.data.locale === locale))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getPublicSlug(id: string): string {
  return id.replace(/^(?:en|zh)\//, '');
}

export function findTranslation<T extends PublishablePost>(posts: readonly T[], post: T, targetLocale: Locale): T | undefined {
  return posts.find((candidate) => candidate.data.locale === targetLocale && candidate.data.translationKey === post.data.translationKey);
}

export function calculateReadingTime(markdown: string): number {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!??\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~|-]/g, ' ');
  const chineseCharacters = plainText.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = plainText.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return Math.max(1, Math.ceil((chineseCharacters + latinWords * 2) / 350));
}

export function getAdjacentPosts<T extends { id: string }>(posts: readonly T[], id: string) {
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: posts[index + 1],
    next: posts[index - 1],
  };
}
