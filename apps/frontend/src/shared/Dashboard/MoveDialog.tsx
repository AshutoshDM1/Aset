import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Folder, Search, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { queryClient, trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';

type MoveItem = {
  id: string;
  type: 'folder' | 'file';
  name: string;
};

type MoveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MoveItem[];
  onSuccess?: () => void;
};

// Helper to recursively get all descendant folder IDs in a local list of folders
function getDescendantFolderIds(
  folderId: string,
  allFolders: { id: string; parentId: string | null }[],
): string[] {
  const result: string[] = [folderId];
  const children = allFolders.filter((f) => f.parentId === folderId);
  for (const child of children) {
    result.push(...getDescendantFolderIds(child.id, allFolders));
  }
  return result;
}

export function MoveDialog({
  open,
  onOpenChange,
  items,
  onSuccess,
}: MoveDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Fetch all non-trashed folders owned by the user
  const { data: folders, isLoading } = useQuery({
    ...trpc.folder.listAll.queryOptions(),
    enabled: open,
  });

  const moveFoldersMutation = useMutation(
    trpc.folder.moveMany.mutationOptions(),
  );
  const moveFilesMutation = useMutation(trpc.file.moveMany.mutationOptions());

  // Determine all invalid destination folder IDs
  const invalidFolderIds = useMemo(() => {
    const invalid = new Set<string>();
    if (!folders || items.length === 0) return invalid;

    const movingFolderIds = items
      .filter((item) => item.type === 'folder')
      .map((item) => item.id);

    for (const folderId of movingFolderIds) {
      const descendants = getDescendantFolderIds(folderId, folders as any);
      descendants.forEach((id) => invalid.add(id));
    }
    return invalid;
  }, [folders, items]);

  const filteredFolders = useMemo(() => {
    if (!folders) return [];
    return folders.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [folders, search]);

  const isPending =
    moveFoldersMutation.isPending || moveFilesMutation.isPending;

  const handleMove = async () => {
    const folderIds = items.filter((i) => i.type === 'folder').map((i) => i.id);
    const fileIds = items.filter((i) => i.type === 'file').map((i) => i.id);

    try {
      const promises = [];
      if (folderIds.length > 0) {
        promises.push(
          moveFoldersMutation.mutateAsync({
            ids: folderIds,
            parentId: selectedFolderId,
          }),
        );
      }
      if (fileIds.length > 0) {
        promises.push(
          moveFilesMutation.mutateAsync({
            ids: fileIds,
            folderId: selectedFolderId,
          }),
        );
      }

      await Promise.all(promises);

      toast.success('Successfully moved items');
      // Invalidate queries to refresh lists
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.file.listByFolder.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getStarred.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getStarred.queryFilter());

      onSuccess?.();
      onOpenChange(false);
      setSelectedFolderId(null);
      setSearch('');
    } catch (err: any) {
      toast.error(err.message || 'Could not move items');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setSelectedFolderId(null);
          setSearch('');
        }
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-md bg-background/85 backdrop-blur-xl border border-border/80 shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ArrowRight className="size-5 text-primary" />
            Move {items.length} {items.length === 1 ? 'item' : 'items'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a target folder to place the selected items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              className="pl-9 h-10 bg-muted/40 border-border/60 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading || isPending}
            />
          </div>

          {/* Folder tree listing */}
          <div className="max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-2 space-y-1 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Loading folders...
                </span>
              </div>
            ) : (
              <>
                {/* My Files Root option */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all cursor-pointer',
                    selectedFolderId === null
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'hover:bg-muted/65 text-muted-foreground hover:text-foreground border border-transparent',
                  )}
                >
                  <Folder className="size-4 text-primary fill-primary/10" />
                  <span>My Files (Root)</span>
                </button>

                {filteredFolders.length === 0 && search && (
                  <p className="text-center text-xs py-6 text-muted-foreground">
                    No folders matching "{search}"
                  </p>
                )}

                {filteredFolders.map((folder) => {
                  const isInvalid = invalidFolderIds.has(folder.id);
                  const isSelected = selectedFolderId === folder.id;

                  return (
                    <button
                      key={folder.id}
                      type="button"
                      disabled={isInvalid || isPending}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all border',
                        isSelected
                          ? 'bg-primary/10 text-primary border-primary/20 shadow-sm cursor-pointer'
                          : isInvalid
                            ? 'opacity-40 bg-muted/10 border-transparent cursor-not-allowed'
                            : 'hover:bg-muted/65 border-transparent text-foreground cursor-pointer',
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Folder
                          className={cn(
                            'size-4 shrink-0',
                            isSelected
                              ? 'text-primary fill-primary/10'
                              : 'text-muted-foreground',
                          )}
                        />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      {isInvalid && (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground select-none uppercase font-semibold scale-90">
                          Subfolder
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 px-6 cursor-pointer"
            onClick={handleMove}
            disabled={isPending || isLoading}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Moving...
              </span>
            ) : (
              'Move Here'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
