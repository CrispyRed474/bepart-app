-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ORGANISATIONS
-- =====================
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PROFILES (extends auth.users)
-- =====================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'carer', 'family')),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CLIENTS
-- =====================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  dob DATE,
  ndis_number TEXT,
  care_type TEXT NOT NULL DEFAULT 'ndis' CHECK (care_type IN ('ndis', 'aged_care', 'both')),
  photo_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CARE LOG ENTRIES
-- =====================
CREATE TABLE care_log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  carer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL DEFAULT 'note' CHECK (entry_type IN ('activity', 'medication', 'incident', 'note', 'meal', 'hygiene', 'health')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_incident BOOLEAN DEFAULT FALSE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- FAMILY → CLIENT LINKS
-- =====================
CREATE TABLE family_client_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_user_id, client_id)
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_clients_org_id ON clients(org_id);
CREATE INDEX idx_care_log_client_id ON care_log_entries(client_id);
CREATE INDEX idx_care_log_carer_id ON care_log_entries(carer_id);
CREATE INDEX idx_care_log_org_id ON care_log_entries(org_id);
CREATE INDEX idx_care_log_logged_at ON care_log_entries(logged_at DESC);
CREATE INDEX idx_care_log_is_incident ON care_log_entries(is_incident) WHERE is_incident = TRUE;
CREATE INDEX idx_family_links_family_user ON family_client_links(family_user_id);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_client_links ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE(id UUID, org_id UUID, role TEXT) AS $$
  SELECT p.id, p.org_id, p.role
  FROM profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ORGANISATIONS: members can read their own org
CREATE POLICY "org_read_own" ON organisations
  FOR SELECT USING (
    id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "org_admin_all" ON organisations
  FOR ALL USING (
    id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- PROFILES: users can read profiles in same org
CREATE POLICY "profiles_read_same_org" ON profiles
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- CLIENTS: org members can read; only admin/carer can modify
CREATE POLICY "clients_read_same_org" ON clients
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "clients_admin_carer_write" ON clients
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role IN ('admin', 'carer'))
  );

-- CARE LOG ENTRIES: all org members can read; carer/admin can write
CREATE POLICY "care_log_read_same_org" ON care_log_entries
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "care_log_carer_insert" ON care_log_entries
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role IN ('admin', 'carer'))
    AND carer_id IN (SELECT id FROM get_my_profile())
  );

CREATE POLICY "care_log_admin_all" ON care_log_entries
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- FAMILY LINKS: family user or admin can read
CREATE POLICY "family_links_read" ON family_client_links
  FOR SELECT USING (
    family_user_id IN (SELECT id FROM get_my_profile())
    OR org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

CREATE POLICY "family_links_admin_write" ON family_client_links
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- =====================
-- STORAGE BUCKETS
-- =====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('care-photos', 'care-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for care-photos
CREATE POLICY "care_photos_org_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'care-photos');

CREATE POLICY "care_photos_carer_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'care-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "care_photos_carer_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'care-photos'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for avatars
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- =====================
-- CLIENT → CARER JUNCTION (Many-to-many)
-- =====================
CREATE TABLE client_carers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  carer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, carer_id)
);

CREATE INDEX idx_client_carers_client_id ON client_carers(client_id);
CREATE INDEX idx_client_carers_carer_id ON client_carers(carer_id);

-- RLS for client_carers
ALTER TABLE client_carers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_carers_read" ON client_carers
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "client_carers_admin_write" ON client_carers
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

-- =====================
-- TASKS
-- =====================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organisations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  assigned_carer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general' CHECK (task_type IN ('medication', 'activity', 'mobility', 'meal', 'hygiene', 'general')),
  due_date DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_assigned_carer_id ON tasks(assigned_carer_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

-- RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_read_same_org" ON tasks
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM get_my_profile())
  );

CREATE POLICY "tasks_carer_update" ON tasks
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role IN ('admin', 'carer'))
  );

CREATE POLICY "tasks_admin_all" ON tasks
  FOR ALL USING (
    org_id IN (SELECT org_id FROM get_my_profile() WHERE role = 'admin')
  );

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
