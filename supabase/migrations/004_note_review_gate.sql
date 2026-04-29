-- =====================
-- NOTE REVIEW GATE + AI SAFETY SCANNING
-- Intercepts care log entries before family notification
-- =====================

-- Add status tracking to care_log_entries
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'flagged', 'approved', 'auto_approved', 'rejected'));

-- AI scan result and issues
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS ai_scan_result JSONB;
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS ai_flagged_issues TEXT[];

-- Review audit trail
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Auto-publish scheduling (when to make note visible to family if no flags)
ALTER TABLE care_log_entries ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;

-- Create indexes for review queue queries
CREATE INDEX IF NOT EXISTS idx_care_log_status ON care_log_entries(status);
CREATE INDEX IF NOT EXISTS idx_care_log_publish_at ON care_log_entries(publish_at);
CREATE INDEX IF NOT EXISTS idx_care_log_flagged ON care_log_entries(status) WHERE status = 'flagged';

-- =====================
-- CLIENT PROFILE FIELDS FOR AI SCANNING
-- Store resident's medical and dietary info for safety checks
-- =====================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS care_plan_notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================
-- RLS POLICY UPDATES
-- Add read policy for care_log_entries with status filtering for families
-- =====================

-- Family members should only see approved/auto_approved notes
CREATE POLICY IF NOT EXISTS "care_log_family_read" ON care_log_entries
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
    AND (
      -- Admins and carers see all notes
      (SELECT role FROM get_my_profile()) IN ('admin', 'carer')
      OR
      -- Family members only see approved notes
      (
        (SELECT role FROM get_my_profile()) = 'family'
        AND status IN ('approved', 'auto_approved')
        AND client_id IN (
          SELECT client_id FROM family_client_links
          WHERE family_user_id IN (SELECT id FROM get_my_profile())
        )
      )
    )
  );

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Function to calculate next auto-publish time (next day 6am AEST)
CREATE OR REPLACE FUNCTION calculate_publish_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  -- Return next day at 06:00 AEST (UTC+10)
  RETURN (
    CURRENT_TIMESTAMP AT TIME ZONE 'Australia/Brisbane' + INTERVAL '1 day'
  )::DATE || ' 06:00:00'::TIME AT TIME ZONE 'Australia/Brisbane';
END;
$$ LANGUAGE plpgsql;

-- Function to set publish_at on new notes
CREATE OR REPLACE FUNCTION set_note_publish_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.publish_at IS NULL THEN
    NEW.publish_at := calculate_publish_time();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER care_log_set_publish_at
  BEFORE INSERT ON care_log_entries
  FOR EACH ROW EXECUTE FUNCTION set_note_publish_time();

-- =====================
-- COMMENTS
-- =====================
COMMENT ON TABLE care_log_entries IS 'Enhanced with review gate: notes start as pending, AI-scanned, then approved by admin or auto-published if clean.';
COMMENT ON COLUMN care_log_entries.status IS 'pending (awaiting review), flagged (AI found issues), approved (admin approved), auto_approved (clean + publish window passed), rejected (admin rejected)';
COMMENT ON COLUMN care_log_entries.ai_scan_result IS 'JSON from OpenAI: {flagged: bool, issues: string[], severity: low|medium|high}';
COMMENT ON COLUMN care_log_entries.ai_flagged_issues IS 'Array of issue strings flagged by AI (allergy violation, care plan contradiction, etc)';
COMMENT ON COLUMN care_log_entries.publish_at IS 'When to auto-publish if status = pending and no flags. Default: next day 6am AEST.';
COMMENT ON TABLE clients IS 'Enhanced with medical/dietary fields used by AI scanning';
COMMENT ON COLUMN clients.allergies IS 'Array of known allergies (e.g., [''peanuts'', ''shellfish''])';
COMMENT ON COLUMN clients.dietary_restrictions IS 'Array of dietary restrictions (e.g., [''vegan'', ''gluten-free''])';
COMMENT ON COLUMN clients.medical_conditions IS 'Array of medical conditions (e.g., [''diabetes'', ''heart condition''])';
COMMENT ON COLUMN clients.care_plan_notes IS 'Free-text care plan overview used for contradiction detection';
