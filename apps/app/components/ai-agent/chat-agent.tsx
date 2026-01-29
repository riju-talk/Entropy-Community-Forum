"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Sparkles, Upload, FileText, X, Settings, Save, Image as ImageIcon } from "lucide-react"
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

interface ChatAgentProps {
  contextDoc?: { id: string, title: string } | null
}

export function ChatAgent({ contextDoc }: ChatAgentProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string, dataUrl: string }>>([])
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

      const payload: any = {
        question: userMessage,
        userId: session?.user?.id || "anonymous",
        collection_name: "default", // We use namespace=user_id in backend usually
        conversation_history: conversationHistory,
        system_prompt: systemPrompt || undefined,
      }

      // If a specific doc is selected, pass a filter
      if (contextDoc) {
        payload.filter = { source: contextDoc.title }
        // And maybe mention it in system prompt?
        payload.system_prompt = (payload.system_prompt || "") + `\n\nFocus on the document: ${contextDoc.title}`
      }

      const response = await fetch("/api/ai-agent/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        // Handle image upload
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          setUploadedImages((prev) => [...prev, { name: file.name, dataUrl }])
          toast({
            title: "Image uploaded",
            description: `${file.name} ready for analysis`,
          })
        }
        reader.readAsDataURL(file)
      } else {
        // Handle document upload
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
      <Card className="h-[600px] flex flex-col border-none shadow-none bg-transparent">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">Chat with Spark ⚡</CardTitle>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">RAG-powered chat with image analysis</p>
            </div>

            <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/50 hover:bg-white/5 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Customize</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-2xl border-border/50 rounded-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Customize Spark's Personality</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                    Edit how Spark responds and behaves
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label htmlFor="system-prompt" className="text-xs font-bold uppercase tracking-wider pl-1">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      value={editingPrompt}
                      onChange={(e) => setEditingPrompt(e.target.value)}
                      rows={10}
                      className="font-mono text-xs bg-muted/20 border-border/50 rounded-xl focus:ring-cyan-500/20 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={() => setShowPromptDialog(false)} className="rounded-xl px-6">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSystemPrompt} className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl px-6 shadow-lg shadow-cyan-500/20 transition-all duration-300">
                      <Save className="h-4 w-4" />
                      Save Changes
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
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    <AvatarFallback className="bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-lg">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed transition-all shadow-sm ${message.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium"
                    : "bg-muted/40 text-foreground border border-border/50 backdrop-blur-sm"
                    }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    <AvatarFallback className="bg-muted border border-border/50 text-muted-foreground font-bold text-xs uppercase rounded-lg">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-4 py-3 bg-muted/20 border border-border/50 flex items-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            {followups.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap pl-11">
                {followups.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollowupClick(q)}
                    className="rounded-full text-[10px] font-bold uppercase tracking-wider bg-background hover:bg-cyan-500/5 hover:text-cyan-400 hover:border-cyan-500/30 border-border/50 transition-all duration-300 h-8"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-muted/10 backdrop-blur-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={`file-${idx}`}
                className="flex items-center gap-1.5 bg-background/50 border border-border/50 rounded-lg px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                <FileText className="h-3 w-3 text-cyan-400" />
                <span>{file}</span>
                <button
                  onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {uploadedImages.map((img, idx) => (
              <div
                key={`img-${idx}`}
                className="flex items-center gap-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider"
              >
                <ImageIcon className="h-3 w-3" />
                <span>{img.name}</span>
                <button
                  onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
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
              className="rounded-xl border-border/50 hover:bg-white/5 h-11 w-11 transition-all"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              className="resize-none h-11 min-h-[44px] bg-background/50 border-border/50 rounded-xl focus:ring-cyan-500/20 py-3 px-4 text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold h-11 w-11 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-3 text-center">
            💡 Press Enter to send • Upload docs for RAG-powered answers
          </p>
        </div>
      </Card>
    </div>
  )
}
