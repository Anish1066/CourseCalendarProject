'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useEvents, type ExtractedEvent } from '@/contexts/events-context'
import { format } from 'date-fns'

export function EventsPreviewSection() {
  const { courses, getAllEvents, selectedEventIds, setSelectedEventIds } = useEvents()
  const allEvents = getAllEvents()
  const courseNames = courses.map((c) => c.course)
  const [selectedCourse, setSelectedCourse] = useState<string | 'All'>(
    courseNames.length > 0 ? courseNames[0] : 'All'
  )
  
  // Auto-select all events when new events are added
  useEffect(() => {
    const currentEventIds = allEvents.map((e) => e.id)
    // Only add new event IDs that aren't already selected
    const newEventIds = currentEventIds.filter((id) => !selectedEventIds.includes(id))
    if (newEventIds.length > 0) {
      setSelectedEventIds((prev) => [...new Set([...prev, ...newEventIds])])
    }
  }, [allEvents, selectedEventIds, setSelectedEventIds])
  
  // Update selected course when courses change
  useEffect(() => {
    if (courseNames.length > 0 && selectedCourse !== 'All' && !courseNames.includes(selectedCourse)) {
      setSelectedCourse(courseNames[0])
    }
  }, [courseNames, selectedCourse])
  
  // Get all current event IDs
  const currentEventIds = allEvents.map((e) => e.id)
  // Filter selected IDs to only include events that still exist
  const validSelectedIds = selectedEventIds.filter((id) => currentEventIds.includes(id))
  
  // Clean up invalid selected IDs
  useEffect(() => {
    if (validSelectedIds.length !== selectedEventIds.length) {
      setSelectedEventIds(validSelectedIds)
    }
  }, [allEvents.length]) // Only depend on the count, not the full array
  
  const selectedEvents = validSelectedIds

  // Filter events by selected course
  const filteredEvents =
    selectedCourse === 'All'
      ? allEvents
      : allEvents.filter((e) => {
          if (e.course === selectedCourse) return true
          const courseData = courses.find((c) => c.course === selectedCourse)
          return courseData?.events.some((ev) => ev.id === e.id) ?? false
        })

  const handleToggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    )
  }

  const handleToggleAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEventIds([])
    } else {
      setSelectedEventIds((prev) => {
        const newIds = filteredEvents.map((e) => e.id)
        return [...new Set([...prev, ...newIds])]
      })
    }
  }

  if (courses.length === 0) {
    return (
      <section id="features" className="py-20 md:py-32 bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Classes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a syllabus to see extracted events here
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Classes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review extracted events from your syllabi and choose what to add to your calendar
          </p>
        </div>

        <Card className="max-w-5xl mx-auto p-6 md:p-8 shadow-xl rounded-2xl">
          {/* Course Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedCourse('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCourse === 'All'
                  ? 'bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] text-white shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              All
            </button>
            {courseNames.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCourse === course
                    ? 'bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] text-white shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {course}
              </button>
            ))}
          </div>

          {/* Select All Toggle */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                onCheckedChange={handleToggleAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({filteredEvents.length} events)
              </span>
            </div>
          )}

          {/* Events Table */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No events found for this course</p>
            ) : (
              filteredEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  isSelected={selectedEvents.includes(event.id)}
                  onToggle={() => handleToggleEvent(event.id)}
                />
              ))
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full py-6 text-base font-semibold"
            disabled={selectedEvents.length === 0}
            onClick={() => {
              // Scroll to Google Calendar section
              const calendarSection = document.querySelector('[data-calendar-section]')
              calendarSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            Review & Add to Google Calendar ({selectedEvents.length})
          </Button>
        </Card>
      </div>
    </section>
  )
}

function EventRow({
  event,
  isSelected,
  onToggle,
}: {
  event: ExtractedEvent
  isSelected: boolean
  onToggle: () => void
}) {
  const typeColors = {
    Exam: 'bg-[oklch(0.75_0.15_350)]/20 text-[oklch(0.5_0.15_350)] border-[oklch(0.75_0.15_350)]/30',
    Homework: 'bg-[oklch(0.7_0.15_250)]/20 text-[oklch(0.5_0.15_250)] border-[oklch(0.7_0.15_250)]/30',
    Project: 'bg-[oklch(0.65_0.15_290)]/20 text-[oklch(0.45_0.15_290)] border-[oklch(0.65_0.15_290)]/30',
    Other: 'bg-muted/50 text-muted-foreground border-border',
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 items-center text-sm">
        <div className="font-medium">{formatDate(event.date)}</div>
        <div className="text-muted-foreground">{event.time || 'All day'}</div>
        <div className="text-muted-foreground">{event.course || 'N/A'}</div>
        <div className="font-medium md:col-span-1">{event.title}</div>
        <div className="flex justify-start md:justify-end">
          <span className={`text-xs px-3 py-1 rounded-full border ${typeColors[event.type]} font-medium`}>
            {event.type}
          </span>
        </div>
      </div>
    </div>
  )
}
