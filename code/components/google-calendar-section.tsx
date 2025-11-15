import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export function GoogleCalendarSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)] border-2 rounded-3xl shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] text-white mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect your Google Calendar in seconds</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Securely connect your Google account to sync all your important dates automatically
          </p>
          <Button size="lg" className="bg-white hover:bg-gray-50 text-foreground border-2 rounded-full px-8 shadow-lg">
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
          </Button>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>We only access calendar events. Your data stays private.</span>
          </div>
        </Card>
      </div>
    </section>
  )
}
