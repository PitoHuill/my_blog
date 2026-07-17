export const supportedLocales = ['en', 'zh'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}

export function getLocalePath(locale: Locale, path = ''): string {
  const normalizedPath = `/${path}`.replace(/\/{2,}/g, '/');
  const withoutLocale = normalizedPath.replace(/^\/(?:en|zh)(?=\/|$)/, '');
  return `${localePrefix(locale)}${withoutLocale.replace(/^\/+/, '')}`;
}
