import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  PdfIcon,
  VideoIcon,
  ImageIcon,
  AudioIcon,
  ZipIcon,
  CodeIcon,
  DocxIcon,
  CsvIcon,
  PptxIcon,
  SvgIcon,
  AsetBrandIcon,
} from './UnlimitedIntegrationsWireframes';
import Logo from '@/shared/Navbar/Logo';

interface FileTypeItem {
  x: number;
  y: number;
  icon: React.ReactNode;
  name: string;
  color: string;
}

export const ConnectionsDiagram: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // SVG coordinates for a spacious 800x600 viewBox
  const fileTypes: FileTypeItem[] = [
    // Row 1 (y = 80)
    {
      x: 100,
      y: 80,
      icon: <PdfIcon />,
      name: 'PDF Documents',
      color: '#ef4444',
    },
    {
      x: 250,
      y: 80,
      icon: <VideoIcon />,
      name: 'HD Videos (MP4, WebM)',
      color: '#6366f1',
    },
    {
      x: 400,
      y: 80,
      icon: <ImageIcon />,
      name: 'Images & Photos (PNG, JPG)',
      color: '#10b981',
    },
    {
      x: 550,
      y: 80,
      icon: <AudioIcon />,
      name: 'Audio & Music (MP3, WAV)',
      color: '#ec4899',
    },
    {
      x: 700,
      y: 80,
      icon: <ZipIcon />,
      name: 'ZIP & TAR Archives',
      color: '#f59e0b',
    },
    // Row 2 (y = 220)
    {
      x: 100,
      y: 220,
      icon: <CodeIcon />,
      name: 'Code & Scripts (JS, TS, JSON)',
      color: '#3b82f6',
    },
    {
      x: 250,
      y: 220,
      icon: <DocxIcon />,
      name: 'Word Documents (DOCX)',
      color: '#0ea5e9',
    },
    {
      x: 400,
      y: 220,
      icon: <CsvIcon />,
      name: 'CSV & Spreadsheets',
      color: '#14b8a6',
    },
    {
      x: 550,
      y: 220,
      icon: <PptxIcon />,
      name: 'Slides & Presentations',
      color: '#f97316',
    },
    {
      x: 700,
      y: 220,
      icon: <SvgIcon />,
      name: 'Vectors & SVGs',
      color: '#06b6d4',
    },
  ];

  const brandX = 400;
  const brandY = 480;

  const isAnyHovered = hoveredIndex !== null;
  const activeGlowColor =
    hoveredIndex !== null ? fileTypes[hoveredIndex].color : '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      className="w-full lg:col-span-7 flex justify-center"
    >
      <div className="w-full max-w-[800px] aspect-5/4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-10 shadow-xs dark:shadow-none relative overflow-hidden group select-none transition-all duration-500">
        <svg
          className="w-full h-full relative"
          viewBox="0 0 800 600"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Connection Line Gradients */}
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.1" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Connecting Curved Paths */}
          {fileTypes.map((item, index) => {
            const startX = item.x;
            const startY = item.y + 40;
            const endX = brandX;
            const endY = brandY - 64;

            const cp1y = startY + 70;
            const cp2y = endY - 90;
            const pathData = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;

            const isHovered = hoveredIndex === index;

            return (
              <g key={index} className="group/path">
                {/* Outer glow stroke on hover */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? '7' : '1.5'}
                  className="transition-all duration-300 pointer-events-none"
                  style={{
                    opacity: isHovered ? 0.002 : isAnyHovered ? 0.05 : 0.2,
                    filter: isHovered
                      ? `drop-shadow(0 0 10px ${item.color})`
                      : 'none',
                  }}
                />
                {/* Primary standard connection stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? item.color : 'url(#line-grad)'}
                  strokeWidth={isHovered ? '2' : '2'}
                  className="transition-all duration-300"
                  style={{
                    opacity: isHovered ? 1 : isAnyHovered ? 0.1 : 0.5,
                  }}
                />
                {/* Moving Glowing Cylindrical Capsules */}
                <rect
                  x={isHovered ? -11 : -8}
                  y={isHovered ? -4 : -3}
                  width={isHovered ? 22 : 16}
                  height={isHovered ? 8 : 6}
                  rx={isHovered ? 4 : 3}
                  fill={item.color}
                  className="transition-all duration-300"
                  style={{
                    filter: `drop-shadow(0 0 6px ${item.color})`,
                    opacity: isHovered ? 1 : isAnyHovered ? 0.25 : 0.85,
                  }}
                >
                  <animateMotion
                    dur={`${3 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                    path={pathData}
                    rotate="auto"
                    begin={`${index * 0.35}s`}
                  />
                </rect>
              </g>
            );
          })}

          {/* File Format Cards Grid (rendered on top of paths - Spacious 80px wide cards) */}
          {fileTypes.map((item, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <foreignObject
                key={index}
                x={item.x - 40}
                y={item.y - 40}
                width="80"
                height="80"
                style={{ overflow: 'visible' }}
              >
                <motion.div
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ scale: 1.1, y: -6 }}
                  animate={{
                    opacity: isHovered ? 1 : isAnyHovered ? 0.5 : 1,
                    scale: isHovered ? 1.15 : isAnyHovered ? 0.95 : 1,
                    border: isHovered ? 1 : isAnyHovered ? 0.5 : 1,
                    borderColor: isHovered
                      ? item.color
                      : 'rgba(228, 228, 231, 0.8)',
                  }}
                  style={{
                    borderColor: isHovered ? item.color : undefined,
                    boxShadow: isHovered
                      ? `0 16px 36px -4px ${item.color}35, 0 6px 20px -6px ${item.color}45`
                      : undefined,
                  }}
                  className={cn(
                    'w-20 h-20 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80',
                    'shadow-[0_6px_20px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center justify-center cursor-pointer relative z-10 transition-colors duration-300',
                  )}
                >
                  {/* SVG size scale up inside card */}
                  <div className="scale-135 flex items-center justify-center">
                    {item.icon}
                  </div>
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-3 scale-0 group-hover/item:scale-100 transition-all duration-200 origin-bottom bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-sm whitespace-nowrap shadow-lg pointer-events-none border border-zinc-700/50 z-50">
                    {item.name}
                  </div>
                </motion.div>
              </foreignObject>
            );
          })}

          {/* Central Vault Box (Aset Secure Vault - Giant 128px wide cloud) */}
          <foreignObject
            x={brandX - 64}
            y={brandY - 64}
            width="128"
            height="128"
            style={{ overflow: 'visible' }}
          >
            <motion.div
              animate={{
                scale: isAnyHovered ? [1, 1.05, 1] : 1,
                borderColor: isAnyHovered
                  ? `${activeGlowColor}30`
                  : 'rgba(124, 58, 237, 0.2)',
                boxShadow: isAnyHovered
                  ? `0 20px 50px ${activeGlowColor}90`
                  : '0 16px 50px rgba(124, 92, 246, 0.3)',
              }}
              transition={{
                scale: {
                  repeat: isAnyHovered ? Infinity : 0,
                  duration: 2,
                  ease: 'easeInOut',
                },
                default: { duration: 0.4 },
              }}
              className={cn(
                'size-32 scale-75 -mt-4 rounded-xl bg-linear-to-br from-indigo-600 via-violet-600 to-violet-500 dark:from-indigo-500 dark:via-violet-600 dark:to-violet-700 flex items-center justify-center border cursor-pointer',
              )}
            >
              <div className="flex items-center justify-center">
                <Logo className="invert size-16" />
              </div>
            </motion.div>
          </foreignObject>
        </svg>
      </div>
    </motion.div>
  );
};
