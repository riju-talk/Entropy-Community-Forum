"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Plus,
    MessageSquare,
    BrainCircuit,
    Files,
    Zap,
    Settings,
    ChevronRight,
    Loader2,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserDocuments } from "@/app/actions/documents"
import { DocumentList } from "./document-list"
import { DocumentUpload } from "./document-upload"

interface NotebookLayoutProps {
    children: React.ReactNode
    activeTab: string
    onTabChange: (tab: string) => void
    selectedDocId?: string
    onDocSelect: (doc: any | null) => void
}

export function NotebookLayout({
    children,
    activeTab,
    onTabChange,
    selectedDocId,
    onDocSelect
}: NotebookLayoutProps) {
    const { data: session } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [docCount, setDocCount] = useState(0)

    useEffect(() => {
        if (session?.user?.id) {
            getUserDocuments(session.user.id).then(res => {
                if (res.success) setDocCount(res.docs?.length || 0)
            })
        }
    }, [session?.user?.id])

    const progress = Math.min((docCount / 10) * 100, 100)

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            {/* Sidebar */}
            <div
                className={cn(
                    "w-64 bg-white/70 backdrop-blur-md border-r border-slate-200 transition-all duration-300 flex flex-col",
                    !isSidebarOpen && "w-0 opacity-0 overflow-hidden"
                )}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800">Spark AI</span>
                    </div>

                    <DocumentUpload userId={session?.user?.id} />
                </div>

                {/* Navigation - Tools */}
                <div className="p-2 space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</p>
                    <NavButton
                        icon={MessageSquare}
                        label="Chat"
                        isActive={activeTab === "qa"}
                        onClick={() => onTabChange("qa")}
                    />
                    <NavButton
                        icon={BrainCircuit}
                        label="Mind Map"
                        isActive={activeTab === "mindmap"}
                        onClick={() => onTabChange("mindmap")}
                    />
                    <NavButton
                        icon={Files}
                        label="Flashcards"
                        isActive={activeTab === "flashcards"}
                        onClick={() => onTabChange("flashcards")}
                    />
                    <NavButton
                        icon={Files}
                        label="Quiz"
                        isActive={activeTab === "assessments"}
                        onClick={() => onTabChange("assessments")}
                    />
                    <NavButton
                        icon={BrainCircuit}
                        label="Charts"
                        isActive={activeTab === "charts"}
                        onClick={() => onTabChange("charts")}
                    />
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-hidden flex flex-col mt-2">
                    <p className="px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">My Library</p>
                    <ScrollArea className="flex-1 px-2">
                        <DocumentList
                            userId={session?.user?.id}
                            selectedDocId={selectedDocId}
                            onSelect={onDocSelect}
                        />
                    </ScrollArea>
                </div>

                {/* User Footer (optional) */}
                <div className="p-4 border-t border-slate-100/50 bg-white/30">
                    <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Free Plan</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Toggle Sidebar Button (absolute or in header) */}

                <div className="flex-1 overflow-hidden bg-white/40 backdrop-blur-sm p-6">
                    <div className="h-full w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden flex flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function NavButton({ icon: Icon, label, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
            {label}
            {isActive && <ChevronRight className="ml-auto h-3 w-3 text-indigo-400" />}
        </button>
    )
}
