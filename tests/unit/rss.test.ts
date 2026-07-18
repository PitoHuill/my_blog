import { describe, expect, it } from 'vitest';
import { renderLocalizedRss } from '../../src/lib/rss';

const posts = [
  {
    id: 'en/lasting-blog',
    data: {
      locale: 'en' as const,
      title: 'A lasting blog',
      description: 'An English description',
      pubDate: new Date('2026-07-02T00:00:00Z'),
    },
  },
  {
    id: 'zh/lasting-blog',
    data: {
      locale: 'zh' as const,
      title: '长期维护的博客',
      description: '一段中文摘要',
      pubDate: new Date('2026-07-02T00:00:00Z'),
    },
  },
];

describe('renderLocalizedRss', () => {
  it('renders an English-only feed with base-prefixed channel and item links', () => {
    const xml = renderLocalizedRss(posts, {
      locale: 'en',
      siteUrl: new URL('https://example.github.io'),
      base: '/my_blog/',
    });

    expect(xml).toContain('<title>Pitohui — Posts</title>');
    expect(xml).toContain('<link>https://example.github.io/my_blog/</link>');
    expect(xml).toContain('<link>https://example.github.io/my_blog/posts/lasting-blog/</link>');
    expect(xml).toContain('A lasting blog');
    expect(xml).toContain('An English description');
    expect(xml).not.toContain('长期维护的博客');
    expect(xml).not.toContain('/my_blog/my_blog/');
  });

  it('renders a Chinese-only feed with localized metadata and URLs', () => {
    const xml = renderLocalizedRss(posts, {
      locale: 'zh',
      siteUrl: new URL('https://example.github.io'),
      base: '/my_blog/',
    });

    expect(xml).toContain('<title>Pitohui — 文章</title>');
    expect(xml).toContain('<link>https://example.github.io/my_blog/zh/</link>');
    expect(xml).toContain('<link>https://example.github.io/my_blog/zh/posts/lasting-blog/</link>');
    expect(xml).toContain('长期维护的博客');
    expect(xml).toContain('一段中文摘要');
    expect(xml).not.toContain('A lasting blog');
    expect(xml).not.toContain('/my_blog/my_blog/');
  });

  it('XML-escapes special characters in channel and item link text', () => {
    const specialCharacterPost = {
      ...posts[0],
      id: 'en/lasting&blog',
    };

    const xml = renderLocalizedRss([specialCharacterPost], {
      locale: 'en',
      siteUrl: new URL('https://example.github.io'),
      base: '/my&blog/',
    });

    expect(xml).toContain('<link>https://example.github.io/my&amp;blog/</link>');
    expect(xml).toContain('<link>https://example.github.io/my&amp;blog/posts/lasting&amp;blog/</link>');
    expect(xml).not.toContain('<link>https://example.github.io/my&blog/</link>');
  });
});
