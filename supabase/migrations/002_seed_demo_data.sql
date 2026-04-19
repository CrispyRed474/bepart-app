-- =====================
-- DEMO SEED DATA
-- Run AFTER creating users in Supabase Auth console or via scripts/seed.ts
-- =====================

-- Demo Organisation
INSERT INTO organisations (id, name, contact_email, contact_phone, address)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sunshine Care Group',
  'admin@sunshinecare.com.au',
  '02 9999 0000',
  '123 Care Street, Sydney NSW 2000'
) ON CONFLICT (id) DO NOTHING;

-- NOTE: User accounts are created via scripts/seed.ts which calls Supabase Auth API
-- The profiles below reference those auth user IDs

-- Demo client
INSERT INTO clients (id, org_id, full_name, dob, ndis_number, care_type, notes)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Margaret Thompson',
  '1945-03-15',
  '430123456',
  'aged_care',
  'Margaret enjoys gardening and classical music. Requires assistance with morning hygiene and meal preparation. Has mild cognitive decline.'
) ON CONFLICT (id) DO NOTHING;
