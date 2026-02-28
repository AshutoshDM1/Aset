import { serve } from "bun";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { router } from "./trpc";
import { fileRouter } from "./routers/file";

const appRouter = router({
  file: fileRouter,
});

export type AppRouter = typeof appRouter;

serve({
  port: 3000,
  fetch(req) {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req,
      router: appRouter,
      createContext() {
        return {};
      },
    });
  },
});

console.log("Server running on http://localhost:3000");