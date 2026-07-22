import { open } from '@tauri-apps/plugin-dialog';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Eye, FilePlus2, ImagePlus, LoaderCircle, Save, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { createPost, parsePost, serializePost, validatePost } from '../lib/frontmatter';
import type { Locale, PostDocument, PostMeta } from '../types';

type Filter = 'all' | 'draft' | 'published';

export function ArticleWorkspace({ root, onPreview, onSaved }: {
  root: string;
  onPreview: (path: string) => void;
  onSaved: () => Promise<void>;
}) {
  const [posts, setPosts] = useState<PostDocument[]>([]);
  const [current, setCurrent] = useState<PostDocument | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'write' | 'preview'>('write');

  const loadPosts = async (selectPath?: string) => {
    setLoading(true);
    setError('');
    try {
      const files = await api.scanPosts(root);
      const parsed = files.map((file) => parsePost(file.relativePath, file.content));
      parsed.sort((left, right) => right.meta.pubDate.localeCompare(left.meta.pubDate));
      setPosts(parsed);
      const selected = parsed.find((post) => post.relativePath === selectPath) ?? parsed[0] ?? null;
      setCurrent(selected ? structuredClone(selected) : null);
      setDirty(false);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPosts(); }, [root]);

  const filtered = useMemo(() => posts.filter((post) => {
    const matchesQuery = `${post.meta.title} ${post.meta.description} ${post.meta.tags.join(' ')}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'draft' ? post.meta.draft : !post.meta.draft);
    return matchesQuery && matchesFilter;
  }), [posts, query, filter]);

  const previewHtml = useMemo(() => {
    if (!current) return '';
    return DOMPurify.sanitize(marked.parse(current.body) as string);
  }, [current?.body]);

  const selectPost = (post: PostDocument) => {
    if (dirty && !window.confirm('当前文章尚未保存，确定切换吗？')) return;
    setCurrent(structuredClone(post));
    setDirty(false);
    setError('');
    setNotice('');
  };

  const updateMeta = <K extends keyof PostMeta>(key: K, value: PostMeta[K]) => {
    if (!current) return;
    setCurrent({ ...current, meta: { ...current.meta, [key]: value } });
    setDirty(true);
  };

  const updateBody = (body: string) => {
    if (!current) return;
    setCurrent({ ...current, body });
    setDirty(true);
  };

  const newPost = (locale: Locale) => {
    if (dirty && !window.confirm('当前文章尚未保存，确定新建文章吗？')) return;
    setCurrent(createPost(locale));
    setDirty(true);
    setView('write');
  };

  const createTranslation = (locale: Locale) => {
    if (!current) return;
    const translated: PostDocument = {
      ...structuredClone(current),
      relativePath: `src/content/posts/${locale}/${current.slug}.md`,
      meta: {
        ...current.meta,
        locale,
        title: locale === 'zh' ? '未命名译文' : 'Untitled translation',
        description: '',
        draft: true,
      },
      body: locale === 'zh' ? '## 第一节\n\n从这里开始翻译。\n' : '## First section\n\nStart translating here.\n',
      isNew: true,
    };
    setCurrent(translated);
    setDirty(true);
  };

  const switchLocale = (locale: Locale) => {
    if (!current || locale === current.meta.locale) return;
    const pair = posts.find((post) => post.meta.translationKey === current.meta.translationKey && post.meta.locale === locale);
    if (pair) selectPost(pair);
    else createTranslation(locale);
  };

  const save = async () => {
    if (!current) return;
    const errors = validatePost(current);
    if (errors.length) {
      setError(errors.join('；'));
      return;
    }
    const relativePath = current.isNew
      ? `src/content/posts/${current.meta.locale}/${current.slug}.md`
      : current.relativePath;
    setSaving(true);
    setError('');
    try {
      await api.savePost(root, relativePath, serializePost({ ...current, relativePath }));
      await loadPosts(relativePath);
      await onSaved();
      setNotice('文章已保存');
    } catch (reason) {
      setError(String(reason));
    } finally {
      setSaving(false);
    }
  };

  const importImage = async () => {
    if (!current) return;
    const selected = await open({
      multiple: false,
      title: '选择文章图片',
      filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'] }],
    });
    if (typeof selected !== 'string') return;
    try {
      const path = await api.importImage(root, selected, current.slug);
      updateBody(`${current.body.trimEnd()}\n\n![图片说明](${path})\n`);
      setNotice('图片已导入并插入正文');
    } catch (reason) {
      setError(String(reason));
    }
  };

  const previewSite = () => {
    if (!current) return;
    const prefix = current.meta.locale === 'zh' ? '/zh' : '';
    onPreview(`${prefix}/posts/${current.slug}/`);
  };

  return (
    <section className="article-workspace">
      <aside className="article-list-panel">
        <button className="primary new-post" onClick={() => newPost('zh')}><FilePlus2 size={17} />新建文章</button>
        <div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章…" /></div>
        <div className="filter-tabs">
          {([['all', '全部'], ['draft', '草稿'], ['published', '已发布']] as const).map(([id, label]) => (
            <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
        <div className="article-list">
          {loading && <div className="empty"><LoaderCircle className="spin" />加载文章…</div>}
          {!loading && filtered.map((post) => (
            <button key={post.relativePath} className={current?.relativePath === post.relativePath ? 'article-row active' : 'article-row'} onClick={() => selectPost(post)}>
              <strong>{post.meta.title}</strong>
              <span>{post.meta.pubDate}<i className={post.meta.draft ? 'draft' : 'published'} />{post.meta.draft ? '草稿' : '已发布'}<b>{post.meta.locale.toUpperCase()}</b></span>
            </button>
          ))}
          {!loading && !filtered.length && <div className="empty">没有匹配的文章</div>}
        </div>
      </aside>

      {!current ? <div className="workspace-empty">新建第一篇文章开始写作</div> : <>
        <div className="editor-panel">
          <div className="editor-toolbar">
            <div className="language-tabs">
              <button className={current.meta.locale === 'zh' ? 'active' : ''} onClick={() => switchLocale('zh')}>中文</button>
              <button className={current.meta.locale === 'en' ? 'active' : ''} onClick={() => switchLocale('en')}>English</button>
            </div>
            <div className="editor-actions">
              <button className={view === 'write' ? 'active' : ''} onClick={() => setView('write')}>编辑</button>
              <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')}>预览</button>
              <button className="ghost" onClick={importImage}><ImagePlus size={16} />图片</button>
            </div>
          </div>
          {view === 'write' ? (
            <textarea className="markdown-editor" value={current.body} onChange={(event) => updateBody(event.target.value)} spellCheck />
          ) : (
            <article className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          )}
          <footer className="editor-footer">
            <span>{current.body.replace(/\s/g, '').length} 字</span>
            <span>{dirty ? '有未保存修改' : '已保存'}</span>
          </footer>
        </div>

        <aside className="metadata-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">文章设置</p><h2>{current.meta.title || '未命名文章'}</h2></div>
          </div>
          {error && <div className="callout error">{error}</div>}
          {notice && <div className="callout success">{notice}</div>}
          <label>标题<input value={current.meta.title} onChange={(event) => updateMeta('title', event.target.value)} /></label>
          <label>摘要<textarea rows={3} value={current.meta.description} onChange={(event) => updateMeta('description', event.target.value)} /></label>
          <div className="field-row">
            <label>发布日期<input type="date" value={current.meta.pubDate} onChange={(event) => updateMeta('pubDate', event.target.value)} /></label>
            <label>语言<select value={current.meta.locale} onChange={(event) => updateMeta('locale', event.target.value as Locale)} disabled={!current.isNew}><option value="zh">中文</option><option value="en">English</option></select></label>
          </div>
          <label>Slug<input value={current.slug} disabled={!current.isNew} onChange={(event) => {
            const slug = event.target.value.toLowerCase();
            setCurrent({ ...current, slug, meta: { ...current.meta, translationKey: current.meta.translationKey === current.slug ? slug : current.meta.translationKey } });
            setDirty(true);
          }} /></label>
          <label>翻译键<input value={current.meta.translationKey} onChange={(event) => updateMeta('translationKey', event.target.value)} /></label>
          <label>标签<input value={current.meta.tags.join(', ')} onChange={(event) => updateMeta('tags', event.target.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} placeholder="Astro, 写作" /></label>
          <label>系列名称<input value={current.meta.series ?? ''} onChange={(event) => updateMeta('series', event.target.value || undefined)} /></label>
          <div className="field-row">
            <label>系列键<input value={current.meta.seriesKey ?? ''} onChange={(event) => updateMeta('seriesKey', event.target.value || undefined)} /></label>
            <label>顺序<input type="number" min="1" value={current.meta.seriesOrder ?? ''} onChange={(event) => updateMeta('seriesOrder', event.target.value ? Number(event.target.value) : undefined)} /></label>
          </div>
          <div className="switch-row"><span><strong>设为精选</strong><small>展示在首页精选区域</small></span><button className={current.meta.featured ? 'switch on' : 'switch'} onClick={() => updateMeta('featured', !current.meta.featured)}><i /></button></div>
          <div className="switch-row"><span><strong>保存为草稿</strong><small>不会进入页面、搜索和 RSS</small></span><button className={current.meta.draft ? 'switch on' : 'switch'} onClick={() => updateMeta('draft', !current.meta.draft)}><i /></button></div>
          <div className="metadata-actions">
            <button className="secondary" onClick={previewSite}><Eye size={17} />网站预览</button>
            <button className="primary" onClick={save} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}保存文章</button>
          </div>
        </aside>
      </>}
    </section>
  );
}
