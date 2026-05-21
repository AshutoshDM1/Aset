import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseTextFetcherProps {
  open: boolean;
  fileUrl: string;
}

export function useTextFetcher({ open, fileUrl }: UseTextFetcherProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !fileUrl) {
      setContent('');
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const text = await response.text();
        if (isMounted) {
          setContent(text);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          setError(err.message || 'Failed to download file content');
          toast.error('Failed to load text content');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [open, fileUrl]);

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied content to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  return {
    content,
    isLoading,
    error,
    copied,
    copyToClipboard,
  };
}
