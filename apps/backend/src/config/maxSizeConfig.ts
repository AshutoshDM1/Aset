import { PRICING_PLANS } from './pricing.config';

/**
 * Returns the maximum allowed file upload size in MB for a given plan name.
 */
export function getMaxUploadSizeMb(planName: string): number {
  const normalized = planName.toLowerCase();
  const plan = PRICING_PLANS.find(
    (p) =>
      p.name.toLowerCase().includes(normalized) ||
      (normalized === 'free' && p.name.toLowerCase().includes('starter')),
  );
  return plan ? plan.maxFileUploadSize : 100; // default 100MB
}

/**
 * Checks if a file upload of a given size in MB is allowed on a plan.
 */
export function isUploadSizeAllowed(
  planName: string,
  sizeMb: number,
): { allowed: boolean; maxSize: number } {
  const maxSize = getMaxUploadSizeMb(planName);
  return {
    allowed: sizeMb <= maxSize,
    maxSize,
  };
}
