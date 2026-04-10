import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { TRPCError } from '@trpc/server';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth || ctx.auth.userId == null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth as Exclude<Context['auth'], { userId: null }>,
    },
  });
});

export const onboardedProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.auth.hasSignedUp === false) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Signup not completed',
    });
  }
  return next();
});
