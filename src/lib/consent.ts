import { createClient } from '@/lib/supabase/server'
import { FamilyConsent } from '@/types'

/**
 * Check if a family member has explicit consent to receive updates about a client
 * @param clientId - The client/care recipient
 * @param familyUserId - The family member
 * @returns true if consent is explicitly given, false otherwise
 */
export async function checkFamilyConsent(
  clientId: string,
  familyUserId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('family_consent')
      .select('consent_given')
      .eq('client_id', clientId)
      .eq('family_user_id', familyUserId)
      .single()

    if (error) {
      console.error('Error checking family consent:', error)
      // Default to false (no notification) if consent record doesn't exist or error
      return false
    }

    return data?.consent_given ?? false
  } catch (error) {
    console.error('Exception checking family consent:', error)
    return false
  }
}

/**
 * Get consent record for a family member and client
 */
export async function getFamilyConsent(
  clientId: string,
  familyUserId: string
): Promise<FamilyConsent | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('family_consent')
      .select('*')
      .eq('client_id', clientId)
      .eq('family_user_id', familyUserId)
      .single()

    if (error) {
      console.error('Error fetching family consent:', error)
      return null
    }

    return data as FamilyConsent
  } catch (error) {
    console.error('Exception fetching family consent:', error)
    return null
  }
}

/**
 * Set consent status for a family member (admin/guardian only)
 */
export async function setFamilyConsent(
  clientId: string,
  familyUserId: string,
  orgId: string,
  consentGiven: boolean,
  reason?: string,
  grantedByUserId?: string
): Promise<FamilyConsent | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('family_consent')
      .upsert(
        {
          client_id: clientId,
          family_user_id: familyUserId,
          org_id: orgId,
          consent_given: consentGiven,
          consent_given_at: consentGiven ? new Date().toISOString() : null,
          consent_given_by: grantedByUserId,
          consent_reason: reason,
        },
        { onConflict: 'client_id,family_user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error setting family consent:', error)
      return null
    }

    return data as FamilyConsent
  } catch (error) {
    console.error('Exception setting family consent:', error)
    return null
  }
}

/**
 * Get all family members who have consent for a client
 */
export async function getFamilyMembersWithConsent(
  clientId: string
): Promise<FamilyConsent[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('family_consent')
      .select('*')
      .eq('client_id', clientId)
      .eq('consent_given', true)

    if (error) {
      console.error('Error fetching family members with consent:', error)
      return []
    }

    return (data as FamilyConsent[]) || []
  } catch (error) {
    console.error('Exception fetching family members with consent:', error)
    return []
  }
}
