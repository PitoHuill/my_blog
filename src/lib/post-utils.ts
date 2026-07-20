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

export type DiscoverablePost = PublishablePost & {
  data: PublishablePost['data'] & {
    title: string;
    description: string;
    tags: string[];
    series?: string;
    seriesKey?: string;
    seriesOrder?: number;
  };
};

export type PostSeries<T extends DiscoverablePost> = {
  key: string;
  title: string;
  posts: T[];
  latestDate: Date;
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

export function getPostSeries<T extends DiscoverablePost>(posts: readonly T[]): PostSeries<T>[] {
  const groups = new Map<string, T[]>();

  for (const post of posts) {
    if (!post.data.series || !post.data.seriesKey) continue;
    const group = groups.get(post.data.seriesKey) ?? [];
    group.push(post);
    groups.set(post.data.seriesKey, group);
  }

  return [...groups.entries()]
    .map(([key, seriesPosts]) => {
      const orderedPosts = [...seriesPosts].sort((a, b) => {
        const orderDifference = (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER);
        return orderDifference || a.data.pubDate.getTime() - b.data.pubDate.getTime();
      });
      return {
        key,
        title: orderedPosts[0].data.series!,
        posts: orderedPosts,
        latestDate: new Date(Math.max(...orderedPosts.map((post) => post.data.pubDate.getTime()))),
      };
    })
    .sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime());
}

export function getRelatedPosts<T extends DiscoverablePost>(posts: readonly T[], current: T, limit = 3): T[] {
  const currentTags = new Set(current.data.tags);

  return posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) => currentTags.has(tag)).length;
      const sameSeries = Boolean(current.data.seriesKey && post.data.seriesKey === current.data.seriesKey);
      return { post, score: (sameSeries ? 100 : 0) + sharedTags * 10 };
    })
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime())
    .slice(0, limit)
    .map(({ post }) => post);
}
