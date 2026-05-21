import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
      include: { storage: true },
    });

    if (!user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User not provisioned',
      });
    }

    return user;
  }),

  updateStorageLimit: protectedProcedure
    .input(z.object({ limitMb: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const storage = await ctx.db.userStorage.upsert({
        where: { userId: ctx.auth.userId },
        update: { totalStorage: input.limitMb },
        create: {
          userId: ctx.auth.userId,
          totalStorage: input.limitMb,
          usedStorage: 0,
        },
      });
      return storage;
    }),
});
