import { healthRouter } from './routers/health/health';
import { router } from './trpc';
import { userRouter } from './routers/user/user';
import { folderRouter } from './routers/folder/folder.route';
import { fileRouter } from './routers/file/file.route';
import { statsRouter } from './routers/stats/stats.route';
import { notificationRouter } from './routers/notification/notification.route';
import { apiKeyRouter } from './routers/apiKey/apiKey.route';

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  folder: folderRouter,
  file: fileRouter,
  stats: statsRouter,
  notification: notificationRouter,
  apiKey: apiKeyRouter,
});

export type AppRouter = typeof appRouter;
