import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
  bigint,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// Drive-style tree; ownerId = Clerk user id; parentId null = root
export const folders = pgTable('folders', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  parentId: integer('parent_id').references((): AnyPgColumn => folders.id, {
    onDelete: 'cascade',
  }),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Binary in object storage; storageKey = provider object key (unique)
export const files = pgTable('files', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  folderId: integer('folder_id').references(() => folders.id, {
    onDelete: 'set null',
  }),
  name: varchar({ length: 512 }).notNull(),
  storageKey: varchar('storage_key', { length: 1024 }).notNull().unique(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const filesTable = files;
