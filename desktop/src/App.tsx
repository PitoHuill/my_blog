import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen, LoaderCircle, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ArticleWorkspace } from './components/ArticleWorkspace';
import { HomeWorkspace } from './components/HomeWorkspace';
import { PreviewModal } from './components/PreviewModal';
import { PublishCenter } from './components/PublishCenter';
import { Sidebar, type AppSection } from './components/Sidebar';
import { api } from './lib/api';
import type { BlogInfo } from './types';

const ROOT_KEY = 'blog-publisher:root';

export default function App() {
  const [section, setSection] = useState<AppSection>('articles');
  const [root, setRoot] = useState(() => localStorage.getItem(ROOT_KEY) ?? '');
  const [info, setInfo] = useState<BlogInfo | null>(null);
  const [loading, setLoading] = useState(Boolean(root));
  const [error, setError] = useState('');
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const refreshInfo = useCallback(async (candidate = root) => {
    if (!candidate) return;
    setLoading(true);
    setError('');
    try {
      const next = await api.validateBlog(candidate);
      setInfo(next);
      setRoot(next.root);
      localStorage.setItem(ROOT_KEY, next.root);
    } catch (reason) {
      setInfo(null);
      setError(String(reason));
    } finally {
      setLoading(false);
    }
  }, [root]);

  useEffect(() => {
    if (root) void refreshInfo(root);
  }, []); // Load the remembered repository once.

  const chooseRoot = async () => {
    const selected = await open({ directory: true, multiple: false, title: '选择 Astro 博客目录' });
    if (typeof selected === 'string') await refreshInfo(selected);
  };

  const openPreview = async (path = '/') => {
    setPreviewPath(path);
    setPreviewUrl(null);
    setPreviewError('');
    setPreviewLoading(true);
    try {
      const base = await api.startPreview(root);
      setPreviewUrl(new URL(path.replace(/^\//, ''), base).toString());
    } catch (reason) {
      setPreviewError(String(reason));
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = async () => {
    setPreviewPath(null);
    setPreviewUrl(null);
    await api.stopPreview().catch(() => undefined);
  };

  if (!info) {
    return (
      <main className="connect-screen">
        <div className="connect-card">
          <div className="app-logo">P</div>
          <p className="eyebrow">BLOG PUBLISHER</p>
          <h1>连接你的 Astro 博客</h1>
          <p>选择包含 package.json 和 src/content/posts 的项目目录。路径只保存在这台电脑上。</p>
          {error && <div className="callout error">{error}</div>}
          <button className="primary large" onClick={chooseRoot} disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={19} /> : <FolderOpen size={19} />}
            {loading ? '正在检查…' : '选择博客目录'}
          </button>
          {root && !loading && <button className="text-button" onClick={() => refreshInfo(root)}><RotateCw size={15} />重试上次目录</button>}
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar active={section} onChange={setSection} />
      <main className="app-main">
        <header className="topbar">
          <div>
            <strong>Blog Publisher</strong>
            <span>{info.name}</span>
          </div>
          <div className="repo-status">
            <span className={`status-dot ${info.releaseBranch ? 'green' : 'amber'}`} />
            <span>{info.branch}</span>
            <button className="ghost" onClick={() => refreshInfo()}><RotateCw size={15} />刷新状态</button>
          </div>
        </header>
        <div className="workspace">
          {section === 'articles' && <ArticleWorkspace root={root} onPreview={openPreview} onSaved={refreshInfo} />}
          {section === 'home' && <HomeWorkspace root={root} onPreview={openPreview} onSaved={refreshInfo} />}
          {section === 'publish' && <PublishCenter root={root} info={info} onRefresh={refreshInfo} />}
          {section === 'settings' && (
            <section className="settings-page page-pad">
              <p className="eyebrow">设置</p>
              <h1>博客目录</h1>
              <div className="settings-card">
                <span>当前目录</span><code>{root}</code>
                <button className="secondary" onClick={chooseRoot}><FolderOpen size={17} />更换目录</button>
              </div>
              <div className="callout">桌面端只会写入文章、首页 JSON 配置和头像文件；发布前会阻止范围之外的修改。</div>
            </section>
          )}
        </div>
      </main>
      {previewPath !== null && (
        <PreviewModal
          url={previewUrl}
          loading={previewLoading}
          error={previewError}
          onClose={closePreview}
          onRefresh={() => openPreview(previewPath)}
        />
      )}
    </div>
  );
}
