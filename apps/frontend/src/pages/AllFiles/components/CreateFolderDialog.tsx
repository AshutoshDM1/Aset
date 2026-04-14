import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { queryClient, trpc } from '@/utils/trpc';

type CreateFolderDialogProps = {
  /** Wait until `user.me` has synced so `Folder.ownerId` FK succeeds */
  canCreate?: boolean;
  /** Create inside this folder; omit for drive root */
  parentFolderId?: number;
};

export function CreateFolderDialog({
  canCreate = true,
  parentFolderId,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const createFolder = useMutation({
    ...trpc.folder.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Folder created');
      setName('');
      setOpen(false);
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
    },
    onError: (err) => {
      toast.error(err.message || 'Could not create folder');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createFolder.mutate({
      name: trimmed,
      ...(parentFolderId != null ? { parentId: parentFolderId } : {}),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setName('');
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={!canCreate}>
          New folder
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Choose a name for your folder. You can rename it later.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-2">
            <Field>
              <FieldLabel htmlFor="folder-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="folder-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Documents"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createFolder.isPending}
                  aria-invalid={name.trim().length === 0 && name.length > 0}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createFolder.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFolder.isPending}>
              {createFolder.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
