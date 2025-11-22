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
import { useSession, signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function AIAgentPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { toast } = useToast()

  // track which tab is active (controlled) and local free-qa usage
  const [activeTab, setActiveTab] = useState<string>("qa")
  const [freeQAUsed, setFreeQAUsed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("entropy_free_qa_used") === "1"
    } catch {
      return false
    }
  })

  // show/hide agents based on simple gating
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

  // Credit costs
  const COSTS = {
    mindmap: 5,
    flashcards: 5,
    qa: 10, // QA normally costs 10, but unauthenticated users get one free QA per session
    quiz: 5,
  }

  // Helper: ask server if user has credits for operation.
  // Server must implement POST /api/credits/check with body { operation: string, cost: number }
  // Response expected: { allowed: boolean, credits: number, cost: number, needsUpgrade?: boolean }
  async function checkCreditsForOperation(operation: string, cost: number) {
    if (sessionStatus !== "authenticated") {
      return { allowed: false, reason: "unauthenticated" }
    }

    try {
      const res = await fetch("/api/credits/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, cost }),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        console.warn("credits check failed:", res.status, txt)
        return { allowed: false, reason: "server" }
      }
      const data = await res.json()
      return data
    } catch (err) {
      console.error("credits check error:", err)
      return { allowed: false, reason: "network" }
    }
  }

  // Handle tab change with gating logic
  const handleTabChange = async (tab: string) => {
    // Always allow QA
    if (tab === "qa") {
      setActiveTab("qa")
      return
    }

    // For other tabs require authentication
    if (sessionStatus !== "authenticated") {
      // show informative toast and prompt sign-in
      toast({
        title: "Sign in required",
        description: "Please sign in to access this tool. Your feedback and credits enable these features.",
      })
      // open sign-in (server-side next-auth flow)
      signIn()
      // keep user on QA
      setActiveTab("qa")
      return
    }

    // If authenticated, perform credits check before granting access
    const opCost = (tab === "mindmap" && COSTS.mindmap) ||
                   (tab === "flashcards" && COSTS.flashcards) ||
                   (tab === "quiz" && COSTS.quiz) || COSTS.qa

    const result = await checkCreditsForOperation(tab, opCost)
    if (result.allowed) {
      setActiveTab(tab)
      // Optionally show toast with remaining credits
      if (typeof result.credits === "number") {
        toast({
          title: "Access granted",
          description: `Credits remaining: ${result.credits}`,
        })
      }
    } else {
      // Not allowed: show actionable message
      if (result.reason === "unauthenticated") {
        toast({
          title: "Sign in required",
          description: "Please sign in to use this tool.",
        })
        signIn()
      } else if (result.needsUpgrade) {
        toast({
          title: "Insufficient credits",
          description: "Your account lacks credits. Please upgrade or add credits to continue.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Insufficient credits",
          description: `You need ${opCost} credits to use this tool.`,
          variant: "destructive",
        })
      }
      setActiveTab("qa")
    }
  }

  // Allow unauthenticated user to consume the one free QA for this session
  const consumeFreeQA = () => {
    try {
      sessionStorage.setItem("entropy_free_qa_used", "1")
    } catch {}
    setFreeQAUsed(true)
    toast({
      title: "Free QA used",
      description: "You used your one free QA for this session. Sign in to continue using AI tools.",
    })
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

      {/* Subscription info banner */}
      <div className="w-full bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-2 max-w-6xl">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-900 m-0">
              <strong>Coming in Beta:</strong> Premium subscriptions with unlimited credits, priority support, and exclusive features
            </p>
                <p className="text-xs text-blue-800 m-0 ml-4">
                  <strong>Beta features coming soon:</strong> Write, Document Upload, and RAG (retrieval-augmented generation).
                </p>
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
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="qa">Q&A + Chat</TabsTrigger>
                  <TabsTrigger value="mindmap">Mind Mapping</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
                  <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                </TabsList>

                <TabsContent value="qa" className="space-y-4">
                  {agentStatus === "available" ? (
                    <>
                      {!session && !freeQAUsed && (
                        <div className="p-4 bg-yellow-50 rounded-md">
                          <p className="text-sm mb-2">
                            You have one free QA query this session. Sign in to continue using more AI features.
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                // mark free QA used and allow ChatAgent to run
                                consumeFreeQA()
                              }}
                            >
                              Use Free QA
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => signIn()}
                            >
                              Sign in
                            </button>
                          </div>
                        </div>
                      )}
                      {(sessionStatus === "authenticated" || !freeQAUsed) ? (
                        <ChatAgent />
                      ) : (
                        <div className="p-6 text-center border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">
                            Please sign in to continue using AI features.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Chat service is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mindmap" className="space-y-4">
                  {agentStatus === "available" ? (
                    sessionStatus === "authenticated" ? (
                      <MindMapAgent />
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">Mindmap costs {COSTS.mindmap} credits. Sign in to use.</p>
                        <div className="flex justify-center gap-2">
                          <button className="btn btn-primary" onClick={() => signIn()}>Sign in</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Mind mapping is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz" className="space-y-4">
                  {agentStatus === "available" ? (
                    sessionStatus === "authenticated" ? (
                      <QuizAgent />
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">Quiz generation costs {COSTS.quiz} credits. Sign in to use.</p>
                        <div className="flex justify-center gap-2">
                          <button className="btn btn-primary" onClick={() => signIn()}>Sign in</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Quiz generator is unavailable. Please try again later.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="flashcards" className="space-y-4">
                  {agentStatus === "available" ? (
                    sessionStatus === "authenticated" ? (
                      <FlashcardsAgent />
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">Flashcards cost {COSTS.flashcards} credits. Sign in to use.</p>
                        <div className="flex justify-center gap-2">
                          <button className="btn btn-primary" onClick={() => signIn()}>Sign in</button>
                        </div>
                      </div>
                    )
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
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                    title="Coming soon — Write, Document Upload, and RAG agent coming soon"
                    aria-label="Coming soon — Write, Document Upload, and RAG agent coming soon"
                    disabled
                  >
                    Test Document Upload
                  </button>
                  {/* Disabled: feature coming soon (Write, Document Upload, RAG) */}
                  </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
