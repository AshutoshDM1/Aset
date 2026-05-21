import { healthRouter } from './routers/health/health';
import { router } from './trpc';
import { userRouter } from './routers/user/user';
import { folderRouter } from './routers/folder/folder.route';
import { fileRouter } from './routers/file/file.route';
import { statsRouter } from './routers/stats/stats.route';

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  folder: folderRouter,
  file: fileRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
