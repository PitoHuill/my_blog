import { CheckCircle2, Circle, GitBranch, LoaderCircle, Rocket, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import type { BlogInfo } from '../types';

type StageState = 'idle' | 'running' | 'success' | 'error';
type Stage = { id: 'unit' | 'build'; title: string; description: string; state: StageState };

export function PublishCenter({ root, info, onRefresh }: {
  root: string;
  info: BlogInfo;
  onRefresh: () => Promise<void>;
}) {
  const [stages, setStages] = useState<Stage[]>([
    { id: 'unit', title: '内容与单元测试', description: '检查双语内容、链接和数据结构', state: 'idle' },
    { id: 'build', title: '生产构建', description: '执行 Astro 静态站点构建', state: 'idle' },
  ]);
  const [message, setMessage] = useState('content: publish blog updates');
  const [running, setRunning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [log, setLog] = useState('尚未开始检查。');
  const [result, setResult] = useState('');

  const updateStage = (id: Stage['id'], state: StageState) => {
    setStages((current) => current.map((stage) => stage.id === id ? { ...stage, state } : stage));
  };

  const runChecks = async () => {
    setRunning(true);
    setResult('');
    setLog('开始执行发布前检查…');
    for (const stage of stages) {
      updateStage(stage.id, 'running');
      try {
        const output = await api.runProjectCheck(root, stage.id);
        setLog((current) => `${current}\n\n$ npm run ${stage.id === 'unit' ? 'test:unit' : 'build'}\n${output.stdout}${output.stderr}`.trim());
        if (!output.ok) {
          updateStage(stage.id, 'error');
          setRunning(false);
          return;
        }
        updateStage(stage.id, 'success');
      } catch (reason) {
        updateStage(stage.id, 'error');
        setLog((current) => `${current}\n${String(reason)}`);
        setRunning(false);
        return;
      }
    }
    setRunning(false);
    setResult('所有检查已通过，可以发布。');
    await onRefresh();
  };

  const publish = async () => {
    setPublishing(true);
    setResult('');
    try {
      const published = await api.publishChanges(root, message);
      setResult(`发布成功：${published.branch} · ${published.commit}`);
      setLog((current) => `${current}\n\nGit 提交 ${published.commit} 已推送，GitHub Actions 将继续部署。`);
      await onRefresh();
    } catch (reason) {
      setResult(String(reason));
    } finally {
      setPublishing(false);
    }
  };

  const allPassed = stages.every((stage) => stage.state === 'success');
  const iconFor = (state: StageState) => {
    if (state === 'running') return <LoaderCircle className="spin" />;
    if (state === 'success') return <CheckCircle2 className="success-icon" />;
    if (state === 'error') return <XCircle className="error-icon" />;
    return <Circle />;
  };

  return (
    <section className="publish-page page-pad">
      <div className="publish-heading">
        <div><p className="eyebrow">PUBLISH CENTER</p><h1>检查并发布网站</h1><p>只有测试和生产构建都通过后，才能执行 Git 发布。</p></div>
        <div className={`branch-card ${info.releaseBranch ? 'ready' : ''}`}><GitBranch size={20} /><span>当前分支<strong>{info.branch}</strong></span></div>
      </div>

      {!info.releaseBranch && <div className="callout warning"><ShieldCheck size={18} /><span>当前不是发布分支。你可以运行检查，但“发布到线上”只在 main/master 分支启用。</span></div>}

      <div className="publish-grid">
        <div>
          <div className="check-card">
            <header><div><h2>发布前检查</h2><p>{info.dirtyFiles.length} 个文件发生修改</p></div><button className="secondary" disabled={running || publishing} onClick={runChecks}>{running ? <LoaderCircle className="spin" size={17} /> : <ShieldCheck size={17} />}运行全部检查</button></header>
            <div className="stage-list">
              {stages.map((stage) => <div className={`stage ${stage.state}`} key={stage.id}>{iconFor(stage.state)}<span><strong>{stage.title}</strong><small>{stage.description}</small></span></div>)}
              <div className={`stage ${allPassed ? 'success' : 'idle'}`}>{allPassed ? <CheckCircle2 className="success-icon" /> : <Circle />}<span><strong>Git 提交与推送</strong><small>只提交文章、首页配置和头像</small></span></div>
            </div>
          </div>

          <div className="publish-action-card">
            <label>提交说明<input value={message} maxLength={120} onChange={(event) => setMessage(event.target.value)} /></label>
            <button className="primary publish-button" disabled={!allPassed || !info.releaseBranch || publishing} onClick={publish}>{publishing ? <LoaderCircle className="spin" /> : <Rocket />}发布到线上</button>
            {result && <div className={result.includes('成功') || result.includes('通过') ? 'callout success' : 'callout warning'}>{result}</div>}
          </div>
        </div>

        <aside>
          <div className="changes-card">
            <h2>待发布修改</h2>
            {info.dirtyFiles.length ? <ul>{info.dirtyFiles.map((file) => <li key={file}>{file}</li>)}</ul> : <p>工作区没有修改。</p>}
          </div>
          <div className="log-card"><header><h2>运行日志</h2></header><pre>{log}</pre></div>
        </aside>
      </div>
    </section>
  );
}
