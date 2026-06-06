import { cn } from '@/lib/utils';
import { DashboardNavbarSearch } from './DashboardNavbarSearch';
import { DashboardNavbarActions } from './DashboardNavbarActions';
import BreadcrumbComponent from '../Breadcrumb/Breadcrumb';
import { Link, useLocation } from 'react-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import Logo from '../Navbar/Logo';
import { SearchDialog } from '@/shared/Search/SearchDialog';

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

  const { data: allFolders } = useQuery({
    ...trpc.folder.listAll.queryOptions(),
    enabled: !!folderId,
  });

  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);

    // If we're not inside a specific folder, use standard pathname-based mapping
    if (!folderId) {
      return pathnames.map((name, index) => {
        let label = name.charAt(0).toUpperCase() + name.slice(1);
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;

        let type: 'dashboard' | 'my-files' | 'starred' | 'trash' | 'shared' =
          'dashboard';
        if (name.toLowerCase() === 'my-files') {
          label = 'My Files';
          type = 'my-files';
        } else if (name.toLowerCase() === 'starred') {
          label = 'Starred';
          type = 'starred';
        } else if (name.toLowerCase() === 'trash') {
          label = 'Trash';
          type = 'trash';
        } else if (name.toLowerCase() === 'shared') {
          label = 'Shared with me';
          type = 'shared';
        }

        return {
          label,
          href,
          type,
        };
      });
    }

    // If we are inside a folder, build the full trace from allFolders
    const items: {
      label: string;
      href: string;
      type:
        | 'dashboard'
        | 'my-files'
        | 'starred'
        | 'trash'
        | 'shared'
        | 'folder';
      id?: string;
    }[] = [
      { label: 'Dashboard', href: '/dashboard', type: 'dashboard' },
      { label: 'My Files', href: '/dashboard/my-files', type: 'my-files' },
    ];

    if (allFolders) {
      const hierarchy: {
        label: string;
        href: string;
        type: 'folder';
        id: string;
      }[] = [];
      let currentId: string | null = folderId;
      let depth = 0;

      while (currentId && depth < 20) {
        const found = allFolders.find((f) => f.id === currentId);
        if (found) {
          hierarchy.unshift({
            label: found.name,
            href: `/dashboard/folder/${found.id}`,
            type: 'folder',
            id: found.id,
          });
          currentId = found.parentId;
        } else {
          break;
        }
        depth++;
      }
      items.push(...hierarchy);
    } else if (folder) {
      // Fallback: If folder detail is loaded but listAll is not yet resolved
      items.push({
        label: folder.name,
        href: `/dashboard/folder/${folder.id}`,
        type: 'folder',
        id: folder.id,
      });
    } else {
      items.push({
        label: 'Loading...',
        href: `/dashboard/folder/${folderId}`,
        type: 'folder',
        id: folderId,
      });
    }

    return items;
  }, [location.pathname, folderId, folder, allFolders]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55 border-b',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-4">
          <BreadcrumbComponent
            className="hidden md:block min-w-0 max-w-lg flex-1 mr-4"
            items={breadcrumbItems}
            allFolders={allFolders}
          />
          <Link
            to="/dashboard"
            className="md:hidden flex items-center gap-2 lock"
          >
            <Logo className="size-8" />
            <h1 className="text-lg font-bold">Aset</h1>
          </Link>
          <div className="flex items-center justify-between gap-4 w-fit md:w-full md:max-w-xl">
            <DashboardNavbarSearch className="flex-1 hidden md:block" />
            <DashboardNavbarActions />
          </div>
        </div>
      </header>
      <SearchDialog />
    </>
  );
}

export default DashboardNavbar;
