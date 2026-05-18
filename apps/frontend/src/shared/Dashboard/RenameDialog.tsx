import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';

type RenameDialogProps = {
  id: number;
  type: 'folder' | 'file';
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch?: () => void;
};

export function RenameDialog({
  id,
  type,
  currentName,
  open,
  onOpenChange,
  onRefetch,
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const folderRename = useMutation({
    ...trpc.folder.rename.mutationOptions(),
    onSuccess: () => {
      toast.success('Folder renamed');
      onOpenChange(false);
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getStarred.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      onRefetch?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Could not rename folder');
    },
  });

  const fileRename = useMutation({
    ...trpc.file.rename.mutationOptions(),
    onSuccess: () => {
      toast.success('File renamed');
      onOpenChange(false);
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getStarred.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());
      onRefetch?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Could not rename file');
    },
  });

  const isPending = folderRename.isPending || fileRename.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === currentName.trim()) {
      onOpenChange(false);
      return;
    }
    if (type === 'folder') {
      folderRename.mutate({ id, name: trimmed });
    } else {
      fileRename.mutate({ id, name: trimmed });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename {type}</DialogTitle>
            <DialogDescription>
              Enter a new name for this {type}.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-2">
            <Field>
              <FieldLabel htmlFor="rename-input">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="rename-input"
                  name="name"
                  autoFocus
                  placeholder="Enter new name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  aria-invalid={name.trim().length === 0 && name.length > 0}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Renaming…' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
