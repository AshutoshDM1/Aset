import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextViewerProps {
  content: string;
  fileName: string;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

export function TextViewer({
  content,
  fileName,
  lineNumbers,
  wordWrap,
  fontSize,
}: TextViewerProps) {
  const lines = useMemo(() => content.split(/\r?\n/), [content]);
  const isMd = fileName.toLowerCase().endsWith('.md');

  // Parse simple Markdown elements for a premium .md viewing experience
  const renderedMarkdown = useMemo(() => {
    if (!isMd) return null;

    let inCodeBlock = false;
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Code blocks
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return null;
      }

      if (inCodeBlock) {
        return (
          <pre
            key={idx}
            className="font-mono bg-white/5 border border-white/5 p-3 rounded-lg text-xs my-2 overflow-x-auto custom-scrollbar text-primary-foreground/90"
          >
            <code>{line}</code>
          </pre>
        );
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        return (
          <h1
            key={idx}
            className="text-2xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2"
          >
            {trimmed.slice(2)}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-white mt-5 mb-2.5">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-white/95 mt-4 mb-2">
            {trimmed.slice(4)}
          </h3>
        );
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-primary/60 pl-4 my-3 italic text-white/60 bg-white/5 py-1.5 rounded-r"
          >
            {trimmed.slice(2)}
          </blockquote>
        );
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="border-white/10 my-6" />;
      }

      // Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li
            key={idx}
            className="list-disc ml-6 my-1 text-white/80 text-sm leading-relaxed"
          >
            {trimmed.slice(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const dotIdx = trimmed.indexOf('.');
        return (
          <li
            key={idx}
            className="list-decimal ml-6 my-1 text-white/80 text-sm leading-relaxed"
          >
            {trimmed.slice(dotIdx + 1).trim()}
          </li>
        );
      }

      // Empty spacing
      if (trimmed === '') {
        return <div key={idx} className="h-3" />;
      }

      // Default paragraph
      return (
        <p key={idx} className="text-white/80 text-sm leading-relaxed my-2">
          {line}
        </p>
      );
    });
  }, [lines, isMd]);

  const sizeClass = {
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
  }[fontSize];

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-28">
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl relative">
        {isMd ? (
          /* Premium Rendered Markdown View */
          <div
            className={cn(
              'prose prose-invert select-text max-w-none',
              sizeClass,
            )}
          >
            {renderedMarkdown}
          </div>
        ) : (
          /* Premium Monospace Code / Text View */
          <div className={cn('font-mono select-text flex w-full', sizeClass)}>
            {lineNumbers && (
              <div className="text-right pr-4 border-r border-white/10 text-white/35 select-none font-semibold">
                {lines.map((_, idx) => (
                  <div key={idx} className="leading-6">
                    {idx + 1}
                  </div>
                ))}
              </div>
            )}
            <pre
              className={cn(
                'flex-1 pl-4 leading-6 text-white/85',
                wordWrap
                  ? 'whitespace-pre-wrap break-all overflow-hidden'
                  : 'whitespace-pre overflow-x-auto custom-scrollbar',
              )}
            >
              <code>
                {lines.map((line, idx) => (
                  <div key={idx} className="hover:bg-white/5 transition-colors">
                    {line || ' '}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
