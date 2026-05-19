import { cn } from '@/lib/utils';
import { DashboardNavbarSearch } from './DashboardNavbarSearch';
import { DashboardNavbarActions } from './DashboardNavbarActions';
import BreadcrumbComponent from '../Breadcrumb/Breadcrumb';
import { useLocation } from 'react-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import Logo from '../Navbar/Logo';

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function DashboardNavbar({ className }: { className?: string }) {
  const location = useLocation();

  const folderId = useMemo(() => {
    const match = location.pathname.match(
      /\/folder\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/,
    );
    return match ? match[1] : null;
  }, [location.pathname]);

  const { data: folder } = useQuery({
    ...trpc.folder.getById.queryOptions({ id: folderId ?? '' }),
    enabled: !!folderId,
    retry: false,
  });

  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = pathnames.map((name, index) => {
      let label = name.charAt(0).toUpperCase() + name.slice(1);
      let href = `/${pathnames.slice(0, index + 1).join('/')}`;

      if (name.toLowerCase() === 'folder') {
        href = '/dashboard/my-files';
      } else if (UUID_REGEX.test(name)) {
        label = folder?.name || 'Loading...';
      }

      return {
        label,
        href,
      };
    });
    return breadcrumbItems;
  }, [location, folder?.name]);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55 border-b',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-4">
        <BreadcrumbComponent
          className="max-w-sm hidden md:block"
          items={breadcrumbItems}
        />
        <div className="md:hidden flex items-center gap-2 lock">
          <Logo className="size-8" />
          <h1 className="text-lg font-bold">Aset</h1>
        </div>
        <div className="flex items-center justify-between gap-4 w-fit md:w-full md:max-w-xl">
          <DashboardNavbarSearch className="flex-1 hidden md:block" />
          <DashboardNavbarActions />
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
