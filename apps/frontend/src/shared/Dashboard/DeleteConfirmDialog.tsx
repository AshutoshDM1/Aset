import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  type: 'folder' | 'file';
  name: string;
  isPending?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
  name,
  isPending = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6 rounded-3xl p-6">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-xl font-heading font-semibold text-foreground">
            Permanently Delete {type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Are you sure you want to permanently delete the {type}{' '}
            <strong className="text-foreground font-semibold">"{name}"</strong>?
            This will recursively remove all contents from the database and
            Cloudflare R2 storage.{' '}
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
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }}
            className="w-full sm:w-auto gap-2 rounded-xl shadow-sm shadow-destructive/20"
          >
            <Trash2 className="size-4" />
            {isPending ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
