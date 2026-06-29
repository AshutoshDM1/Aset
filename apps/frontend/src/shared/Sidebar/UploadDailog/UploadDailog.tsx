import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { queryClient, trpc } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import {
  useUploadStore,
  uploadWithProgress,
  activeUploads,
  cancelAllUploads,
} from './uploadStore';
import type { UploadFileState } from './uploadStore';
import FolderSelectionStage from './FolderSelectionStage';
import FileSelectionStage from './FileSelectionStage';
import FileListPanel from './FileListPanel';
import UploadProgressStage from './UploadProgressStage';
import MinimizedPill from './MinimizedPill';
import { Upload, X, Minus, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
    setPersistStructure,
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

      // Create a specific AbortController for this file upload
      const controller = new AbortController();
      activeUploads.set(fileId, controller);
      const { signal } = controller;

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

        // Check if aborted before triggering XHR
        if (signal.aborted) {
          throw new DOMException('Upload cancelled', 'AbortError');
        }

        // 2. Perform upload via XMLHttpRequest with progress tracking
        await uploadWithProgress(
          signed.uploadUrl,
          file,
          signed.contentType,
          (percent) => {
            updateFileProgress(fileId, percent);
          },
          signal,
        );

        // Check if aborted before DB registration
        if (signal.aborted) {
          throw new DOMException('Upload cancelled', 'AbortError');
        }

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
        // Distinguish between a user-initiated cancel and a real error
        if (err?.name === 'AbortError' || signal.aborted) {
          updateFileStatus(fileId, 'cancelled');
        } else {
          console.error('File upload failed:', err);
          updateFileStatus(
            fileId,
            'error',
            err.message || 'Could not complete upload',
          );
        }
      } finally {
        activeUploads.delete(fileId);
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

  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const cancelledCount = files.filter((f) => f.status === 'cancelled').length;
  const isAllDone =
    files.length > 0 &&
    successCount + errorCount + cancelledCount === files.length;

  const cancelUploads = () => {
    cancelAllUploads();
    toast.info('Cancelling all uploads...');
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

  // Reset internal state and abort ongoing uploads on close/unmount
  useEffect(() => {
    if (!isOpen) {
      cancelAllUploads();
      setLocalFiles([]);
      setDecodeVideos(true);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cancelAllUploads();
    };
  }, []);

  if (!isOpen) return null;

  if (isMinimized) {
    return <MinimizedPill />;
  }

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
          className={cn(
            'p-0 overflow-hidden flex flex-col max-h-[52vh] gap-0',
            localFiles.length ? 'sm:max-w-3xl' : 'sm:max-w-lg',
          )}
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

          {/* Two-panel content area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {!isUploading ? (
              <>
                {/* Left panel — folder picker + drop zone */}
                <div
                  className={cn(
                    'flex flex-col gap-4 overflow-y-auto custom-scrollbar px-4 py-4 transition-all duration-300',
                    localFiles.length > 0
                      ? 'w-[50%] border-r border-border/60'
                      : 'w-full',
                  )}
                >
                  <FolderSelectionStage />
                  {localFiles.some((f) => {
                    const path = (f as any).filepath || '';
                    return path.includes('/') && path.split('/').length > 1;
                  }) && (
                    <div className="flex items-center justify-between shrink-0 border border-border/60 rounded-xl px-3 py-2 bg-muted/5 animate-in slide-in-from-top-1 duration-200">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label
                            htmlFor="folder-structure-switch"
                            className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none"
                          >
                            <Info className="size-3 text-muted-foreground" />
                            Preserve subfolders
                          </label>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-60 text-xs">
                          Recreate folder and directory structures in
                          destination. If disabled, all selected files will be
                          uploaded directly into the folder.
                        </TooltipContent>
                      </Tooltip>
                      <Switch
                        id="folder-structure-switch"
                        checked={persistStructure}
                        onCheckedChange={setPersistStructure}
                        className="scale-90"
                      />
                    </div>
                  )}
                  {folderId !== null && folderId !== undefined && (
                    <FileSelectionStage setLocalFiles={setLocalFiles} />
                  )}
                </div>

                {/* Right panel — file list (slides in when files are selected) */}
                {localFiles.length > 0 && (
                  <div className="w-[50%] flex flex-col px-4 py-4 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                    <FileListPanel
                      localFiles={localFiles}
                      setLocalFiles={setLocalFiles}
                      decodeVideos={decodeVideos}
                      setDecodeVideos={setDecodeVideos}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                <UploadProgressStage />
              </div>
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
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-8"
                      onClick={cancelUploads}
                    >
                      Cancel Upload
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={minimizeDialog}
                    >
                      Background
                    </Button>
                  </>
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
