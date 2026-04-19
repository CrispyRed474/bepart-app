'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Microphone, Upload, X, AlertTriangle } from 'lucide-react'

type EntryType = 'meal' | 'activity' | 'medication' | 'incident' | 'note' | 'photo' | 'hygiene'
type Severity = 'low' | 'medium' | 'high' | 'critical'

const ENTRY_TYPE_OPTIONS = [
  { value: 'meal', label: '🍽️ Meal' },
  { value: 'activity', label: '🎯 Activity' },
  { value: 'medication', label: '💊 Medication' },
  { value: 'hygiene', label: '🚿 Hygiene' },
  { value: 'incident', label: '⚠️ Incident' },
  { value: 'note', label: '📝 Note' },
  { value: 'photo', label: '📸 Photo' },
]

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function LogEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recordingRef] = useState<{ mediaRecorder?: MediaRecorder }>({})

  const [formData, setFormData] = useState({
    entry_type: 'note' as EntryType,
    title: '',
    description: '',
    is_incident: false,
    severity: 'medium' as Severity,
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [transcribedText, setTranscribedText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return
    setPhotos(prev => [...prev, ...Array.from(files)])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      recordingRef.mediaRecorder = mediaRecorder

      const audioChunks: Blob[] = []
      mediaRecorder.addEventListener('dataavailable', e => audioChunks.push(e.data))

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      })

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (recordingRef.mediaRecorder) {
      recordingRef.mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.text) {
        setTranscribedText(data.text)
        setFormData(prev => ({
          ...prev,
          description: prev.description + (prev.description ? ' ' : '') + data.text,
        }))
      }
    } catch (error) {
      console.error('Transcription error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('client_id', params.id)
      submitData.append('entry_type', formData.entry_type)
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('is_incident', String(formData.is_incident))
      if (formData.is_incident) {
        submitData.append('severity', formData.severity)
      }

      photos.forEach(photo => {
        submitData.append('photos', photo)
      })

      const res = await fetch('/api/log', {
        method: 'POST',
        body: submitData,
      })

      if (!res.ok) throw new Error('Failed to create log entry')

      router.push(`/carer/clients/${params.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to save log entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Care Log Entry</h1>
        <p className="text-gray-600 mt-1">Record what happened during this visit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Type */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Entry Type
          </label>
          <Select
            value={formData.entry_type}
            onChange={e => setFormData(prev => ({
              ...prev,
              entry_type: e.target.value as EntryType
            }))}
            options={ENTRY_TYPE_OPTIONS}
          />
        </Card>

        {/* Incident Toggle */}
        <Card className="p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_incident}
              onChange={e => setFormData(prev => ({
                ...prev,
                is_incident: e.target.checked
              }))}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              This is an incident
            </span>
          </label>
        </Card>

        {/* Severity (if incident) */}
        {formData.is_incident && (
          <Card className="p-4 border-red-200 bg-red-50">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Severity Level
            </label>
            <Select
              value={formData.severity}
              onChange={e => setFormData(prev => ({
                ...prev,
                severity: e.target.value as Severity
              }))}
              options={SEVERITY_OPTIONS}
            />
          </Card>
        )}

        {/* Title */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Title *
          </label>
          <Input
            type="text"
            placeholder="Brief summary of what happened"
            value={formData.title}
            onChange={e => setFormData(prev => ({
              ...prev,
              title: e.target.value
            }))}
            required
          />
        </Card>

        {/* Description */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Details *
          </label>
          <Textarea
            placeholder="Full details about what happened, observations, client response, etc."
            value={formData.description}
            onChange={e => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            rows={4}
            required
          />
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              <Microphone className="w-4 h-4" />
              {isRecording ? 'Stop Recording' : 'Voice Note'}
            </Button>
            {transcribedText && (
              <Badge variant="default">{transcribedText.length} chars</Badge>
            )}
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Photos
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={e => handlePhotoSelect(e.target.files)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </Button>

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? <LoadingSpinner /> : 'Save Entry'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
