import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatBytes, useUploadStore } from './uploadStore';
import { cn } from '@/lib/utils';
import {
  UploadCloud,
  FileIcon,
  Trash2,
  FolderIcon,
  Archive,
  Settings,
  FolderPlus,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface FileSelectionStageProps {
  localFiles: File[];
  setLocalFiles: React.Dispatch<React.SetStateAction<File[]>>;
  decodeVideos: boolean;
  setDecodeVideos: (decode: boolean) => void;
}

interface PendingZip {
  file: File;
  id: string;
}

// Simple mime-type resolver based on file extension
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'txt':
      return 'text/plain';
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'application/javascript';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}

// Client-side ZIP extractor using JSZip
const extractZip = async (zipFile: File): Promise<File[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const files: File[] = [];

  const promises: Promise<void>[] = [];
  loadedZip.forEach((_relativePath, zipEntry) => {
    // Skip directory entries, we only care about files.
    if (zipEntry.dir) return;

    const promise = zipEntry.async('blob').then((blob) => {
      const name = zipEntry.name.split('/').pop() || zipEntry.name;
      const file = new File([blob], name, {
        type: getMimeType(name),
      });

      // Attach relative path inside the ZIP for structure preservation
      Object.defineProperty(file, 'filepath', {
        value: zipEntry.name,
        writable: true,
        configurable: true,
      });
      files.push(file);
    });
    promises.push(promise);
  });

  await Promise.all(promises);
  return files;
};

// Recursive file tree reader for dropped folders using webkitGetAsEntry API
const traverseFileTree = async (entry: any, path = ''): Promise<File[]> => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file(
        (file: File) => {
          const relativePath = path ? `${path}/${file.name}` : file.name;
          Object.defineProperty(file, 'filepath', {
            value: relativePath,
            writable: true,
            configurable: true,
          });
          resolve([file]);
        },
        () => resolve([]),
      );
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        const allEntries: any[] = [];
        const readEntries = (): Promise<any[]> => {
          return new Promise((res) => {
            dirReader.readEntries(
              (entries: any[]) => res(entries),
              () => res([]),
            );
          });
        };

        while (true) {
          const entries = await readEntries();
          if (entries.length === 0) break;
          allEntries.push(...entries);
        }
        return allEntries;
      };

      readAllEntries().then(async (entries) => {
        const filesPromises = entries.map((childEntry) =>
          traverseFileTree(
            childEntry,
            path ? `${path}/${entry.name}` : entry.name,
          ),
        );
        const nestedFiles = await Promise.all(filesPromises);
        resolve(nestedFiles.flat());
      });
    } else {
      resolve([]);
    }
  });
};

