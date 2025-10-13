import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl">Entropy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Academic community platform for students and educators to collaborate, learn, and grow together.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link href="/ask" className="block text-muted-foreground hover:text-foreground">
                Ask Questions
              </Link>
              <Link href="/ai-agent" className="block text-muted-foreground hover:text-foreground">
                AI Assistant
              </Link>
              <Link href="/mentorship" className="block text-muted-foreground hover:text-foreground">
                Find Mentors
              </Link>
              <Link href="/leaderboard" className="block text-muted-foreground hover:text-foreground">
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <div className="space-y-2 text-sm">
              <Link href="/happenings" className="block text-muted-foreground hover:text-foreground">
                Events
              </Link>
              <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                About Us
              </Link>
              <Link href="/community" className="block text-muted-foreground hover:text-foreground">
                Communities
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              <Link href="/help" className="block text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">© 2025 Entropy. All rights reserved.</p>
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <span>Made with ❤️ for education</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
