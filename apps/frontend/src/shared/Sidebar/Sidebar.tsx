import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Logo from '@/shared/Navbar/Logo';
import { trpc } from '@/utils/trpc';
import {
  ChevronDown,
  Clock3,
  Folder,
  Home,
  Plus,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useUploadStore } from '@/shared/Sidebar/UploadDailog/uploadStore';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'My Files', href: '/dashboard/my-files', icon: Folder },
  { label: 'Shared with me', href: '/dashboard/shared', icon: Users },
  { label: 'Recent', href: '/dashboard/recent', icon: Clock3 },
  { label: 'Starred', href: '/dashboard/starred', icon: Star },
  { label: 'Trash', href: '/dashboard/trash', icon: Trash2 },
];

function SidebarNavItem({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  const location = useLocation();
  const isActive =
    item.href === '/dashboard'
      ? location.pathname === '/dashboard' ||
        location.pathname === '/dashboard/'
      : location.pathname.startsWith(item.href);
  return (
    <NavLink to={item.href}>
      <Button
        asChild
        className={cn(
          'w-full transition-all duration-300',
          isActive
            ? 'bg-muted hover:bg-muted/60 text-foreground '
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60 ',
        )}
      >
        <div className="flex items-center justify-start gap-2">
          <Icon aria-hidden data-icon="inline-start" className="size-4 ml-2" />
          <span className="truncate">{item.label}</span>
        </div>
      </Button>
    </NavLink>
  );
}

import { useBillingStore } from '@/store/billingStore';

const MB_PER_GB = 1024;

function mbToGb(valueMb: number) {
  return (valueMb / MB_PER_GB).toFixed(2);
}

function SidebarStorageCard() {
  const { data, isPending } = useQuery(trpc.user.me.queryOptions());
  const openPricing = useBillingStore((state) => state.openPricing);

  const storage = data?.storage;
  const totalMb = storage?.totalStorage ?? 0;
  const usedMb = storage?.usedStorage ?? 0;
  const percent =
    totalMb > 0 ? Math.min(100, Math.round((usedMb / totalMb) * 100)) : 0;

  return (
    <Card size="sm" className="bg-card/60">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Home aria-hidden className="size-4 text-primary" />
          Storage
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {isPending ? '—' : `${percent}%`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percent} />
        <p className="text-xs text-muted-foreground">
          {isPending ? (
            'Loading storage…'
          ) : (
            <>
              You&apos;ve used{' '}
              <span className="font-medium text-foreground">
                {mbToGb(usedMb)} GB
              </span>{' '}
              of{' '}
              <span className="font-medium text-foreground">
                {mbToGb(totalMb)} GB
              </span>{' '}
              total storage.
            </>
          )}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          className="w-full cursor-pointer"
          variant="secondary"
          size="sm"
          onClick={() => openPricing('monthly')}
        >
          Upgrade Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SidebarFolderListProps {
  label: string;
  href: string;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export function SidebarFolderList({
  label,
  href,
  color,
  icon,
}: SidebarFolderListProps) {
  const Icon = icon;
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'mx-4 flex items-center gap-2 rounded-xl px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
          isActive && 'bg-muted text-foreground',
        )
      }
    >
      <span
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full ring-2 ring-background',
          color,
        )}
      />
      <Icon aria-hidden className="size-4 shrink-0 opacity-70" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

const FOLDER_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

export default function Sidebar({ className }: { className?: string }) {
  const { data: folders, isPending: foldersPending } = useQuery(
    trpc.folder.list.queryOptions({ parentId: null }),
  );
  const [isFoldersCollapsed, setIsFoldersCollapsed] = React.useState(false);
  return (
    <aside
      className={cn(
        'flex h-dvh w-70 shrink-0 flex-col justify-between border-r bg-sidebar text-sidebar-foreground select-none',
        className,
      )}
    >
      <div>
        <Link to="/">
          <div className="flex gap-2 items-center px-7 mt-3">
            <Logo />
            <span className="text-2xl font-bold">Aset</span>
          </div>
        </Link>
        <div className="p-4">
          <Button
            className="w-full py-5 cursor-pointer"
            size="lg"
            onClick={() => useUploadStore.getState().openDialog()}
          >
            <Plus aria-hidden data-icon="inline-start" />
            Upload New
          </Button>
          <nav className="space-y-1 mt-2">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
        <div className="space-y-1 mt-2 px-4">
          <button
            onClick={() => setIsFoldersCollapsed((prev) => !prev)}
            className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Folder className="size-4 opacity-70" />
              Folders
            </span>
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200 opacity-70 group-hover:opacity-100',
                isFoldersCollapsed && '-rotate-90',
              )}
            />
          </button>
          {!isFoldersCollapsed && (
            <div className="space-y-1 mt-1 transition-all duration-300">
              {foldersPending ? (
                <p className="px-7 py-1 text-xs text-muted-foreground">
                  Loading…
                </p>
              ) : folders && folders.length > 0 ? (
                folders.map((item, index) => (
                  <SidebarFolderList
                    key={item.id}
                    label={item.name}
                    href={`/dashboard/folder/${item.id}`}
                    color={FOLDER_COLORS[index % FOLDER_COLORS.length]}
                    icon={Folder}
                  />
                ))
              ) : (
                <p className="px-7 py-1 text-xs text-muted-foreground">
                  No folders yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <SidebarStorageCard />
      </div>
    </aside>
  );
}