export default function FileSelectionStage({
  localFiles,
  setLocalFiles,
  decodeVideos,
  setDecodeVideos,
}: FileSelectionStageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingZips, setPendingZips] = useState<PendingZip[]>([]);

  const { persistStructure, setPersistStructure } = useUploadStore();

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

  const processFilesBeforeAdding = async (files: File[]) => {
    const zips = files.filter((f) => f.name.toLowerCase().endsWith('.zip'));
    const nonZips = files.filter((f) => !f.name.toLowerCase().endsWith('.zip'));

    // Ensure non-zip files have at least their file name as default filepath
    nonZips.forEach((file) => {
      if (!(file as any).filepath) {
        Object.defineProperty(file, 'filepath', {
          value: file.name,
          writable: true,
          configurable: true,
        });
      }
    });

    if (zips.length > 0) {
      const newPending = zips.map((zip) => ({
        file: zip,
        id: Math.random().toString(36).substring(2, 9),
      }));
      setPendingZips((prev) => [...prev, ...newPending]);
    }

    setLocalFiles((prev) => [...prev, ...nonZips]);
  };

  const handleFileSelect = (pickedFiles: FileList | null) => {
    if (!pickedFiles) return;
    processFilesBeforeAdding(Array.from(pickedFiles));
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = e.target.files;
    if (!pickedFiles) return;
    const array = Array.from(pickedFiles).map((file) => {
      // In folder input, file.webkitRelativePath contains the full relative path e.g. "my_folder/sub/file.txt"
      const path = file.webkitRelativePath || file.name;
      Object.defineProperty(file, 'filepath', {
        value: path,
        writable: true,
        configurable: true,
      });
      return file;
    });
    processFilesBeforeAdding(array);
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const items = e.dataTransfer.items;
    if (!items) {
      if (e.dataTransfer.files) {
        processFilesBeforeAdding(Array.from(e.dataTransfer.files));
      }
      return;
    }

    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        entries.push(entry);
      }
    }

    const loadToast = toast.loading('Parsing dropped items recursively...');
    try {
      const filesPromises = entries.map((entry) => traverseFileTree(entry));
      const filesArray = (await Promise.all(filesPromises)).flat();
      await processFilesBeforeAdding(filesArray);
      toast.success('Successfully scanned and added folder files!');
    } catch (err) {
      console.error(err);
      toast.error('Error scanning folder contents');
    } finally {
      toast.dismiss(loadToast);
    }
  };

  const removeFile = (idxToRemove: number) => {
    setLocalFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Determine if we have selected files with subfolder paths
  const hasFolders = localFiles.some((f) => {
    const path = (f as any).filepath || '';
    return path.includes('/') && path.split('/').length > 1;
  });

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
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative',
          dragOver
            ? 'border-primary bg-primary/5 scale-[0.98]'
            : 'border-muted-foreground/20 bg-muted/10 hover:bg-muted/15 hover:border-primary/20',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFolderSelect}
        />

        <UploadCloud className="size-10 text-muted-foreground/75 mb-3" />
        <p className="text-sm font-semibold text-foreground">
          Drag & drop files or folders here, or browse
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Supports recursive directory drops and client-side ZIP extraction
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="gap-2 rounded-xl text-xs h-9 cursor-pointer"
          >
            <FileIcon className="size-4 text-blue-500" />
            Select Files
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="gap-2 rounded-xl text-xs h-9 cursor-pointer"
          >
            <FolderPlus className="size-4 text-amber-500" />
            Select Folder
          </Button>
        </div>
      </div>

      {/* Persist vs Flatten Settings Panel */}
      {hasFolders && (
        <TooltipProvider>
          <div className="border border-border bg-muted/20 rounded-2xl p-4.5 space-y-3.5 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Settings className="size-4 text-primary" />
              <span>Folder Upload Configuration</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We detected directory structures in your selection. Choose how
              Aset should organize these files:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPersistStructure(true)}
                className={cn(
                  'flex items-center justify-between p-1 px-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none',
                  persistStructure
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border/60 bg-transparent hover:bg-muted/10',
                )}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                  <FolderIcon
                    className={cn(
                      'size-4',
                      persistStructure
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <span>Preserve Subfolders</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Info className="size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Automatically recreate directory hierarchies and
                    subdirectories.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div
                onClick={() => setPersistStructure(false)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none',
                  !persistStructure
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border/60 bg-transparent hover:bg-muted/10',
                )}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                  <FileIcon
                    className={cn(
                      'size-4',
                      !persistStructure
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  />
                  <span>Flatten (Files Only)</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Info className="size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Discard folder paths. Upload all files into the root
                    destination directory.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* Video Decoding Option */}
      {videoFiles.length > 0 && (
        <div className="border border-border/80 bg-muted/10 rounded-2xl p-4.5 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1 pr-4">
              <label
                htmlFor="decode-videos"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enable Video Decoding</span>
              </label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Extract subtitle tracks and secondary audio tracks from your
                uploaded videos to support multi-language play and captions.
              </p>
            </div>
            <input
              id="decode-videos"
              type="checkbox"
              checked={decodeVideos && !isDecodingDisabled}
              disabled={isDecodingDisabled}
              onChange={(e) => setDecodeVideos(e.target.checked)}
              className="size-4.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed mt-0.5"
            />
          </div>
          {isDecodingDisabled && (
            <p className="text-[10px] text-destructive leading-tight font-medium">
              ⚠️ Video decoding is disabled because you are uploading more than
              5 videos or a total size exceeding 6 GB.
            </p>
          )}
        </div>
      )}

      {/* Local selected files list preview */}
      {localFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Selected Files ({localFiles.length})
            </span>
            <Button
              variant="ghost"
              className="text-xs h-auto p-1 text-destructive hover:bg-destructive/5 cursor-pointer"
              onClick={() => setLocalFiles([])}
            >
              Clear All
            </Button>
          </div>
          <div className="border border-border/60 rounded-xl divide-y divide-border/60 max-h-[180px] overflow-y-auto custom-scrollbar bg-muted/5">
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
                  className="flex items-center justify-between p-2.5 text-xs group"
                >
                  <div className="flex items-center gap-2 truncate pr-4">
                    <FileIcon className="size-3.5 text-blue-500 shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-foreground font-medium">
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
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive cursor-pointer"
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
        </div>
      )}

      {/* ZIP Prompt Modal */}
      {pendingZips.length > 0 && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Archive className="size-5 text-primary" />
                Unzip Archive?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
                We detected a ZIP archive:{' '}
                <strong className="text-foreground">
                  {pendingZips[0].file.name}
                </strong>{' '}
                ({formatBytes(pendingZips[0].file.size)}). Would you like to
                unzip and extract its contents or upload the archive directly?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={async () => {
                  const zipToExtract = pendingZips[0].file;
                  const loadToast = toast.loading(
                    `Extracting ${zipToExtract.name} client-side...`,
                  );
                  try {
                    const extracted = await extractZip(zipToExtract);
                    setLocalFiles((prev) => [...prev, ...extracted]);
                    toast.success(
                      `Extracted and queued ${extracted.length} files from ${zipToExtract.name}!`,
                    );
                  } catch (err) {
                    console.error(err);
                    toast.error(`Failed to extract ${zipToExtract.name}`);
                  } finally {
                    toast.dismiss(loadToast);
                    setPendingZips((prev) => prev.slice(1));
                  }
                }}
                className="w-full gap-2 cursor-pointer font-medium"
              >
                Unzip & Preview Files
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const zipFile = pendingZips[0].file;
                  if (!(zipFile as any).filepath) {
                    Object.defineProperty(zipFile, 'filepath', {
                      value: zipFile.name,
                      writable: true,
                      configurable: true,
                    });
                  }
                  setLocalFiles((prev) => [...prev, zipFile]);
                  setPendingZips((prev) => prev.slice(1));
                }}
                className="w-full cursor-pointer"
              >
                Upload ZIP Directly
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setPendingZips((prev) => prev.slice(1));
                }}
                className="w-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Discard ZIP File
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
