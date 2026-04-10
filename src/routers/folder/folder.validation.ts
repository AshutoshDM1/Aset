import { z } from 'zod';

export const folderCreateInputSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullable(),
});

export const folderListInputSchema = z.object({
  /** `null` = only root folders (no parent) */
  parentId: z.number().int().positive().nullable(),
});

export const folderGetInputSchema = z.object({
  id: z.number().int().positive(),
});
