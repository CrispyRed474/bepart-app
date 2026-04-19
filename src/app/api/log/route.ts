import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const formData = await request.formData()
    const clientId = formData.get('client_id') as string
    const entryType = formData.get('entry_type') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isIncident = formData.get('is_incident') === 'true'
    const severity = (formData.get('severity') as string) || null

    if (!clientId || !entryType || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify carer has access to this client
    const { data: carerClient } = await supabase
      .from('client_carers')
      .select('*')
      .eq('carer_id', profile.id)
      .eq('client_id', clientId)
      .single()

    if (!carerClient && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied to this client' },
        { status: 403 }
      )
    }

    // Handle photo uploads
    let photoUrls: string[] = []
    const files = formData.getAll('photos') as File[]

    for (const file of files) {
      if (file instanceof File) {
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(7)
        const fileName = `${clientId}/${timestamp}-${randomId}-${file.name}`

        const { data, error } = await supabase.storage
          .from('care-photos')
          .upload(fileName, file)

        if (error) {
          console.error('Photo upload error:', error)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('care-photos')
          .getPublicUrl(data.path)

        photoUrls.push(urlData.publicUrl)
      }
    }

    // Create care log entry
    const { data: logEntry, error: logError } = await supabase
      .from('care_log_entries')
      .insert({
        org_id: profile.org_id,
        client_id: clientId,
        carer_id: profile.id,
        entry_type: entryType,
        title,
        description,
        photo_urls: photoUrls,
        is_incident: isIncident,
        severity: isIncident ? severity : null,
        logged_at: new Date().toISOString(),
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

    return NextResponse.json(logEntry, { status: 201 })
  } catch (error) {
    console.error('Log creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
