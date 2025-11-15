import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileText, Calendar, CheckCircle2 } from 'lucide-react'

export function HeroSection() {
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
              <Button size="lg" className="bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full px-8">
                <Upload className="mr-2 h-5 w-5" />
                Upload Syllabus
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-2">
                Try Demo
              </Button>
            </div>
          </div>

          {/* Right side - Preview Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.75_0.15_350)] to-[oklch(0.7_0.15_250)] rounded-3xl blur-3xl opacity-20" />
            <Card className="relative bg-white/80 backdrop-blur-sm border-none shadow-2xl rounded-3xl p-8 space-y-6">
              {/* Upload Zone */}
              <div className="border-2 border-dashed border-[oklch(0.7_0.15_250)]/30 rounded-2xl p-8 text-center bg-gradient-to-br from-[oklch(0.95_0.02_250)] to-[oklch(0.95_0.02_350)] hover:border-[oklch(0.7_0.15_250)]/50 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-[oklch(0.7_0.15_250)]" />
                <p className="text-sm font-medium text-foreground">Drop your syllabus here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or image</p>
              </div>

              {/* Extracted Events */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">CS 2120 - Discrete Math</span>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <EventItem title="Midterm Exam" date="Oct 15, 2:00 PM" type="Exam" />
                  <EventItem title="Problem Set 3" date="Oct 20, 11:59 PM" type="Homework" />
                  <EventItem title="Final Project Due" date="Dec 10, 11:59 PM" type="Project" />
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Google Calendar
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function EventItem({ title, date, type }: { title: string; date: string; type: 'Exam' | 'Homework' | 'Project' }) {
  const colors = {
    Exam: 'bg-[oklch(0.75_0.15_350)]/20 text-[oklch(0.5_0.15_350)] border-[oklch(0.75_0.15_350)]/30',
    Homework: 'bg-[oklch(0.7_0.15_250)]/20 text-[oklch(0.5_0.15_250)] border-[oklch(0.7_0.15_250)]/30',
    Project: 'bg-[oklch(0.65_0.15_290)]/20 text-[oklch(0.45_0.15_290)] border-[oklch(0.65_0.15_290)]/30',
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
