import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';

export const couponRouter = router({
  validate: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: {
          code: input.code.toUpperCase().trim(),
        },
      });

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid coupon code',
        });
      }

      if (!coupon.active) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This coupon is no longer active',
        });
      }

      return {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      };
    }),
});
