'use client'

import { useState, useCallback } from 'react'

export interface ExtractedEvent {
  id: string
  title: string
  date: string
  time?: string
  type: 'Exam' | 'Homework' | 'Project' | 'Other'
  course?: string
  description?: string
}

export interface CourseData {
  course: string
  events: ExtractedEvent[]
  filename: string
}

export function useEvents() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])

  const addCourse = useCallback((courseData: CourseData) => {
    console.log('addCourse called with:', {
      course: courseData.course,
      eventsCount: courseData.events.length,
      filename: courseData.filename,
    })
    setCourses((prev) => {
      console.log('Previous courses state:', prev.length, prev.map(c => ({ course: c.course, eventsCount: c.events.length })))
      // Check if course already exists, if so, merge events
      const existingIndex = prev.findIndex((c) => c.course === courseData.course)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          events: [...updated[existingIndex].events, ...courseData.events],
        }
        console.log('Merged with existing course, new state:', updated.length, updated.map(c => ({ course: c.course, eventsCount: c.events.length })))
        return updated
      }
      const newState = [...prev, courseData]
      console.log('Added new course, new state:', newState.length, newState.map(c => ({ course: c.course, eventsCount: c.events.length })))
      return newState
    })
  }, [])

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let data: any
      let responseText: string = ''
      
      try {
        responseText = await response.text()
        if (responseText) {
          try {
            data = JSON.parse(responseText)
          } catch {
            // Response is not JSON, use text as error message
            data = { error: responseText || `Server error: ${response.status} ${response.statusText}` }
          }
        }
      } catch (parseError) {
        // If we can't read response, create error from status
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || responseText || `Failed to upload file (${response.status})`
        // Log error details for debugging
        // eslint-disable-next-line no-console
        console.error('Upload error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          responseData: data,
          responseText: responseText.substring(0, 500), // First 500 chars
        })
        throw new Error(errorMessage)
      }

      // Add IDs to events - use a more unique ID to avoid conflicts
      const timestamp = Date.now()
      const eventsWithIds: ExtractedEvent[] = data.events.map((event: any, index: number) => ({
        ...event,
        id: `${data.filename}-${index}-${timestamp}-${Math.random().toString(36).substring(7)}`,
      }))

      console.log('Upload successful, events extracted:', {
        course: data.course || data.filename,
        eventsCount: eventsWithIds.length,
        eventIds: eventsWithIds.map(e => e.id),
        events: eventsWithIds.map(e => ({ id: e.id, title: e.title, date: e.date })),
      })

      const courseData: CourseData = {
        course: data.course || data.filename,
        events: eventsWithIds,
        filename: data.filename,
      }

      addCourse(courseData)
      console.log('Course added, current courses state will update')
      
      // Auto-select all new events
      const newIds = eventsWithIds.map((e) => e.id)
      setSelectedEventIds((prev) => {
        const updated = [...new Set([...prev, ...newIds])]
        console.log('Selected event IDs updated:', {
          previousCount: prev.length,
          newIdsCount: newIds.length,
          totalSelected: updated.length,
          selectedIds: updated,
        })
        return updated
      })
      
      return courseData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [addCourse, setSelectedEventIds])

  const getAllEvents = useCallback((): ExtractedEvent[] => {
    return courses.flatMap((course) => course.events)
  }, [courses])

  const getSelectedEvents = useCallback((): ExtractedEvent[] => {
    const allEvents = getAllEvents()
    return allEvents.filter((event) => selectedEventIds.includes(event.id))
  }, [getAllEvents, selectedEventIds])

  const getCourses = useCallback((): string[] => {
    return courses.map((course) => course.course)
  }, [courses])

  return {
    courses,
    loading,
    error,
    uploadFile,
    getAllEvents,
    getSelectedEvents,
    getCourses,
    selectedEventIds,
    setSelectedEventIds,
    clearError: () => setError(null),
  }
}

