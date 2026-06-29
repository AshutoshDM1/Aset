import { FileText, Folder, Users, Star } from 'lucide-react';
import { StatCard } from './StatCard';
import type { StatItem } from './mockData';

const statConfig = {
  files: {
    icon: FileText,
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
  },
  folders: {
    icon: Folder,
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
  },
  shared: {
    icon: Users,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  starred: {
    icon: Star,
    iconClass: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
  },
};

type StatsOverviewProps = {
  overview: StatItem[];
};

export function StatsOverview({ overview }: StatsOverviewProps) {
  return (
    <section
      aria-label="Overview stats"
      className="grid gap-4 grid-cols-2 xl:grid-cols-4"
    >
      {overview.map((stat) => {
        const config = statConfig[stat.id as keyof typeof statConfig];
        const IconComponent = config?.icon;
        return (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            hint={stat.hint}
            icon={
              IconComponent ? (
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bgClass}`}
                >
                  <IconComponent className={`size-5 ${config.iconClass}`} />
                </div>
              ) : null
            }
          />
        );
      })}
    </section>
  );
}
