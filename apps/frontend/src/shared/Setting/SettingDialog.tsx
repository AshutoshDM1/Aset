// SettingDialog.tsx
// Main dialog shell — two-panel layout: left sidebar nav + right content area.
// Right panel content is determined by activeTab + storageView from settingStore.
// To add a new settings section, add a tab to SettingSidebar.tsx and a case here.

import { X } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSettingStore } from './settingStore';
import { SettingSidebar } from './SettingSidebar';
import { StorageOverview } from './StorageOverview';
import { StoragePlans } from './StoragePlans';

function RightPanel() {
  const { activeTab, storageView } = useSettingStore();

  if (activeTab === 'storage') {
    return storageView === 'plans' ? <StoragePlans /> : <StorageOverview />;
  }

  return null; // future tabs rendered here
}

export function SettingDialog() {
  const { isOpen, closeDialog } = useSettingStore();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent
        className="p-0 overflow-hidden flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl sm:max-w-2xl max-h-[85vh]"
        showCloseButton={false}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 shrink-0">
          <DialogTitle className="text-sm font-semibold">Settings</DialogTitle>
          <button
            onClick={closeDialog}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md p-1 hover:bg-muted"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Two-panel body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <SettingSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <RightPanel />
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
