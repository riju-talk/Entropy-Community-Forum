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

export default function AthenaPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const tools: Tool[] = [
    {
      id: "code-review",
      name: "Code Review",
      icon: GitBranch,
      description: "Analyze and review code for improvements",
      active: selectedTools.includes("code-review"),
    },
    {
      id: "brainstorm",
      name: "Brainstorm",
      icon: Brain,
      description: "Generate creative ideas and solutions",
      active: selectedTools.includes("brainstorm"),
    },
    {
      id: "task-list",
      name: "Task List",
      icon: ClipboardList,
      description: "Break down complex tasks into manageable steps",
      active: selectedTools.includes("task-list"),
    },
    {
      id: "explain",
      name: "Explain",
      icon: MessageSquare,
      description: "Explain complex concepts in simple terms",
      active: selectedTools.includes("explain"),
    },
  ]

  useEffect(() => {
    // Load user credits on component mount
    const loadCredits = async () => {
      try {
        const credits = await getUserCredits()
        setUserCredits(credits)
      } catch (error) {
        console.error("Failed to load credits:", error)
      }
    }
    loadCredits()
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newDocuments: Document[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
    }))
    setUploadedDocuments(prev => [...prev, ...newDocuments])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const newDocuments: Document[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
    }))
    setUploadedDocuments(prev => [...prev, ...newDocuments])
  }

  const removeDocument = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Check credits before making request
      if (userCredits) {
        const canProceed = await checkCreditsAndDeduct(userCredits.credits)
        if (!canProceed) {
          toast({
            title: "Insufficient Credits",
            description: "You don't have enough credits to use Athena. Please upgrade your plan.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Here you would integrate with your Athena AI service
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm Athena, your AI assistant! I'm here to help you with code review, brainstorming, task management, and explanations. What would you like to work on?",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 2000)

    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message to Athena. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Athena</h1>
                <p className="text-muted-foreground">
                  Your intelligent AI assistant for coding and problem-solving
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Tools */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Athena Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={tool.active ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleToolToggle(tool.id)}
                    >
                      <tool.icon className="mr-2 h-4 w-4" />
                      {tool.name}
                    </Button>
                  ))}

                  {/* Document Upload */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Upload Documents</h4>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                      />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop files here or{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </p>
                    </div>

                    {/* Uploaded Documents */}
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1 truncate">{doc.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(doc.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Credits Display */}
              {userCredits && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {userCredits.credits}
                      </div>
                      <p className="text-sm text-muted-foreground">Credits Remaining</p>
                      <Badge variant="outline" className="mt-2">
                        {userCredits.subscriptionTier}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Athena Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Welcome to Athena!</h3>
                        <p className="text-sm">
                          I'm your AI assistant here to help with coding, problem-solving, and creative tasks.
                          Select tools from the sidebar and start a conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Athena is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Athena anything..."
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                      />
                      <Button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Selected Tools Display */}
                    {selectedTools.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTools.map((toolId) => {
                          const tool = tools.find(t => t.id === toolId)
                          return tool ? (
                            <Badge key={toolId} variant="secondary" className="text-xs">
                              {tool.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
