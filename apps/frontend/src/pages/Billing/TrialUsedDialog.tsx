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

interface TrialUsedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialUsedDialog: React.FC<TrialUsedDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-sm bg-popover text-popover-foreground rounded-3xl border border-border/50 shadow-2xl p-6 text-center"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <span className="text-red-500 font-bold text-lg">!</span>
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-base font-semibold text-center w-full">
              Free Trial Already Used
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-center leading-relaxed">
              Our records show that you have already redeemed your one-time
              15-day Free Trial (20 GB limit).
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col w-full">
          <Button
            onClick={onClose}
            className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95 font-medium py-2.5 rounded-xl text-xs border-none"
          >
            View Premium Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
