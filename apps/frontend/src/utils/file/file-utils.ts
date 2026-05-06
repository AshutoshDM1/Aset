export const IMAGE_NAME_REGEX = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;
export const PDF_NAME_REGEX = /\.pdf$/i;

export function isImageFileName(name: string) {
  return IMAGE_NAME_REGEX.test(name);
}

export function isPdfFileName(name: string) {
  return PDF_NAME_REGEX.test(name);
}

export function formatFileSize(mb: number) {
  if (mb < 1) {
    return `${(mb * 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}
