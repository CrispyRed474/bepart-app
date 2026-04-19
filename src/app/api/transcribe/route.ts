import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get('audio') as Blob

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio blob provided' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Send to OpenAI Whisper API
    const transcribeFormData = new FormData()
    transcribeFormData.append('file', audioBlob, 'audio.wav')
    transcribeFormData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: transcribeFormData,
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: 'Transcription failed', details: error },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      text: result.text,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
