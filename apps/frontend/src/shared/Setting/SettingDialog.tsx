// SettingDialog.tsx
// Main dialog shell — two-panel layout: left sidebar nav + right content area.
// Right panel content is determined by activeTab + storageView from settingStore.
// To add a new settings section, add a tab to SettingSidebar.tsx and a case here.

import { X } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSettingStore } from './Storage/settingStore';
import { SettingSidebar } from './SettingSidebar';
import { StorageOverview } from './Storage/StorageOverview';
import { StoragePlans } from './Storage/StoragePlans';
import { DeveloperSettings } from './Developer/DeveloperSettings';
import { VideoDecodingSettings } from './VideoDecodingSettings';
import { ProfileSettings } from './ProfileSettings';

function RightPanel() {
  const { activeTab, storageView } = useSettingStore();

  if (activeTab === 'storage') {
    return storageView === 'plans' ? <StoragePlans /> : <StorageOverview />;
  }

  if (activeTab === 'profile') {
    return <ProfileSettings />;
  }

  if (activeTab === 'developer') {
    return <DeveloperSettings />;
  }

  if (activeTab === 'decoding') {
    return <VideoDecodingSettings />;
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
        className="p-0 overflow-hidden flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] sm:max-h-[85vh]"
        showCloseButton={false}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-border/50 shrink-0">
          <DialogTitle className="text-sm font-semibold">Settings</DialogTitle>
          <button
            onClick={closeDialog}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md p-1 hover:bg-muted"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: stacked on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
          <SettingSidebar />
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden p-4 sm:p-6">
            <RightPanel />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
