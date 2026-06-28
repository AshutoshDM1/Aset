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
import { Upload, X, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function UploadDailog() {
  const {
    isOpen,
    isMinimized,
    folderId,
    files,
    isUploading,
    persistStructure,
    minimizeDialog,
    setFiles,
    updateFileProgress,
    updateFileStatus,
    setIsUploading,
    preloadedFiles,
    setPreloadedFiles,
    reset,
  } = useUploadStore();

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [decodeVideos, setDecodeVideos] = useState(true);

  const videoFiles = localFiles.filter((file) => {
    const nameLower = file.name.toLowerCase();
    return (
      nameLower.endsWith('.mkv') ||
      nameLower.endsWith('.mp4') ||
      nameLower.endsWith('.mov') ||
      nameLower.endsWith('.webm')
    );
  });
  const totalVideoSize = videoFiles.reduce((acc, f) => acc + f.size, 0);
  const isDecodingDisabled =
    videoFiles.length > 5 || totalVideoSize > 6 * 1024 * 1024 * 1024;

  // tRPC Mutations
  const presign = useMutation(trpc.file.presignUpload.mutationOptions());
  const registerFile = useMutation(trpc.file.create.mutationOptions());
  const getOrCreateFolder = useMutation(
    trpc.folder.getOrCreate.mutationOptions(),
  );

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
      filepath: (file as any).filepath || file.name,
    }));

    setFiles(storeFiles);

    // 1. Resolve and create nested folder paths sequentially to avoid parallel write race conditions
    const pathCache = new Map<string, string>();
    const resolvedFolderIds: string[] = [];

    const resolveFolderIdForPath = async (
      filepath: string,
      rootFolderId: string,
    ): Promise<string> => {
      if (
        !persistStructure ||
        !filepath ||
        !filepath.includes('/') ||
        filepath.split('/').length <= 1
      ) {
        return rootFolderId;
      }

      const segments = filepath.split('/');
      const dirSegments = segments.slice(0, -1);

      let currentParentId = rootFolderId;
      let currentPath = '';

      for (const segment of dirSegments) {
        if (!segment.trim()) continue;
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        const cacheKey = `${rootFolderId}::${currentPath}`;

        if (pathCache.has(cacheKey)) {
          currentParentId = pathCache.get(cacheKey)!;
        } else {
          const folder = await getOrCreateFolder.mutateAsync({
            name: segment,
            parentId: currentParentId,
          });
          pathCache.set(cacheKey, folder.id);
          currentParentId = folder.id;
        }
      }

      return currentParentId;
    };

    const needsFolderResolution =
      persistStructure &&
      localFiles.some((file) => {
        const path = (file as any).filepath || '';
        return path.includes('/') && path.split('/').length > 1;
      });

    if (needsFolderResolution) {
      const loadToast = toast.loading('Recreating folder structure...');
      try {
        for (const file of localFiles) {
          const path = (file as any).filepath || file.name;
          const targetFolderId = await resolveFolderIdForPath(path, folderId);
          resolvedFolderIds.push(targetFolderId);
        }
        toast.success('Folder structures prepared successfully!', {
          id: loadToast,
        });
      } catch (err) {
        console.error('Error pre-resolving folder structure:', err);
        toast.error('Failed to create subfolders. Uploading to root folder.', {
          id: loadToast,
        });
        // Fallback to root folder if resolution fails
        while (resolvedFolderIds.length < localFiles.length) {
          resolvedFolderIds.push(folderId);
        }
      }
    } else {
      // Direct resolution without any toasts or mutations
      for (const {} of localFiles) {
        resolvedFolderIds.push(folderId);
      }
    }

    // 2. Run parallel uploads
    const uploadPromises = localFiles.map(async (file, index) => {
      const fileState = storeFiles[index];
      const fileId = fileState.id;
      const targetFolderId = resolvedFolderIds[index];

      try {
        updateFileStatus(fileId, 'uploading');
        const sizeMb = file.size / (1024 * 1024);

        // 1. Get presigned URL using targetFolderId
        const signed = await presign.mutateAsync({
          folderId: targetFolderId,
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

        // 3. Register file in database using targetFolderId
        await registerFile.mutateAsync({
          name: file.name,
          folderId: targetFolderId,
          objectKey: signed.objectKey,
          sizeMb,
          decodingEnabled: decodeVideos && !isDecodingDisabled,
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

    // Invalidate dashboard, folder list and storage queries
    void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
    void queryClient.invalidateQueries(trpc.folder.listAll.queryFilter());
    void queryClient.invalidateQueries(
      trpc.file.listByFolder.queryFilter({ folderId }),
    );
    void queryClient.invalidateQueries(trpc.user.me.queryFilter());
    toast.success('Finished processing upload queue!');
  };

  // Seed localFiles from drag-and-dropped preloaded files when dialog opens
  useEffect(() => {
    if (isOpen && preloadedFiles.length > 0) {
      setLocalFiles((prev) => {
        const existing = new Set(prev.map((f) => f.name + f.size));
        const newOnes = preloadedFiles.filter(
          (f) => !existing.has(f.name + f.size),
        );
        return [...prev, ...newOnes];
      });
      setPreloadedFiles([]);
    }
  }, [isOpen, preloadedFiles, setPreloadedFiles]);

  // Reset internal state on close
  useEffect(() => {
    if (!isOpen) {
      setLocalFiles([]);
      setDecodeVideos(true);
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
    <TooltipProvider delayDuration={400}>
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
          className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[82vh] gap-0"
          showCloseButton={false}
        >
          {/* Compact header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="size-3.5 text-primary" strokeWidth={2} />
              </div>
              <DialogTitle className="text-sm font-semibold leading-none">
                Upload
              </DialogTitle>
            </div>
            <div className="flex items-center gap-0.5">
              {isUploading && !isAllDone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={minimizeDialog}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Run in background</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={isUploading && !isAllDone ? minimizeDialog : reset}
                  >
                    <X className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isUploading && !isAllDone ? 'Minimize' : 'Close'}
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
            {!isUploading ? (
              <div className="space-y-4">
                <FolderSelectionStage />
                {folderId !== null && folderId !== undefined && (
                  <FileSelectionStage
                    localFiles={localFiles}
                    setLocalFiles={setLocalFiles}
                    decodeVideos={decodeVideos}
                    setDecodeVideos={setDecodeVideos}
                  />
                )}
              </div>
            ) : (
              <UploadProgressStage />
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border/60 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
            {!isUploading ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8"
                  onClick={reset}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  disabled={!folderId || localFiles.length === 0}
                  onClick={startUploads}
                >
                  <Upload className="size-3.5" />
                  {localFiles.length > 0
                    ? `Upload ${localFiles.length}`
                    : 'Upload'}
                </Button>
              </>
            ) : (
              <>
                {!isAllDone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={minimizeDialog}
                  >
                    <Minus className="size-3.5 mr-1" />
                    Background
                  </Button>
                )}
                <Button
                  size="sm"
                  className="text-xs h-8"
                  disabled={!isAllDone}
                  onClick={reset}
                >
                  {isAllDone && errorCount > 0 ? '⚠ Done' : 'Done'}
                </Button>
              </>
            )}
          </footer>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
