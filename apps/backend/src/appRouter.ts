import { healthRouter } from "@/routers/health/health";
import { router } from "@/trpc";

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
