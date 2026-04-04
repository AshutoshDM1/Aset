import { z } from 'zod';
import { router, publicProcedure } from '../../trpc';

export const fileRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        message: `Hello ${input.name}`,
      };
    }),
});
