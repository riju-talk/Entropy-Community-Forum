"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Sparkles, Upload, FileText, X, Settings, Save } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [systemPrompt, setSystemPrompt] = useState("")
  const [editingPrompt, setEditingPrompt] = useState("")
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [followups, setFollowups] = useState<string[]>([])

  const loadGreeting = async () => {
    try {
      const response = await fetch("/api/ai-agent/qa")
      if (response.ok) {
        const data = await response.json()
        setMessages([{ role: "assistant", content: sanitizeContent(data.greeting) }])
      }
    } catch (error) {
      console.error("Failed to load greeting:", error)
      setMessages([
        {
          role: "assistant",
          content: sanitizeContent("Hi! I'm Spark ⚡ - Ask me anything or upload documents!"),
        },
      ])
    }
  }

  function sanitizeContent(input: string | undefined) {
    if (!input) return ""
    // Remove any <think>...</think> blocks (multiline-safe)
    return input.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
  }

  // Load greeting on mount
  useEffect(() => {
    loadGreeting()
    setSystemPrompt("Hi! I'm Spark ⚡ - your AI study buddy!")
    setEditingPrompt("Hi! I'm Spark ⚡ - your AI study buddy!")
  }, [])

  // Core send function, accepts an optional override message (used by follow-up clicks)
  const sendMessage = async (overrideMessage?: string) => {
    const raw = overrideMessage !== undefined ? overrideMessage : input
    const userMessage = (raw || "").toString().trim()
    if (!userMessage) return

    // If user typed the message (no override), clear the input box
    if (overrideMessage === undefined) setInput("")

    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)
    setFollowups([])

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      console.log("📤 Sending Q&A request with system prompt:", systemPrompt?.substring(0, 50))

      const response = await fetch("/api/ai-agent/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          userId: "user123",
          collection_name: "default",
          conversation_history: conversationHistory,
          system_prompt: systemPrompt || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      console.log("✅ Received response:", {
        mode: data.mode,
        sourcesCount: data.sources?.length || 0,
        qaId: data.qaId,
        followups: data.follow_up_questions?.length ?? data.followUps?.length ?? 0,
      })

      let responseText = data.answer || ""

      if (data.sources && data.sources.length > 0) {
        responseText += `\n\n---\n**📚 ${data.sources.length} source(s) used**`
      }

      responseText += `\n\n*Response mode: ${data.mode === 'rag' ? '📖 RAG (Document-based)' : '💬 Direct Chat'}*`

      // Capture follow-ups separately so we can render clickable buttons
      const receivedFollowups = data.follow_up_questions || data.followUps || []
      if (Array.isArray(receivedFollowups) && receivedFollowups.length > 0) {
        setFollowups(receivedFollowups.map((f: string) => sanitizeContent(f)))
      }

      // Custom friendly greeting for "hi"
      if (userMessage.toLowerCase().trim() === "hi") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: sanitizeContent(
              "Hi Spark! ⚡ How can I help you study today? Need notes explained, tricky concepts broken down, or practice questions? Just let me know! 📚✨\n\nResponse mode: 💬 Direct Chat"
            ),
          },
        ])
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: sanitizeContent(responseText) }])
      }

      // Deduct credits after successful response (token-based calculation)
      // Estimate tokens: ~4 chars per token (rough approximation)
      const estimatedTokens = Math.ceil((data.answer || "").length / 4)
      const creditsToDeduct = Math.max(1, Math.ceil(estimatedTokens / 100)) // 1 credit per 100 tokens, min 1

      try {
        await fetch("/api/credits/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: creditsToDeduct,
            operation: "qa_chat",
            metadata: { tokens: estimatedTokens, mode: data.mode }
          })
        })
      } catch (creditError) {
        console.warn("Failed to deduct credits:", creditError)
        // Don't block user experience if credit deduction fails
      }

    } catch (error) {
      console.error("❌ Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get response from Spark",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Keep handleSend for existing keypress and button bindings
  const handleSend = () => sendMessage()

  const handleFollowupClick = (question: string) => {
    // Immediately send the follow-up as a new query
    sendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("collection_name", "default")

      try {
        const response = await fetch("/api/ai-agent/documents/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setUploadedFiles((prev) => [...prev, file.name])
          toast({
            title: "Document uploaded",
            description: data.message,
          })
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveSystemPrompt = () => {
    setSystemPrompt(editingPrompt)
    setShowPromptDialog(false)
    toast({
      title: "System prompt saved",
      description: "Spark's personality has been updated!",
    })
  }

  return (
    <div className="space-y-4">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Chat with Spark</CardTitle>
              <p className="text-xs text-muted-foreground">RAG-powered Q&A assistant</p>
            </div>
            
            <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Customize Spark's Personality</DialogTitle>
                  <DialogDescription>
                    Edit how Spark responds and behaves
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      value={editingPrompt}
                      onChange={(e) => setEditingPrompt(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowPromptDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSystemPrompt} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            {followups.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {followups.map((q, idx) => (
                  <Button key={idx} variant="outline" size="sm" onClick={() => handleFollowupClick(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <CardContent className="border-t p-4">
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-muted rounded px-2 py-1 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  <span>{file}</span>
                  <button
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("file-upload")?.click()}
              title="Upload documents"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              className="resize-none"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Press Enter to send • Upload docs for RAG-powered answers
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
