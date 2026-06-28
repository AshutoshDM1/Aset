import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileIcon, Trash2, Info } from 'lucide-react';
import { formatBytes, useUploadStore } from './uploadStore';

interface FileListPanelProps {
  localFiles: File[];
  setLocalFiles: React.Dispatch<React.SetStateAction<File[]>>;
  decodeVideos: boolean;
  setDecodeVideos: (v: boolean) => void;
}

export default function FileListPanel({
  localFiles,
  setLocalFiles,
  decodeVideos,
  setDecodeVideos,
}: FileListPanelProps) {
  const { persistStructure } = useUploadStore();

  const videoFiles = localFiles.filter((f) => {
    const n = f.name.toLowerCase();
    return (
      n.endsWith('.mkv') ||
      n.endsWith('.mp4') ||
      n.endsWith('.mov') ||
      n.endsWith('.webm')
    );
  });
  const totalVideoSize = videoFiles.reduce((acc, f) => acc + f.size, 0);
  const isDecodingDisabled =
    videoFiles.length > 5 || totalVideoSize > 6 * 1024 * 1024 * 1024;

  const removeFile = (idx: number) =>
    setLocalFiles((prev) => prev.filter((_, i) => i !== idx));

  if (localFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-10">
        <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
          <FileIcon className="size-4 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground">No files selected yet</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full gap-3">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">
            {localFiles.length} file{localFiles.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            className="text-xs h-auto py-0.5 px-1.5 text-destructive hover:bg-destructive/5"
            onClick={() => setLocalFiles([])}
          >
            Clear all
          </Button>
        </div>

        {/* Scrollable file list */}
        <div className="flex-1 min-h-0 border border-border/60 rounded-xl divide-y divide-border/60 overflow-y-auto custom-scrollbar bg-muted/5">
          {localFiles.map((file, idx) => {
            const filepath = (file as any).filepath || file.name;
            const hasSubPath =
              filepath.includes('/') && filepath.lastIndexOf('/') > 0;
            const dirPath = hasSubPath
              ? filepath.substring(0, filepath.lastIndexOf('/'))
              : '';

            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-xs group hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileIcon className="size-3.5 text-blue-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate text-foreground font-medium leading-snug">
                      {file.name}
                    </span>
                    {persistStructure && dirPath && (
                      <span className="text-[9px] text-muted-foreground truncate font-mono">
                        {dirPath}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video decoding toggle — only when there are videos */}
        {videoFiles.length > 0 && (
          <div className="flex items-center justify-between shrink-0 border border-border/60 rounded-xl px-3 py-2 bg-muted/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <label
                  htmlFor="video-decode-switch"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none"
                >
                  <Info className="size-3 text-muted-foreground" />
                  Video decoding
                  {isDecodingDisabled && (
                    <span className="text-destructive text-[10px]">
                      (disabled)
                    </span>
                  )}
                </label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-60 text-xs">
                {isDecodingDisabled
                  ? 'Disabled: more than 5 videos or total size exceeds 6 GB.'
                  : 'Extract subtitle tracks and secondary audio from videos for multi-language playback.'}
              </TooltipContent>
            </Tooltip>
            <Switch
              id="video-decode-switch"
              checked={decodeVideos && !isDecodingDisabled}
              disabled={isDecodingDisabled}
              onCheckedChange={setDecodeVideos}
              className="scale-90"
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
