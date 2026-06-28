import * as React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  FileCode,
  FolderArchive,
  Music,
  File as FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileIconProps = {
  className?: string;
  label?: string;
  outerSvg?: boolean;
  view?: 'list' | 'grid';
};

type FileDocIconProps = {
  className?: string;
  label: string;
  outerSvg?: boolean;
  view?: 'list' | 'grid';
  color:
    | 'red'
    | 'indigo'
    | 'teal'
    | 'amber'
    | 'blue'
    | 'emerald'
    | 'gray'
    | 'sky';
  children?: React.ReactNode;
};

function FileDocIcon({
  className,
  label,
  outerSvg = false,
  view = 'grid',
  color = 'gray',
  children,
}: FileDocIconProps) {
  const colorMap = {
    red: {
      bg: 'fill-red-50/50',
      stroke: 'stroke-red-300',
      text: 'text-red-500',
      fold: 'fill-red-200',
      badgeBorder: 'border-red-200 text-red-500',
    },
    indigo: {
      bg: 'fill-indigo-50/50',
      stroke: 'stroke-indigo-300',
      text: 'text-indigo-500',
      fold: 'fill-indigo-200',
      badgeBorder: 'border-indigo-200 text-indigo-500',
    },
    teal: {
      bg: 'fill-teal-50/50',
      stroke: 'stroke-teal-300',
      text: 'text-teal-600',
      fold: 'fill-teal-200',
      badgeBorder: 'border-teal-200 text-teal-600',
    },
    amber: {
      bg: 'fill-amber-50/50',
      stroke: 'stroke-amber-300',
      text: 'text-amber-600',
      fold: 'fill-amber-200',
      badgeBorder: 'border-amber-200 text-amber-600',
    },
    blue: {
      bg: 'fill-blue-50/50',
      stroke: 'stroke-blue-300',
      text: 'text-blue-500',
      fold: 'fill-blue-200',
      badgeBorder: 'border-blue-200 text-blue-500',
    },
    emerald: {
      bg: 'fill-emerald-50/50',
      stroke: 'stroke-emerald-300',
      text: 'text-emerald-600',
      fold: 'fill-emerald-200',
      badgeBorder: 'border-emerald-200 text-emerald-600',
    },
    sky: {
      bg: 'fill-sky-100/50',
      stroke: 'stroke-sky-300',
      text: 'text-sky-500',
      fold: 'fill-sky-200',
      badgeBorder: 'border-sky-200 text-sky-500',
    },
    gray: {
      bg: 'fill-gray-50/50',
      stroke: 'stroke-gray-300',
      text: 'text-gray-500',
      fold: 'fill-gray-200',
      badgeBorder: 'border-gray-200 text-gray-500',
    },
  };

  const theme = colorMap[color];

  if (!outerSvg) {
    return (
      <div
        className={cn(
          'select-none flex items-center justify-center flex-col gap-0',
          theme.text,
          className,
        )}
      >
        {children}
        {/* Badge pill */}
        <div
          className={cn(
            'px-2.5 text-[10px]',
            view === 'list' ? 'text-[8px]' : 'text-[10px]',
            theme.badgeBorder,
          )}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full h-full aspect-72/90 select-none flex items-center justify-center rounded-xl transition-all duration-200',
        className,
      )}
    >
      {/* Page outline SVG */}
      <svg
        viewBox="0 0 72 90"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        {/* Page body background */}
        <path
          d="M8 2h40l16 16v62c0 4.4-3.6 8-8 8H16c-4.4 0-8-3.6-8-8V2z"
          className={theme.bg}
        />
        {/* Page body border */}
        <path
          d="M8 2h40l16 16v62c0 4.4-3.6 8-8 8H16c-4.4 0-8-3.6-8-8V2z"
          className={theme.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Top-right corner fold flap */}
        <path
          d="M48 2v16h16L48 2z"
          className={cn(theme.fold, theme.stroke)}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Central Content */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-between p-2 pt-6 pb-3.5',
          theme.text,
        )}
      >
        <div className="flex-1 flex items-center justify-center w-full">
          {children}
        </div>

        {/* Badge pill */}
        <div
          className={cn(
            'px-2.5 py-0.5 rounded-md text-[10px] uppercase text-center min-w-10 select-none leading-none border bg-white shadow-xs',
            theme.badgeBorder,
          )}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export function PdfFileIcon({
  className,
  label = 'PDF',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="red"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <FileText
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function ImageFileIcon({
  className,
  label = 'PNG',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="sky"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <ImageIcon
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function VideoFileIcon({
  className,
  label = 'MKV',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="indigo"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <VideoIcon
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function CodeFileIcon({
  className,
  label = 'CODE',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="amber"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <FileCode
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function ZipFileIcon({
  className,
  label = 'ZIP',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="blue"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <FolderArchive
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function AudioFileIcon({
  className,
  label = 'MP3',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="emerald"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <Music
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}

export function DefaultFileIcon({
  className,
  label = 'FILE',
  outerSvg = true,
  view = 'grid',
}: FileIconProps) {
  return (
    <FileDocIcon
      color="gray"
      label={label}
      outerSvg={outerSvg}
      view={view}
      className={className}
    >
      <FileIcon
        className={cn('stroke-1', view === 'list' ? 'size-5' : 'size-8')}
      />
    </FileDocIcon>
  );
}
