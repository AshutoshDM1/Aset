import React from 'react';

// 1. PDF File Icon (Red/Amber gradient page)
export const PdfIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-red-500 dark:text-red-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15h3a1.5 1.5 0 0 0 0-3H9v6" />
    <path d="M12 12v3" />
  </svg>
);

// 2. Video File Icon (Indigo/Violet gradient page with a play symbol)
export const VideoIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-indigo-500 dark:text-indigo-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <polygon points="10 11 15 13.5 10 16 10 11" fill="currentColor" />
  </svg>
);

// 3. Image File Icon (Emerald/Teal gradient page with a mountain symbol)
export const ImageIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-emerald-500 dark:text-emerald-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" />
    <path d="M4 18l4-4 3 3 5-5 4 4" />
  </svg>
);

// 4. Audio File Icon (Pink/Rose gradient page with a music wave symbol)
export const AudioIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-pink-500 dark:text-pink-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 18V12h4v2" />
    <circle cx="8" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

// 5. ZIP/Archive File Icon (Amber/Yellow gradient page with a zipper pattern)
export const ZipIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-amber-500 dark:text-amber-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 10h4M10 12h4M10 14h4" />
    <rect x="9" y="16" width="6" height="3" rx="0.5" fill="currentColor" />
  </svg>
);

// 6. Code File Icon (Blue gradient page with HTML tags)
export const CodeIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-blue-500 dark:text-blue-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m8 12-2 2 2 2M12 12l2 2-2 2" />
  </svg>
);

// 7. Text Document Icon (Royal Blue gradient page with lines)
export const DocxIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-sky-500 dark:text-sky-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

// 8. CSV Spreadsheet Icon (Teal/Green gradient page with table cells)
export const CsvIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-teal-500 dark:text-teal-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <rect x="8" y="12" width="8" height="6" rx="1" />
    <line x1="12" y1="12" x2="12" y2="18" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

// 9. PPTX Presentation Icon (Orange gradient page with pie chart)
export const PptxIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-orange-500 dark:text-orange-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M12 12v3h3" />
  </svg>
);

// 10. Design Vector Icon (Cyan gradient page with cursor & bezier curve)
export const SvgIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-6 text-cyan-500 dark:text-cyan-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 16c2-3 4-3 6 0" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="14" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// central brand icon representing Aset (beautiful folder & cloud design)
export const AsetBrandIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-10 text-white fill-current animate-pulse-slow"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
    <path
      d="M12 9.5v5.5m-2.5-2.5h5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
