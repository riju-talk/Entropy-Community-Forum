import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import ErrorBoundary from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    default: "Entropy - Academic Community Platform",
    template: "%s | Entropy"
  },
  description: "A comprehensive academic community platform for STEM learning, doubt resolution, and collaborative education. Connect with students, educators, and experts worldwide.",
  keywords: ["academic", "education", "STEM", "learning", "community", "doubts", "questions", "answers", "collaboration"],
  authors: [{ name: "Entropy Team" }],
  creator: "Entropy",
  publisher: "Entropy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://entropy-community-forum.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Entropy - Academic Community Platform",
    description: "A comprehensive academic community platform for STEM learning, doubt resolution, and collaborative education.",
    siteName: "Entropy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Entropy - Academic Community Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Entropy - Academic Community Platform",
    description: "A comprehensive academic community platform for STEM learning, doubt resolution, and collaborative education.",
    images: ["/og-image.png"],
    creator: "@entropy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Entropy" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1">
                  <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Sidebar */}
                      <aside className="lg:col-span-3">
                        <Sidebar />
                      </aside>

                      {/* Main Content */}
                      <main className="lg:col-span-9">{children}</main>
                    </div>
                  </div>
                </div>
                <Footer />
              </div>
            </ErrorBoundary>
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
