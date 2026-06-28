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
import { Sparkles } from 'lucide-react';
import { useBillingStore } from '../../store/billingStore';

interface UpgradeRequiredDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const UpgradeRequiredDialog: React.FC<UpgradeRequiredDialogProps> = ({
  isOpen,
  onOpenChange,
  featureName = 'video decoding',
}) => {
  const openPricing = useBillingStore((state) => state.openPricing);

  const handleUpgradeClick = () => {
    onOpenChange(false);
    openPricing();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover text-popover-foreground rounded-3xl border border-border shadow-2xl p-6 select-none animate-in fade-in zoom-in-95">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="size-12 text-primary flex items-center justify-center ">
            <Sparkles className="size-6 stroke-2 " />
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Premium Feature Locked
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            The{' '}
            <span className="font-semibold text-foreground">{featureName}</span>{' '}
            feature is only available on Pro and Business plans. Upgrade your
            storage plan to unlock multi-language audio extraction and subtitle
            indexing.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl text-xs font-normal cursor-pointer border-border hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgradeClick}
            className="flex-1 rounded-xl text-xs font-normal bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer flex items-center justify-center gap-1"
          >
            <Sparkles className="size-3.5 fill-current" />
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
