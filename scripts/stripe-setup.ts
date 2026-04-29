/**
 * Stripe Setup Script
 * Creates subscription products and prices for BePart billing
 * Run: npx ts-node scripts/stripe-setup.ts
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia' as any,
});

const PLANS = [
  { name: 'Solo', amount: 4900, clients: 10 },
  { name: 'Practice', amount: 14900, clients: 50 },
  { name: 'Organisation', amount: 34900, clients: 150 },
  { name: 'Enterprise', amount: 79900, clients: null },
];

const ADDONS = [{ name: 'AI Screening', amount: 2900 }];

async function createProduct(productName: string, metadata: any) {
  console.log(`Creating product: ${productName}`);
  const product = await stripe.products.create({
    name: productName,
    type: 'service',
    metadata,
  });
  return product;
}

async function createPrice(productId: string, amountCents: number) {
  console.log(`  Creating monthly price: $${(amountCents / 100).toFixed(2)}/mo`);
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency: 'usd',
    recurring: {
      interval: 'month',
      usage_type: 'licensed',
    },
  });
  return price;
}

async function main() {
  console.log('🔵 Starting Stripe setup...\n');

  const priceIds: Record<string, string> = {};

  // Create subscription plans
  for (const plan of PLANS) {
    const product = await createProduct(`BePart ${plan.name}`, {
      plan_name: plan.name.toLowerCase(),
      max_clients: plan.clients?.toString() || 'unlimited',
    });

    const price = await createPrice(product.id, plan.amount);
    priceIds[plan.name.toLowerCase()] = price.id;
    console.log(`  ✓ Price ID: ${price.id}\n`);
  }

  // Create add-on product
  for (const addon of ADDONS) {
    const product = await createProduct(`BePart ${addon.name}`, {
      type: 'addon',
    });

    const price = await createPrice(product.id, addon.amount);
    priceIds['ai_screening'] = price.id;
    console.log(`  ✓ Price ID: ${price.id}\n`);
  }

  // Save price IDs to config file
  const scriptDir = __dirname || process.cwd();
  const configPath = path.resolve(scriptDir, '../src/lib/stripe/price-ids.ts');
  const configDir = path.dirname(configPath);

  // Create directory if needed
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configContent = `/**
 * Auto-generated Stripe price IDs
 * Generated: ${new Date().toISOString()}
 */

export const STRIPE_PRICE_IDS = {
  solo: '${priceIds.solo}',
  practice: '${priceIds.practice}',
  organisation: '${priceIds.organisation}',
  enterprise: '${priceIds.enterprise}',
  ai_screening: '${priceIds.ai_screening}',
} as const;

export type PlanType = keyof Omit<typeof STRIPE_PRICE_IDS, 'ai_screening'>;
`;

  fs.writeFileSync(configPath, configContent);
  console.log(`\n✅ Config saved to: ${configPath}`);

  console.log('\n📋 Price IDs created:');
  console.log(JSON.stringify(priceIds, null, 2));
}

main().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
