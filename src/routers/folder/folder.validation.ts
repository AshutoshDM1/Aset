import { z } from 'zod';

export const ownerIdSchema = z.string().min(1);

export const folderCreateInputSchema = z.object({
  ownerId: ownerIdSchema,
  name: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullable(),
});

export const folderListInputSchema = z.object({
  ownerId: ownerIdSchema,
  /** `null` = only root folders (no parent) */
  parentId: z.number().int().positive().nullable(),
});

export const folderGetInputSchema = z.object({
  ownerId: ownerIdSchema,
  id: z.number().int().positive(),
});
