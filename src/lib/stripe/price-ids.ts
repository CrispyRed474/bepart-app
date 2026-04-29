/**
 * Auto-generated Stripe price IDs
 * Generated: 2026-04-29
 */

export const STRIPE_PRICE_IDS = {
  solo: 'price_1TRR1a8oVjrant4teIrdj4Vl',
  practice: 'price_1TRR1a8oVjrant4tcTfTufel',
  organisation: 'price_1TRR1b8oVjrant4tXT21Ncrj',
  enterprise: 'price_1TRR1c8oVjrant4tjkCFbazD',
  ai_screening: 'price_1TRR1c8oVjrant4tRpC3Ttx5',
} as const;

export type PlanType = keyof Omit<typeof STRIPE_PRICE_IDS, 'ai_screening'>;
