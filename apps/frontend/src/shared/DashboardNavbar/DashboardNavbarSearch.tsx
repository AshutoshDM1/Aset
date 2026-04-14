import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export function DashboardNavbarSearch({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Search files, folders, and members..."
        className="h-11 pl-10 pr-16"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:block">
        ⌘K
      </kbd>
    </div>
  );
}
