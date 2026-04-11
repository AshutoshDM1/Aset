import { z } from 'zod';
import { createClerkClient } from '@clerk/backend';
import { router, protectedProcedure } from '../../trpc';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const existing = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
    });

    if (existing) return existing;

    const clerkUser = await clerk.users.getUser(ctx.auth.userId);
    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    return ctx.db.user.upsert({
      where: { id: ctx.auth.userId },
      create: {
        id: ctx.auth.userId,
        email: email!,
        name:
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          null,
      },
      update: {},
    });
  }),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.auth.userId },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.delete({ where: { id: ctx.auth.userId } });
    return { success: true } as const;
  }),
});
