export const IMAGE_NAME_REGEX = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;
export const PDF_NAME_REGEX = /\.pdf$/i;
export const VIDEO_NAME_REGEX = /\.(mp4|webm|ogg|mov|mkv|avi|flv|wmv|m4v)$/i;
export const TEXT_CODE_NAME_REGEX =
  /\.(txt|md|json|js|jsx|ts|tsx|py|go|html|css|yaml|yml|sh|sql|jsonld|ini|conf|env)$/i;

export function isImageFileName(name: string) {
  return IMAGE_NAME_REGEX.test(name);
}

export function isPdfFileName(name: string) {
  return PDF_NAME_REGEX.test(name);
}

export function isVideoFileName(name: string) {
  return VIDEO_NAME_REGEX.test(name);
}

export function isTextCodeFileName(name: string) {
  return TEXT_CODE_NAME_REGEX.test(name);
}

export function formatFileSize(mb: number) {
  if (mb < 1) {
    return `${(mb * 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function truncateFileName(name: string, totalLimit = 13) {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) {
    if (name.length <= totalLimit) return name;
    return name.slice(0, totalLimit - 3) + '...';
  }

  const base = name.slice(0, dot);
  const ext = name.slice(dot);

  if (name.length <= totalLimit) {
    return name;
  }

  const baseLimit = totalLimit - 3 - ext.length;
  if (baseLimit <= 1) {
    return base.slice(0, 5) + '...' + ext;
  }

  return base.slice(0, baseLimit) + '...' + ext;
}
