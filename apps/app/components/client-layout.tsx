"use client"

import { SessionProvider } from "next-auth/react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}