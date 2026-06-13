import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmCancellationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const ConfirmCancellationDialog: React.FC<
  ConfirmCancellationDialogProps
> = ({ isOpen, onOpenChange, onConfirm, isPending }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover text-popover-foreground rounded-2xl border border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Confirm Plan Cancellation
          </DialogTitle>
          <DialogDescription className="text-sm mt-2 text-muted-foreground">
            Are you sure you want to cancel your current plan and return to the
            Starter (Free) plan? Your storage limit will be reset to 5 GB.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="cursor-pointer bg-red-600 hover:bg-red-500 text-white border-none"
            disabled={isPending}
          >
            Downgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
