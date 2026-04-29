import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AIScanResult {
  flagged: boolean
  issues: string[]
  severity: 'low' | 'medium' | 'high'
}

async function scanNoteWithAI(
  noteText: string,
  clientId: string,
  supabase: any
): Promise<AIScanResult> {
  try {
    // Fetch client profile with medical/dietary info
    const { data: client } = await supabase
      .from('clients')
      .select('allergies, dietary_restrictions, medical_conditions, care_plan_notes')
      .eq('id', clientId)
      .single()

    if (!client) {
      console.error('Client not found for AI scan')
      return { flagged: false, issues: [], severity: 'low' }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured')
      return { flagged: false, issues: [], severity: 'low' }
    }

    // Build the prompt
    const prompt = `You are a care home compliance assistant. Check this activity note against the resident's profile for any potential issues.

Resident profile:
- Allergies: ${client.allergies?.join(', ') || 'None listed'}
- Dietary restrictions: ${client.dietary_restrictions?.join(', ') || 'None listed'}
- Medical conditions: ${client.medical_conditions?.join(', ') || 'None listed'}
- Care plan notes: ${client.care_plan_notes || 'None listed'}

Activity note: "${noteText}"

Respond in JSON only (no markdown, no extra text): {"flagged": true/false, "issues": ["issue 1", "issue 2"], "severity": "low/medium/high"}
Only flag genuine concerns — allergy violations, dietary restriction breaches, contradictions with care plan, dignity concerns, safeguarding language.`

    // Call OpenAI GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText)
      return { flagged: false, issues: [], severity: 'low' }
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    // Parse JSON response
    const result = JSON.parse(content) as AIScanResult
    return result
  } catch (error) {
    console.error('AI scan error:', error)
    return { flagged: false, issues: [], severity: 'low' }
  }
}

async function notifyAdminOfFlaggedNote(
  noteId: string,
  clientId: string,
  issues: string[],
  orgId: string,
  supabase: any
) {
  try {
    // Fetch org admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, email, user_id')
      .eq('org_id', orgId)
      .eq('role', 'admin')

    if (!admins || admins.length === 0) {
      console.log('No admins found to notify')
      return
    }

    // In a real app, send email/notification here
    // For now, just log it
    console.log(`[ALERT] Note ${noteId} flagged with issues: ${issues.join(', ')}`)
  } catch (error) {
    console.error('Error notifying admin:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { client_id, entry_type, title, description, is_incident, severity } = body

    if (!client_id || !entry_type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, entry_type, title, description' },
        { status: 400 }
      )
    }

    // Verify carer has access to this client
    if (profile.role !== 'admin') {
      const { data: carerClient } = await supabase
        .from('client_carers')
        .select('*')
        .eq('carer_id', profile.id)
        .eq('client_id', client_id)
        .single()

      if (!carerClient) {
        return NextResponse.json(
          { error: 'Access denied to this client' },
          { status: 403 }
        )
      }
    }

    // Check if org has AI screening enabled
    const { data: org } = await supabase
      .from('organisations')
      .select('ai_screening_enabled')
      .eq('id', profile.org_id)
      .single()

    // Trigger AI scan only if enabled
    let aiScanResult: AIScanResult = { flagged: false, issues: [], severity: 'low' }
    let status = 'pending'

    if (org?.ai_screening_enabled) {
      // AI Screening add-on is enabled: scan and flag if issues found
      aiScanResult = await scanNoteWithAI(description, client_id, supabase)
      if (aiScanResult.flagged) {
        status = 'flagged'
      }
    } else {
      // AI Screening is not enabled: skip AI scan, all notes go to manual review
      status = 'pending'
    }

    // Create care log entry
    const { data: logEntry, error: logError } = await supabase
      .from('care_log_entries')
      .insert({
        org_id: profile.org_id,
        client_id,
        carer_id: profile.id,
        entry_type,
        title,
        description,
        is_incident: is_incident || false,
        severity: is_incident ? severity : null,
        logged_at: new Date().toISOString(),
        status,
        ai_scan_result: aiScanResult,
        ai_flagged_issues: aiScanResult.issues,
        // publish_at is set by database trigger to next day 6am
      })
      .select()
      .single()

    if (logError) {
      console.error('Log entry creation error:', logError)
      return NextResponse.json(
        { error: 'Failed to create log entry' },
        { status: 500 }
      )
    }

    // If flagged, notify admin
    if (aiScanResult.flagged) {
      await notifyAdminOfFlaggedNote(
        logEntry.id,
        client_id,
        aiScanResult.issues,
        profile.org_id,
        supabase
      )
    }

    return NextResponse.json(
      {
        success: true,
        note_id: logEntry.id,
        status,
        ai_scan: aiScanResult,
        message: status === 'flagged'
          ? 'Note created but flagged for review due to potential issues'
          : 'Note created and will be auto-published tomorrow at 6am if no issues found',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Note submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
