"use client"

import { useState } from "react"
import { NotebookLayout } from "@/components/ai-agent/notebook/notebook-layout"
import { ChatAgent } from "@/components/ai-agent/chat-agent"
import { MindMapAgent } from "@/components/ai-agent/mindmap-agent"
import { AssessmentsAgent } from "@/components/ai-agent/assessments-agent"
import { ChartsAgent } from "@/components/ai-agent/charts-agent"
import { Sparkles } from "lucide-react"

export default function AIAgentPage() {
  const [activeTab, setActiveTab] = useState("qa")
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)

  return (
    <div className="h-full">
      <NotebookLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDocId={selectedDoc?.id}
        onDocSelect={setSelectedDoc}
      >
        {activeTab === "qa" && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-muted/30 backdrop-blur-md flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                AI Chat
              </h2>
              {selectedDoc && (
                <span className="text-[10px] px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-bold uppercase tracking-wider truncate max-w-[200px]" title={selectedDoc.title}>
                  Context: {selectedDoc.title}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatAgent contextDoc={selectedDoc} />
            </div>
          </div>
        )}

        {activeTab === "mindmap" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30 backdrop-blur-md">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Mind Map Generator
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MindMapAgent contextDoc={selectedDoc} />
            </div>
          </div>
        )}

        {(activeTab === "assessments" || activeTab === "flashcards") && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30 backdrop-blur-md">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Assessments & Flashcards
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AssessmentsAgent contextDoc={selectedDoc} />
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30 backdrop-blur-md">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Data Insights & Charts
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ChartsAgent contextDoc={selectedDoc} />
            </div>
          </div>
        )}
      </NotebookLayout>
    </div>
  )
}
