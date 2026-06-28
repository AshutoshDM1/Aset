import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadStore } from './uploadStore';
import { FolderOpen, FolderPlus, Loader2, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FolderSelectionStage() {
  const navigate = useNavigate();
  const { folderId, setFolderId, closeDialog } = useUploadStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // tRPC Queries & Mutations
  const ownedQuery = useQuery(trpc.folder.listAll.queryOptions());
  const sharedQuery = useQuery(trpc.folder.listShared.queryOptions());

  const loadingFolders = ownedQuery.isLoading || sharedQuery.isLoading;

  const createFolderMutation = useMutation(
    trpc.folder.create.mutationOptions(),
  );

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const load = toast.loading('Creating folder...');
    try {
      const newFolder = await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
      });
      toast.success(`Folder "${newFolder.name}" created!`);
      await ownedQuery.refetch();
      setFolderId(newFolder.id);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (err) {
      toast.error('Could not create folder');
    } finally {
      toast.dismiss(load);
    }
  };

  const owned = ownedQuery.data ?? [];
  const shared = (sharedQuery.data ?? []).filter((f) => f.canUpload);

  const folders = [
    ...owned.map((f) => ({ id: f.id, name: f.name })),
    ...shared.map((f) => ({ id: f.id, name: `${f.name} (Shared)` })),
  ];

  if (loadingFolders) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-5 animate-spin text-primary" />
        Loading your folders...
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="border border-dashed border-destructive/20 bg-destructive/5 rounded-2xl p-6 text-center space-y-4">
        <div className="flex justify-center">
          <FolderOpen className="size-10 text-destructive/80" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            No active folders found
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            You must create at least one folder before you can upload any files.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              closeDialog();
              navigate('/dashboard/my-files');
            }}
          >
            Go to My Files
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateFolder(true)}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Create Folder
          </Button>
        </div>

        {showCreateFolder && (
          <form
            onSubmit={handleCreateFolder}
            className="bg-background border p-4 rounded-xl space-y-3 mt-4 text-left border-destructive/20"
          >
            <Label
              htmlFor="new-folder-name"
              className="text-xs font-semibold text-foreground/80 block"
            >
              Create New Folder
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-folder-name"
                className="flex-1 h-9 text-xs"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                disabled={createFolderMutation.isPending}
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                className="text-xs py-1 h-9 gap-1.5"
                disabled={createFolderMutation.isPending}
              >
                {createFolderMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                Create
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs py-1 h-9 text-muted-foreground"
                onClick={() => setShowCreateFolder(false)}
                disabled={createFolderMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={folderId ? String(folderId) : undefined}
          onValueChange={(val) => setFolderId(val)}
          disabled={createFolderMutation.isPending}
        >
          <SelectTrigger className="flex-1 h-9 w-full rounded-lg border-input bg-background text-sm text-foreground font-medium select-none">
            <SelectValue placeholder="Select a folder…" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="rounded-xl border border-border bg-popover shadow-xl"
          >
            {folders.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-9 w-9"
                onClick={() => setShowCreateFolder((prev) => !prev)}
                disabled={createFolderMutation.isPending}
              >
                <FolderPlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New folder</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showCreateFolder && (
        <form
          onSubmit={handleCreateFolder}
          className="bg-muted/30 border border-border p-4 rounded-xl space-y-3"
        >
          <Label
            htmlFor="inline-folder-name"
            className="text-xs font-semibold text-foreground/80 block"
          >
            Create New Folder
          </Label>
          <div className="flex gap-2">
            <Input
              id="inline-folder-name"
              className="flex-1 h-9 text-xs"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={createFolderMutation.isPending}
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="text-xs py-1 h-9 gap-1.5"
              disabled={createFolderMutation.isPending}
            >
              {createFolderMutation.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs py-1 h-9 text-muted-foreground"
              onClick={() => setShowCreateFolder(false)}
              disabled={createFolderMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
