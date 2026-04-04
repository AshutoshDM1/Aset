import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod';
import { folders } from '../../db/schema';
import {
  folderCreateInputSchema,
  folderGetInputSchema,
  folderListInputSchema,
} from './folder.validation';

export type FolderRow = InferSelectModel<typeof folders>;
export type FolderCreateInput = z.infer<typeof folderCreateInputSchema>;
export type FolderListInput = z.infer<typeof folderListInputSchema>;
export type FolderGetInput = z.infer<typeof folderGetInputSchema>;
