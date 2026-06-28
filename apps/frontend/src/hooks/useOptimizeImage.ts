import { useState } from 'react';
import { toast } from 'sonner';

const OPTIX_URL =
  (import.meta.env.VITE_OPTIX_URL as string | undefined) ??
  'http://localhost:5001';

export type OptimizeState = 'idle' | 'uploading' | 'done' | 'error';

export type OptimizeResult = {
  id: string;
  name: string;
  url: string;
  oldSize: number;
  newSize: number;
  savedPercent: number;
  message: string;
};

export function useOptimizeImage() {
  const [state, setState] = useState<OptimizeState>('idle');

  const optimize = async (
    imageUrl: string,
    originalName: string,
    fileId: string,
  ): Promise<OptimizeResult | null> => {
    setState('uploading');

    try {
      // Send the URL, fileId, and clean fileName to Optix — the Go server fetches the image server-side.
      const res = await fetch(`${OPTIX_URL}/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl, fileId, fileName: originalName }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Optix ${res.status}: ${errText}`);
      }

      const result = (await res.json()) as OptimizeResult;

      console.log('[Optix /compress] ✓', result);

      setState('done');

      toast.success('Image optimized successfully!', {
        duration: 6000,
      });

      setTimeout(() => setState('idle'), 4000);
      return result;
    } catch (err: unknown) {
      setState('error');
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Optix] Failed:', message);
      toast.error('Optix request failed', { description: message });
      setTimeout(() => setState('idle'), 4000);
      return null;
    }
  };

  return { state, optimize };
}
