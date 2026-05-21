import { useState } from 'react';
import { toast } from 'sonner';

const OPTIX_URL =
  (import.meta.env.VITE_OPTIX_URL as string | undefined) ??
  'http://localhost:5001';

export type OptimizeState = 'idle' | 'uploading' | 'done' | 'error';

export function useOptimizeImage() {
  const [state, setState] = useState<OptimizeState>('idle');

  const optimize = async (imageUrl: string, _originalName: string) => {
    setState('uploading');

    try {
      // Send the URL to Optix — the Go server fetches the image server-side.
      // This completely bypasses the browser CORS restriction on R2.
      const res = await fetch(`${OPTIX_URL}/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Optix ${res.status}: ${errText}`);
      }

      const result = (await res.json()) as {
        filename: string;
        size: number;
        message: string;
      };

      console.log('[Optix /compress] ✓', result);

      setState('done');
      toast.success(result.message, {
        description: `${result.filename} · ${(result.size / 1024).toFixed(1)} KB received by Optix`,
        duration: 5000,
      });

      setTimeout(() => setState('idle'), 4000);
    } catch (err: unknown) {
      setState('error');
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Optix] Failed:', message);
      toast.error('Optix request failed', { description: message });
      setTimeout(() => setState('idle'), 4000);
    }
  };

  return { state, optimize };
}
