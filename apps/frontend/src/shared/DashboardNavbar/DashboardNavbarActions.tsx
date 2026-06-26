import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { NotificationDropdown } from './NotificationDropdown';
import { useSettingStore } from '@/shared/Setting/Storage/settingStore';

export function DashboardNavbarActions() {
  const openSettings = useSettingStore((state) => state.openDialog);

  return (
    <div className="flex items-center justify-end gap-2">
      <NotificationDropdown />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        onClick={openSettings}
        className="cursor-pointer"
      >
        <Settings aria-hidden className="h-5 w-5 text-muted-foreground" />
      </Button>
      <div className="shrink-0 flex justify-center items-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-9 rounded-full ring-2 ring-muted',
            },
          }}
        />
      </div>
    </div>
  );
}
