import { describe, expect, it } from 'vitest';
import { parsePost, serializePost, validatePost } from './frontmatter';

describe('frontmatter helpers', () => {
  it('round-trips a bilingual post metadata document', () => {
    const source = `---\ntitle: 测试文章\ndescription: 一句话摘要\npubDate: 2026-07-22\ntags:\n  - Astro\nlocale: zh\ntranslationKey: test-post\n---\n\n## 正文\n`;
    const post = parsePost('src/content/posts/zh/test-post.md', source);
    expect(post.slug).toBe('test-post');
    expect(post.meta.locale).toBe('zh');
    expect(validatePost(post)).toEqual([]);
    expect(serializePost(post)).toContain('translationKey: test-post');
    expect(serializePost(post)).toContain('## 正文');
  });

  it('rejects an invalid slug and missing description', () => {
    const post = parsePost(
      'src/content/posts/en/Bad Slug.md',
      `---\ntitle: Hello\ndescription: ''\npubDate: 2026-07-22\nlocale: en\ntranslationKey: hello\n---\n`,
    );
    expect(validatePost(post)).toContain('摘要不能为空');
    expect(validatePost(post)).toContain('Slug 只能包含小写字母、数字和连字符');
  });
});
