import { getLocalePath, type Locale } from '../i18n/config';

export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}

export function localizedPath(path: string, locale: Locale, base = import.meta.env.BASE_URL): string {
  return withBase(getLocalePath(locale, path), base);
}
