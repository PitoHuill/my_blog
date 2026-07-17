import { describe, expect, it } from 'vitest';
import { withBase } from '../../src/lib/paths';

describe('withBase', () => {
  it('joins a GitHub Pages project base without losing the separator', () => {
    expect(withBase('posts/example/', '/my_blog')).toBe('/my_blog/posts/example/');
  });

  it('keeps root deployments rooted at one slash', () => {
    expect(withBase('/posts/', '/')).toBe('/posts/');
  });
});
