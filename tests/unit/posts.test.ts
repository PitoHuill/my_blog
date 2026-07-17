import { describe, expect, it } from 'vitest';
import {
  calculateReadingTime,
  filterPublishedPosts,
  getAdjacentPosts,
} from '../../src/lib/post-utils';

type MockPost = {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    draft: boolean;
  };
  body: string;
};

const makePost = (id: string, pubDate: string, draft = false): MockPost => ({
  id,
  data: {
    title: id,
    description: `${id} description`,
    pubDate: new Date(pubDate),
    tags: [],
    draft,
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
