import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useSearchStore } from '@/shared/Search/searchStore';
import * as React from 'react';

export function DashboardNavbarSearch({ className }: { className?: string }) {
  const openSearch = useSearchStore((state) => state.openSearch);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        'relative flex h-11 w-full items-center justify-start rounded-xl border border-input/50 bg-background pl-10 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/40 cursor-pointer select-none text-left outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      <Search
        aria-hidden
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-80"
      />
      <span className="truncate pr-10">Search files, folders...</span>
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:block">
        ⌘ <span className="text-[11px]">K</span>
      </kbd>
    </button>
  );
}
