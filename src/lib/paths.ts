export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
