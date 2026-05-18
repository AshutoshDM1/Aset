import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatBytes } from './uploadStore';
import { cn } from '@/lib/utils';
import { UploadCloud, FileIcon, Trash2 } from 'lucide-react';

interface FileSelectionStageProps {
  localFiles: File[];
  setLocalFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function FileSelectionStage({
  localFiles,
  setLocalFiles,
}: FileSelectionStageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (pickedFiles: FileList | null) => {
    if (!pickedFiles) return;
    const array = Array.from(pickedFiles);
    setLocalFiles((prev) => [...prev, ...array]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (idxToRemove: number) => {
    setLocalFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Label className="text-sm font-medium text-foreground/90 block">
        Select Files to Upload
      </Label>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300',
          dragOver
            ? 'border-primary bg-primary/5 scale-[0.98]'
            : 'border-muted-foreground/20 bg-muted/10 hover:bg-muted/20 hover:border-primary/30',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <UploadCloud className="size-10 text-muted-foreground/75 mb-3" />
        <p className="text-sm font-semibold text-foreground">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports multiple files, including ZIP (.zip) archives
        </p>
      </div>

      {/* Local selected files list preview */}
      {localFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Selected Files ({localFiles.length})
            </span>
            <Button
              variant="ghost"
              className="text-xs h-auto p-1 text-destructive hover:bg-destructive/5"
              onClick={() => setLocalFiles([])}
            >
              Clear All
            </Button>
          </div>
          <div className="border border-border/60 rounded-xl divide-y divide-border/60 max-h-[160px] overflow-y-auto bg-muted/5">
            {localFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 text-xs group"
              >
                <div className="flex items-center gap-2 truncate pr-4">
                  <FileIcon className="size-3.5 text-blue-500 shrink-0" />
                  <span className="truncate text-foreground font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
