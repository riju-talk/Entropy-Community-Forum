"use client"

import { useEffect, useState } from "react"
import { getUserDocuments } from "@/app/actions/documents"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface DocumentListProps {
    userId?: string
    selectedDocId?: string
    onSelect: (doc: any | null) => void
}

export function DocumentList({ userId, selectedDocId, onSelect }: DocumentListProps) {
    const [docs, setDocs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        // Poll for updates (simple way to catch new uploads)
        // In production, use optimistic updates or revalidation
        const fetchDocs = async () => {
            const res = await getUserDocuments(userId)
            if (res.success) {
                setDocs(res.docs || [])
            }
            setLoading(false)
        }

        fetchDocs()
        const interval = setInterval(fetchDocs, 5000)
        return () => clearInterval(interval)
    }, [userId])

    if (loading) {
        return (
            <div className="space-y-2 mt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (docs.length === 0) {
        return (
            <div className="text-center py-8 px-4 opacity-50">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs text-slate-500">No documents yet.</p>
                <p className="text-xs text-slate-400">Upload one to start!</p>
            </div>
        )
    }

    return (
        <div className="space-y-1 mt-2">
            {docs.map((doc) => (
                <div
                    key={doc.id}
                    onClick={() => onSelect(doc)}
                    className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer border border-transparent",
                        selectedDocId === doc.id
                            ? "bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-500/10"
                            : "hover:bg-white/50 hover:shadow-sm"
                    )}
                >
                    <div className={cn(
                        "h-8 w-8 rounded flex items-center justify-center shrink-0",
                        selectedDocId === doc.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                    )}>
                        <FileText className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            "font-medium truncate",
                            selectedDocId === doc.id ? "text-indigo-900" : "text-slate-700"
                        )}>
                            {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                            {new Date(doc.createdAt).toLocaleDateString()} • {Math.round(doc.size / 1024)} KB
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Delete action
                        }}
                    >
                        <MoreVertical className="h-3 w-3 text-slate-400" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
