import { open } from '@tauri-apps/plugin-dialog';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Eye, FilePlus2, ImagePlus, LoaderCircle, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Save, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/errors';
import { createPost, parsePost, serializePost, validatePost } from '../lib/frontmatter';
import type { Locale, PostDocument, PostMeta } from '../types';

type Filter = 'all' | 'draft' | 'published';

export function ArticleWorkspace({ root, onPreview, onSaved, onDirtyChange }: {
  root: string;
  onPreview: (path: string) => void;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
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
  const [listCollapsed, setListCollapsed] = useState(false);
  const [metaCollapsed, setMetaCollapsed] = useState(false);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

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
      setError(getErrorMessage(reason, '无法载入文章'));
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
    setNotice('');
    setError('');
  };

  const updateBody = (body: string) => {
    if (!current) return;
    setCurrent({ ...current, body });
    setDirty(true);
    setNotice('');
    setError('');
  };

  const newPost = (locale: Locale) => {
    if (dirty && !window.confirm('当前文章尚未保存，确定新建文章吗？')) return;
    setCurrent(createPost(locale));
    setDirty(true);
    setView('write');
    setNotice('');
    setError('');
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
    setNotice('');
    setError('');
  };

  const switchLocale = (locale: Locale) => {
    if (!current || locale === current.meta.locale) return;
    if (dirty && !window.confirm('当前文章尚未保存，确定切换语言版本吗？')) return;
    const pair = posts.find((post) => post.meta.translationKey === current.meta.translationKey && post.meta.locale === locale);
    if (pair) {
      setCurrent(structuredClone(pair));
      setDirty(false);
      setError('');
      setNotice('');
    }
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
      setError(getErrorMessage(reason, '保存文章失败'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const saveWithShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      if (!saving) void save();
    };
    window.addEventListener('keydown', saveWithShortcut);
    return () => window.removeEventListener('keydown', saveWithShortcut);
  }, [current, saving]);

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
      setError(getErrorMessage(reason, '导入图片失败'));
    }
  };

  const previewSite = () => {
    if (!current) return;
    const prefix = current.meta.locale === 'zh' ? '/zh' : '';
    onPreview(`${prefix}/posts/${current.slug}/`);
  };

  return (
    <section className={`article-workspace${listCollapsed ? ' list-collapsed' : ''}${metaCollapsed ? ' meta-collapsed' : ''}`} aria-busy={loading || saving}>
      <aside className="article-list-panel" hidden={listCollapsed} aria-label="文章列表">
        <button className="primary new-post" onClick={() => newPost('zh')}><FilePlus2 size={17} />新建文章</button>
        <div className="search-box"><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章…" aria-label="搜索文章" /></div>
        <div className="filter-tabs" aria-label="文章状态筛选">
          {([['all', '全部'], ['draft', '草稿'], ['published', '已发布']] as const).map(([id, label]) => (
            <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label}</button>
          ))}
        </div>
        <div className="article-list">
          {loading && <div className="empty"><LoaderCircle className="spin" />加载文章…</div>}
          {!loading && filtered.map((post) => (
            <button key={post.relativePath} className={current?.relativePath === post.relativePath ? 'article-row active' : 'article-row'} onClick={() => selectPost(post)} aria-current={current?.relativePath === post.relativePath ? 'true' : undefined}>
              <strong>{post.meta.title}</strong>
              <span>{post.meta.pubDate}<i className={post.meta.draft ? 'draft' : 'published'} />{post.meta.draft ? '草稿' : '已发布'}<b>{post.meta.locale.toUpperCase()}</b></span>
            </button>
          ))}
          {!loading && !filtered.length && <div className="empty">没有匹配的文章</div>}
        </div>
      </aside>

      {metaCollapsed && error && <div className="workspace-float callout error" role="alert">{error}</div>}
      {metaCollapsed && notice && <div className="workspace-float callout success" role="status" aria-live="polite">{notice}</div>}

      {!current ? (
        <div className="workspace-empty workspace-empty-state" role={error ? 'alert' : 'status'}>
          <div>
            <h2>{error ? '文章载入失败' : '还没有文章'}</h2>
            <p>{error || '新建第一篇文章开始写作。'}</p>
            {error
              ? <button className="secondary" onClick={() => loadPosts()}>重新载入</button>
              : <button className="primary" onClick={() => newPost('zh')}><FilePlus2 size={17} />新建文章</button>}
          </div>
        </div>
      ) : <>
        <div className="editor-panel">
          <div className="editor-toolbar">
            <div className="editor-toolbar__cluster">
              <button className="panel-toggle" onClick={() => setListCollapsed((value) => !value)} aria-label={listCollapsed ? '展开文章列表' : '收起文章列表'} title={listCollapsed ? '展开文章列表' : '收起文章列表'}>
                {listCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
              <div className="language-tabs">
                <button className={current.meta.locale === 'zh' ? 'active' : ''} onClick={() => switchLocale('zh')} aria-pressed={current.meta.locale === 'zh'}>中文</button>
                <button className={current.meta.locale === 'en' ? 'active' : ''} onClick={() => switchLocale('en')} aria-pressed={current.meta.locale === 'en'}>English</button>
              </div>
            </div>
            <div className="editor-actions">
              <button className={view === 'write' ? 'active' : ''} onClick={() => setView('write')} aria-pressed={view === 'write'}>编辑</button>
              <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')} aria-pressed={view === 'preview'}>预览</button>
              <button className="ghost" onClick={importImage}><ImagePlus size={16} />图片</button>
              <button className="panel-toggle" onClick={() => setMetaCollapsed((value) => !value)} aria-label={metaCollapsed ? '展开文章设置' : '收起文章设置'} title={metaCollapsed ? '展开文章设置' : '收起文章设置'}>
                {metaCollapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}
              </button>
            </div>
          </div>
          {view === 'write' ? (
            <textarea className="markdown-editor" value={current.body} onChange={(event) => updateBody(event.target.value)} spellCheck aria-label="文章正文 Markdown" />
          ) : (
            <article className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          )}
          <footer className="editor-footer" role="status" aria-live="polite">
            <span>{current.body.replace(/\s/g, '').length} 字</span>
            <span>{dirty ? '有未保存修改' : '已保存'}</span>
          </footer>
        </div>

        <aside className="metadata-panel" hidden={metaCollapsed} aria-label="文章设置">
          <div className="panel-heading">
            <div><h2>文章设置</h2><p>{current.meta.title || '未命名文章'}</p></div>
          </div>
          {error && <div className="callout error" role="alert">{error}</div>}
          {notice && <div className="callout success" role="status" aria-live="polite">{notice}</div>}
          <section className="metadata-section" aria-labelledby="article-basic-settings">
            <h3 id="article-basic-settings">基础信息</h3>
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
              setNotice('');
              setError('');
            }} /></label>
            <label>标签<input value={current.meta.tags.join(', ')} onChange={(event) => updateMeta('tags', event.target.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean))} placeholder="Astro, 写作" /></label>
          </section>
          <section className="metadata-section" aria-labelledby="article-series-settings">
            <h3 id="article-series-settings">翻译与系列</h3>
            <label>翻译键<input value={current.meta.translationKey} onChange={(event) => updateMeta('translationKey', event.target.value)} /></label>
            <label>系列名称<input value={current.meta.series ?? ''} onChange={(event) => updateMeta('series', event.target.value || undefined)} /></label>
            <div className="field-row">
              <label>系列键<input value={current.meta.seriesKey ?? ''} onChange={(event) => updateMeta('seriesKey', event.target.value || undefined)} /></label>
              <label>顺序<input type="number" min="1" value={current.meta.seriesOrder ?? ''} onChange={(event) => updateMeta('seriesOrder', event.target.value ? Number(event.target.value) : undefined)} /></label>
            </div>
          </section>
          <section className="metadata-section" aria-labelledby="article-publish-settings">
            <h3 id="article-publish-settings">发布状态</h3>
            <div className="switch-row"><span><strong>设为精选</strong><small>展示在首页精选区域</small></span><button type="button" role="switch" aria-label="设为精选" aria-checked={current.meta.featured} className={current.meta.featured ? 'switch on' : 'switch'} onClick={() => updateMeta('featured', !current.meta.featured)}><i /></button></div>
            <div className="switch-row"><span><strong>保存为草稿</strong><small>不会进入页面、搜索和 RSS</small></span><button type="button" role="switch" aria-label="保存为草稿" aria-checked={current.meta.draft} className={current.meta.draft ? 'switch on' : 'switch'} onClick={() => updateMeta('draft', !current.meta.draft)}><i /></button></div>
          </section>
          <div className="metadata-actions">
            <button className="secondary" onClick={previewSite}><Eye size={17} />网站预览</button>
            <button className="primary" onClick={save} disabled={saving} aria-busy={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}{saving ? '正在保存' : '保存文章'}</button>
          </div>
        </aside>
      </>}
    </section>
  );
}
