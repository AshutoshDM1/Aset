import { cn } from '@/lib/utils';
import { DashboardNavbarSearch } from './DashboardNavbarSearch';
import { DashboardNavbarActions } from './DashboardNavbarActions';

function DashboardNavbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <DashboardNavbarSearch className="max-w-lg flex-1" />
        <DashboardNavbarActions />
      </div>
    </header>
  );
}

export default DashboardNavbar;
