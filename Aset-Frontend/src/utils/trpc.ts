import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@aset/api';
import { getToken } from '@clerk/react';
export const queryClient = new QueryClient();

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL is not set');
}

export function makeTrpc(getToken: () => Promise<string | null>) {
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiUrl}/trpc`,
        async headers() {
          const token = await getToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
  return createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
  });
}
export const trpc = makeTrpc(getToken);
