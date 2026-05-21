import { PdfPreviewDialog as ModularPdfPreviewDialog } from '@/components/Pdf-Preview';

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  fileId: string;
}

export function PdfPreviewDialog(props: PdfPreviewDialogProps) {
  console.log('fileId', props.fileId);
  // console.log('PdfPreviewDialog Wrapper props:', props);
  return <ModularPdfPreviewDialog {...props} />;
}
