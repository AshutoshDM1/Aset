import { verifyToken } from '@clerk/backend';

export type AuthState =
  | { userId: string; sessionId: string }
  | { userId: null; sessionId: null };

export async function verifyAuth(req: Request): Promise<AuthState> {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) return { userId: null, sessionId: null };

  try {
    const SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not set');
    }
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES?.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!payload.sub) return { userId: null, sessionId: null };
    return { userId: payload.sub, sessionId: payload.sid };
  } catch (err) {
    console.error('Auth verification failed:', err);
    return { userId: null, sessionId: null };
  }
}
