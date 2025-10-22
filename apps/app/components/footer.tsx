import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Heart, Github, Twitter, Linkedin } from "lucide-react"
import { AlphaBadge } from "@/components/ui/alpha-badge"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Entropy</span>
                <AlphaBadge />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Academic community platform for STEM learning and collaboration.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link href="/ask" className="block text-muted-foreground hover:text-foreground transition-colors">
                Ask questions
              </Link>
              <Link href="/ai-agent" className="block text-muted-foreground hover:text-foreground transition-colors">
                Spark AI
              </Link>
              <Link href="/mentorship" className="block text-muted-foreground hover:text-foreground transition-colors">
                Mentorship
              </Link>
              <Link href="/leaderboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Community</h3>
            <div className="space-y-2 text-sm">
              <Link href="/happenings" className="block text-muted-foreground hover:text-foreground transition-colors">
                Events
              </Link>
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About us
              </Link>
              <Link href="/community" className="block text-muted-foreground hover:text-foreground transition-colors">
                Communities
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help center
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact us
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy policy
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Legal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms of service
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy policy
              </Link>
              <Link href="/cookies" className="block text-muted-foreground hover:text-foreground transition-colors">
                Cookie policy
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">© {currentYear} Entropy. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for education</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
