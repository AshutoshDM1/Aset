// SettingSidebar.tsx
// The fixed left-nav panel of the settings dialog.
// Add new tabs here as { id, label } entries — nothing else changes.

import { cn } from '@/lib/utils';
import { useSettingStore, type SettingTab } from './settingStore';

const NAV_ITEMS: { id: SettingTab; label: string }[] = [
  { id: 'storage', label: 'Storage' },
  // Future: { id: 'notifications', label: 'Notifications' },
  // Future: { id: 'account', label: 'Account' },
];

export function SettingSidebar() {
  const { activeTab, setActiveTab } = useSettingStore();

  return (
    <aside className="w-44 shrink-0 border-r border-border/50 flex flex-col py-4 px-2 gap-0.5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer',
            activeTab === item.id
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
