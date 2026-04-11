import { router, publicProcedure } from '../../trpc';

export const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      message: 'Server is running',
      status: 'ok',
    };
  }),
});
