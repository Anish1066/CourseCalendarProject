import { Card } from '@/components/ui/card'
import { Upload, CheckSquare, Calendar } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your syllabi into organized calendar events
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            icon={<Upload className="h-10 w-10" />}
            step="1"
            title="Upload"
            description="Drop your syllabus files (PDF, DOC, or images) and we'll process them instantly."
          />
          <StepCard
            icon={<CheckSquare className="h-10 w-10" />}
            step="2"
            title="Review"
            description="We highlight key deadlines: exams, assignments, and projects. Review and edit as needed."
          />
          <StepCard
            icon={<Calendar className="h-10 w-10" />}
            step="3"
            title="Sync"
            description="Approve events and send them directly to your Google Calendar with one click."
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode
  step: string
  title: string
  description: string
}) {
  return (
    <Card className="relative p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 rounded-2xl group">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className="mb-4 text-[oklch(0.7_0.15_250)] group-hover:scale-110 transition-transform inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}
