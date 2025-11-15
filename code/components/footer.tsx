import Link from 'next/link'
import { Calendar } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[oklch(0.7_0.15_250)]" />
            <span className="font-semibold bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] bg-clip-text text-transparent">
              SyllabiGuy
            </span>
            <span className="text-sm text-muted-foreground ml-2">Never miss a deadline again</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
