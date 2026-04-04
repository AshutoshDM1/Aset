import type { inferAsyncReturnType } from '@trpc/server';
import { db } from './utils/drizzle';

export function createContext() {
  return { db };
}

export type Context = inferAsyncReturnType<typeof createContext>;
