import type { Request } from 'express';
import { verifyAuth } from './middleware/clerk-auth';
import { db } from './utils/db';

export async function createContext({ req }: { req: Request }) {
  const auth = await verifyAuth(req);
  return { db, auth };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
