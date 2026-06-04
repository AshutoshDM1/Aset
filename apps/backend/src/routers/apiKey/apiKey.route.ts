import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import crypto from 'crypto';
import { encryptSecret } from '../../utils/crypto';

export const apiKeyRouter = router({
  /**
   * Lists all API Keys for the authenticated user (excludes secrets)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.apiKey.findMany({
      where: { userId: ctx.auth.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyId: true,
        folderId: true,
        folder: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });
  }),

  /**
   * Generates a new API Key / Secret pair and encrypts the secret in the database
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        folderId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const keyId = `ast_pk_${crypto.randomBytes(16).toString('hex')}`;
      const secretKey = `ast_sk_${crypto.randomBytes(32).toString('hex')}`;
      const secretHash = encryptSecret(secretKey);

      const apiKey = await ctx.db.apiKey.create({
        data: {
          name: input.name,
          keyId,
          secretHash,
          userId: ctx.auth.userId,
          folderId: input.folderId || null,
        },
      });

      return {
        id: apiKey.id,
        name: apiKey.name,
        keyId: apiKey.keyId,
        secretKey, // Return raw secret EXACTLY ONCE on creation so developer can copy it
        createdAt: apiKey.createdAt,
      };
    }),

  /**
   * Revokes/deletes an existing API Key
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.apiKey.delete({
        where: { id: input.id, userId: ctx.auth.userId },
      });
    }),
});
