'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileText, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import { useEvents } from '@/contexts/events-context'
import { useToast } from '@/hooks/use-toast'

export function HeroSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { uploadFile, loading, courses, getAllEvents } = useEvents()
  const { toast } = useToast()

  const handleFileSelect = async (file: File) => {
    console.log('File selected for upload:', file.name, file.size, 'bytes')
    try {
      const result = await uploadFile(file)
      console.log('Upload completed, result:', result)
      console.log('Current courses after upload:', courses.length, courses)
      console.log('Current events after upload:', getAllEvents().length, getAllEvents())
      
      toast({
        title: 'Syllabus processed!',
        description: `Successfully extracted ${result.events.length} events from ${result.course}.`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to process syllabus',
        variant: 'destructive',
      })
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Get the most recent course and events for preview
  const latestCourse = courses[courses.length - 1]
  const previewEvents = latestCourse?.events.slice(0, 3) || []

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.95_0.02_250)] via-background to-[oklch(0.95_0.02_350)] py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Turn your syllabi into a{' '}
              <span className="bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] bg-clip-text text-transparent">
                smart calendar
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">
              Upload your class syllabi and automatically add exams, homework, and projects to your Google Calendar.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full px-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Syllabus
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button size="lg" variant="outline" className="rounded-full px-8 border-2" disabled>
                Try Demo
              </Button>
            </div>
          </div>

          {/* Right side - Preview Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.75_0.15_350)] to-[oklch(0.7_0.15_250)] rounded-3xl blur-3xl opacity-20" />
            <Card className="relative bg-white/80 backdrop-blur-sm border-none shadow-2xl rounded-3xl p-8 space-y-6">
              {/* Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)] transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-[oklch(0.7_0.15_250)] bg-[oklch(0.95_0.02_250)]'
                    : 'border-[oklch(0.7_0.15_250)]/30 hover:border-[oklch(0.7_0.15_250)]/50'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto mb-4 text-[oklch(0.7_0.15_250)] animate-spin" />
                    <p className="text-sm font-medium text-foreground">Processing syllabus...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-[oklch(0.7_0.15_250)]" />
                    <p className="text-sm font-medium text-foreground">Drop your syllabus here</p>
                    <p className="text-xs text-muted-foreground mt-1">TXT files only</p>
                  </>
                )}
              </div>

              {/* Extracted Events */}
              {latestCourse && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{latestCourse.course}</span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    {previewEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        title={event.title}
                        date={formatEventDate(event.date, event.time)}
                        type={event.type}
                      />
                    ))}
                    {previewEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No events extracted</p>
                    )}
                  </div>
                </div>
              )}

              {!latestCourse && !loading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">Upload a syllabus to see events</span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function EventItem({ title, date, type }: { title: string; date: string; type: 'Exam' | 'Homework' | 'Project' | 'Other' }) {
  const colors = {
    Exam: 'bg-[oklch(0.75_0.15_350)]/20 text-[oklch(0.5_0.15_350)] border-[oklch(0.75_0.15_350)]/30',
    Homework: 'bg-[oklch(0.7_0.15_250)]/20 text-[oklch(0.5_0.15_250)] border-[oklch(0.7_0.15_250)]/30',
    Project: 'bg-[oklch(0.65_0.15_290)]/20 text-[oklch(0.45_0.15_290)] border-[oklch(0.65_0.15_290)]/30',
    Other: 'bg-muted/50 text-muted-foreground border-border',
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full border ${colors[type]} font-medium whitespace-nowrap`}>
        {type}
      </span>
    </div>
  )
}

function formatEventDate(dateStr: string, time?: string): string {
  try {
    const date = new Date(dateStr)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    if (time) {
      return `${month} ${day}, ${time}`
    }
    return `${month} ${day}`
  } catch {
    return dateStr
  }
}
