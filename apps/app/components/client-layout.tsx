"use client"

import { SessionProvider } from "next-auth/react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen bg-background relative selection:bg-cyan-500 selection:text-white font-sans overflow-x-hidden">
        {/* 'Campify' Global Background - Dark Mode Only */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-background hidden dark:block">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <div className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}