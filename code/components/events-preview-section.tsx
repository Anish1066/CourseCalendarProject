'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const courses = ['CS 2120', 'ECON 2010', 'SPAN 1010']

const events = [
  { id: 1, date: 'Oct 15', time: '2:00 PM', course: 'CS 2120', title: 'Midterm Exam', type: 'Exam' },
  { id: 2, date: 'Oct 18', time: '11:59 PM', course: 'ECON 2010', title: 'Essay 2 Due', type: 'Homework' },
  { id: 3, date: 'Oct 20', time: '11:59 PM', course: 'CS 2120', title: 'Problem Set 3', type: 'Homework' },
  { id: 4, date: 'Oct 25', time: '3:30 PM', course: 'SPAN 1010', title: 'Oral Presentation', type: 'Project' },
  { id: 5, date: 'Nov 2', time: '2:00 PM', course: 'ECON 2010', title: 'Midterm 2', type: 'Exam' },
  { id: 6, date: 'Dec 10', time: '11:59 PM', course: 'CS 2120', title: 'Final Project Due', type: 'Project' },
]

export function EventsPreviewSection() {
  const [selectedCourse, setSelectedCourse] = useState('CS 2120')
  const [selectedEvents, setSelectedEvents] = useState<number[]>([1, 2, 3, 4, 5, 6])

  const filteredEvents = events.filter((e) => e.course === selectedCourse)

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
            {courses.map((course) => (
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

          {/* Events Table */}
          <div className="space-y-2 mb-6">
            {filteredEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                isSelected={selectedEvents.includes(event.id)}
                onToggle={() => {
                  setSelectedEvents((prev) =>
                    prev.includes(event.id) ? prev.filter((id) => id !== event.id) : [...prev, event.id]
                  )
                }}
              />
            ))}
          </div>

          <Button className="w-full bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full py-6 text-base font-semibold">
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
  event: (typeof events)[0]
  isSelected: boolean
  onToggle: () => void
}) {
  const typeColors = {
    Exam: 'bg-[oklch(0.75_0.15_350)]/20 text-[oklch(0.5_0.15_350)] border-[oklch(0.75_0.15_350)]/30',
    Homework: 'bg-[oklch(0.7_0.15_250)]/20 text-[oklch(0.5_0.15_250)] border-[oklch(0.7_0.15_250)]/30',
    Project: 'bg-[oklch(0.65_0.15_290)]/20 text-[oklch(0.45_0.15_290)] border-[oklch(0.65_0.15_290)]/30',
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 items-center text-sm">
        <div className="font-medium">{event.date}</div>
        <div className="text-muted-foreground">{event.time}</div>
        <div className="text-muted-foreground">{event.course}</div>
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
