import { cn } from '@/lib/utils';
import { DashboardNavbarSearch } from './DashboardNavbarSearch';
import { DashboardNavbarActions } from './DashboardNavbarActions';
import BreadcrumbComponent from '../Breadcrumb/Breadcrumb';
import { useLocation } from 'react-router';
import { useMemo } from 'react';

function DashboardNavbar({ className }: { className?: string }) {
  const location = useLocation();
  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = pathnames.map((name, index) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      href: `/${pathnames.slice(0, index + 1).join('/')}`,
    }));
    return breadcrumbItems;
  }, [location]);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55 border-b',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-4">
        <div className="hidden md:block">
          <BreadcrumbComponent items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-between gap-4 w-full md:max-w-xl">
          <DashboardNavbarSearch className="flex-1" />
          <DashboardNavbarActions />
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
