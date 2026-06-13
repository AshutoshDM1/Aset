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
    .input(z.object({ limitMb: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const allowedLimits = [
        5 * 1024, // Starter (Free) / Downgrade limit
        20 * 1024, // Trial limit
        400 * 1024, // Pro limit
        1024 * 1024, // Business limit
      ];

      if (!allowedLimits.includes(input.limitMb)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid storage limit requested.',
        });
      }

      let planName = 'free';
      let trialExpiresAt: Date | null = null;
      let setHasUsedTrial = false;

      if (input.limitMb === 20 * 1024) {
        const storageRecord = await ctx.db.userStorage.findUnique({
          where: { userId: ctx.auth.userId },
        });

        if (storageRecord?.hasUsedTrial) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already used your free trial.',
          });
        }

        planName = 'trial';
        trialExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        setHasUsedTrial = true;
      } else if (input.limitMb === 400 * 1024) {
        planName = 'pro';
        setHasUsedTrial = true;
      } else if (input.limitMb === 1024 * 1024) {
        planName = 'business';
        setHasUsedTrial = true;
      }

      const storage = await ctx.db.userStorage.upsert({
        where: { userId: ctx.auth.userId },
        update: {
          totalStorage: input.limitMb,
          plan: planName,
          trialExpiresAt,
          ...(setHasUsedTrial ? { hasUsedTrial: true } : {}),
        },
        create: {
          userId: ctx.auth.userId,
          totalStorage: input.limitMb,
          usedStorage: 0,
          plan: planName,
          trialExpiresAt,
          hasUsedTrial: setHasUsedTrial,
        },
      });
      return storage;
    }),
});
