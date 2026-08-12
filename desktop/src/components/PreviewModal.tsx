import { LoaderCircle, Monitor, RotateCw, Smartphone, Tablet, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type Device = 'desktop' | 'tablet' | 'mobile';

export function PreviewModal({ url, loading, error, onClose, onRefresh }: {
  url: string | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], iframe, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute('hidden'));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const deviceLabels: Record<Device, string> = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端',
  };

  return (
    <div className="modal-backdrop">
      <div className="preview-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1}>
        <header>
          <div>
            <strong id={titleId}>网站预览</strong>
            <span id={descriptionId}>{url ?? '正在启动 Astro…'}</span>
          </div>
          <div className="preview-tools">
            {([
              ['desktop', Monitor],
              ['tablet', Tablet],
              ['mobile', Smartphone],
            ] as const).map(([name, Icon]) => (
              <button key={name} className={device === name ? 'active' : ''} onClick={() => setDevice(name)} aria-label={`${deviceLabels[name]}预览`} aria-pressed={device === name} title={`${deviceLabels[name]}预览`}>
                <Icon size={17} />
              </button>
            ))}
            <button onClick={onRefresh} aria-label="刷新预览" title="刷新预览" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <RotateCw size={17} />}</button>
            <button ref={closeButtonRef} onClick={onClose} aria-label="关闭预览" title="关闭预览"><X size={19} /></button>
          </div>
        </header>
        <div className={`preview-stage ${device}`} aria-busy={loading}>
          {loading && <div className="preview-message" role="status" aria-live="polite"><LoaderCircle className="spin" />正在启动真实 Astro 预览…</div>}
          {!loading && error && <div className="preview-message error" role="alert"><span>{error}</span><button className="secondary" onClick={onRefresh}>重新加载</button></div>}
          {!loading && !error && url && <iframe key={`${url}-${device}`} src={url} title="博客网站预览" />}
        </div>
      </div>
    </div>
  );
}
