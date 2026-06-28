import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import {
  Loader2,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export function VideoDecodingSettings() {
  const [activeMobileTab, setActiveMobileTab] = useState<'current' | 'history'>(
    'current',
  );

  // Poll every 5 seconds to keep progress updated
  const { data: processingFiles, isLoading: isLoadingQueue } = useQuery({
    ...trpc.file.getProcessingFiles.queryOptions(),
    refetchInterval: 5000,
  });

  // Fetch decoding history
  const { data: decodingHistory, isLoading: isLoadingHistory } = useQuery({
    ...trpc.file.getDecodingHistory.queryOptions(),
    refetchInterval: 10000,
  });

  if (isLoadingQueue || isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-muted-foreground animate-in fade-in">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading decoding tasks...</span>
      </div>
    );
  }

  const activeTasks = processingFiles || [];
  const history = decodingHistory || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full min-w-0 flex flex-col">
      <div>
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
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider block">
              Active Decodings
            </span>
            <span className="text-base md:text-xl font-bold text-foreground mt-0.5 block">
              {activeTasks.length}{' '}
              {activeTasks.length === 1 ? 'Video' : 'Videos'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="flex md:hidden p-0.5 rounded-xl bg-muted/65 border border-border/60">
        <button
          type="button"
          onClick={() => setActiveMobileTab('current')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
            activeMobileTab === 'current'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Current ({activeTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('history')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
            activeMobileTab === 'history'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          History ({history.length})
        </button>
      </div>

      {/* Queue List */}
      <div
        className={cn(
          'space-y-3',
          activeMobileTab !== 'current' && 'hidden md:block',
        )}
      >
        <span className="text-xs text-muted-foreground tracking-wider block">
          Current Processing Queue
        </span>

        {activeTasks.length === 0 ? (
          <div className="border border-dashed border-border/60 rounded-2xl p-4 md:p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5">
            <CheckCircle2 className="size-8 text-muted-foreground/50 mb-2.5" />
            <span className="text-sm font-semibold text-foreground">
              No Active Tasks
            </span>
            <span className="hidden md:block text-xs text-muted-foreground/80 mt-1 max-w-xs leading-normal">
              All videos are fully decoded or skipped. Newly uploaded videos
              will appear here during processing.
            </span>
          </div>
        ) : (
          <div className="h-[140px] md:h-[200px] overflow-y-auto custom-scrollbar pr-1 w-full min-w-0">
            <div className="border border-border/60 rounded-2xl divide-y divide-border/60 bg-muted/5">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 truncate min-w-0">
                    <PlayCircle className="size-5 text-blue-500 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-foreground truncate text-sm">
                        {task.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
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
          </div>
        )}
      </div>

      {/* Decoding History */}
      <div
        className={cn(
          'space-y-3',
          activeMobileTab !== 'history' && 'hidden md:block',
        )}
      >
        <span className="text-xs text-muted-foreground tracking-wider block">
          Decoding History
        </span>

        {history.length === 0 ? (
          <div className="border border-dashed border-border/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5">
            <Clock className="size-8 text-muted-foreground/50 mb-2.5" />
            <span className="text-sm font-semibold text-foreground">
              No History Available
            </span>
            <span className="text-xs text-muted-foreground/80 mt-1 max-w-xs leading-normal">
              Completed and failed decoding jobs will appear here in
              chronological order.
            </span>
          </div>
        ) : (
          <div className="h-[300px] overflow-y-auto custom-scrollbar pr-1 w-full min-w-0">
            <div className="border border-border/60 rounded-2xl divide-y divide-border/60 bg-muted/5">
              {history.map((job) => (
                <div
                  key={job.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 truncate min-w-0">
                    {job.status === 'completed' ? (
                      <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="size-4.5" />
                      </div>
                    ) : (
                      <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <XCircle className="size-4.5" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-foreground truncate text-sm">
                        {job.fileName}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 items-center">
                        <span>Size: {job.fileSizeMb.toFixed(2)} MB</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-emerald-600 font-semibold">
                          {job.audioTracksCount} audio tracks
                        </span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-indigo-600 font-semibold">
                          {job.subtitleTracksCount} subtitles
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 text-muted-foreground font-medium sm:self-center">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span>Active time: {formatDuration(job.durationMs)}</span>
                    </div>
                    <span className="text-[10px]">
                      Completed{' '}
                      {formatDistanceToNow(new Date(job.completedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
