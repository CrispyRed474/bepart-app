import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can approve notes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, description: updatedDescription } = body

    // Validate action
    if (!['approve', 'reject', 'escalate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, reject, or escalate' },
        { status: 400 }
      )
    }

    // Fetch the note
    const { data: note } = await supabase
      .from('care_log_entries')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Check org access
    if (note.org_id !== profile.org_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update based on action
    let updateData: any = {
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    }

    if (action === 'approve') {
      updateData.status = 'approved'
      if (updatedDescription) {
        updateData.description = updatedDescription
      }
    } else if (action === 'reject') {
      updateData.status = 'rejected'
    } else if (action === 'escalate') {
      // Escalate keeps it flagged but marks it as escalated
      // Could add an escalated_at timestamp if needed
      updateData.status = 'flagged'
    }

    // Update the note
    const { data: updatedNote, error: updateError } = await supabase
      .from('care_log_entries')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Note update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      note_id: updatedNote.id,
      status: updatedNote.status,
      reviewed_by: profile.full_name,
      reviewed_at: updatedNote.reviewed_at,
      message: `Note ${action}ed by ${profile.full_name}`,
    })
  } catch (error) {
    console.error('Note approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
