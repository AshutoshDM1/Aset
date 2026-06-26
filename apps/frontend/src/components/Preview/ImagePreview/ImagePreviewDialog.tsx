import { ImagePreview } from './ImagePreview';
import type { ImagePreviewProps } from './types';

export type ImagePreviewDialogProps = ImagePreviewProps;

export function ImagePreviewDialog(props: ImagePreviewDialogProps) {
  return <ImagePreview {...props} />;
}
