import { describe, expect, it } from 'vitest';
import { buildSearchIndex, serializeSearchPayload } from '../../src/lib/search';

const posts = [
  {
    id: 'en/lasting-blog',
    data: {
      locale: 'en' as const,
      title: 'A lasting blog',
      description: 'An English description',
      pubDate: new Date('2026-07-02T00:00:00Z'),
      tags: ['Astro'],
    },
  },
  {
    id: 'zh/lasting-blog',
    data: {
      locale: 'zh' as const,
      title: '长期维护的博客',
      description: '一段中文摘要',
      pubDate: new Date('2026-07-02T00:00:00Z'),
      tags: ['博客'],
    },
  },
];

describe('buildSearchIndex', () => {
  it('builds an English-only index with unprefixed post URLs', () => {
    const index = buildSearchIndex(posts, 'en', '/');

    expect(index.map((entry) => entry.title)).toEqual(['A lasting blog']);
    expect(index.map((entry) => entry.url)).toEqual(['/posts/lasting-blog/']);
    expect(JSON.stringify(index)).not.toContain('长期维护的博客');
  });

  it('builds a Chinese-only index below the configured base exactly once', () => {
    const index = buildSearchIndex(posts, 'zh', '/my_blog/');

    expect(index.map((entry) => entry.title)).toEqual(['长期维护的博客']);
    expect(index.map((entry) => entry.url)).toEqual(['/my_blog/zh/posts/lasting-blog/']);
    expect(JSON.stringify(index)).not.toContain('A lasting blog');
    expect(JSON.stringify(index)).not.toContain('/my_blog/my_blog/');
  });
});

describe('serializeSearchPayload', () => {
  it('prevents mixed-case script termination while preserving the authored data', () => {
    const attack = '</SCRIPT><img src=x onerror=alert(1)>';
    const payload = {
      searchable: [{ title: attack, description: `Before ${attack} after` }],
      locale: 'en',
    };

    const serialized = serializeSearchPayload(payload);

    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003c/SCRIPT>\\u003cimg');
    expect(JSON.parse(serialized)).toEqual(payload);
  });
});
