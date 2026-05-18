import { Button } from '@/components/ui/button';
import { useUploadStore } from './uploadStore';
import { UploadCloud, Maximize2 } from 'lucide-react';

export default function MinimizedPill() {
  const { files, maximizeDialog } = useUploadStore();

  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const isAllDone =
    files.length > 0 && successCount + errorCount === files.length;

  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
      : 0;

  return (
    <div
      onClick={maximizeDialog}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl shadow-2xl p-4 cursor-pointer hover:bg-zinc-900 transition-all transform scale-100 hover:scale-105 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-center size-8 rounded-full bg-primary/15 text-primary">
        <UploadCloud className="size-4 " />
      </div>
      <div className="flex flex-col min-w-[120px]">
        <span className="text-sm font-semibold">
          {isAllDone ? 'Upload Completed' : 'Uploading Files...'}
        </span>
        <span className="text-xs text-zinc-400">
          {successCount + errorCount} of {files.length} done ({totalProgress}%)
        </span>
        {!isAllDone && (
          <div className="w-full bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={(e) => {
          e.stopPropagation();
          maximizeDialog();
        }}
      >
        <Maximize2 className="size-4" />
      </Button>
    </div>
  );
}
