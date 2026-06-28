import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useUploadStore } from '@/shared/Sidebar/UploadDailog/uploadStore';

interface FolderDropZoneProps {
  folderId: string;
  canUpload: boolean;
  children: React.ReactNode;
}

/**
 * FolderDropZone makes the entire browser viewport droppable.
 * It attaches drag listeners to `document` (not a sized div), so empty
 * whitespace and areas outside the content grid are always valid drop targets —
 * exactly like Google Drive's behaviour.
 */
export function FolderDropZone({
  folderId,
  canUpload,
  children,
}: FolderDropZoneProps) {
  const { openDialog, setPreloadedFiles } = useUploadStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  // Depth counter prevents the overlay flickering when crossing child element boundaries
  const dragDepthRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (!canUpload) return;
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setIsDraggingOver(true);
    },
    [canUpload],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (!canUpload) return;
      e.preventDefault();
      dragDepthRef.current -= 1;
      if (dragDepthRef.current <= 0) {
        dragDepthRef.current = 0;
        setIsDraggingOver(false);
      }
    },
    [canUpload],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (!canUpload) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    },
    [canUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingOver(false);

      if (!canUpload) return;

      const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
      if (droppedFiles.length === 0) return;

      setPreloadedFiles(droppedFiles);
      openDialog(folderId);
    },
    [canUpload, folderId, openDialog, setPreloadedFiles],
  );

  // Attach to document so ANY part of the viewport is droppable,
  // not just the rendered content area.
  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <div className="w-full">
      {children}

      {/* Full-screen drop overlay — only visible while files are dragged over the page */}
      {isDraggingOver && canUpload && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/60 rounded-3xl m-3">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
              <Upload className="size-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-foreground">
                Drop files to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Files will be uploaded to this folder
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
