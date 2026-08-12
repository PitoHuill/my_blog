import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen, LoaderCircle, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ArticleWorkspace } from './components/ArticleWorkspace';
import { HomeWorkspace } from './components/HomeWorkspace';
import { PreviewModal } from './components/PreviewModal';
import { PublishCenter } from './components/PublishCenter';
import { Sidebar, type AppSection } from './components/Sidebar';
import { api } from './lib/api';
import { getErrorMessage } from './lib/errors';
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
  const [workspaceDirty, setWorkspaceDirty] = useState(false);

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
      setError(getErrorMessage(reason, '无法读取博客状态'));
    } finally {
      setLoading(false);
    }
  }, [root]);

  useEffect(() => {
    if (root) void refreshInfo(root);
  }, []); // Load the remembered repository once.

  useEffect(() => {
    if (!workspaceDirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [workspaceDirty]);

  const confirmDiscard = (message: string) => !workspaceDirty || window.confirm(message);

  const changeSection = (next: AppSection) => {
    if (next === section) return;
    if (!confirmDiscard('当前页面有未保存修改，确定离开吗？')) return;
    setWorkspaceDirty(false);
    setSection(next);
  };

  const chooseRoot = async () => {
    if (!confirmDiscard('当前页面有未保存修改，确定更换博客目录吗？')) return;
    const selected = await open({ directory: true, multiple: false, title: '选择 Astro 博客目录' });
    if (typeof selected === 'string') {
      setWorkspaceDirty(false);
      await refreshInfo(selected);
    }
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
      setPreviewError(getErrorMessage(reason, '无法启动网站预览'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = useCallback(async () => {
    setPreviewPath(null);
    setPreviewUrl(null);
    await api.stopPreview().catch(() => undefined);
  }, []);

  if (!info) {
    return (
      <main className="connect-screen">
        <div className="connect-card">
          <div className="app-logo">P</div>
          <h1>连接你的 Astro 博客</h1>
          <p>选择包含 package.json 和 src/content/posts 的项目目录。路径只保存在这台电脑上。</p>
          {error && <div className="callout error" role="alert">{error}</div>}
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
      <Sidebar active={section} onChange={changeSection} />
      <main className={`app-main${error ? ' has-app-alert' : ''}`}>
        <header className="topbar">
          <div>
            <strong>Blog Publisher</strong>
            <span className="repo-name" title={info.name}>{info.name}</span>
          </div>
          <div className="repo-status">
            <span className={`status-dot ${info.releaseBranch ? 'green' : 'amber'}`} />
            <span className="repo-branch" title={info.branch}>{info.branch}</span>
            <button className="ghost" onClick={() => refreshInfo()} disabled={loading} aria-busy={loading}>
              {loading ? <LoaderCircle className="spin" size={15} /> : <RotateCw size={15} />}
              {loading ? '正在刷新' : '刷新状态'}
            </button>
          </div>
        </header>
        {error && (
          <div className="app-alert callout error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="关闭错误提示">关闭</button>
          </div>
        )}
        <div className="workspace">
          {section === 'articles' && <ArticleWorkspace root={root} onPreview={openPreview} onSaved={refreshInfo} onDirtyChange={setWorkspaceDirty} />}
          {section === 'home' && <HomeWorkspace root={root} onPreview={openPreview} onSaved={refreshInfo} onDirtyChange={setWorkspaceDirty} />}
          {section === 'publish' && <PublishCenter root={root} info={info} onRefresh={refreshInfo} />}
          {section === 'settings' && (
            <section className="settings-page page-pad">
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
