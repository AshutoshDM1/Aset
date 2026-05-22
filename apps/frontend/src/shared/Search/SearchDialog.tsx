import * as React from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useSearchStore } from './searchStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Folder,
  FileIcon,
  ImageIcon,
  FileText,
  Video,
  Search,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
  formatFileSize,
} from '@/utils/file/file-utils';
import { cn } from '@/lib/utils';

export function SearchDialog() {
  const { isOpen, closeSearch } = useSearchStore();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounce input to prevent massive API spam
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset selection index when search results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  const { data, isLoading } = useQuery({
    ...trpc.folder.search.queryOptions({ query: debouncedQuery }),
    enabled: isOpen && debouncedQuery.trim().length > 0,
  });

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const totalItems = folders.length + files.length;

  // Flatten folders and files for keyboard navigation
  const flatItems = React.useMemo(() => {
    const list: Array<
      | { type: 'folder'; id: string; name: string }
      | {
          type: 'file';
          id: string;
          name: string;
          url: string;
          sizeMb: number;
          folderId?: string | null;
        }
    > = [];
    folders.forEach((f) => list.push({ type: 'folder', ...f }));
    files.forEach((f) => list.push({ type: 'file', ...f }));
    return list;
  }, [folders, files]);

  // Auto focus input when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelectItem = (item: (typeof flatItems)[number]) => {
    closeSearch();
    if (item.type === 'folder') {
      navigate(`/dashboard/folder/${item.id}`);
    } else {
      if (item.folderId) {
        navigate(`/dashboard/folder/${item.folderId}`);
      } else {
        navigate('/dashboard/my-files');
      }
    }
  };

  // Keyboard navigation listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || flatItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + flatItems.length) % flatItems.length,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = flatItems[selectedIndex];
        if (activeItem) {
          handleSelectItem(activeItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex]);

  const getFileIcon = (fileName: string) => {
    if (isImageFileName(fileName))
      return <ImageIcon className="size-5 text-emerald-500" />;
    if (isPdfFileName(fileName))
      return <FileText className="size-5 text-rose-500" />;
    if (isVideoFileName(fileName))
      return <Video className="size-5 text-indigo-500" />;
    if (isTextCodeFileName(fileName))
      return <FileText className="size-5 text-amber-500" />;
    return <FileIcon className="size-5 text-muted-foreground" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl p-0 overflow-hidden rounded-3xl duration-200">
        <DialogHeader className="p-4 border-b border-border/60 flex flex-row items-center gap-3 space-y-0">
          <DialogTitle className="sr-only">Search Workspace</DialogTitle>
          <Search className="size-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Type folder or file name..."
            className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </DialogHeader>

        <div className="max-h-[350px] overflow-y-auto p-2 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
              <Loader2 className="size-8 text-primary animate-spin shrink-0" />
              <span className="animate-pulse">
                Searching files & folders...
              </span>
            </div>
          ) : debouncedQuery.trim().length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Search folders and files in your workspace.
            </div>
          ) : flatItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No results found for &ldquo;
              <span className="font-semibold text-foreground">
                {debouncedQuery}
              </span>
              &rdquo;
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Folders List */}
              {folders.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">
                    Folders
                  </div>
                  {folders.map((item, idx) => {
                    const isSelected =
                      flatItems[idx] === flatItems[selectedIndex];
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          handleSelectItem({ type: 'folder', ...item })
                        }
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer group',
                          isSelected
                            ? 'bg-primary/10 text-foreground ring-1 ring-primary/20'
                            : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-2 rounded-xl transition-colors',
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground group-hover:bg-background',
                            )}
                          >
                            <Folder className="size-4 fill-current" />
                          </div>
                          <span className="font-medium text-foreground text-sm truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-muted-foreground">
                            Open folder
                          </span>
                          <ArrowRight className="size-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Files List */}
              {files.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">
                    Files
                  </div>
                  {files.map((item, idx) => {
                    const fileIndex = folders.length + idx;
                    const isSelected =
                      flatItems[fileIndex] === flatItems[selectedIndex];
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          handleSelectItem({ type: 'file', ...item })
                        }
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer group',
                          isSelected
                            ? 'bg-primary/10 text-foreground ring-1 ring-primary/20'
                            : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-2 rounded-xl transition-colors',
                              isSelected
                                ? 'bg-primary/20'
                                : 'bg-muted group-hover:bg-background',
                            )}
                          >
                            {getFileIcon(item.name)}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="font-medium text-foreground text-sm truncate">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                              {formatFileSize(item.sizeMb)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {flatItems.length > 0 && (
          <div className="p-3 bg-muted/40 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                Use{' '}
                <kbd className="bg-background border px-1.5 py-0.5 rounded shadow-xs font-sans">
                  ↑↓
                </kbd>{' '}
                to navigate
              </span>
              <span>
                <kbd className="bg-background border px-1.5 py-0.5 rounded shadow-xs font-sans">
                  Enter
                </kbd>{' '}
                to open
              </span>
            </div>
            <span>{totalItems} items found</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
