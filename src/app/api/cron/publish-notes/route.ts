import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Cron endpoint to auto-publish pending notes
 * 
 * This endpoint should be called daily at 6am AEST or later.
 * It finds all notes where status='pending' and publish_at has passed,
 * then updates them to 'auto_approved' so families can see them.
 * 
 * For Fly.io, add to fly.toml:
 * [http_service.processes.web]
 * 
 * [build.processes]
 * cron = "npm run build && node -e 'setInterval(async () => { ... }, 24*60*60*1000)'"
 * 
 * Or call via external cron service:
 * curl -X POST https://bepart-app.fly.dev/api/cron/publish-notes \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

export async function POST(request: NextRequest) {
  try {
    // Optional: validate cron secret if you have one
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Use service role key for admin access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const now = new Date().toISOString()

    // Find all pending notes where publish window has passed
    const { data: notesToPublish, error: queryError } = await supabase
      .from('care_log_entries')
      .select('id, client_id, org_id, title')
      .eq('status', 'pending')
      .lte('publish_at', now)

    if (queryError) {
      console.error('[CRON] Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to query pending notes', details: queryError.message },
        { status: 500 }
      )
    }

    if (!notesToPublish || notesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending notes to publish',
        published_count: 0,
      })
    }

    console.log(`[CRON] Publishing ${notesToPublish.length} pending notes`)

    // Update all to auto_approved
    const noteIds = notesToPublish.map((n) => n.id)
    const { error: updateError } = await supabase
      .from('care_log_entries')
      .update({
        status: 'auto_approved',
      })
      .in('id', noteIds)

    if (updateError) {
      console.error('[CRON] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update notes', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Published ${notesToPublish.length} notes`,
      published_count: notesToPublish.length,
      note_ids: noteIds,
    })
  } catch (error) {
    console.error('[CRON] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for external cron services (e.g., EasyCron, GitHub Actions)
export async function GET(request: NextRequest) {
  return POST(request)
}
