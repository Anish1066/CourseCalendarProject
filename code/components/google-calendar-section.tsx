'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Loader2, CheckCircle2 } from 'lucide-react'
import { useEvents } from '@/contexts/events-context'
import { useToast } from '@/hooks/use-toast'

export function GoogleCalendarSection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { getSelectedEvents, courses, getAllEvents, selectedEventIds } = useEvents()
  const { toast } = useToast()
  
  // Track connection state for timeout cleanup
  const connectionStateRef = { isConnected: false }

  const handleConnect = async () => {
    setIsConnecting(true)
    connectionStateRef.isConnected = false
    
    try {
      // Get OAuth URL
      const authResponse = await fetch('/api/calendar/auth')
      if (!authResponse.ok) {
        throw new Error('Failed to get auth URL')
      }

      const { authUrl } = await authResponse.json()

      // Open OAuth popup
      const width = 500
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      window.open(
        authUrl,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Set a timeout to handle cases where popup is closed without sending a message
      // This is a fallback - we don't check popup.closed due to COOP
      const timeoutRef = { current: null as NodeJS.Timeout | null }
      
      // Listen for OAuth callback via postMessage
      const messageHandler = (event: MessageEvent) => {
        console.log('Received message:', event.origin, event.data)
        
        // Verify origin for security - allow both the app URL and current origin
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const currentOrigin = window.location.origin
        
        // Accept messages from the same origin (where the callback page is served)
        if (event.origin !== expectedOrigin && event.origin !== currentOrigin) {
          console.log('Origin mismatch:', event.origin, 'expected:', expectedOrigin, 'current:', currentOrigin)
          return
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log('Auth success, setting token')
          setAccessToken(event.data.accessToken)
          setIsConnected(true)
          connectionStateRef.isConnected = true
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          
          // Popup will close itself automatically (handled in callback route)
          // Don't try to close it from parent due to Cross-Origin-Opener-Policy
          
          toast({
            title: 'Connected!',
            description: 'Your Google Calendar is now connected.',
          })
        } else if (event.data.type === 'GOOGLE_AUTH_CLOSED') {
          console.log('Auth popup closed by user')
          // Popup was closed by user
          window.removeEventListener('message', messageHandler)
          setIsConnecting(false)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        }
      }

      window.addEventListener('message', messageHandler)
      console.log('Listening for messages from popup, expected origin:', process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
      
      timeoutRef.current = setTimeout(() => {
        console.log('Timeout reached, cleaning up')
        window.removeEventListener('message', messageHandler)
        if (!connectionStateRef.isConnected) {
          setIsConnecting(false)
          toast({
            title: 'Connection timeout',
            description: 'The connection took too long. Please try again.',
            variant: 'destructive',
          })
        }
      }, 5 * 60 * 1000) // 5 minute timeout
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect to Google Calendar',
        variant: 'destructive',
      })
      setIsConnecting(false)
    }
  }

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('/api/calendar/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      setAccessToken(data.accessToken)
      setIsConnected(true)
      setIsConnecting(false)

      toast({
        title: 'Connected!',
        description: 'Your Google Calendar is now connected.',
      })
    } catch (error) {
      console.error('Token exchange error:', error)
      toast({
        title: 'Connection failed',
        description: 'Failed to complete Google Calendar connection',
        variant: 'destructive',
      })
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    if (!accessToken) {
      toast({
        title: 'Not connected',
        description: 'Please connect your Google Calendar first',
        variant: 'destructive',
      })
      return
    }

    const allEvents = getAllEvents()
    console.log('Sync debug:', {
      coursesCount: courses.length,
      allEventsCount: allEvents.length,
      selectedEventIdsCount: selectedEventIds.length,
      selectedEventIds: selectedEventIds,
      allEvents: allEvents.map(e => ({ id: e.id, title: e.title })),
    })
    
    const selectedEvents = getSelectedEvents()
    console.log('Selected events from getSelectedEvents():', selectedEvents.length, selectedEvents)
    
    if (selectedEvents.length === 0) {
      if (allEvents.length === 0) {
        toast({
          title: 'No events found',
          description: 'Please upload a syllabus file first to extract events. Use the "Upload Syllabus" button at the top of the page.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'No events selected',
          description: 'Please select events to sync from the events preview section above.',
          variant: 'destructive',
        })
      }
      return
    }

    try {
      console.log('Sending sync request with', selectedEvents.length, 'events')
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          events: selectedEvents.map((e) => ({
            title: e.title,
            date: e.date,
            time: e.time,
            type: e.type,
            description: e.description,
          })),
        }),
      })

      console.log('Sync response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          const responseText = await response.text()
          console.error('Error response text:', responseText)
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` }
        }
        console.error('Sync error data:', errorData)
        throw new Error(errorData.error || errorData.message || `Failed to sync events (${response.status})`)
      }

      const data = await response.json()
      console.log('Sync response data:', data)

      if (data.errors && data.errors.length > 0) {
        // Some events failed
        console.error('Failed events:', data.errors)
        toast({
          title: 'Partially synced',
          description: `Added ${data.created} events. ${data.failed} failed. Check console for details.`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Events synced!',
          description: `Successfully added ${data.created} events to your Google Calendar.`,
        })
      }
    } catch (error) {
      console.error('Sync error:', error)
      let errorMessage = 'Failed to sync events to Google Calendar'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        // Try to extract error from response
        try {
          const errorResponse = error as { error?: string; message?: string }
          errorMessage = errorResponse.error || errorResponse.message || errorMessage
        } catch {
          // Use default message
        }
      }
      
      console.error('Final error message:', errorMessage)
      toast({
        title: 'Sync failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <section className="py-20 md:py-32" data-calendar-section>
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)] border-2 rounded-3xl shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] text-white mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isConnected ? 'Google Calendar Connected' : 'Connect your Google Calendar in seconds'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {isConnected
              ? 'Your events are ready to sync. Click below to add them to your calendar.'
              : 'Securely connect your Google account to sync all your important dates automatically'}
          </p>

          {!isConnected ? (
            <Button
              size="lg"
              className="bg-white hover:bg-gray-50 text-foreground border-2 rounded-full px-8 shadow-lg"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Connect with Google
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full px-8 shadow-lg"
              onClick={handleSync}
            >
              <CheckCircle2 className="mr-3 h-5 w-5" />
              Sync Events to Calendar
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>We only access calendar events. Your data stays private.</span>
          </div>
        </Card>
      </div>
    </section>
  )
}
