import { Button } from '@/components/ui/button';
import { Bell, Settings, Check, RefreshCw } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { useSettingStore } from '@/shared/Setting/settingStore';

export function DashboardNavbarActions() {
  const openSettings = useSettingStore((state) => state.openDialog);
  const { data: unreadData, refetch: refetchCount } = useQuery(
    trpc.notification.unreadCount.queryOptions(),
  );
  const { data: notifications, refetch: refetchList } = useQuery(
    trpc.notification.list.queryOptions(),
  );

  const markAllReadMutation = useMutation({
    ...trpc.notification.markAllAsRead.mutationOptions(),
    onSuccess: () => {
      void refetchCount();
      void refetchList();
    },
  });

  const markSingleReadMutation = useMutation({
    ...trpc.notification.markAsRead.mutationOptions(),
    onSuccess: () => {
      void refetchCount();
      void refetchList();
    },
  });

  const unreadCount = unreadData?.count ?? 0;
  const list = notifications ?? [];

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleMarkSingleRead = (id: string, read: boolean) => {
    if (!read) {
      markSingleReadMutation.mutate({ id });
    }
  };

  const formatRelativeTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    const days = Math.floor(diffHours / 24);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <ThemeToggle />

      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            void refetchCount();
            void refetchList();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative group"
          >
            <Bell
              aria-hidden
              className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 p-2 rounded-2xl bg-popover text-popover-foreground shadow-2xl border"
        >
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                className="h-auto px-2 py-1 text-xs text-primary font-medium hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllRead();
                }}
                disabled={markAllReadMutation.isPending}
              >
                {markAllReadMutation.isPending ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Mark all read
              </Button>
            )}
          </div>

          <DropdownMenuSeparator />

          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="rounded-full bg-muted/50 p-3 mb-2 text-muted-foreground/60">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                All caught up!
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                No new notifications.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1 mt-1">
              {list.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkSingleRead(item.id, item.read)}
                  className={cn(
                    'flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-left',
                    item.read
                      ? 'hover:bg-muted/40'
                      : 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary pl-2.5 rounded-l-none',
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold',
                        item.read
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-xs leading-none',
                          !item.read ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-normal wrap-break-word">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        onClick={openSettings}
        className="cursor-pointer"
      >
        <Settings aria-hidden className="h-5 w-5 text-muted-foreground" />
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
