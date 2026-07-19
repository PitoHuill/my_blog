import { describe, expect, it } from 'vitest';
import {
  calculateReadingTime,
  filterPublishedPosts,
  findTranslation,
  getAdjacentPosts,
  getPublicSlug,
} from '../../src/lib/post-utils';
import { createGetPublishedPosts } from '../../src/lib/posts';

type MockPost = {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    draft: boolean;
    locale: 'en' | 'zh';
    translationKey: string;
  };
  body: string;
};

const makePost = (
  id: string,
  pubDate: string,
  draft = false,
  locale: 'en' | 'zh' = 'en',
  translationKey = id,
): MockPost => ({
  id,
  data: {
    title: id,
    description: `${id} description`,
    pubDate: new Date(pubDate),
    tags: [],
    draft,
    locale,
    translationKey,
  },
  body: `${id} body`,
});

describe('filterPublishedPosts', () => {
  it('removes drafts and scheduled posts, then sorts newest first', () => {
    const posts = [
      makePost('older', '2026-06-01'),
      makePost('draft', '2026-07-01', true),
      makePost('future', '2026-08-01'),
      makePost('newer', '2026-07-10'),
    ];

    const result = filterPublishedPosts(posts, new Date('2026-07-18T00:00:00Z'));

    expect(result.map((post) => post.id)).toEqual(['newer', 'older']);
  });

  it('returns only published posts for the requested locale', () => {
    const posts = [
      makePost('en/example', '2026-07-10', false, 'en', 'example'),
      makePost('zh/example', '2026-07-11', false, 'zh', 'example'),
      makePost('en/future', '2026-08-01', false, 'en', 'future'),
    ];

    const result = filterPublishedPosts(posts, 'zh', new Date('2026-07-18T00:00:00Z'));

    expect(result.map((post) => post.id)).toEqual(['zh/example']);
  });
});

describe('getPublicSlug', () => {
  it('removes the locale directory from collection IDs', () => {
    expect(getPublicSlug('en/write-clearly')).toBe('write-clearly');
    expect(getPublicSlug('zh/write-clearly')).toBe('write-clearly');
  });
});

describe('findTranslation', () => {
  it('finds a post with the same translation key in the target locale', () => {
    const english = makePost('en/example', '2026-07-10', false, 'en', 'example');
    const chinese = makePost('zh/example', '2026-07-10', false, 'zh', 'example');

    expect(findTranslation([english, chinese], english, 'zh')).toBe(chinese);
  });
});

describe('getPublishedPosts', () => {
  it('defaults to the English collection', async () => {
    const getPublishedPosts = createGetPublishedPosts(async () => [
      makePost('en/example', '2026-07-10', false, 'en'),
      makePost('zh/example', '2026-07-10', false, 'zh'),
    ]);
    const posts = await getPublishedPosts();

    expect(posts).toHaveLength(1);
    expect(posts.every((post) => post.data.locale === 'en')).toBe(true);
  });

  it('continues to accept a legacy Date argument', async () => {
    const getPublishedPosts = createGetPublishedPosts(async () => [
      makePost('en/newer', '2026-07-10', false, 'en'),
      makePost('en/older', '2026-06-01', false, 'en'),
      makePost('zh/older', '2026-06-01', false, 'zh'),
    ]);
    const posts = await getPublishedPosts(new Date('2026-06-30T00:00:00Z'));

    expect(posts.map((post) => post.id)).toEqual(['en/older']);
  });
});

describe('calculateReadingTime', () => {
  it('returns at least one minute for short Markdown', () => {
    expect(calculateReadingTime('# 标题\n\n一小段正文。')).toBe(1);
  });

  it('counts long Chinese content as multiple minutes', () => {
    expect(calculateReadingTime('文'.repeat(701))).toBe(3);
  });
});

describe('getAdjacentPosts', () => {
  it('returns the older post as previous and the newer post as next', () => {
    const posts = [
      makePost('newest', '2026-07-10'),
      makePost('middle', '2026-07-05'),
      makePost('oldest', '2026-07-01'),
    ];

    const result = getAdjacentPosts(posts, 'middle');

    expect(result.previous?.id).toBe('oldest');
    expect(result.next?.id).toBe('newest');
  });
});
