import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '../i18n/config';
import { filterPublishedPosts } from './post-utils';

export { calculateReadingTime, findTranslation, getAdjacentPosts, getPublicSlug } from './post-utils';

export async function getPublishedPosts(locale: Locale = defaultLocale, now = new Date()): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts');
  return filterPublishedPosts(posts, locale, now);
}
