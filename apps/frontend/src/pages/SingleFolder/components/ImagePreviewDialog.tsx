import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ImagePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  imageUrl: string;
};

export function ImagePreviewDialog({
  open,
  onOpenChange,
  fileName,
  imageUrl,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,56rem)] gap-4">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of uploaded image
          </DialogDescription>
        </DialogHeader>
        {imageUrl ? (
          <div className="flex max-h-[min(70vh,720px)] items-center justify-center overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/60">
            <img
              src={imageUrl}
              alt=""
              className="max-h-[min(70vh,720px)] w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Set{' '}
            <code className="rounded bg-muted px-1">R2_PUBLIC_BASE_URL</code> on
            the server (e.g. your R2 public dev URL).
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
