export type UserRole = 'admin' | 'carer' | 'family'

export interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string
  role: UserRole
  org_id: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Organisation {
  id: string
  name: string
  logo_url?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  created_at: string
}

export interface Client {
  id: string
  org_id: string
  full_name: string
  dob?: string
  ndis_number?: string
  care_type: 'ndis' | 'aged_care' | 'both'
  photo_url?: string
  notes?: string
  is_active: boolean
  created_at: string
}

export interface CareLogEntry {
  id: string
  org_id: string
  client_id: string
  carer_id: string
  entry_type: 'activity' | 'medication' | 'incident' | 'note' | 'meal' | 'hygiene' | 'health'
  title: string
  description: string
  photo_urls?: string[]
  is_incident: boolean
  severity?: 'low' | 'medium' | 'high' | 'critical'
  logged_at: string
  created_at: string
  // Joined fields
  client?: Client
  carer?: Profile
}

export interface FamilyClientLink {
  id: string
  family_user_id: string
  client_id: string
  org_id: string
  created_at: string
  client?: Client
}
