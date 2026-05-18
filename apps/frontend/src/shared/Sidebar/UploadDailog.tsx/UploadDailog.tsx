import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { queryClient, trpc } from '@/utils/trpc';
import { useUploadStore, uploadWithProgress } from './uploadStore';
import type { UploadFileState } from './uploadStore';
import FolderSelectionStage from './FolderSelectionStage';
import FileSelectionStage from './FileSelectionStage';
import UploadProgressStage from './UploadProgressStage';
import MinimizedPill from './MinimizedPill';
import { UploadCloud, X, Minus } from 'lucide-react';

export default function UploadDailog() {
  const {
    isOpen,
    isMinimized,
    folderId,
    files,
    isUploading,
    minimizeDialog,
    setFiles,
    updateFileProgress,
    updateFileStatus,
    setIsUploading,
    reset,
  } = useUploadStore();

  const [localFiles, setLocalFiles] = useState<File[]>([]);

  // tRPC Mutations
  const presign = useMutation(trpc.file.presignUpload.mutationOptions());
  const registerFile = useMutation(trpc.file.create.mutationOptions());

  // Perform upload sequence
  const startUploads = async () => {
    if (!folderId || localFiles.length === 0) return;

    setIsUploading(true);

    // Initial state mapping in Zustand store
    const storeFiles: UploadFileState[] = localFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'idle',
    }));

    setFiles(storeFiles);

    // Run parallel uploads
    const uploadPromises = localFiles.map(async (file, index) => {
      const fileState = storeFiles[index];
      const fileId = fileState.id;

      try {
        updateFileStatus(fileId, 'uploading');
        const sizeMb = file.size / (1024 * 1024);

        // 1. Get presigned URL
        const signed = await presign.mutateAsync({
          folderId,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          sizeMb,
        });

        // 2. Perform upload via XMLHttpRequest with progress tracking
        await uploadWithProgress(
          signed.uploadUrl,
          file,
          signed.contentType,
          (percent) => {
            updateFileProgress(fileId, percent);
          },
        );

        // 3. Register file in database
        await registerFile.mutateAsync({
          name: file.name,
          folderId,
          objectKey: signed.objectKey,
          sizeMb,
        });

        updateFileStatus(fileId, 'success');
      } catch (err: any) {
        console.error('File upload failed:', err);
        updateFileStatus(
          fileId,
          'error',
          err.message || 'Could not complete upload',
        );
      }
    });

    await Promise.all(uploadPromises);

    // Invalidate dashboard and storage queries
    void queryClient.invalidateQueries(
      trpc.file.listByFolder.queryFilter({ folderId }),
    );
    void queryClient.invalidateQueries(trpc.user.me.queryFilter());
    toast.success('Finished processing upload queue!');
  };

  // Reset internal state on close
  useEffect(() => {
    if (!isOpen) {
      setLocalFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isMinimized) {
    return <MinimizedPill />;
  }

  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const isAllDone =
    files.length > 0 && successCount + errorCount === files.length;

  return (
    <Dialog
      open={isOpen && !isMinimized}
      onOpenChange={(open) => {
        if (!open) {
          if (isUploading && !isAllDone) {
            minimizeDialog();
          } else {
            reset();
          }
        }
      }}
    >
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[85vh]"
        showCloseButton={false}
      >
        {/* Title Bar Header */}
        <header className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <UploadCloud className="size-5 text-primary" />
            <DialogTitle className="text-base font-semibold leading-none">
              Upload Files
            </DialogTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {isUploading && !isAllDone && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-muted/80"
                onClick={minimizeDialog}
                title="Minimize to Background"
              >
                <Minus className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-muted/80"
              onClick={isUploading && !isAllDone ? minimizeDialog : reset}
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!isUploading ? (
            <div className="space-y-5">
              <FolderSelectionStage />
              {folderId !== null && folderId !== undefined && (
                <FileSelectionStage
                  localFiles={localFiles}
                  setLocalFiles={setLocalFiles}
                />
              )}
            </div>
          ) : (
            <UploadProgressStage />
          )}
        </div>

        {/* Footer Actions Panel */}
        <footer className="border-t border-border/80 p-4 bg-muted/10 flex items-center justify-end gap-2 shrink-0">
          {!isUploading ? (
            <>
              <Button variant="ghost" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!folderId || localFiles.length === 0}
                onClick={startUploads}
              >
                Upload{' '}
                {localFiles.length > 0 ? `(${localFiles.length} files)` : ''}
              </Button>
            </>
          ) : (
            <>
              {!isAllDone && (
                <Button variant="secondary" size="sm" onClick={minimizeDialog}>
                  Run in Background
                </Button>
              )}
              <Button size="sm" disabled={!isAllDone} onClick={reset}>
                {isAllDone && errorCount > 0 ? 'Done (With Errors)' : 'Done'}
              </Button>
            </>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
