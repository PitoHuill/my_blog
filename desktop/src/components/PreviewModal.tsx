import { LoaderCircle, Monitor, RotateCw, Smartphone, Tablet, X } from 'lucide-react';
import { useState } from 'react';

type Device = 'desktop' | 'tablet' | 'mobile';

export function PreviewModal({ url, loading, error, onClose, onRefresh }: {
  url: string | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="网站预览">
      <div className="preview-modal">
        <header>
          <div>
            <strong>网站预览</strong>
            <span>{url ?? '正在启动 Astro…'}</span>
          </div>
          <div className="preview-tools">
            {([
              ['desktop', Monitor],
              ['tablet', Tablet],
              ['mobile', Smartphone],
            ] as const).map(([name, Icon]) => (
              <button key={name} className={device === name ? 'active' : ''} onClick={() => setDevice(name)}>
                <Icon size={17} />
              </button>
            ))}
            <button onClick={onRefresh} title="刷新预览"><RotateCw size={17} /></button>
            <button onClick={onClose} title="关闭预览"><X size={19} /></button>
          </div>
        </header>
        <div className={`preview-stage ${device}`}>
          {loading && <div className="preview-message"><LoaderCircle className="spin" />正在启动真实 Astro 预览…</div>}
          {!loading && error && <div className="preview-message error">{error}</div>}
          {!loading && !error && url && <iframe key={`${url}-${device}`} src={url} title="博客网站预览" />}
        </div>
      </div>
    </div>
  );
}
