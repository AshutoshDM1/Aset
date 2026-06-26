import { PdfPreviewDialog as ModularPdfPreviewDialog } from '@/components/Preview/PDFPreview';
import type { PdfPreviewDialogProps } from '@/components/Preview/PDFPreview';

export function PdfPreviewDialog(props: PdfPreviewDialogProps) {
  return <ModularPdfPreviewDialog {...props} />;
}
