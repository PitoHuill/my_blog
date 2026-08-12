import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('preserves authored, actionable command errors', () => {
    expect(getErrorMessage('所选目录不是可管理的博客，缺少 package.json', '无法连接博客'))
      .toBe('所选目录不是可管理的博客，缺少 package.json');
  });

  it('turns permission errors into a recovery instruction', () => {
    expect(getErrorMessage(new Error('Permission denied (os error 13)'), '保存文章失败'))
      .toBe('保存文章失败。请检查所选目录的读写权限后重试。');
  });

  it('does not expose empty or oversized technical payloads', () => {
    expect(getErrorMessage({}, '载入失败')).toBe('载入失败，请稍后重试。');
    expect(getErrorMessage('x'.repeat(300), '发布失败')).toBe('发布失败，请查看运行日志后重试。');
  });
});
