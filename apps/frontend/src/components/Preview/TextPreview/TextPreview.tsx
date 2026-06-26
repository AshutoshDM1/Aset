import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFileDownload } from '@/hooks/useFileDownload';
import { toast } from 'sonner';

import { useTextFetcher } from './useTextFetcher';
import { TextHeader } from './TextHeader';
import { TextControls } from './TextControls';
import { TextViewer } from './TextViewer';

interface TextPreviewProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileId?: string;
}

export function TextPreview({
  open,
  onClose,
  fileName,
  fileUrl,
  fileId,
}: TextPreviewProps) {
  const { download, isDownloading } = useFileDownload();
  const { content, isLoading, error, copied, copyToClipboard } = useTextFetcher(
    {
      open,
      fileUrl,
    },
  );

  const [lineNumbers, setLineNumbers] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('sm');

  // Escape key keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleDownload = () => {
    if (fileId) {
      download(fileId, fileName, fileUrl);
    } else {
      toast.error('Please provide a fileId for download');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex flex-col justify-between bg-black text-white select-none overflow-hidden"
      >
        <TextHeader
          fileName={fileName}
          copied={copied}
          isDownloading={isDownloading}
          onCopy={copyToClipboard}
          onDownload={handleDownload}
          onClose={onClose}
        />

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/50">
            <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase animate-pulse">
              Preloading File Content...
            </span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-500/80 px-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider">
              Failed to Preview File
            </span>
            <p className="text-xs text-white/40 max-w-md">{error}</p>
          </div>
        ) : (
          <TextViewer
            content={content}
            fileName={fileName}
            lineNumbers={lineNumbers}
            wordWrap={wordWrap}
            fontSize={fontSize}
          />
        )}

        {!isLoading && !error && (
          <TextControls
            lineNumbers={lineNumbers}
            wordWrap={wordWrap}
            fontSize={fontSize}
            setLineNumbers={setLineNumbers}
            setWordWrap={setWordWrap}
            setFontSize={setFontSize}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
