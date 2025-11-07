"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { QAAgent } from "@/components/ai-agent/qa-agent"
import { MindMapAgent } from "@/components/ai-agent/mindmap-agent"
import { QuizAgent } from "@/components/ai-agent/quiz-agent"
import { FlashcardAgent } from "@/components/ai-agent/flashcard-agent"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AIAgentPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const { open: openAuthModal } = useAuthModal()
  const [activeTab, setActiveTab] = useState("qa")
  const [agentStatus, setAgentStatus] = useState<"working" | "maintenance" | "checking">("checking")

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/ai-agent")
        const data = await response.json()
        setAgentStatus(data.status === "working" ? "working" : "maintenance")
      } catch (error) {
        // If health check fails, assume working (fallback for development)
        console.error("Health check failed:", error)
        setAgentStatus("working")
      }
    }

    checkHealth()
  }, [])

  const handleProtectedTab = (tab: string) => {
    if (!isAuthenticated && tab !== "qa") {
      openAuthModal()
      setActiveTab("qa") // Keep them on QA tab if not authenticated
      return
    }
    setActiveTab(tab)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Spark AI Agent</h1>
            <p className="text-muted-foreground">Your intelligent learning companion</p>
          </div>
        </div>
        <Badge
          variant={agentStatus === "working" ? "default" : agentStatus === "maintenance" ? "destructive" : "secondary"}
        >
          {agentStatus === "working" && <CheckCircle className="h-3 w-3 mr-1" />}
          {agentStatus === "maintenance" && <AlertCircle className="h-3 w-3 mr-1" />}
          {agentStatus === "working" ? "Working" : agentStatus === "maintenance" ? "Under Maintenance" : "Checking..."}
        </Badge>
      </div>

      {/* Maintenance Alert */}
      {agentStatus === "maintenance" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Agent Unavailable</AlertTitle>
          <AlertDescription>
            The AI Agent backend is currently under maintenance. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Learning Tools</CardTitle>
          <CardDescription>
            Enhance your learning with advanced AI capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleProtectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="qa">
                Q&A + Documents
              </TabsTrigger>
              <TabsTrigger value="mindmap">
                Mind Mapping
                {!isAuthenticated && <Lock className="ml-2 h-3 w-3" />}
              </TabsTrigger>
              <TabsTrigger value="quiz">
                Quiz Generator
                {!isAuthenticated && <Lock className="ml-2 h-3 w-3" />}
              </TabsTrigger>
              <TabsTrigger value="flashcards">
                Flashcards
                {!isAuthenticated && <Lock className="ml-2 h-3 w-3" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qa" className="mt-6">
              <QAAgent />
            </TabsContent>

            <TabsContent value="mindmap" className="mt-6">
              {isAuthenticated ? (
                <MindMapAgent />
              ) : (
                <LockedFeature feature="Mind Mapping" />
              )}
            </TabsContent>

            <TabsContent value="quiz" className="mt-6">
              {isAuthenticated ? (
                <QuizAgent />
              ) : (
                <LockedFeature feature="Quiz Generator" />
              )}
            </TabsContent>

            <TabsContent value="flashcards" className="mt-6">
              {isAuthenticated ? (
                <FlashcardAgent />
              ) : (
                <LockedFeature feature="Flashcards" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LockedFeature({ feature }: { feature: string }) {
  const { open: openAuthModal } = useAuthModal()

  return (
    <div className="text-center py-12">
      <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">{feature} is a Premium Feature</h3>
      <p className="text-muted-foreground mb-4">
        Sign in to unlock advanced AI capabilities
      </p>
      <Badge className="cursor-pointer" onClick={openAuthModal}>
        Sign in to unlock
      </Badge>
    </div>
  )
}
