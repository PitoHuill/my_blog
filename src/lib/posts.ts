import { getCollection, type CollectionEntry } from 'astro:content';
import { filterPublishedPosts } from './post-utils';

export { calculateReadingTime, getAdjacentPosts } from './post-utils';

export async function getPublishedPosts(now = new Date()): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts');
  return filterPublishedPosts(posts, now);
}
