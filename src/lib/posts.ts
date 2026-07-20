import type { CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '../i18n/config';
import { filterPublishedPosts, type PublishablePost } from './post-utils';

export {
  calculateReadingTime,
  findTranslation,
  getAdjacentPosts,
  getPostSeries,
  getPublicSlug,
  getRelatedPosts,
} from './post-utils';

export function createGetPublishedPosts<T extends PublishablePost>(loadPosts: () => Promise<readonly T[]>) {
  async function getPublishedPosts(): Promise<T[]>;
  async function getPublishedPosts(now: Date): Promise<T[]>;
  async function getPublishedPosts(locale: Locale, now?: Date): Promise<T[]>;
  async function getPublishedPosts(localeOrNow: Locale | Date = defaultLocale, now = new Date()): Promise<T[]> {
    const locale = localeOrNow instanceof Date ? defaultLocale : localeOrNow;
    const effectiveNow = localeOrNow instanceof Date ? localeOrNow : now;
    return filterPublishedPosts(await loadPosts(), locale, effectiveNow);
  }

  return getPublishedPosts;
}

export const getPublishedPosts = createGetPublishedPosts(async (): Promise<CollectionEntry<'posts'>[]> => {
  const { getCollection } = await import('astro:content');
  return getCollection('posts');
});
