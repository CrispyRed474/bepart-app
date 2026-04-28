-- =====================
-- CONSENT GATE FOR FAMILY NOTIFICATIONS
-- Tracks explicit consent from care recipients before sharing care updates
-- =====================

CREATE TABLE family_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  family_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  consent_given_at TIMESTAMPTZ,
  consent_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, family_user_id)
);

CREATE INDEX idx_family_consent_client_id ON family_consent(client_id);
CREATE INDEX idx_family_consent_family_user_id ON family_consent(family_user_id);
CREATE INDEX idx_family_consent_org_id ON family_consent(org_id);
CREATE INDEX idx_family_consent_consent_given ON family_consent(consent_given) WHERE consent_given = TRUE;

-- RLS for family_consent
ALTER TABLE family_consent ENABLE ROW LEVEL SECURITY;

-- Admin and affected family member can read
CREATE POLICY "family_consent_read" ON family_consent
  FOR SELECT USING (
    family_user_id IN (SELECT id FROM get_my_profile())
    OR org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- Only admin can update/insert consent (consent captured in app during setup)
CREATE POLICY "family_consent_admin_write" ON family_consent
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

CREATE POLICY "family_consent_admin_update" ON family_consent
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- Trigger to update updated_at
CREATE TRIGGER family_consent_updated_at
  BEFORE UPDATE ON family_consent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- NOTIFICATION POLICY
-- Only send notifications if consent_given = TRUE
-- =====================
-- This is enforced at the application level when creating/sending notifications
-- No notifications should be sent for family_user_id WITHOUT explicit consent

COMMENT ON TABLE family_consent IS 'Tracks explicit consent from care recipients before sharing updates with family members. Notifications MUST NOT be sent without consent_given = TRUE.';
COMMENT ON COLUMN family_consent.consent_given IS 'If FALSE, no notifications should be sent to this family member. This must be explicitly set to TRUE by admin/guardian.';
