// SettingSidebar.tsx
// The fixed left-nav panel of the settings dialog.
// Add new tabs here as { id, label } entries — nothing else changes.

import { cn } from '@/lib/utils';
import { useSettingStore, type SettingTab } from './Storage/settingStore';

const NAV_ITEMS: { id: SettingTab; label: string }[] = [
  { id: 'storage', label: 'Storage' },
  // Future: { id: 'notifications', label: 'Notifications' },
  // Future: { id: 'account', label: 'Account' },
];

export function SettingSidebar() {
  const { activeTab, setActiveTab } = useSettingStore();

  return (
    <aside
      className="
      flex flex-row overflow-x-auto sm:overflow-x-visible
      sm:flex-col sm:w-44 sm:shrink-0
      border-b sm:border-b-0 sm:border-r border-border/50
      py-2 sm:py-4 px-2 gap-0.5
      scrollbar-none
    "
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            'shrink-0 sm:w-full text-left text-sm px-3 py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
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
