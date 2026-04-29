-- =====================
-- AI SCREENING ADD-ON
-- Splits note review into free tier (manual) + paid add-on (AI screening)
-- =====================

-- Add ai_screening_enabled to organisations table
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS ai_screening_enabled BOOLEAN DEFAULT false;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS ai_screening_enabled_at TIMESTAMPTZ;

-- Add stripe_price_id for the add-on for future billing
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS ai_screening_stripe_price_id TEXT;

-- Create index for querying orgs with AI screening enabled
CREATE INDEX IF NOT EXISTS idx_organisations_ai_screening ON organisations(ai_screening_enabled);

-- =====================
-- COMMENTS
-- =====================
COMMENT ON COLUMN organisations.ai_screening_enabled IS 'Flag indicating whether this org has AI screening add-on enabled';
COMMENT ON COLUMN organisations.ai_screening_enabled_at IS 'Timestamp when AI screening was enabled';
COMMENT ON COLUMN organisations.ai_screening_stripe_price_id IS 'Stripe price ID for the AI screening add-on ($29/mo)';
