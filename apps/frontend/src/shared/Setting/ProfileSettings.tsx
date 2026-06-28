import { useUser } from '@clerk/react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, Monitor, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground animate-in fade-in duration-200">
        <span className="text-sm font-medium">Loading user profile...</span>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? 'No email address';
  const name = user?.fullName ?? user?.username ?? 'Optix User';
  const userId = user?.id ?? '';
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">My Profile</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Manage your personal account profile, credentials, and app visual
          preferences.
        </p>
      </div>

      {/* User Info Card */}
      <div className="border border-border/60 bg-muted/5 rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={name}
              className="size-16 rounded-2xl object-cover ring-2 ring-primary/10 shrink-0"
            />
          ) : (
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="size-8" />
            </div>
          )}
          <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {name}
            </h4>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="truncate">{email}</span>
              </span>
              {user?.username && (
                <span className="flex items-center gap-1.5 before:content-['•'] before:hidden sm:before:inline-block before:text-muted-foreground/45 before:mr-1">
                  @{user.username}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden border-t border-border/50 pt-4 md:grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              User ID
            </span>
            <code className="py-1 text-[11px] font-mono text-foreground select-all w-full truncate">
              {userId}
            </code>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              Joined
            </span>
            <span className="py-1 font-medium text-foreground">
              {createdAt || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Toggle Card */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          App Appearance
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as 'light' | 'dark' | 'system')}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer text-center gap-2 group',
                  isSelected
                    ? 'bg-primary/5 border-primary/30 text-primary font-semibold'
                    : 'border-border/20 bg-muted/5 text-muted-foreground hover:bg-muted/15 hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 transition-transform duration-200 group-hover:scale-110',
                    isSelected ? 'text-primary' : 'text-muted-foreground/80',
                  )}
                />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
