"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Send,
  Sparkles,
  GitBranch,
  Brain,
  ClipboardList,
  MessageSquare,
  Upload,
  FileText,
  X,
  AlertCircle
} from "lucide-react"
import { getUserCredits, checkCreditsAndDeduct, incrementDocumentCount, decrementDocumentCount } from "@/app/actions/credits"
import { useToast } from "@/hooks/use-toast"
import { sparkAPI } from "@/lib/spark-api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Tool {
  id: string
  name: string
  icon: typeof Brain
  description: string
  active: boolean
}

interface Document {
  id: string
  name: string
  size: number
}

interface UserCredits {
  credits: number
  subscriptionTier: string
  documentCount: number
}

export default function SparkPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [userCredits, setUserCredits] = useState<UserCredits>({ credits: 100, subscriptionTier: "FREE", documentCount: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "mindmap",
      name: "Mind Mapping",
      icon: Brain,
      description: "Visualize concepts and ideas",
      active: false,
    },
    {
      id: "flowchart",
      name: "Flowcharting",
      icon: GitBranch,
      description: "Create process diagrams",
      active: false,
    },
    {
      id: "quiz",
      name: "Quizzing",
      icon: ClipboardList,
      description: "Test your knowledge",
      active: false,
    },
    {
      id: "flashcard",
      name: "Flashcards",
      icon: FileText,
      description: "Create study flashcards",
      active: false,
    },
  ])

  useEffect(() => {
    loadUserCredits()
  }, [])

  const loadUserCredits = async () => {
    try {
      const credits = await getUserCredits()
      setUserCredits(credits)
    } catch (error) {
      console.error("Failed to load credits:", error)
    }
  }

  const toggleTool = (toolId: string) => {
    setTools(tools.map((tool) => ({ ...tool, active: tool.id === toolId ? !tool.active : false })))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    try {
      // Check document count limit
      const remainingSlots = userCredits.subscriptionTier === "FREE" 
        ? 10 - userCredits.documentCount 
        : Number.MAX_SAFE_INTEGER

      if (remainingSlots <= 0) {
        toast({
          title: "Document Limit Reached",
          description: "Free tier allows up to 10 documents. Upgrade to upload more.",
          variant: "destructive",
        })
        router.push("/subscription")
        return
      }

      const newFiles = Array.from(files).slice(0, remainingSlots)

      for (const file of newFiles) {
        await incrementDocumentCount()

        // Upload to backend
        try {
          await sparkAPI.uploadDocument(
            userCredits.subscriptionTier === "FREE" ? "free_user" : "premium_user",
            file
          )
        } catch (error) {
          await decrementDocumentCount() // Revert on failure
          throw error
        }
      }

      const newDocuments = newFiles.map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
      }))

      setDocuments([...documents, ...newDocuments])
      await loadUserCredits()

      toast({
        title: "Documents Uploaded",
        description: `${newFiles.length} document(s) uploaded successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      })

      if (error.message?.includes("limit reached")) {
        router.push("/subscription")
      }
    }
  }

  const removeDocument = async (id: string) => {
    try {
      await decrementDocumentCount()
      setDocuments(documents.filter((doc) => doc.id !== id))
      await loadUserCredits()
      
      toast({
        title: "Document Removed",
        description: "Document removed successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove document",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const activeTool = tools.find((t) => t.active)
    const operation = activeTool?.id || "chat"

    try {
      // Check and deduct credits
      const result = await checkCreditsAndDeduct(operation)

      if (!result.allowed) {
        toast({
          title: "Insufficient Credits",
          description: `This operation costs ${result.cost} credits. You have ${result.credits} credits remaining.`,
          variant: "destructive",
        })
        router.push("/subscription")
        return
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      let aiResponse = ""
      let sessionId = undefined

      if (operation === "chat") {
        // Use actual chat API
        const chatResponse = await sparkAPI.chat(userCredits.subscriptionTier === "FREE" ? "free_user" : "premium_user", input)
        aiResponse = chatResponse.response
        sessionId = chatResponse.session_id

        // Show follow-up questions if available
        if (chatResponse.follow_up_questions && chatResponse.follow_up_questions.length > 0) {
          aiResponse += `\n\n**Follow-up questions:**\n${chatResponse.follow_up_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        }

      } else if (operation === "flashcard") {
        // Use actual flashcard API
        const flashcardResponse = await sparkAPI.generateFlashcards(
          userCredits.subscriptionTier === "FREE" ? "free_user" : "premium_user",
          input,
          5,
          "medium"
        )
        aiResponse = `🗂️ **${flashcardResponse.total_generated} Flashcards Generated** (Cost: ${flashcardResponse.credits_used} credits)\n\n`

        flashcardResponse.flashcards.forEach((card, i) => {
          aiResponse += `**Card ${i + 1}**\nFront: ${card.front}\nBack: ${card.back}\n\n`
        })

      } else if (operation === "quiz") {
        // Use actual quiz API
        const quizResponse = await sparkAPI.generateQuiz(
          userCredits.subscriptionTier === "FREE" ? "free_user" : "premium_user",
          input,
          3,
          ["mcq", "true_false"]
        )
        aiResponse = `📝 **Quiz Generated** (Cost: ${quizResponse.credits_used} credits)\n\n`

        quizResponse.quiz.forEach((question, i) => {
          aiResponse += `**Q${i + 1}:** ${question.question}\n`
          if (question.options) {
            question.options.forEach((option, j) => {
              aiResponse += `${option}\n`
            })
          }
          aiResponse += `**Answer:** ${question.correct_answer}\n**Explanation:** ${question.explanation}\n\n`
        })

      } else if (operation === "mindmap") {
        // Use actual mindmap API
        const mindmapResponse = await sparkAPI.generateMindMap(
          userCredits.subscriptionTier === "FREE" ? "free_user" : "premium_user",
          input,
          3,
          "hierarchical"
        )
        aiResponse = `📍 **Mind Map Generated** (Cost: ${mindmapResponse.credits_used} credits)\n\n`
        aiResponse += `**Mermaid Code:**\n\`\`\`mermaid\n${mindmapResponse.mermaid_code}\n\`\`\`\n\n`
        aiResponse += `**Details:** ${mindmapResponse.mind_map.topic} (${mindmapResponse.mind_map.style}, ${mindmapResponse.mind_map.depth} levels, ${mindmapResponse.mind_map.node_count} nodes)`
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      await loadUserCredits()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })

      if (error.message?.includes("Authentication required")) {
        router.push("/auth/signin")
      } else if (error.message?.includes("credits")) {
        router.push("/subscription")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canUploadMore = userCredits.subscriptionTier !== "FREE" || userCredits.documentCount < 10

  return (
    <div className="space-y-6">
      {/* Header with Credits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Spark</h1>
              <p className="text-muted-foreground">Your AI study companion for academic excellence</p>
            </div>
          </div>
          {userCredits.subscriptionTier === "FREE" && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {userCredits.credits} Credits
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with Spark
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Welcome to Spark!</h3>
                    <p className="text-muted-foreground mb-4">
                      I can help you study with various tools and find similar discussions on Entropy.
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap max-w-md mx-auto">
                      <Badge variant="secondary">Mind Mapping (5 credits)</Badge>
                      <Badge variant="secondary">Flowcharting (5 credits)</Badge>
                      <Badge variant="secondary">Quizzing (3 credits)</Badge>
                      <Badge variant="secondary">Flashcards (3 credits)</Badge>
                      <Badge variant="secondary">QA (1 credit)</Badge>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                      </div>

                      {message.role === "user" && (
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Spark is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything or use a tool to study better..."
                    className="flex-1 min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="lg">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tools.map((tool) => {
                const Icon = tool.icon
                const costs = { mindmap: 5, flowchart: 5, quiz: 3, flashcard: 3 }
                const cost = costs[tool.id as keyof typeof costs]
                
                return (
                  <Button
                    key={tool.id}
                    variant={tool.active ? "default" : "outline"}
                    className="w-full justify-start p-8"
                    onClick={() => toggleTool(tool.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs opacity-80">{cost} credits per use</div>
                    </div>
                    {tool.active && <Badge variant="secondary" className="ml-2">Active</Badge>}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Documents
                <Badge variant="secondary">{userCredits.documentCount}/
                  {userCredits.subscriptionTier === "FREE" ? "10" : "∞"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canUploadMore && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </>
              )}
              
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{doc.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {!canUploadMore && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      Free tier limit reached. <button onClick={() => router.push("/subscription")} className="underline font-medium">Upgrade</button> to upload more documents.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
