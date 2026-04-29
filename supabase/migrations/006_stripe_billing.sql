-- Stripe Billing Integration
-- Add billing columns to organisations table

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS plan_name TEXT CHECK (plan_name IN ('solo', 'practice', 'organisation', 'enterprise')),
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'trialing' CHECK (plan_status IN ('trialing', 'active', 'past_due', 'cancelled')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_screening_subscription_id TEXT;

-- Create index on stripe_customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_organisations_stripe_customer_id 
ON organisations(stripe_customer_id);

-- Create index on plan_status for filtering
CREATE INDEX IF NOT EXISTS idx_organisations_plan_status 
ON organisations(plan_status);
