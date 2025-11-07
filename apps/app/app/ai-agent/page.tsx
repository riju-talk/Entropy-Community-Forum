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
import { useAuthModal } from "@/hooks/use-auth-modal"

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Spark AI Agent</h1>
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
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {agentStatus === "available"
                      ? "Generate flashcards for any topic"
                      : "Service Temporarily Unavailable"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {agentStatus === "available"
                      ? "Create study flashcards automatically"
                      : "The flashcard service is currently under maintenance"}
                  </p>
                </div>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
