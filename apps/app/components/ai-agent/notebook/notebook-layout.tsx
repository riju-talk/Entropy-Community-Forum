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
        <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
            {/* Sidebar */}
            <div
                className={cn(
                    "w-64 bg-background/60 backdrop-blur-xl border-r border-border transition-all duration-300 flex flex-col z-20",
                    !isSidebarOpen && "w-0 opacity-0 overflow-hidden"
                )}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-foreground">Spark AI</span>
                    </div>

                    <DocumentUpload userId={session?.user?.id} />
                </div>

                {/* Navigation - Tools */}
                <div className="p-2 space-y-1">
                    <p className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tools</p>
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
                    <p className="px-5 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">My Library</p>
                    <ScrollArea className="flex-1 px-2">
                        <DocumentList
                            userId={session?.user?.id}
                            selectedDocId={selectedDocId}
                            onSelect={onDocSelect}
                        />
                    </ScrollArea>
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Free Plan</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Background Glows for Deep Space Vibe */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none -z-10 hidden dark:block" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] pointer-events-none -z-10 hidden dark:block" />

                <div className="flex-1 overflow-hidden p-6">
                    <div className="h-full w-full max-w-5xl mx-auto bg-background/40 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col">
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                isActive
                    ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] border border-cyan-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
        >
            <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-cyan-400" : "text-muted-foreground")} />
            <span className="tracking-tight">{label}</span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
        </button>
    )
}
