import { open } from '@tauri-apps/plugin-dialog';
import { ArrowDown, ArrowUp, Eye, ImagePlus, LoaderCircle, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/errors';
import type { HomeConfig, HomeSectionId, Locale, SiteContent } from '../types';

const sectionLabels: Record<HomeSectionId, string> = {
  featured: '精选文章',
  now: '近期状态',
  latest: '最新文章',
  projects: '项目展示',
};

export function HomeWorkspace({ root, onPreview, onSaved, onDirtyChange }: {
  root: string;
  onPreview: (path: string) => void;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [site, setSite] = useState<SiteContent | null>(null);
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [locale, setLocale] = useState<Locale>('zh');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [structureCollapsed, setStructureCollapsed] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [importingAvatar, setImportingAvatar] = useState(false);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextSite, nextConfig] = await Promise.all([api.loadSiteContent(root), api.loadHomeConfig(root)]);
      setSite(nextSite);
      setConfig(nextConfig);
      setDirty(false);
    } catch (reason) {
      setError(getErrorMessage(reason, '无法载入首页配置'));
    } finally {
      setLoading(false);
    }
  }, [root]);

  useEffect(() => { void loadHome(); }, [loadHome]);

  const markDirty = () => {
    setDirty(true);
    setNotice('');
    setError('');
  };

  const updateProfile = (field: 'name' | 'email' | 'github', value: string) => {
    if (!site) return;
    setSite({ ...site, profile: { ...site.profile, [field]: value } });
    markDirty();
  };

  const updateLocalized = (field: 'tagline' | 'bio' | 'now', value: string) => {
    if (!site) return;
    setSite({
      ...site,
      profile: {
        ...site.profile,
        [field]: { ...site.profile[field], [locale]: value },
      },
    });
    markDirty();
  };

  const toggleSidebar = (key: keyof HomeConfig['sidebar']) => {
    if (!config) return;
    setConfig({ ...config, sidebar: { ...config.sidebar, [key]: !config.sidebar[key] } });
    markDirty();
  };

  const toggleSection = (id: HomeSectionId) => {
    if (!config) return;
    setConfig({ ...config, mainSections: config.mainSections.map((section) => section.id === id ? { ...section, visible: !section.visible } : section) });
    markDirty();
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    if (!config) return;
    const target = index + direction;
    if (target < 0 || target >= config.mainSections.length) return;
    const sections = [...config.mainSections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setConfig({ ...config, mainSections: sections });
    markDirty();
  };

  const save = async () => {
    if (!site || !config) return;
    if (!site.profile.name.trim() || !site.profile.tagline.en.trim() || !site.profile.tagline.zh.trim()) {
      setError('姓名和中英文首页标语不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.saveSiteContent(root, site);
      await api.saveHomeConfig(root, config);
      await onSaved();
      setDirty(false);
      setNotice('首页配置已保存');
    } catch (reason) {
      setError(getErrorMessage(reason, '保存首页配置失败'));
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
  }, [site, config, saving]);

  const replaceAvatar = async () => {
    const selected = await open({
      multiple: false,
      title: '选择 JPG 头像',
      filters: [{ name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] }],
    });
    if (typeof selected !== 'string') return;
    setImportingAvatar(true);
    setError('');
    setNotice('');
    try {
      await api.importAvatar(root, selected);
      setDirty(true);
      setNotice('头像已替换，保存并预览即可查看');
    } catch (reason) {
      setError(getErrorMessage(reason, '替换头像失败'));
    } finally {
      setImportingAvatar(false);
    }
  };

  if (loading && (!site || !config)) return <div className="workspace-empty" role="status"><LoaderCircle className="spin" />正在载入首页配置…</div>;
  if (!site || !config) {
    return (
      <div className="workspace-empty workspace-empty-state" role="alert">
        <div>
          <h2>首页配置载入失败</h2>
          <p>{error || '暂时无法读取首页配置。'}</p>
          <button className="secondary" onClick={loadHome}>重新载入</button>
        </div>
      </div>
    );
  }

  const profile = site.profile;
  return (
    <section className={`home-workspace${structureCollapsed ? ' structure-collapsed' : ''}${settingsCollapsed ? ' settings-collapsed' : ''}`} aria-busy={loading || saving || importingAvatar}>
      <aside className="module-panel" hidden={structureCollapsed} aria-label="首页结构">
        <div className="panel-title"><h2>首页模块</h2></div>
        <p className="panel-hint">控制模块显示状态，并调整主内容的顺序。</p>
        <div className="module-group">
          <span>侧栏</span>
          {([
            ['profile', '个人介绍'],
            ['stats', '数据统计'],
            ['links', '精选链接'],
          ] as const).map(([id, label]) => (
            <div className="module-row" key={id}><strong>{label}</strong><button type="button" role="switch" aria-label={label} aria-checked={config.sidebar[id]} className={config.sidebar[id] ? 'switch on' : 'switch'} onClick={() => toggleSidebar(id)}><i /></button></div>
          ))}
        </div>
        <div className="module-group">
          <span>主内容</span>
          {config.mainSections.map((section, index) => (
            <div className="module-row reorder" key={section.id}>
              <div className="reorder-buttons">
                <button aria-label={`上移${sectionLabels[section.id]}`} title={`上移${sectionLabels[section.id]}`} onClick={() => moveSection(index, -1)} disabled={index === 0}><ArrowUp size={13} /></button>
                <button aria-label={`下移${sectionLabels[section.id]}`} title={`下移${sectionLabels[section.id]}`} onClick={() => moveSection(index, 1)} disabled={index === config.mainSections.length - 1}><ArrowDown size={13} /></button>
              </div>
              <strong>{sectionLabels[section.id]}</strong>
              <button type="button" role="switch" aria-label={`显示${sectionLabels[section.id]}`} aria-checked={section.visible} className={section.visible ? 'switch on' : 'switch'} onClick={() => toggleSection(section.id)}><i /></button>
            </div>
          ))}
        </div>
      </aside>

      {settingsCollapsed && error && <div className="workspace-float callout error" role="alert">{error}</div>}
      {settingsCollapsed && notice && <div className="workspace-float callout success" role="status" aria-live="polite">{notice}</div>}

      <div className="home-canvas-wrap">
        <div className="canvas-toolbar">
          <div className="canvas-toolbar__start">
            <button className="panel-toggle" onClick={() => setStructureCollapsed((value) => !value)} aria-label={structureCollapsed ? '展开首页结构' : '收起首页结构'} title={structureCollapsed ? '展开首页结构' : '收起首页结构'}>
              {structureCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
            <strong>首页画布</strong><span>{locale === 'zh' ? '/zh/' : '/'}</span>
          </div>
          <div className="canvas-toolbar__actions">
            <button className="secondary" onClick={() => onPreview(locale === 'zh' ? '/zh/' : '/')}><Eye size={16} />真实预览</button>
            <button className="panel-toggle" onClick={() => setSettingsCollapsed((value) => !value)} aria-label={settingsCollapsed ? '展开个人资料' : '收起个人资料'} title={settingsCollapsed ? '展开个人资料' : '收起个人资料'}>
              {settingsCollapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}
            </button>
          </div>
        </div>
        <div className="home-canvas">
          <header><strong>{profile.name}</strong><nav>首页　文章　系列　项目　关于</nav></header>
          <div className="home-preview-grid">
            <aside>
              {config.sidebar.profile && <div className="preview-profile selected-block">
                <div className="avatar-placeholder">{profile.name.slice(0, 1).toUpperCase()}</div>
                <h2>{profile.name}</h2>
                <p>{profile.tagline[locale]}</p>
                <small>{profile.bio[locale]}</small>
              </div>}
              {config.sidebar.stats && <div className="preview-stats"><b>4<small>文章</small></b><b>{site.projects.length}<small>项目</small></b><b>3<small>成果</small></b></div>}
              {config.sidebar.links && <div className="preview-links"><strong>精选链接</strong><span>关于我 →</span><span>文章系列 →</span><span>全部项目 →</span></div>}
            </aside>
            <main>
              {config.mainSections.filter((section) => section.visible).map((section) => {
                if (section.id === 'featured') return <div className="preview-section preview-feature" key={section.id}><label>精选文章</label><article><h2>建立一套温和的阅读工作流</h2><p>把输入、标注与复盘分成轻量的阶段。</p></article></div>;
                if (section.id === 'now') return <div className="preview-now" key={section.id}><b>此刻</b><span>{profile.now[locale]}</span><em>→</em></div>;
                if (section.id === 'latest') return <div className="preview-section preview-latest" key={section.id}><label>最新文章</label><article><h2>为什么我选择了 Astro 搭建个人博客</h2><p>从性能、开发体验到部署成本的思考。</p></article><article><h2>在数字花园中积累思考</h2></article></div>;
                return <div className="preview-section preview-projects" key={section.id}><label>项目展示</label><article><h2>个人知识花园</h2><p>一个持续更新的笔记、研究与作品索引。</p></article></div>;
              })}
            </main>
          </div>
        </div>
      </div>

      <aside className="home-settings metadata-panel" hidden={settingsCollapsed} aria-label="个人资料设置">
        <div className="panel-heading"><div><h2>个人资料</h2><p>首页身份与联系信息</p></div></div>
        <div className="language-tabs settings-language"><button className={locale === 'zh' ? 'active' : ''} onClick={() => setLocale('zh')} aria-pressed={locale === 'zh'}>中文</button><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')} aria-pressed={locale === 'en'}>English</button></div>
        {error && <div className="callout error" role="alert">{error}</div>}
        {notice && <div className="callout success" role="status" aria-live="polite">{notice}</div>}
        <section className="metadata-section" aria-labelledby="home-identity-settings">
          <h3 id="home-identity-settings">身份与近况</h3>
          <label>姓名<input value={profile.name} maxLength={80} required onChange={(event) => updateProfile('name', event.target.value)} /></label>
          <label>首页标语<input value={profile.tagline[locale]} maxLength={160} required onChange={(event) => updateLocalized('tagline', event.target.value)} /></label>
          <label>个人介绍<textarea rows={3} value={profile.bio[locale]} maxLength={600} onChange={(event) => updateLocalized('bio', event.target.value)} /></label>
          <label>近期状态<textarea rows={3} value={profile.now[locale]} maxLength={400} onChange={(event) => updateLocalized('now', event.target.value)} /></label>
        </section>
        <section className="metadata-section" aria-labelledby="home-contact-settings">
          <h3 id="home-contact-settings">联系与头像</h3>
          <label>邮箱<input type="email" value={profile.email} maxLength={254} onChange={(event) => updateProfile('email', event.target.value)} /></label>
          <label>GitHub<input type="url" value={profile.github} maxLength={240} onChange={(event) => updateProfile('github', event.target.value)} /></label>
          <button className="secondary wide" onClick={replaceAvatar} disabled={importingAvatar} aria-busy={importingAvatar}>{importingAvatar ? <LoaderCircle className="spin" size={17} /> : <ImagePlus size={17} />}{importingAvatar ? '正在导入头像' : '更换 JPG 头像'}</button>
        </section>
        <div className="metadata-actions home-actions">
          <span role="status" aria-live="polite">{dirty ? '有未保存修改' : '所有修改已保存'}</span>
          <button className="primary" onClick={save} disabled={saving} aria-busy={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}{saving ? '正在保存' : '保存首页'}</button>
        </div>
      </aside>
    </section>
  );
}
