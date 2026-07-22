import { FileText, Home, Rocket, Settings2 } from 'lucide-react';

export type AppSection = 'articles' | 'home' | 'publish' | 'settings';

const items: Array<{ id: AppSection; label: string; icon: typeof FileText }> = [
  { id: 'articles', label: '文章', icon: FileText },
  { id: 'home', label: '首页', icon: Home },
  { id: 'publish', label: '发布中心', icon: Rocket },
  { id: 'settings', label: '设置', icon: Settings2 },
];

export function Sidebar({ active, onChange }: { active: AppSection; onChange: (value: AppSection) => void }) {
  return (
    <aside className="app-sidebar">
      <div className="app-mark">P</div>
      <nav>
        {items.map(({ id, label, icon: Icon }) => (
          <button className={active === id ? 'active' : ''} key={id} onClick={() => onChange(id)}>
            <Icon size={21} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-version">v0.1</div>
    </aside>
  );
}
