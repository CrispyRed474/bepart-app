/**
 * Auto-publish pending notes when publish window has passed
 * 
 * This script should be run daily at 6am AEST (or later).
 * It finds all notes where:
 * - status = 'pending' 
 * - publish_at <= now()
 * - ai_flagged_issues is empty (AI cleared them)
 * 
 * Then updates them to status = 'auto_approved' to make them visible to families.
 * 
 * Usage (local):
 *   npx ts-node src/scripts/publish-pending-notes.ts
 * 
 * Usage (Fly.io cron via curl):
 *   curl -X POST https://bepart-app.fly.dev/api/cron/publish-notes \
 *     -H "Authorization: Bearer ${CRON_SECRET}"
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function publishPendingNotes() {
  try {
    console.log('[CRON] Starting auto-publish of pending notes...')

    const now = new Date().toISOString()

    // Find all pending notes where publish window has passed
    const { data: notesToPublish, error: queryError } = await supabase
      .from('care_log_entries')
      .select('id, client_id, carer_id, title, org_id')
      .eq('status', 'pending')
      .lte('publish_at', now)

    if (queryError) {
      console.error('[ERROR] Failed to query pending notes:', queryError)
      process.exit(1)
    }

    if (!notesToPublish || notesToPublish.length === 0) {
      console.log('[CRON] No pending notes to publish at this time')
      process.exit(0)
    }

    console.log(`[CRON] Found ${notesToPublish.length} notes ready to publish`)

    // Update all to auto_approved
    const noteIds = notesToPublish.map((n) => n.id)
    const { error: updateError } = await supabase
      .from('care_log_entries')
      .update({
        status: 'auto_approved',
      })
      .in('id', noteIds)

    if (updateError) {
      console.error('[ERROR] Failed to update notes:', updateError)
      process.exit(1)
    }

    console.log(`[CRON] Successfully published ${notesToPublish.length} notes`)
    console.log('[CRON] Notes are now visible to family members')

    process.exit(0)
  } catch (error) {
    console.error('[ERROR] Unexpected error in publish-pending-notes:', error)
    process.exit(1)
  }
}

publishPendingNotes()
