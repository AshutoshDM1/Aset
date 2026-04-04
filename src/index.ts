import { serve } from "bun";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./context";
import { router } from "./trpc";
import { fileRouter } from "./routers/file";
import { folderRouter } from "./routers/folder";
import { buildCorsHeaders, withCors } from "./utils/cors";

const appRouter = router({
  file: fileRouter,
  folder: folderRouter,
});
export type AppRouter = typeof appRouter;

serve({
  port: 3000,
  async fetch(req) {
    const corsHeaders = buildCorsHeaders(req);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const res = await fetchRequestHandler({
      endpoint: "/trpc",
      req,
      router: appRouter,
      createContext,
    });

    return withCors(req, res);
  },
});

console.log("Server running on http://localhost:3000");
