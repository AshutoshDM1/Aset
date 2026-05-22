import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useViewMode,
  type SortField,
  type SortOrder,
} from '@/context/ViewModeContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const DashboardToolbar = () => {
  const {
    viewMode,
    setViewMode,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  } = useViewMode();

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1 select-none">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-8 rounded-lg transition-all cursor-pointer',
            viewMode === 'grid'
              ? 'bg-background shadow-xs text-primary'
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
            'size-8 rounded-lg transition-all cursor-pointer',
            viewMode === 'table'
              ? 'bg-background shadow-xs text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setViewMode('table')}
          title="Table View"
        >
          <List className="size-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-border/60 shrink-0 mx-0.5" />

      {/* Sort Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Sort options"
          >
            <ArrowUpDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortField}
            onValueChange={(val) => setSortField(val as SortField)}
          >
            <DropdownMenuRadioItem className="cursor-pointer" value="name">
              Name
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="cursor-pointer" value="createdAt">
              Date Created
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="cursor-pointer" value="size">
              Size
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Order</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortOrder}
            onValueChange={(val) => setSortOrder(val as SortOrder)}
          >
            <DropdownMenuRadioItem className="cursor-pointer" value="asc">
              Ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="cursor-pointer" value="desc">
              Descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
