import { PdfPreviewDialog as ModularPdfPreviewDialog } from '@/components/Pdf-Preview';

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  fileId: string;
}

export function PdfPreviewDialog(props: PdfPreviewDialogProps) {
  return <ModularPdfPreviewDialog {...props} />;
}
