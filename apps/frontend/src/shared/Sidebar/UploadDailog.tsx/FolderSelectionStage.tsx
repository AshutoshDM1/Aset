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

export default function FolderSelectionStage() {
  const navigate = useNavigate();
  const { folderId, setFolderId, closeDialog } = useUploadStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // tRPC Queries & Mutations
  const {
    data: folders,
    isLoading: loadingFolders,
    refetch: refetchFolders,
  } = useQuery(trpc.folder.listAll.queryOptions());

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
      await refetchFolders();
      setFolderId(newFolder.id);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (err) {
      toast.error('Could not create folder');
    } finally {
      toast.dismiss(load);
    }
  };

  if (loadingFolders) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-5 animate-spin text-primary" />
        Loading your folders...
      </div>
    );
  }

  if (!folders || folders.length === 0) {
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
            className="bg-background border border-border p-4 rounded-xl space-y-3 mt-4 text-left animate-in slide-in-from-top-2 duration-200"
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
                autoFocus
              />
              <Button type="submit" size="sm" className="text-xs py-1 h-9">
                Create
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs py-1 h-9 text-muted-foreground"
                onClick={() => setShowCreateFolder(false)}
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
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground/90">
          Destination Folder
        </Label>
        <div className="flex items-center gap-2">
          <Select
            value={folderId ? String(folderId) : undefined}
            onValueChange={(val) => setFolderId(Number(val))}
          >
            <SelectTrigger className="flex-1 h-10 w-full rounded-lg border-input bg-background text-sm text-foreground font-medium select-none">
              <SelectValue placeholder="Select a destination folder" />
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
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={() => setShowCreateFolder((prev) => !prev)}
            title="Create new folder"
          >
            <FolderPlus className="size-4" />
          </Button>
        </div>
      </div>

      {showCreateFolder && (
        <form
          onSubmit={handleCreateFolder}
          className="bg-muted/30 border border-border p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200"
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
              autoFocus
            />
            <Button type="submit" size="sm" className="text-xs py-1 h-9">
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs py-1 h-9 text-muted-foreground"
              onClick={() => setShowCreateFolder(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
