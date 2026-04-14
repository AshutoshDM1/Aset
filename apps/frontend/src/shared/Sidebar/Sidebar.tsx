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
import { Clock3, Folder, Home, Plus, Star, Trash2, Users } from 'lucide-react';
import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'All Files', href: '/dashboard', icon: Folder },
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
            ? 'bg-primary text-primary-foreground '
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted ',
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

function SidebarStorageCard() {
  const usedGB = 41.2;
  const totalGB = 50;
  const percent = Math.round((usedGB / totalGB) * 100);

  return (
    <Card size="sm" className="bg-card/60">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Home aria-hidden className="size-4 text-primary" />
          Storage
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {percent}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percent} />
        <p className="text-xs text-muted-foreground">
          You&apos;ve used{' '}
          <span className="font-medium text-foreground">{usedGB} GB</span> of{' '}
          <span className="font-medium text-foreground">{totalGB} GB</span>{' '}
          total storage.
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="w-full" variant="secondary" size="sm">
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

export default function Sidebar({ className }: { className?: string }) {
  const content = [
    {
      label: 'Work',
      href: '/dashboard/work',
      color: 'bg-blue-500',
      icon: Folder,
    },
    {
      label: 'Personal',
      color: 'bg-green-500',
      href: '/dashboard/personal',
      icon: Folder,
    },
  ];
  return (
    <aside
      className={cn(
        'flex h-dvh w-[280px] shrink-0 flex-col justify-between border-r bg-sidebar text-sidebar-foreground select-none',
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
          <Button className="w-full py-5" size="lg">
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
          <h3 className="text-sm font-medium text-muted-foreground px-4">
            Folders
          </h3>
          {content.map((item) => (
            <SidebarFolderList
              key={item.href}
              label={item.label}
              href={item.href}
              color={item.color}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <SidebarStorageCard />
      </div>
    </aside>
  );
}
