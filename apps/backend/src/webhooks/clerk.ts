import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { db } from '../utils/db';
import { PRICING_PLANS } from '../config/pricing.config';

const DEFAULT_TOTAL_STORAGE_MB = 10 * 1024;

type ClerkEmailAddress = { id: string; email_address: string };

type ClerkUserData = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
};

type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: { id: string; deleted?: boolean } }
  | { type: string; data: unknown };

function primaryEmail(data: ClerkUserData): string | null {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  );
  return (
    primary?.email_address ?? data.email_addresses[0]?.email_address ?? null
  );
}

function fullName(data: ClerkUserData): string | null {
  const parts = [data.first_name, data.last_name].filter(
    (p): p is string => !!p && p.length > 0,
  );
  return parts.length > 0 ? parts.join(' ') : null;
}

export async function clerkWebhookHandler(req: Request, res: Response) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const svixId = req.header('svix-id');
  const svixTimestamp = req.header('svix-timestamp');
  const svixSignature = req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing Svix headers' });
  }

  const payload = (req.body as Buffer).toString('utf8');

  let evt: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Invalid Clerk webhook signature', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (evt.type) {
      case 'user.created': {
        const data = evt.data as ClerkUserData;
        const email = primaryEmail(data)?.toLowerCase().trim();
        if (!email) {
          return res.status(400).json({ error: 'No email on Clerk user' });
        }

        const starterPlan = PRICING_PLANS.find((p) =>
          p.name.toLowerCase().includes('starter'),
        );
        const starterStorageMb = starterPlan ? starterPlan.storageMb : 5 * 1024;

        await db.user.upsert({
          where: { id: data.id },
          update: { email, name: fullName(data) },
          create: {
            id: data.id,
            email,
            name: fullName(data),
            storage: {
              create: {
                totalStorage: starterStorageMb,
                usedStorage: 0,
                plan: 'free',
                trialExpiresAt: null,
                hasUsedTrial: false,
              },
            },
          },
        });
        break;
      }
      case 'user.updated': {
        const data = evt.data as ClerkUserData;
        const email = primaryEmail(data)?.toLowerCase().trim();
        await db.user.update({
          where: { id: data.id },
          data: {
            ...(email ? { email } : {}),
            name: fullName(data),
          },
        });
        break;
      }
      case 'user.deleted': {
        const data = evt.data as { id: string };
        await db.user.delete({ where: { id: data.id } }).catch(() => {
          /* already gone */
        });
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to process Clerk webhook', err);
    return res.status(500).json({ error: 'Processing failed' });
  }
}
