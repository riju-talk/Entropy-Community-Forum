"use client"

import { useState } from "react"
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
  Plus
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

export default function SparkPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
  ])

  const toggleTool = (toolId: string) => {
    setTools(tools.map((tool) => ({ ...tool, active: tool.id === toolId ? !tool.active : false })))
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
        aiResponse = `📍 **Mind Map**

Central Concept: ${input.slice(0, 30)}...

Key Branches:
• Main Idea 1
  - Sub-concept A
  - Sub-concept B
• Main Idea 2
  - Related topic
  - Application
• Main Idea 3

This helps organize your thoughts visually.`
      } else if (activeTool?.id === "flowchart" || inputLower.includes("flowchart") || inputLower.includes("process")) {
        aiResponse = `📊 **Flowchart**

Start
  ↓
Input/Question
  ↓
Process → Decision?
  ↓           ↓
 Yes         No
  ↓           ↓
Action    Alternative
  ↓           ↓
  → Output ←
      ↓
    End

This shows the logical flow of your process.`
      } else if (activeTool?.id === "quiz" || inputLower.includes("quiz") || inputLower.includes("test")) {
        aiResponse = `📝 **Quiz Generated**

**Question 1:** What is the main concept?
A) Option A
B) Option B
C) Option C
D) Option D

**Question 2:** How does this apply?
A) Practical use
B) Theoretical only
C) Both
D) Neither

**Question 3:** What's the key takeaway?
[Short answer]

I can generate more questions based on your topic!`
      } else {
        const randomResponses = [
          "Based on my analysis of similar questions on Entropy, here's what I found: This topic has been discussed extensively in the Computer Science community. Let me break it down for you...",
          "I've found 3 similar posts on Entropy that might help:\n\n1. 'Understanding the basics' - 45 upvotes\n2. 'Advanced concepts explained' - 32 upvotes\n3. 'Practical applications' - 28 upvotes\n\nHere's my answer...",
          "Great question! This connects to several concepts we've seen discussed. Let me explain step by step...",
        ]
        aiResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)]
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
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTools(tools.map((tool) => ({ ...tool, active: tool.id === "mindmap" })))
                  setInput("Create a mindmap for machine learning concepts")
                }}
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Mind Map
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTools(tools.map((tool) => ({ ...tool, active: tool.id === "flowchart" })))
                  setInput("Create a flowchart for sorting algorithm")
                }}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Create Flowchart
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTools(tools.map((tool) => ({ ...tool, active: tool.id === "quiz" })))
                  setInput("Generate a quiz on data structures")
                }}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Generate Quiz
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span>Searches similar posts on Entropy</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span>Creates visual study materials</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span>Generates practice quizzes</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span>Multi-modal support coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
