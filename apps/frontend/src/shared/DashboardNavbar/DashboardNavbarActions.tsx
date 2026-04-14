import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardNavbarActions() {
  return (
    <div className="flex items-center justify-end gap-2">
      <ThemeToggle />
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell aria-hidden />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Settings">
        <Settings aria-hidden />
      </Button>
      <div className="shrink-0">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-9 rounded-full ring-2 ring-muted/20',
            },
          }}
        />
      </div>
    </div>
  );
}
