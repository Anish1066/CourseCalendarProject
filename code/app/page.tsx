import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { EventsPreviewSection } from '@/components/events-preview-section'
import { GoogleCalendarSection } from '@/components/google-calendar-section'
import { FAQSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <EventsPreviewSection />
        <GoogleCalendarSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
