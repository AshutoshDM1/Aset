import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewMode } from '@/context/ViewModeContext';
import { cn } from '@/lib/utils';

export const ViewToggle = () => {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'size-8 rounded-md transition-all',
          viewMode === 'grid'
            ? 'bg-background shadow-sm text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => setViewMode('grid')}
        title="Grid View"
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'size-8 rounded-md transition-all',
          viewMode === 'table'
            ? 'bg-background shadow-sm text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => setViewMode('table')}
        title="Table View"
      >
        <List className="size-4" />
      </Button>
    </div>
  );
};
