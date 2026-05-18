import { Button } from '@/components/ui/button';
import { useUploadStore } from '@/shared/Sidebar/UploadDailog.tsx/uploadStore';
import { Upload } from 'lucide-react';

type UploadFileButtonProps = {
  folderId: number;
  canUpload: boolean;
};

export function UploadFileButton({
  folderId,
  canUpload,
}: UploadFileButtonProps) {
  const openDialog = useUploadStore((state) => state.openDialog);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!canUpload}
      onClick={() => openDialog(folderId > 0 ? folderId : null)}
      className="gap-1.5"
    >
      <Upload className="size-4" />
      Upload file
    </Button>
  );
}
