import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Loader2, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function VideoDecodingSettings() {
  // Poll every 5 seconds to keep progress updated
  const { data: processingFiles, isLoading } = useQuery({
    ...trpc.file.getProcessingFiles.queryOptions(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-muted-foreground animate-in fade-in">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading decoding tasks...</span>
      </div>
    );
  }

  const activeTasks = processingFiles || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">
          Video Decoding Status
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Monitor active media extraction tasks. Optix extracts multi-language
          subtitle tracks and secondary audio tracks.
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border/80 bg-muted/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Loader2
              className={
                activeTasks.length > 0 ? 'size-5 animate-spin' : 'size-5'
              }
            />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Active Decodings
            </span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">
              {activeTasks.length}{' '}
              {activeTasks.length === 1 ? 'Video' : 'Videos'}
            </span>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          Current Processing Queue
        </span>

        {activeTasks.length === 0 ? (
          <div className="border border-dashed border-border/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5">
            <CheckCircle2 className="size-8 text-muted-foreground/50 mb-2.5" />
            <span className="text-sm font-semibold text-foreground">
              No Active Tasks
            </span>
            <span className="text-xs text-muted-foreground/80 mt-1 max-w-xs leading-normal">
              All videos are fully decoded or skipped. Newly uploaded videos
              will appear here during processing.
            </span>
          </div>
        ) : (
          <div className="border border-border/60 rounded-2xl divide-y divide-border/60 overflow-hidden bg-muted/5">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  <PlayCircle className="size-5 text-blue-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-foreground truncate text-sm">
                      {task.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Size: {task.sizeMb.toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0 sm:self-center">
                  <Clock className="size-3.5" />
                  <span>
                    Started{' '}
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
