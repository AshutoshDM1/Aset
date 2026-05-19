import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  Folder01Icon,
  UserGroupIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { StatCard } from './StatCard';
import { statsMock } from './mockData';

const iconById: Record<string, typeof File01Icon> = {
  files: File01Icon,
  folders: Folder01Icon,
  shared: UserGroupIcon,
  starred: StarIcon,
};

export function StatsOverview() {
  return (
    <section
      aria-label="Overview stats"
      className="grid gap-4 grid-cols-2 xl:grid-cols-4"
    >
      {statsMock.map((stat) => {
        const Icon = iconById[stat.id];
        return (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            hint={stat.hint}
            icon={
              Icon ? (
                <HugeiconsIcon icon={Icon} size={18} strokeWidth={1.5} />
              ) : null
            }
          />
        );
      })}
    </section>
  );
}
