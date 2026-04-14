import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth as Extract<Context['auth'], { userId: string }>,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
