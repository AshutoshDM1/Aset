import { useUploadStore } from './uploadStore';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadProgressStage() {
  const { files } = useUploadStore();

  const successCount = files.filter((f) => f.status === 'success').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Processing Upload Queue
        </span>
        <span className="text-xs font-bold text-foreground">
          {successCount} / {files.length} Completed
        </span>
      </div>

      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        {files.map((file) => {
          const isPending = file.status === 'idle';
          const isActive = file.status === 'uploading';
          const isSuccess = file.status === 'success';
          const isError = file.status === 'error';

          return (
            <div
              key={file.id}
              className={cn(
                'border rounded-xl p-3.5 transition-all duration-300',
                isSuccess && 'border-green-500/20 bg-green-500/5',
                isError && 'border-red-500/20 bg-red-500/5',
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
                      isActive && 'text-primary animate-pulse',
                      isPending && 'text-muted-foreground',
                    )}
                  />
                  <span className="truncate text-foreground font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSuccess && (
                    <CheckCircle2 className="size-4 text-green-500" />
                  )}
                  {isError && <AlertCircle className="size-4 text-red-500" />}
                  {isActive && (
                    <span className="font-mono text-primary">
                      {file.progress}%
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-muted-foreground">
                      Waiting
                    </span>
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

              {/* Error details */}
              {isError && file.errorMsg && (
                <span className="text-[10px] text-red-500 mt-1 block">
                  {file.errorMsg}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
