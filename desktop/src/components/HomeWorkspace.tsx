import { open } from '@tauri-apps/plugin-dialog';
import { ArrowDown, ArrowUp, Eye, ImagePlus, LoaderCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { HomeConfig, HomeSectionId, Locale, SiteContent } from '../types';

const sectionLabels: Record<HomeSectionId, string> = {
  featured: '精选文章',
  now: '近期状态',
  latest: '最新文章',
  projects: '项目展示',
};

export function HomeWorkspace({ root, onPreview, onSaved }: {
  root: string;
  onPreview: (path: string) => void;
  onSaved: () => Promise<void>;
}) {
  const [site, setSite] = useState<SiteContent | null>(null);
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [locale, setLocale] = useState<Locale>('zh');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.loadSiteContent(root), api.loadHomeConfig(root)])
      .then(([nextSite, nextConfig]) => {
        setSite(nextSite);
        setConfig(nextConfig);
        setDirty(false);
      })
      .catch((reason) => setError(String(reason)))
      .finally(() => setLoading(false));
  }, [root]);

  const updateProfile = (field: 'name' | 'email' | 'github', value: string) => {
    if (!site) return;
    setSite({ ...site, profile: { ...site.profile, [field]: value } });
    setDirty(true);
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
    setDirty(true);
  };

  const toggleSidebar = (key: keyof HomeConfig['sidebar']) => {
    if (!config) return;
    setConfig({ ...config, sidebar: { ...config.sidebar, [key]: !config.sidebar[key] } });
    setDirty(true);
  };

  const toggleSection = (id: HomeSectionId) => {
    if (!config) return;
    setConfig({ ...config, mainSections: config.mainSections.map((section) => section.id === id ? { ...section, visible: !section.visible } : section) });
    setDirty(true);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    if (!config) return;
    const target = index + direction;
    if (target < 0 || target >= config.mainSections.length) return;
    const sections = [...config.mainSections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setConfig({ ...config, mainSections: sections });
    setDirty(true);
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
      setError(String(reason));
    } finally {
      setSaving(false);
    }
  };

  const replaceAvatar = async () => {
    const selected = await open({
      multiple: false,
      title: '选择 JPG 头像',
      filters: [{ name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] }],
    });
    if (typeof selected !== 'string') return;
    try {
      await api.importAvatar(root, selected);
      setDirty(true);
      setNotice('头像已替换，保存并预览即可查看');
    } catch (reason) {
      setError(String(reason));
    }
  };

  if (loading || !site || !config) return <div className="workspace-empty"><LoaderCircle className="spin" />正在载入首页配置…</div>;

  const profile = site.profile;
  return (
    <section className="home-workspace">
      <aside className="module-panel">
        <div className="panel-title"><p className="eyebrow">结构</p><h2>首页模块</h2></div>
        <p className="panel-hint">控制模块显示状态，并调整主内容的顺序。</p>
        <div className="module-group">
          <span>侧栏</span>
          {([
            ['profile', '个人介绍'],
            ['stats', '数据统计'],
            ['links', '精选链接'],
          ] as const).map(([id, label]) => (
            <div className="module-row" key={id}><strong>{label}</strong><button className={config.sidebar[id] ? 'switch on' : 'switch'} onClick={() => toggleSidebar(id)}><i /></button></div>
          ))}
        </div>
        <div className="module-group">
          <span>主内容</span>
          {config.mainSections.map((section, index) => (
            <div className="module-row reorder" key={section.id}>
              <div className="reorder-buttons">
                <button onClick={() => moveSection(index, -1)} disabled={index === 0}><ArrowUp size={13} /></button>
                <button onClick={() => moveSection(index, 1)} disabled={index === config.mainSections.length - 1}><ArrowDown size={13} /></button>
              </div>
              <strong>{sectionLabels[section.id]}</strong>
              <button className={section.visible ? 'switch on' : 'switch'} onClick={() => toggleSection(section.id)}><i /></button>
            </div>
          ))}
        </div>
      </aside>

      <div className="home-canvas-wrap">
        <div className="canvas-toolbar">
          <div><strong>首页画布</strong><span>{locale === 'zh' ? '/zh/' : '/'}</span></div>
          <button className="secondary" onClick={() => onPreview(locale === 'zh' ? '/zh/' : '/')}><Eye size={16} />真实预览</button>
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
                if (section.id === 'featured') return <div className="preview-section" key={section.id}><label>精选文章</label><article><small>FEATURED</small><h2>建立一套温和的阅读工作流</h2><p>把输入、标注与复盘分成轻量的阶段。</p></article></div>;
                if (section.id === 'now') return <div className="preview-now" key={section.id}><b>此刻</b><span>{profile.now[locale]}</span><em>→</em></div>;
                if (section.id === 'latest') return <div className="preview-section" key={section.id}><label>最新文章</label><article><h2>为什么我选择了 Astro 搭建个人博客</h2><p>从性能、开发体验到部署成本的思考。</p></article><article><h2>在数字花园中积累思考</h2></article></div>;
                return <div className="preview-section" key={section.id}><label>项目展示</label><article><h2>个人知识花园</h2><p>一个持续更新的笔记、研究与作品索引。</p></article></div>;
              })}
            </main>
          </div>
        </div>
      </div>

      <aside className="home-settings metadata-panel">
        <div className="panel-heading"><div><p className="eyebrow">内容</p><h2>个人资料</h2></div></div>
        <div className="language-tabs settings-language"><button className={locale === 'zh' ? 'active' : ''} onClick={() => setLocale('zh')}>中文</button><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>English</button></div>
        {error && <div className="callout error">{error}</div>}
        {notice && <div className="callout success">{notice}</div>}
        <label>姓名<input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} /></label>
        <label>首页标语<input value={profile.tagline[locale]} onChange={(event) => updateLocalized('tagline', event.target.value)} /></label>
        <label>个人介绍<textarea rows={3} value={profile.bio[locale]} onChange={(event) => updateLocalized('bio', event.target.value)} /></label>
        <label>近期状态<textarea rows={3} value={profile.now[locale]} onChange={(event) => updateLocalized('now', event.target.value)} /></label>
        <label>邮箱<input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} /></label>
        <label>GitHub<input value={profile.github} onChange={(event) => updateProfile('github', event.target.value)} /></label>
        <button className="secondary wide" onClick={replaceAvatar}><ImagePlus size={17} />更换 JPG 头像</button>
        <div className="metadata-actions home-actions">
          <span>{dirty ? '有未保存修改' : '所有修改已保存'}</span>
          <button className="primary" onClick={save} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}保存首页</button>
        </div>
      </aside>
    </section>
  );
}
