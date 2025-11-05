"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto px-12 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}