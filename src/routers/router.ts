import { router } from '../trpc';
import { healthRouter } from './health/health';
import { userRouter } from './user/user';

const appRouter = router({
  health: healthRouter,
  user: userRouter,
});

export default appRouter;

export type AppRouter = typeof appRouter;
