import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { folders } from "../db/schema";
import { publicProcedure, router } from "../trpc";

const ownerId = z.string().min(1);

export const folderRouter = router({
  create: publicProcedure
    .input(
      z.object({
        ownerId,
        name: z.string().min(1).max(255),
        parentId: z.number().int().positive().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.parentId != null) {
        const [parent] = await ctx.db
          .select({ id: folders.id })
          .from(folders)
          .where(
            and(
              eq(folders.id, input.parentId),
              eq(folders.ownerId, input.ownerId),
            ),
          )
          .limit(1);
        if (!parent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent folder not found",
          });
        }
      }

      const [row] = await ctx.db
        .insert(folders)
        .values({
          ownerId: input.ownerId,
          name: input.name,
          parentId: input.parentId,
        })
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create folder",
        });
      }

      return row;
    }),

  list: publicProcedure
    .input(
      z.object({
        ownerId,
        /** `null` = only root folders (no parent) */
        parentId: z.number().int().positive().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const owner = eq(folders.ownerId, input.ownerId);
      const parent =
        input.parentId === null
          ? isNull(folders.parentId)
          : eq(folders.parentId, input.parentId);

      return ctx.db
        .select()
        .from(folders)
        .where(and(owner, parent));
    }),

  get: publicProcedure
    .input(
      z.object({
        ownerId,
        id: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(eq(folders.id, input.id), eq(folders.ownerId, input.ownerId)),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      return row;
    }),
});
