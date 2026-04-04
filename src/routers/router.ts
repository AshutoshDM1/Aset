import { router } from '../trpc';
import { fileRouter } from './files/file';
import { folderRouter } from './folder/folder';
import { healthRouter } from './health/health';

const appRouter = router({
  file: fileRouter,
  folder: folderRouter,
  health: healthRouter,
});

export default appRouter;

export type AppRouter = typeof appRouter;
