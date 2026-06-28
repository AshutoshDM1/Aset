import { Button } from '@/components/ui/button';
import { useUploadStore, cancelFileUpload } from './uploadStore';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileIcon, CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

export default function UploadProgressStage() {
  const { files, persistStructure } = useUploadStore();

  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const cancelledCount = files.filter((f) => f.status === 'cancelled').length;
  const completedCount = successCount + errorCount + cancelledCount;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Processing Upload Queue
        </span>
        <span className="text-xs font-bold text-foreground">
          {completedCount} / {files.length} Completed
        </span>
      </div>

      <div className="space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {files.map((file) => {
          const isPending = file.status === 'idle';
          const isActive = file.status === 'uploading';
          const isSuccess = file.status === 'success';
          const isError = file.status === 'error';
          const isCancelled = file.status === 'cancelled';
          const hasSubPath =
            file.filepath &&
            file.filepath.includes('/') &&
            file.filepath.lastIndexOf('/') > 0;
          const dirPath =
            hasSubPath && file.filepath
              ? file.filepath.substring(0, file.filepath.lastIndexOf('/'))
              : '';

          return (
            <div
              key={file.id}
              className={cn(
                'border rounded-xl p-3.5 transition-all duration-300',
                isSuccess && 'border-green-500/20 bg-green-500/5',
                isError && 'border-red-500/20 bg-red-500/5',
                isCancelled && 'border-muted bg-muted/40 opacity-70',
                isActive && 'border-primary/20 bg-primary/5',
              )}
            >
              <div className="flex items-center justify-between gap-4 text-xs font-semibold mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <FileIcon
                    className={cn(
                      'size-4 shrink-0',
                      isSuccess && 'text-green-500',
                      isError && 'text-red-500',
                      isCancelled && 'text-muted-foreground',
                      isActive && 'text-primary animate-pulse',
                      isPending && 'text-muted-foreground',
                    )}
                  />
                  <div className="flex flex-col truncate">
                    <span
                      className={cn(
                        'truncate font-medium',
                        isCancelled
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {file.name}
                    </span>
                    {persistStructure && dirPath && (
                      <span className="text-[9px] text-muted-foreground truncate font-mono mt-0.5">
                        {dirPath}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSuccess && (
                    <CheckCircle2 className="size-4 text-green-500" />
                  )}
                  {isError && <AlertCircle className="size-4 text-red-500" />}
                  {isCancelled && (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
                  {isActive && (
                    <span className="font-mono text-primary mr-1 text-xs">
                      {file.progress}%
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-muted-foreground mr-1">
                      Waiting
                    </span>
                  )}
                  {(isActive || isPending) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer shrink-0"
                      onClick={() => cancelFileUpload(file.id)}
                      title="Cancel file upload"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {(isActive || isSuccess) && (
                <Progress
                  value={file.progress}
                  className={cn(
                    'h-1.5',
                    isSuccess &&
                      '*:data-[slot=progress-indicator]:bg-green-500',
                  )}
                />
              )}

              {/* Error/Cancel details */}
              {isError && file.errorMsg && (
                <span className="text-[10px] text-red-500 mt-1 block">
                  {file.errorMsg}
                </span>
              )}
              {isCancelled && (
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Cancelled
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
