import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-[oklch(0.7_0.15_250)]" />
          <span className="text-xl font-semibold bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] bg-clip-text text-transparent">
            SyllabiGuy
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#faq" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link href="#login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Login
          </Link>
          <Button className="bg-gradient-to-r from-[oklch(0.7_0.15_250)] to-[oklch(0.75_0.15_350)] hover:opacity-90 text-white rounded-full">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
