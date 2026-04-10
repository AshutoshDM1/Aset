import type { inferAsyncReturnType } from '@trpc/server';
import { db } from './utils/drizzle';
import { getClerkAuth } from './middleware/clerk-auth';

export async function createContext({ req }: { req: Request }) {
  const auth = await getClerkAuth(req);
  return { db, auth };
}

export type Context = inferAsyncReturnType<typeof createContext>;
