/**
 * OakAudix — Per-User, Per-Audit Pricing
 *
 * Prices are in Nigerian Naira (NGN).
 * Tier is determined by the number of users in the organization.
 */

export type UserTier = "individual" | "1-5" | "5-15" | "16+";

/** Determine which tier a user count falls into */
export function getUserTier(userCount: number, isIndividual?: boolean): UserTier {
  if (isIndividual) return "individual";
  if (userCount <= 5) return "1-5";
  if (userCount <= 15) return "5-15";
  return "16+";
}

/** Human-readable tier label */
export const TIER_LABELS: Record<UserTier, string> = {
  "individual": "Individual (1 User)",
  "1-5":        "1 – 5 Users",
  "5-15":       "5 – 15 Users",
  "16+":        "16 and Above Users",
};

/**
 * Pricing matrix per pack per tier (in Naira).
 *
 * ISO 9001 / 14001 / 45001 (individually)
 *   1-5 users   →  ₦500,000
 *   5-15 users  →  ₦1,000,000
 *   16+ users   →  ₦1,500,000
 *
 * HSE Bundle (ISO 14001 + ISO 45001)
 *   1-5 users   →  ₦1,000,000
 *   5-15 users  →  ₦1,500,000
 *   16+ users   →  ₦2,000,000
 *
 * IMS Bundle (ISO 9001 + ISO 14001 + ISO 45001)
 *   1-5 users   →  ₦1,500,000
 *   5-15 users  →  ₦2,000,000
 *   16+ users   →  ₦2,500,000
 */
export const PACK_TIER_PRICES: Record<string, Record<UserTier, number>> = {
  "9001": {
    "individual": 500_000,
    "1-5":  500_000,
    "5-15": 1_000_000,
    "16+":  1_500_000,
  },
  "14001": {
    "individual": 500_000,
    "1-5":  500_000,
    "5-15": 1_000_000,
    "16+":  1_500_000,
  },
  "45001": {
    "individual": 500_000,
    "1-5":  500_000,
    "5-15": 1_000_000,
    "16+":  1_500_000,
  },
  "hse": {
    "individual": 1_000_000,
    "1-5":  1_000_000,
    "5-15": 1_500_000,
    "16+":  2_000_000,
  },
  "ims": {
    "individual": 1_500_000,
    "1-5":  1_500_000,
    "5-15": 2_000_000,
    "16+":  2_500_000,
  },
  // ISO 27001 kept with legacy price (to be updated separately)
  "27001": {
    "individual": 500_000,
    "1-5":  500_000,
    "5-15": 1_000_000,
    "16+":  1_500_000,
  },
};

/** Get the price in Naira for a given pack and user count */
export function getPriceForPack(pack: string, userCount: number): number {
  const tier = getUserTier(userCount);
  return PACK_TIER_PRICES[pack]?.[tier] ?? 0;
}

/** Format a Naira amount with the ₦ symbol */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Convert Naira to Kobo (Paystack uses kobo) */
export function nairaToKobo(naira: number): number {
  return naira * 100;
}
