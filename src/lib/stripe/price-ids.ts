/**
 * Auto-generated Stripe price IDs
 * Generated: 2026-04-29
 */

export const STRIPE_PRICE_IDS = {
  // Monthly prices
  solo_monthly: 'price_1TRR1a8oVjrant4teIrdj4Vl',
  practice_monthly: 'price_1TRR1a8oVjrant4tcTfTufel',
  organisation_monthly: 'price_1TRR1b8oVjrant4tXT21Ncrj',
  enterprise_monthly: 'price_1TRR1c8oVjrant4tjkCFbazD',
  // Annual prices (20% discount)
  solo_annual: 'price_1TRRAP8oVjrant4tjUBTTOjG',
  practice_annual: 'price_1TRRAP8oVjrant4t0aOc7hAk',
  organisation_annual: 'price_1TRRAQ8oVjrant4t4uNCHVYG',
  enterprise_annual: 'price_1TRRAQ8oVjrant4tJDJvgEqb',
  // Add-on
  ai_screening: 'price_1TRR1c8oVjrant4tRpC3Ttx5',
} as const;

export type PlanType = keyof Omit<typeof STRIPE_PRICE_IDS, 'ai_screening'>;
