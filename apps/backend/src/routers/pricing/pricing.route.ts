import { router, publicProcedure } from '../../trpc';
import { PRICING_PLANS } from '../../config/pricing.config';

export const pricingRouter = router({
  getPlans: publicProcedure.query(() => {
    return PRICING_PLANS;
  }),
});
