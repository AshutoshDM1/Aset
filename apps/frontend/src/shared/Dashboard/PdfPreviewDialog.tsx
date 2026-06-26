import { PdfPreviewDialog as ModularPdfPreviewDialog } from '@/components/Pdf-Preview';
import type { PdfPreviewDialogProps } from '@/components/Pdf-Preview';

export function PdfPreviewDialog(props: PdfPreviewDialogProps) {
  return <ModularPdfPreviewDialog {...props} />;
}
