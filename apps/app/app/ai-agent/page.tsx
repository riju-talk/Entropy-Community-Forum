"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { QuizAgent } from "@/components/ai-agent/quiz-agent"
import { MindMapAgent } from "@/components/ai-agent/mindmap-agent"
import { ChatAgent } from "@/components/ai-agent/chat-agent"
import { FlashcardsAgent } from "@/components/ai-agent/flashcards-agent"

export default function AIAgentPage() {
  const [agentStatus, setAgentStatus] = useState<"checking" | "available" | "unavailable">("checking")

  useEffect(() => {
    checkAgentHealth()
  }, [])

  const checkAgentHealth = async () => {
    console.log("🔍 Checking AI Agent health from frontend...")
    try {
      const response = await fetch("/api/ai-agent/health")
      console.log("Frontend health check response status:", response.status)

      const data = await response.json()
      console.log("Frontend health check response data:", data)

      if (response.ok) {
        console.log("✅ AI Agent is AVAILABLE")
        setAgentStatus("available")
      } else {
        console.log("❌ AI Agent is UNAVAILABLE")
        setAgentStatus("unavailable")
      }
    } catch (error) {
      console.error("❌ Health check error from frontend:", error)
      setAgentStatus("unavailable")
    }
  }

  const handleProtectedTab = (tab: string) => {
    if (tab !== "qa") {
      openAuthModal()
      setActiveTab("qa") // Keep them on QA tab if not authenticated
      return
    }
    setActiveTab(tab)
  }

  return (
    <div>
      {/* Alpha banner */}
      <div className="w-full bg-yellow-50 border-b border-yellow-200">
        <div className="container mx-auto px-4 py-2 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold">
                ALPHA
              </span>
              <p className="text-sm text-yellow-900 m-0">
                This is an experimental alpha. Many features may be missing or unstable — your feedback is crucial.
              </p>
            </div>
            <div className="text-xs text-yellow-800">Your feedback helps shape development</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Spark AI Agent
                  <span
                    title="Alpha phase of development"
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold"
                  >
                    ALPHA
                  </span>
                </h1>
                <p className="text-muted-foreground">Your intelligent learning companion</p>
              </div>
            </div>
            {agentStatus === "available" ? (
              <Badge variant="default" className="gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Available
              </Badge>
            ) : agentStatus === "checking" ? (
              <Badge variant="secondary" className="gap-2">
                Checking...
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-2">
                <AlertCircle className="h-3 w-3" />
                Under Maintenance
              </Badge>
            )}
          </div>

          {/* Status Alert */}
          {agentStatus === "unavailable" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>AI Agent Unavailable</AlertTitle>
              <AlertDescription>
                The AI Agent backend is currently under maintenance. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>AI-Powered Learning Tools</CardTitle>
              <CardDescription>Enhance your learning with advanced AI capabilities</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="qa" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="qa">Q&A + Chat</TabsTrigger>
                  <TabsTrigger value="mindmap">Mind Mapping</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
                  <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                </TabsList>

                <TabsContent value="qa" className="space-y-4">
                  {agentStatus === "available" ? (
                    <ChatAgent />
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Chat service is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mindmap" className="space-y-4">
                  {agentStatus === "available" ? (
                    <MindMapAgent />
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Mind mapping is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz" className="space-y-4">
                  {agentStatus === "available" ? (
                    <QuizAgent />
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Quiz generator is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="flashcards" className="space-y-4">
                  {agentStatus === "available" ? (
                    <FlashcardsAgent />
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Flashcard service is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* System Prompt Info */}
          {agentStatus === "available" && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">System Prompt (Customize AI Behavior)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You are a helpful AI tutor. Provide clear, concise, and educational responses.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Use the &quot;Advanced Options&quot; in each tool to customize how the AI responds
                </p>

                {/* Test upload button for debugging */}
                <div className="mt-4">
                  <button
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-white text-sm"
                    onClick={async () => {
                      // Test upload with verbose logging
                      try {
                        console.groupCollapsed("📤 Test Document Upload")
                        const start = Date.now()
                        console.log("-> Preparing FormData with a small test file")
                        const fd = new FormData()
                        const blob = new Blob(["test file content"], { type: "text/plain" })
                        fd.append("files", blob, "test.txt")
                        fd.append("collection_name", "test_collection")

                        console.log("-> Sending POST to /api/ai-agent/documents/upload")
                        const resp = await fetch("/api/ai-agent/documents/upload", {
                          method: "POST",
                          body: fd,
                        })

                        const elapsed = Date.now() - start
                        console.log(`<- Response received (${elapsed}ms)`)
                        console.log("Status:", resp.status, resp.statusText)
                        // Log response headers (some hosts hide headers; this will show what is available)
                        try {
                          const headers: Record<string,string> = {}
                          resp.headers.forEach((v, k) => (headers[k] = v))
                          console.log("Response headers:", headers)
                        } catch (hErr) {
                          console.warn("Could not read response headers:", hErr)
                        }

                        let textBody: string | null = null
                        try {
                          textBody = await resp.text()
                          console.log("Response body (raw):", textBody)
                          // try parse json
                          try {
                            const json = JSON.parse(textBody)
                            console.log("Response body (json):", json)
                          } catch (_) {
                            // not json
                          }
                        } catch (bodyErr) {
                          console.warn("Failed to read body:", bodyErr)
                        }

                        if (!resp.ok) {
                          console.error("Upload failed: status not OK", resp.status)
                        } else {
                          console.log("Upload OK")
                        }
                        console.groupEnd()
                      } catch (err) {
                        console.error("❌ Test upload threw:", err)
                      }
                    }}
                  >
                    Test Document Upload
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
