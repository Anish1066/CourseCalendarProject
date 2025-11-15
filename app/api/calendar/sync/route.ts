import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'
export const maxDuration = 30

interface CalendarEvent {
  title: string
  date: string
  time?: string
  type: 'Exam' | 'Homework' | 'Project' | 'Other'
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Sync endpoint called')
    const body = await request.json()
    const { accessToken, events } = body as { accessToken: string; events: CalendarEvent[] }

    console.log('Received sync request:', {
      hasAccessToken: !!accessToken,
      eventsCount: events?.length || 0,
    })

    if (!accessToken) {
      console.error('No access token provided')
      return NextResponse.json({ error: 'Google access token is required' }, { status: 400 })
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      console.error('No events provided or empty array')
      return NextResponse.json({ error: 'Events array is required' }, { status: 400 })
    }

    // Initialize Google Calendar API
    console.log('Initializing Google Calendar API client')
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    console.log('Calendar client initialized, processing', events.length, 'events')

    const results = []
    const errors = []

    // Create events in Google Calendar
    for (const event of events) {
      try {
        // Parse date - handle ISO date strings (YYYY-MM-DD)
        let eventDate: Date
        if (event.date.includes('T')) {
          // ISO datetime string
          eventDate = new Date(event.date)
        } else if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // ISO date string (YYYY-MM-DD)
          eventDate = new Date(event.date + 'T00:00:00')
        } else {
          // Try parsing as-is
          eventDate = new Date(event.date)
        }
        
        if (isNaN(eventDate.getTime())) {
          console.error(`Invalid date format for event "${event.title}": ${event.date}`)
          errors.push({ event: event.title, error: `Invalid date format: ${event.date}` })
          continue
        }

        // Parse time if provided
        let startDateTime: Date
        let endDateTime: Date

        if (event.time) {
          // Try to parse time (e.g., "2:00 PM", "11:59 PM")
          const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
          if (timeMatch) {
            let hours = parseInt(timeMatch[1])
            const minutes = parseInt(timeMatch[2])
            const period = timeMatch[3].toUpperCase()

            if (period === 'PM' && hours !== 12) hours += 12
            if (period === 'AM' && hours === 12) hours = 0

            startDateTime = new Date(eventDate)
            startDateTime.setHours(hours, minutes, 0, 0)

            // Default duration: 1 hour for exams, 0 for assignments
            endDateTime = new Date(startDateTime)
            if (event.type === 'Exam') {
              endDateTime.setHours(hours + 2, minutes, 0, 0) // 2 hour exam default
            } else {
              endDateTime.setHours(hours + 1, minutes, 0, 0) // 1 hour default
            }
          } else {
            // If time parsing fails, use date with default time
            startDateTime = new Date(eventDate)
            startDateTime.setHours(0, 0, 0, 0)
            endDateTime = new Date(startDateTime)
            endDateTime.setHours(23, 59, 59, 999)
          }
        } else {
          // No time specified, use all-day event
          startDateTime = new Date(eventDate)
          startDateTime.setHours(0, 0, 0, 0)
          endDateTime = new Date(eventDate)
          endDateTime.setHours(23, 59, 59, 999)
        }

        // Determine if it's an all-day event (no specific time)
        const isAllDay = !event.time

        const calendarEvent = {
          summary: event.title,
          description: event.description || `Type: ${event.type}`,
          start: isAllDay
            ? {
                date: eventDate.toISOString().split('T')[0],
                timeZone: 'America/New_York',
              }
            : {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/New_York',
              },
          end: isAllDay
            ? {
                date: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                timeZone: 'America/New_York',
              }
            : {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/New_York',
              },
          colorId: getColorIdForEventType(event.type),
        }

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: calendarEvent,
        })

        results.push({
          id: response.data.id,
          title: event.title,
          htmlLink: response.data.htmlLink,
        })
      } catch (error) {
        console.error(`Error creating event "${event.title}":`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        // Log more details for debugging
        if (error instanceof Error && 'response' in error) {
          const gError = error as any
          console.error('Google API error details:', {
            code: gError.code,
            message: gError.message,
            response: gError.response?.data,
          })
        }
        errors.push({
          event: event.title,
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sync to Google Calendar',
      },
      { status: 500 }
    )
  }
}

function getColorIdForEventType(type: string): string {
  // Google Calendar color IDs: 1-11
  switch (type) {
    case 'Exam':
      return '6' // Orange
    case 'Homework':
      return '9' // Blue
    case 'Project':
      return '10' // Green
    default:
      return '1' // Lavender
  }
}

