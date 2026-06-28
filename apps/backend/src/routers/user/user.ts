import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import { PRICING_PLANS } from '../../config/pricing.config';

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

    const planName = user.storage?.plan || 'free';
    const plan = PRICING_PLANS.find(
      (p) =>
        p.name.toLowerCase().includes(planName.toLowerCase()) ||
        (planName.toLowerCase() === 'free' &&
          p.name.toLowerCase().includes('starter')),
    );
    const maxFileUploadSize = plan ? plan.maxFileUploadSize : 100;
    const videoDecodingEnabled = planName !== 'free';

    return {
      ...user,
      storage: user.storage
        ? {
            ...user.storage,
            maxFileUploadSize,
            videoDecodingEnabled,
          }
        : null,
    };
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

    const trialPlan = PRICING_PLANS.find((p) =>
      p.name.toLowerCase().includes('trial'),
    );
    const trialLimitMb = trialPlan ? trialPlan.storageMb : 20 * 1024;

    const storage = await ctx.db.userStorage.upsert({
      where: { userId: ctx.auth.userId },
      update: {
        totalStorage: trialLimitMb,
        plan: 'trial',
        trialExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        hasUsedTrial: true,
      },
      create: {
        userId: ctx.auth.userId,
        totalStorage: trialLimitMb,
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
      const starterPlan = PRICING_PLANS.find((p) =>
        p.name.toLowerCase().includes('starter'),
      );
      const trialPlan = PRICING_PLANS.find((p) =>
        p.name.toLowerCase().includes('trial'),
      );
      const proPlan = PRICING_PLANS.find((p) =>
        p.name.toLowerCase().includes('pro'),
      );
      const businessPlan = PRICING_PLANS.find((p) =>
        p.name.toLowerCase().includes('business'),
      );

      const starterLimitMb = starterPlan ? starterPlan.storageMb : 5 * 1024;
      const trialLimitMb = trialPlan ? trialPlan.storageMb : 20 * 1024;
      const proLimitMb = proPlan ? proPlan.storageMb : 500 * 1024;
      const businessLimitMb = businessPlan
        ? businessPlan.storageMb
        : 1024 * 1024;

      let limitMb = starterLimitMb;
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

        limitMb = trialLimitMb;
        planName = 'trial';
        trialExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        setHasUsedTrial = true;
      } else if (input.planId === 'pro') {
        limitMb = proLimitMb;
        planName = 'pro';
        setHasUsedTrial = true;
      } else if (input.planId === 'business') {
        limitMb = businessLimitMb;
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
