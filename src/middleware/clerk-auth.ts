import { createClerkClient, verifyToken } from '@clerk/backend';

export type ClerkAuthResult =
  | {
      userId: string;
      sessionId?: string;
      hasSignedUp?: boolean;
    }
  | { userId: null };

function getBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (!type || type.toLowerCase() !== 'bearer') return null;
  if (!token) return null;
  return token.trim();
}

export async function getClerkAuth(req: Request): Promise<ClerkAuthResult> {
  const token = getBearerToken(req);
  if (!token) return { userId: null };

  try {
    // Uses CLERK_SECRET_KEY (or CLERK_JWT_KEY if you configure it).
    const { sub, sid } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      // Optional but recommended (locks tokens to your frontend origins)
      authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES?.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    if (!sub) return { userId: null };

    // Fetch user to read metadata (server-side, trusted).
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await clerkClient.users.getUser(sub);
    const hasSignedUp = user.publicMetadata?.has_signed_up;

    return {
      userId: sub,
      sessionId: sid,
      hasSignedUp: typeof hasSignedUp === 'boolean' ? hasSignedUp : undefined,
    };
  } catch {
    return { userId: null };
  }
}

