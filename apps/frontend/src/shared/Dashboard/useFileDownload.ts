import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export function useFileDownload() {
  const downloadMutation = useMutation({
    ...trpc.file.getDownloadUrl.mutationOptions(),
  });

  const handleDownload = async (id: string, name: string, url?: string) => {
    const loadingToast = toast.loading('Generating secure download link...');
    try {
      const res = await downloadMutation.mutateAsync({ id });
      toast.dismiss(loadingToast);

      const link = document.createElement('a');
      link.href = res.downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Download failed:', error);

      // Fallback to simple direct/new-tab download if secure generator fails
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
      } else {
        toast.error('Failed to generate download link');
      }
    }
  };

  return {
    download: handleDownload,
    isDownloading: downloadMutation.isPending,
  };
}
