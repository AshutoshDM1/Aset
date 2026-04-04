import { serve } from 'bun';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from './context';
import { buildCorsHeaders, withCors } from './utils/cors';
import appRouter from './routers/router';

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = buildCorsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === 'GET' && url.pathname === '/') {
      return withCors(
        req,
        new Response(
          JSON.stringify({
            message: 'Welcome to the ASET Backend built on Trpc',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    const res = await fetchRequestHandler({
      endpoint: '/trpc',
      req,
      router: appRouter,
      createContext,
    });

    return withCors(req, res);
  },
});

console.log('Server running on http://localhost:3000');
