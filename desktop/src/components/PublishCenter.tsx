import { CheckCircle2, Circle, GitBranch, LoaderCircle, Rocket, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/errors';
import type { BlogInfo } from '../types';

type StageState = 'idle' | 'running' | 'success' | 'error';
type Stage = { id: 'unit' | 'build'; title: string; description: string; state: StageState };
type Result = { tone: 'success' | 'error' | 'warning'; message: string } | null;

const initialStages: Stage[] = [
  { id: 'unit', title: '内容与单元测试', description: '检查双语内容、链接和数据结构', state: 'idle' },
  { id: 'build', title: '生产构建', description: '执行 Astro 静态站点构建', state: 'idle' },
];

export function PublishCenter({ root, info, onRefresh }: {
  root: string;
  info: BlogInfo;
  onRefresh: () => Promise<void>;
}) {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [message, setMessage] = useState('content: publish blog updates');
  const [running, setRunning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [log, setLog] = useState('尚未开始检查。');
  const [result, setResult] = useState<Result>(null);

  const updateStage = (id: Stage['id'], state: StageState) => {
    setStages((current) => current.map((stage) => stage.id === id ? { ...stage, state } : stage));
  };

  const runChecks = async () => {
    setRunning(true);
    setResult(null);
    setStages(initialStages.map((stage) => ({ ...stage })));
    setLog('开始执行发布前检查…');
    for (const stage of initialStages) {
      updateStage(stage.id, 'running');
      try {
        const output = await api.runProjectCheck(root, stage.id);
        setLog((current) => `${current}\n\n$ npm run ${stage.id === 'unit' ? 'test:unit' : 'build'}\n${output.stdout}${output.stderr}`.trim());
        if (!output.ok) {
          updateStage(stage.id, 'error');
          setResult({ tone: 'error', message: `${stage.title}未通过。请查看运行日志，修复问题后重新检查。` });
          setRunning(false);
          return;
        }
        updateStage(stage.id, 'success');
      } catch (reason) {
        updateStage(stage.id, 'error');
        const message = getErrorMessage(reason, `无法运行${stage.title}`);
        setLog((current) => `${current}\n${message}`);
        setResult({ tone: 'error', message });
        setRunning(false);
        return;
      }
    }
    setRunning(false);
    setResult({ tone: 'success', message: '所有检查已通过，可以发布。' });
    await onRefresh();
  };

  const publish = async () => {
    const commitMessage = message.trim();
    if (!commitMessage) {
      setResult({ tone: 'error', message: '请填写提交说明后再发布。' });
      return;
    }
    setPublishing(true);
    setResult(null);
    try {
      const published = await api.publishChanges(root, commitMessage);
      setResult({ tone: 'success', message: `发布成功：${published.branch} · ${published.commit}` });
      setLog((current) => `${current}\n\nGit 提交 ${published.commit} 已推送，GitHub Actions 将继续部署。`);
      await onRefresh();
    } catch (reason) {
      setResult({ tone: 'error', message: getErrorMessage(reason, '发布失败') });
    } finally {
      setPublishing(false);
    }
  };

  const allPassed = stages.every((stage) => stage.state === 'success');
  const hasMessage = Boolean(message.trim());
  const stateLabel: Record<StageState, string> = {
    idle: '尚未运行',
    running: '正在运行',
    success: '已通过',
    error: '未通过',
  };
  const iconFor = (state: StageState) => {
    if (state === 'running') return <LoaderCircle className="spin" />;
    if (state === 'success') return <CheckCircle2 className="success-icon" />;
    if (state === 'error') return <XCircle className="error-icon" />;
    return <Circle />;
  };

  return (
    <section className="publish-page page-pad" aria-busy={running || publishing}>
      <div className="publish-heading">
        <div><h1>检查并发布网站</h1><p>只有测试和生产构建都通过后，才能执行 Git 发布。</p></div>
        <div className={`branch-card ${info.releaseBranch ? 'ready' : ''}`}><GitBranch size={20} /><span>当前分支<strong>{info.branch}</strong></span></div>
      </div>

      {!info.releaseBranch && <div className="callout warning"><ShieldCheck size={18} /><span>当前不是发布分支。你可以运行检查，但“发布到线上”只在 main/master 分支启用。</span></div>}

      <div className="publish-grid">
        <div>
          <div className="check-card">
            <header><div><h2>发布前检查</h2><p>{info.dirtyFiles.length} 个文件发生修改</p></div><button className="secondary" disabled={running || publishing} onClick={runChecks} aria-busy={running}>{running ? <LoaderCircle className="spin" size={17} /> : <ShieldCheck size={17} />}{running ? '正在检查' : '运行全部检查'}</button></header>
            <div className="stage-list" role="list" aria-live="polite">
              {stages.map((stage) => <div className={`stage ${stage.state}`} key={stage.id} role="listitem">{iconFor(stage.state)}<span><strong>{stage.title}</strong><small>{stage.description}</small><span className="sr-only">{stateLabel[stage.state]}</span></span></div>)}
              <div className={`stage ${allPassed ? 'success' : 'idle'}`} role="listitem">{allPassed ? <CheckCircle2 className="success-icon" /> : <Circle />}<span><strong>Git 提交与推送</strong><small>只提交文章、首页配置和头像</small><span className="sr-only">{allPassed ? '可以运行' : '等待检查通过'}</span></span></div>
            </div>
          </div>

          <div className="publish-action-card">
            <label>提交说明<input value={message} maxLength={120} required aria-invalid={!hasMessage} aria-describedby="commit-message-help" onChange={(event) => { setMessage(event.target.value); if (result?.tone === 'error') setResult(null); }} /></label>
            <small id="commit-message-help" className="field-help">必填，最多 120 个字符；不能包含换行。当前 {message.length}/120。</small>
            <button className="primary publish-button" disabled={!allPassed || !info.releaseBranch || publishing || !hasMessage} onClick={publish} aria-busy={publishing}>{publishing ? <LoaderCircle className="spin" /> : <Rocket />}{publishing ? '正在发布' : '发布到线上'}</button>
            {result && <div className={`callout ${result.tone}`} role={result.tone === 'error' ? 'alert' : 'status'} aria-live="polite">{result.message}</div>}
          </div>
        </div>

        <aside>
          <div className="changes-card">
            <h2>待发布修改</h2>
            {info.dirtyFiles.length ? <ul>{info.dirtyFiles.map((file) => <li key={file}>{file}</li>)}</ul> : <p>工作区没有修改。</p>}
          </div>
          <div className="log-card"><header><h2>运行日志</h2></header><pre tabIndex={0} aria-label="发布检查运行日志">{log}</pre></div>
        </aside>
      </div>
    </section>
  );
}
