import { Download, X, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface TextHeaderProps {
  fileName: string;
  copied: boolean;
  isDownloading: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export function TextHeader({
  fileName,
  copied,
  isDownloading,
  onCopy,
  onDownload,
  onClose,
}: TextHeaderProps) {
  return (
    <motion.div
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute top-0 left-0 right-0 z-110 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black to-transparent"
    >
      <div className="flex flex-col max-w-[70%]">
        <span className="text-white/60 text-[10px] font-bold tracking-wider uppercase">
          Text Preview
        </span>
        <h1 className="text-sm md:text-base font-semibold truncate text-white/95">
          {fileName}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center size-9 md:size-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white/80 hover:text-white transition-all cursor-pointer shadow-md"
          title="Copy Content"
        >
          {copied ? (
            <Check className="size-4.5 text-emerald-500" />
          ) : (
            <Copy className="size-4.5" />
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center size-9 md:size-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white/80 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Secure Download"
        >
          {isDownloading ? (
            <div className="size-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Download className="size-4.5" />
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center size-9 md:size-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white/80 hover:text-white transition-all cursor-pointer shadow-md"
          title="Close Preview"
        >
          <X className="size-4.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
