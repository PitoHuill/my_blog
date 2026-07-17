import { describe, expect, it } from 'vitest';
import { defaultLocale, getLocalePath, localePrefix, supportedLocales } from '../../src/i18n/config';
import { ui } from '../../src/i18n/ui';

describe('locale configuration', () => {
  it('uses English as the default locale without a URL prefix', () => {
    expect(defaultLocale).toBe('en');
    expect(supportedLocales).toEqual(['en', 'zh']);
    expect(localePrefix('en')).toBe('/');
    expect(getLocalePath('en', 'posts/example/')).toBe('/posts/example/');
  });

  it('adds the Chinese prefix exactly once', () => {
    expect(localePrefix('zh')).toBe('/zh/');
    expect(getLocalePath('zh', '/zh/posts/example/')).toBe('/zh/posts/example/');
  });
});

describe('shared UI dictionary', () => {
  it('provides a non-empty value for every shared label in both locales', () => {
    const values = (dictionary: object): string[] => Object.values(dictionary)
      .flatMap((value) => typeof value === 'string' ? [value] : values(value));

    expect(values(ui.en)).not.toHaveLength(0);
    expect(values(ui.zh)).toHaveLength(values(ui.en).length);
    expect([...values(ui.en), ...values(ui.zh)].every((value) => value.trim().length > 0)).toBe(true);
  });
});
