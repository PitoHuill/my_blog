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
  it('provides every shared label in both locales', () => {
    expect(ui.en.navigation.home).toBeTruthy();
    expect(ui.zh.navigation.home).toBeTruthy();
    expect(ui.en.search.inputLabel).toBeTruthy();
    expect(ui.zh.languageToggle.label).toBeTruthy();
  });
});
