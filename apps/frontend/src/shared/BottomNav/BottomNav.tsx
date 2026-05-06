import { Clock3, Folder, Star, Trash2, Users } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Files', href: '/dashboard/my-files', icon: Folder },
  { label: 'Shared', href: '/dashboard/shared', icon: Users },
  { label: 'Recent', href: '/dashboard/recent', icon: Clock3 },
  { label: 'Starred', href: '/dashboard/starred', icon: Star },
  { label: 'Trash', href: '/dashboard/trash', icon: Trash2 },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 backdrop-blur-lg lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
