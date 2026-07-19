import { describe, expect, it } from 'vitest';
import { localizedPath, withBase } from '../../src/lib/paths';

describe('withBase', () => {
  it('joins a GitHub Pages project base without losing the separator', () => {
    expect(withBase('posts/example/', '/my_blog')).toBe('/my_blog/posts/example/');
  });

  it('keeps root deployments rooted at one slash', () => {
    expect(withBase('/posts/', '/')).toBe('/posts/');
  });

  it('creates unprefixed English paths at the root base', () => {
    expect(localizedPath('posts/example/', 'en', '/')).toBe('/posts/example/');
  });

  it('creates Chinese paths below the configured base without double prefixes', () => {
    expect(localizedPath('/zh/posts/example/', 'zh', '/my_blog/')).toBe('/my_blog/zh/posts/example/');
  });
});
