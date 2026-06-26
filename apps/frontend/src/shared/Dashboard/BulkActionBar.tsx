import { useState } from 'react';
import { useLocation } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Star,
  Trash2,
  FolderInput,
  X,
  Loader2,
  ShieldAlert,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSelectionStore } from '@/store/selectionStore';
import { trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { MoveDialog } from './MoveDialog';

export function BulkActionBar() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const {
    selectedFolderIds,
    selectedFileIds,
    clearSelection,
    selectFolders,
    selectFiles,
  } = useSelectionStore();

  const handleSelectAll = () => {
    const elements = document.querySelectorAll('[data-selectable-id]');
    const folderIds: string[] = [];
    const fileIds: string[] = [];

    elements.forEach((el) => {
      const itemId = el.getAttribute('data-selectable-id');
      const itemType = el.getAttribute('data-selectable-type');
      if (itemId && itemType) {
        if (itemType === 'folder') {
          folderIds.push(itemId);
        } else if (itemType === 'file') {
          fileIds.push(itemId);
        }
      }
    });

    selectFolders(folderIds);
    selectFiles(fileIds);
  };

  const totalCount = selectedFolderIds.length + selectedFileIds.length;
  const active = totalCount > 0;
  const isTrash = location.pathname.includes('/trash');

  // Mutations
  const toggleStarFoldersMutation = useMutation({
    ...trpc.folder.toggleStarMany.mutationOptions(),
  });
  const toggleStarFilesMutation = useMutation({
    ...trpc.file.toggleStarMany.mutationOptions(),
  });

  const toggleTrashFoldersMutation = useMutation({
    ...trpc.folder.toggleTrashMany.mutationOptions(),
  });
  const toggleTrashFilesMutation = useMutation({
    ...trpc.file.toggleTrashMany.mutationOptions(),
  });

  const deleteFoldersPermanentlyMutation = useMutation({
    ...trpc.folder.deleteManyPermanently.mutationOptions(),
  });
  const deleteFilesPermanentlyMutation = useMutation({
    ...trpc.file.deleteManyPermanently.mutationOptions(),
  });

  const isPending =
    toggleStarFoldersMutation.isPending ||
    toggleStarFilesMutation.isPending ||
    toggleTrashFoldersMutation.isPending ||
    toggleTrashFilesMutation.isPending ||
    deleteFoldersPermanentlyMutation.isPending ||
    deleteFilesPermanentlyMutation.isPending;

  const handleStarMany = async (starred: boolean) => {
    try {
      const promises = [];
      if (selectedFolderIds.length > 0) {
        promises.push(
          toggleStarFoldersMutation.mutateAsync({
            ids: selectedFolderIds,
            starred,
          }),
        );
      }
      if (selectedFileIds.length > 0) {
        promises.push(
          toggleStarFilesMutation.mutateAsync({
            ids: selectedFileIds,
            starred,
          }),
        );
      }
      await Promise.all(promises);
      toast.success(
        starred ? 'Selected items starred' : 'Selected items unstarred',
      );

      // Invalidate queries to refresh lists
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.file.listByFolder.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getStarred.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getStarred.queryFilter());

      clearSelection();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stars');
    }
  };

  const handleTrashMany = async (trashed: boolean) => {
    try {
      const promises = [];
      if (selectedFolderIds.length > 0) {
        promises.push(
          toggleTrashFoldersMutation.mutateAsync({
            ids: selectedFolderIds,
            trashed,
          }),
        );
      }
      if (selectedFileIds.length > 0) {
        promises.push(
          toggleTrashFilesMutation.mutateAsync({
            ids: selectedFileIds,
            trashed,
          }),
        );
      }
      await Promise.all(promises);
      toast.success(
        trashed
          ? 'Selected items moved to trash'
          : 'Selected items successfully restored',
      );

      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.file.listByFolder.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());

      clearSelection();
    } catch (err: any) {
      toast.error(err.message || 'Failed to trash/restore items');
    }
  };

  const handleDeletePermanently = async () => {
    try {
      const promises = [];
      if (selectedFolderIds.length > 0) {
        promises.push(
          deleteFoldersPermanentlyMutation.mutateAsync({
            ids: selectedFolderIds,
          }),
        );
      }
      if (selectedFileIds.length > 0) {
        promises.push(
          deleteFilesPermanentlyMutation.mutateAsync({
            ids: selectedFileIds,
          }),
        );
      }
      await Promise.all(promises);
      toast.success('Selected items permanently deleted');

      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.file.listByFolder.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());

      setIsDeleteConfirmOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err.message || 'Failed to permanently delete items');
    }
  };

  // Convert currently selected IDs into the MoveItem format expected by MoveDialog
  const moveItems = [
    ...selectedFolderIds.map((id) => ({
      id,
      type: 'folder' as const,
      name: '',
    })),
    ...selectedFileIds.map((id) => ({ id, type: 'file' as const, name: '' })),
  ];

  return (
    <>
      <div
        className={cn(
          'fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center gap-4 px-4 py-3 sm:py-2.5 rounded-2xl sm:rounded-full border border-border/80 bg-background/80 dark:bg-background/70 backdrop-blur-xl shadow-2xl transition-all duration-300 transform w-11/12 max-w-xl',
          active
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-12 opacity-0 scale-95 pointer-events-none',
        )}
      >
        {/* Selected count info & Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-6 rounded-full bg-primary/15 text-primary text-xs font-bold ring-1 ring-primary/20">
            {totalCount}
          </div>
          <span className="text-sm font-medium text-foreground mr-1">
            selected
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            disabled={isPending}
            className="size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title="Clear Selection"
          >
            <X className="size-4" />
          </Button>

          {/* Select All Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={isPending}
            className="h-7 px-2.5 rounded-full text-xs font-semibold text-primary hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-1"
          >
            <CheckSquare className="size-3.5" />
            Select All
          </Button>
        </div>

        {/* Action divider line */}
        <div className="hidden sm:block h-6 w-px bg-border/60" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 w-full justify-center">
          {isTrash ? (
            <>
              {/* Restore permanently */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTrashMany(false)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all cursor-pointer font-medium"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin text-primary mr-1.5" />
                ) : (
                  <RotateCcw className="size-4 text-primary mr-1.5" />
                )}
                Restore
              </Button>

              {/* Delete permanently */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-destructive hover:bg-destructive/5 transition-all cursor-pointer font-medium"
              >
                <Trash2 className="size-4 mr-1.5" />
                Delete Permanently
              </Button>
            </>
          ) : (
            <>
              {/* Star selected */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStarMany(true)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/5 transition-all cursor-pointer font-medium"
              >
                <Star className="size-4 mr-1.5" />
                Star
              </Button>

              {/* Unstar selected */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStarMany(false)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-muted-foreground hover:text-muted-foreground hover:bg-muted/65 transition-all cursor-pointer font-medium"
              >
                <Star className="size-4 fill-current mr-1.5 text-yellow-400" />
                Unstar
              </Button>

              {/* Move selected */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMoveOpen(true)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all cursor-pointer font-medium"
              >
                <FolderInput className="size-4 mr-1.5 text-primary" />
                Move
              </Button>

              {/* Move to Trash */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTrashMany(true)}
                disabled={isPending}
                className="h-9 px-1 rounded-full text-destructive hover:bg-destructive/5 transition-all cursor-pointer font-medium"
              >
                <Trash2 className="size-4 mr-1.5" />
                Trash
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Floating Move Dialog */}
      <MoveDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        items={moveItems}
        onSuccess={clearSelection}
      />

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md gap-6 rounded-3xl p-6 bg-background/90 backdrop-blur-xl border border-border shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
              <ShieldAlert className="size-6" />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Permanently Delete {totalCount} Selected Items?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Are you sure you want to permanently delete these{' '}
              <strong className="text-foreground font-semibold">
                {totalCount} items
              </strong>
              ? This will recursively remove all selected files, folders, and
              their contents from the database and storage.
              <span className="text-destructive font-medium block mt-2">
                This action is completely irreversible.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full sm:w-auto rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDeletePermanently}
              className="w-full sm:w-auto gap-2 rounded-xl shadow-sm shadow-destructive/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
