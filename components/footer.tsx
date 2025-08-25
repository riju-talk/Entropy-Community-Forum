import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Global University</h3>
            <p className="text-neutral-300 mb-6">
              A leading institution dedicated to academic excellence, research innovation, and global citizenship.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-neutral-300 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-neutral-300 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-neutral-300 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-neutral-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-neutral-300 hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/programs" className="text-neutral-300 hover:text-white">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-neutral-300 hover:text-white">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-neutral-300 hover:text-white">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/campus-life" className="text-neutral-300 hover:text-white">
                  Campus Life
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="text-neutral-300 hover:text-white">
                  Alumni
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-neutral-300 hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-neutral-300 mt-0.5" />
                <span className="text-neutral-300">123 University Avenue, Global City, 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-neutral-300" />
                <span className="text-neutral-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-neutral-300" />
                <span className="text-neutral-300">info@globaluniversity.edu</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Stay Updated</h3>
            <p className="text-neutral-300 mb-4">Subscribe to our newsletter for the latest news and events.</p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-neutral-400"
              />
              <Button className="w-full bg-slate-600 hover:bg-slate-500">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Global University. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white text-sm">
                Terms of Use
              </Link>
              <Link href="/accessibility" className="text-neutral-400 hover:text-white text-sm">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
