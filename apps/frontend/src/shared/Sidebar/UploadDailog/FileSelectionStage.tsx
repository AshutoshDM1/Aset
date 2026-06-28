import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatBytes } from './uploadStore';
import { cn } from '@/lib/utils';
import { Upload, FileIcon, Archive, FolderPlus } from 'lucide-react';
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
  setLocalFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

interface PendingZip {
  file: File;
  zipEntries: any[];
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
  setLocalFiles,
}: FileSelectionStageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingZips, setPendingZips] = useState<PendingZip[]>([]);

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
          enumerable: true,
        });
      }
    });

    // Scanned non-zip files
    if (nonZips.length > 0) {
      setLocalFiles((prev) => {
        const unique = [...prev];
        nonZips.forEach((f) => {
          if (!unique.some((u) => u.name === f.name && u.size === f.size)) {
            unique.push(f);
          }
        });
        return unique;
      });
    }

    // Scanned zip files
    if (zips.length > 0) {
      const loadZip = await import('jszip').then((m) => m.default);
      for (const zipFile of zips) {
        try {
          const zip = await loadZip.loadAsync(zipFile);
          const zipEntries: any[] = [];
          zip.forEach((_relativePath, entry) => {
            if (!entry.dir) {
              zipEntries.push(entry);
            }
          });
          if (zipEntries.length > 0) {
            setPendingZips((prev) => [...prev, { file: zipFile, zipEntries }]);
          }
        } catch (err) {
          console.error(err);
          toast.error(`Could not read zip archive: ${zipFile.name}`);
        }
      }
    }
  };

  const handleFileSelect = (pickedFiles: FileList | null) => {
    if (!pickedFiles) return;
    processFilesBeforeAdding(Array.from(pickedFiles));
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = e.target.files;
    if (!pickedFiles) return;
    const array = Array.from(pickedFiles).map((file) => {
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
    if (!items || items.length === 0) return;

    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        entries.push(entry);
      }
    }

    const loadToast = toast.loading('Parsing dropped items...');
    try {
      const filesPromises = entries.map((entry) => traverseFileTree(entry));
      const filesArray = (await Promise.all(filesPromises)).flat();
      await processFilesBeforeAdding(filesArray);
    } catch (err) {
      console.error(err);
      toast.error('Error scanning folder contents');
    } finally {
      toast.dismiss(loadToast);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300 flex-1 ">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'h-full flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 relative cursor-default',
          dragOver
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-muted-foreground/20 bg-muted/10 hover:bg-muted/15 hover:border-primary/30',
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

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3 cursor-default">
                <Upload
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-56 text-center">
              Supports files, folders, recursive directory drops and ZIP
              extraction
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <p className="text-xs font-medium text-foreground mb-3">
          Drop files or folders here
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="gap-1.5 text-xs h-7 px-3 cursor-pointer"
          >
            <FileIcon className="size-3 text-blue-500" />
            Files
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="gap-1.5 text-xs h-7 px-3 cursor-pointer"
          >
            <FolderPlus className="size-3 text-amber-500" />
            Folder
          </Button>
        </div>
      </div>

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
