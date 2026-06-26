import type { ImagePreviewProps } from '@/components/ImagePreview';
import { ImagePreview } from '@/components/ImagePreview';

export type ImagePreviewDialogProps = ImagePreviewProps;

export function ImagePreviewDialog(props: ImagePreviewDialogProps) {
  return <ImagePreview {...props} />;
}
