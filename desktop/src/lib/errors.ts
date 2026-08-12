const TECHNICAL_PREFIX = /^(?:error|invokeerror|uncaught(?: \(in promise\))?)\s*:\s*/i;

function extractMessage(reason: unknown): string {
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return reason.message;
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const message = (reason as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return '';
}

export function getErrorMessage(reason: unknown, fallback: string): string {
  const message = extractMessage(reason).replace(TECHNICAL_PREFIX, '').trim();

  if (!message) return `${fallback}，请稍后重试。`;
  if (/__TAURI_INTERNALS__|tauri.+(?:not available|undefined)|invoke.+undefined/i.test(message)) {
    return '桌面服务暂时不可用，请重新启动应用后重试。';
  }
  if (/permission denied|access is denied|eacces|eperm|拒绝访问|权限/i.test(message)) {
    return `${fallback}。请检查所选目录的读写权限后重试。`;
  }
  if (/enoent|not found|os error 2|找不到指定的文件|不存在/i.test(message)) {
    return `${fallback}。目标文件可能已移动或删除，请刷新后重试。`;
  }
  if (/timed? out|timeout|超时|未就绪/i.test(message)) {
    return `${fallback}。操作等待超时，请确认服务状态后重试。`;
  }
  if (message.length > 260) return `${fallback}，请查看运行日志后重试。`;

  return message;
}
