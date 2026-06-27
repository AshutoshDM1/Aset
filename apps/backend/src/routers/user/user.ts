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

  activateTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const storageRecord = await ctx.db.userStorage.findUnique({
      where: { userId: ctx.auth.userId },
    });

    if (storageRecord?.hasUsedTrial) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You have already used your free trial.',
      });
    }

    const storage = await ctx.db.userStorage.upsert({
      where: { userId: ctx.auth.userId },
      update: {
        totalStorage: 20 * 1024, // 20 GB trial limit in MB
        plan: 'trial',
        trialExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        hasUsedTrial: true,
      },
      create: {
        userId: ctx.auth.userId,
        totalStorage: 20 * 1024,
        usedStorage: 0,
        plan: 'trial',
        trialExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        hasUsedTrial: true,
      },
    });

    return storage;
  }),

  updateStorageLimit: protectedProcedure
    .input(z.object({ planId: z.enum(['free', 'trial', 'pro', 'business']) }))
    .mutation(async ({ ctx, input }) => {
      let limitMb = 5 * 1024;
      let planName = 'free';
      let trialExpiresAt: Date | null = null;
      let setHasUsedTrial = false;

      if (input.planId === 'trial') {
        const storageRecord = await ctx.db.userStorage.findUnique({
          where: { userId: ctx.auth.userId },
        });

        if (storageRecord?.hasUsedTrial) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already used your free trial.',
          });
        }

        limitMb = 20 * 1024;
        planName = 'trial';
        trialExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        setHasUsedTrial = true;
      } else if (input.planId === 'pro') {
        limitMb = 500 * 1024; // 500 GB
        planName = 'pro';
        setHasUsedTrial = true;
      } else if (input.planId === 'business') {
        limitMb = 1024 * 1024; // 1 TB
        planName = 'business';
        setHasUsedTrial = true;
      }

      const storage = await ctx.db.userStorage.upsert({
        where: { userId: ctx.auth.userId },
        update: {
          totalStorage: limitMb,
          plan: planName,
          trialExpiresAt,
          ...(setHasUsedTrial ? { hasUsedTrial: true } : {}),
        },
        create: {
          userId: ctx.auth.userId,
          totalStorage: limitMb,
          usedStorage: 0,
          plan: planName,
          trialExpiresAt,
          hasUsedTrial: setHasUsedTrial,
        },
      });
      return storage;
    }),
});
