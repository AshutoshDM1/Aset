import { useUser } from '@clerk/react';
import type { ActivityItem } from './mockData';

type RecentActivityProps = {
  activities: ActivityItem[];
};

export function RecentActivity({ activities }: RecentActivityProps) {
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col justify-between rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Recent activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest changes in your drive
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border/60">
          {activities.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                {item.actor === 'You' && user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User avatar'}
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                  >
                    {item.actor
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
                <p className="min-w-0 truncate">
                  <span className="font-medium">{item.actor}</span>{' '}
                  <span className="text-muted-foreground">{item.action}</span>{' '}
                  <span className="font-medium">{item.target}</span>
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
