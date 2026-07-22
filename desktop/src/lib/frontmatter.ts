import YAML from 'yaml';
import type { Locale, PostDocument, PostMeta } from '../types';

const FRONTMATTER = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/;

const dateValue = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').slice(0, 10);
};

export function parsePost(relativePath: string, raw: string): PostDocument {
  const match = raw.match(FRONTMATTER);
  if (!match) throw new Error(`${relativePath} 缺少有效的 Frontmatter`);

  const input = YAML.parse(match[1]) as Record<string, unknown>;
  const locale = input.locale === 'zh' ? 'zh' : 'en';
  const filename = relativePath.split(/[\\/]/).pop() ?? '';
  const slug = filename.replace(/\.(md|mdx)$/i, '');
  const meta: PostMeta = {
    title: String(input.title ?? ''),
    description: String(input.description ?? ''),
    pubDate: dateValue(input.pubDate),
    updatedDate: input.updatedDate ? dateValue(input.updatedDate) : undefined,
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    featured: Boolean(input.featured),
    draft: Boolean(input.draft),
    series: input.series ? String(input.series) : undefined,
    seriesKey: input.seriesKey ? String(input.seriesKey) : undefined,
    seriesOrder: input.seriesOrder ? Number(input.seriesOrder) : undefined,
    heroImage: input.heroImage ? String(input.heroImage) : undefined,
    locale,
    translationKey: String(input.translationKey ?? slug),
  };

  return { relativePath, slug, meta, body: raw.slice(match[0].length), raw };
}

export function validatePost(post: PostDocument): string[] {
  const errors: string[] = [];
  if (!post.meta.title.trim()) errors.push('标题不能为空');
  if (!post.meta.description.trim()) errors.push('摘要不能为空');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.meta.pubDate)) errors.push('发布日期必须为 YYYY-MM-DD');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) errors.push('Slug 只能包含小写字母、数字和连字符');
  if (!post.meta.translationKey.trim()) errors.push('translationKey 不能为空');
  if (post.meta.seriesKey && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.meta.seriesKey)) {
    errors.push('seriesKey 只能包含小写字母、数字和连字符');
  }
  if (post.meta.seriesOrder !== undefined && (!Number.isInteger(post.meta.seriesOrder) || post.meta.seriesOrder < 1)) {
    errors.push('系列顺序必须是大于 0 的整数');
  }
  return errors;
}

export function serializePost(post: PostDocument): string {
  const data: Record<string, unknown> = {
    title: post.meta.title.trim(),
    description: post.meta.description.trim(),
    pubDate: post.meta.pubDate,
  };
  if (post.meta.updatedDate) data.updatedDate = post.meta.updatedDate;
  data.tags = post.meta.tags;
  if (post.meta.featured) data.featured = true;
  if (post.meta.draft) data.draft = true;
  if (post.meta.series) data.series = post.meta.series;
  if (post.meta.seriesKey) data.seriesKey = post.meta.seriesKey;
  if (post.meta.seriesOrder) data.seriesOrder = post.meta.seriesOrder;
  if (post.meta.heroImage) data.heroImage = post.meta.heroImage;
  data.locale = post.meta.locale;
  data.translationKey = post.meta.translationKey.trim();

  return `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${post.body.trimStart()}`;
}

export function createPost(locale: Locale): PostDocument {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = `new-post-${stamp}`;
  const meta: PostMeta = {
    title: locale === 'zh' ? '未命名文章' : 'Untitled post',
    description: '',
    pubDate: stamp,
    tags: [],
    featured: false,
    draft: true,
    locale,
    translationKey: slug,
  };
  const relativePath = `src/content/posts/${locale}/${slug}.md`;
  const post = { relativePath, slug, meta, body: '## 第一节\n\n从这里开始写作。\n', raw: '', isNew: true };
  return { ...post, raw: serializePost(post) };
}
