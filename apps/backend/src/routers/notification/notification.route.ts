import { router, protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const notificationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.findMany({
      where: { userId: ctx.auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: { userId: ctx.auth.userId, read: false },
    });
    return { count };
  }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: { userId: ctx.auth.userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.updateMany({
        where: { id: input.id, userId: ctx.auth.userId },
        data: { read: true },
      });
      return { success: true };
    }),
});
