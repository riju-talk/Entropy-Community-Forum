"use client"

import { useState, useRef } from "react"
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
  X
} from "lucide-react"

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

export default function SparkPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  const toggleTool = (toolId: string) => {
    setTools(tools.map((tool) => ({ ...tool, active: tool.id === toolId ? !tool.active : false })))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newDocuments = Array.from(files).slice(0, 10 - documents.length).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
    }))

    setDocuments([...documents, ...newDocuments])
  }

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000))

      const activeTool = tools.find((t) => t.active)
      let aiResponse = "I understand your question. Let me help you with that."

      const inputLower = input.toLowerCase()

      if (activeTool?.id === "mindmap" || inputLower.includes("mindmap") || inputLower.includes("concept")) {
        aiResponse = `📍 **Mind Map Generated**

Central Topic: ${input.slice(0, 30)}...

Main Branches:
├─ Core Concept 1
│  ├─ Sub-point A
│  └─ Sub-point B
├─ Core Concept 2
│  ├─ Related idea
│  └─ Application
└─ Core Concept 3
   └─ Summary

This helps organize your understanding visually.`
      } else if (activeTool?.id === "flowchart" || inputLower.includes("flowchart") || inputLower.includes("process")) {
        aiResponse = `📊 **Flowchart Created**

[Start]
   ↓
[Input/Question]
   ↓
[Process Data] → [Decision?]
   ↓                 ↓
  Yes               No
   ↓                 ↓
[Action]      [Alternative]
   ↓                 ↓
   └──→ [Output] ←──┘
          ↓
        [End]

This visualizes your process flow.`
      } else if (activeTool?.id === "quiz" || inputLower.includes("quiz") || inputLower.includes("test")) {
        aiResponse = `📝 **Quiz Generated**

**Question 1:** What is the main concept here?
A) Option A
B) Option B  
C) Option C
D) Option D

**Question 2:** How does this apply in practice?
A) Practical application
B) Theoretical only
C) Both approaches
D) Neither

**Question 3:** Key takeaway?
[Short answer required]

Answer key provided at the end!`
      } else if (activeTool?.id === "flashcard" || inputLower.includes("flashcard")) {
        aiResponse = `🗂️ **Flashcards Created**

**Card 1**
Front: What is ${input.split(" ")[0]}?
Back: [Key definition and explanation]

**Card 2**
Front: How does it work?
Back: [Step-by-step process]

**Card 3**
Front: When to use it?
Back: [Use cases and applications]

**Card 4**
Front: Common mistakes?
Back: [Pitfalls to avoid]

Ready to study!`
      } else {
        const responses = [
          `Based on my analysis of similar questions on Entropy, here's what I found:\n\n✓ This topic has been discussed 15 times in the ${["Computer Science", "Mathematics", "Physics"][Math.floor(Math.random() * 3)]} community.\n✓ Top rated answer suggests: [Key insight here]\n✓ Common approach: [Solution pattern]\n\nLet me explain in detail...`,
          `I've searched through Entropy and found 3 highly relevant posts:\n\n1. "${input.slice(0, 20)}..." - 45 upvotes ⭐\n2. "Understanding the basics" - 32 upvotes\n3. "Practical guide" - 28 upvotes\n\nHere's my comprehensive answer...`,
          `Great question! This connects to several discussions on Entropy.\n\n🔍 Found 12 related posts\n💡 Key insight from top answer\n📚 Recommended resources\n\nLet me break this down step by step...`,
        ]
        aiResponse = responses[Math.floor(Math.random() * responses.length)]
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Spark</h1>
            <p className="text-muted-foreground">Your AI study companion for academic excellence</p>
          </div>
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
                      <Badge variant="secondary">Mind Mapping</Badge>
                      <Badge variant="secondary">Flowcharting</Badge>
                      <Badge variant="secondary">Quizzing</Badge>
                      <Badge variant="secondary">Flashcards</Badge>
                      <Badge variant="secondary">QA & Discussion Search</Badge>
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
                return (
                  <Button
                    key={tool.id}
                    variant={tool.active ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => toggleTool(tool.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs opacity-80">{tool.description}</div>
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
                <Badge variant="secondary">{documents.length}/10</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.length < 10 && (
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
              
              {documents.length >= 10 && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Free tier limit reached. Upgrade to upload more documents.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
