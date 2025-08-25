"use client"

import { useState, useRef } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, Bot, User, Sparkles, ImageIcon, Code, BarChart3, GitBranch, Brain } from "lucide-react"
import CodeEditor from "@/components/code-editor"
import ImageUpload from "@/components/image-upload"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "text" | "code" | "image" | "chart" | "flowchart" | "mindmap"
  timestamp: Date
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [code, setCode] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendMessage = async (messageType = "text") => {
    if ((!input.trim() && !code && !uploadedImage) || isLoading) return

    let content = input
    let type: Message["type"] = "text"

    if (messageType === "code" && code) {
      content = code
      type = "code"
    } else if (messageType === "image" && uploadedImage) {
      content = `[Image uploaded: ${uploadedImage}]\n${input}`
      type = "image"
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      type,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setCode("")
    setUploadedImage(null)
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000))

      let aiResponse = "I understand your question. Let me help you with that."
      let responseType: Message["type"] = "text"

      const inputLower = content.toLowerCase()

      if (type === "code" || inputLower.includes("code") || inputLower.includes("programming")) {
        aiResponse = `Here's a solution for your code:\n\n\`\`\`javascript\n// Optimized solution\nfunction example() {\n  // Your code here\n  return "Hello World";\n}\n\`\`\`\n\nThis approach is more efficient because it uses modern JavaScript features.`
        responseType = "code"
      } else if (inputLower.includes("chart") || inputLower.includes("graph") || inputLower.includes("visualization")) {
        aiResponse =
          "I'll create a chart for you:\n\n📊 **Data Visualization**\n\n```\nSales Data:\n█████████████ 85%\n██████████ 70%\n███████ 55%\n████████████████ 95%\n```\n\nThis shows the trend over the last 4 quarters."
        responseType = "chart"
      } else if (inputLower.includes("flowchart") || inputLower.includes("diagram") || inputLower.includes("process")) {
        aiResponse =
          "Here's a flowchart for your process:\n\n```\nStart → Input Data → Process → Decision?\n  ↓                                ↓\n  No ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Yes\n  ↓                                ↓\nEnd ← ← ← ← ← ← ← ← ← ← ← ← ← ← Output\n```\n\nThis represents the logical flow of your algorithm."
        responseType = "flowchart"
      } else if (
        inputLower.includes("mindmap") ||
        inputLower.includes("concept") ||
        inputLower.includes("brainstorm")
      ) {
        aiResponse =
          "Here's a mindmap for your topic:\n\n```\n        Machine Learning\n           /    |    \\\n    Supervised  |  Unsupervised\n      /    \\    |    /    \\\n  Linear  Neural |  K-means Clustering\n Regression Networks| \n           |    Reinforcement\n      Deep Learning\n```\n\nThis breaks down the key concepts and relationships."
        responseType = "mindmap"
      } else if (type === "image") {
        aiResponse =
          "I can see your image! Based on what I observe:\n\n• The image appears to show academic content\n• I can help analyze diagrams, equations, or text\n• Feel free to ask specific questions about what you've shared\n\nWhat would you like me to explain about this image?"
        responseType = "image"
      } else if (inputLower.includes("math") || inputLower.includes("calculus") || inputLower.includes("algebra")) {
        aiResponse =
          "Let me solve this step by step:\n\n**Step 1:** Identify the variables\n**Step 2:** Apply the relevant formula\n**Step 3:** Substitute values\n**Step 4:** Simplify\n\n```math\nf(x) = x² + 2x + 1\nf'(x) = 2x + 2\n```\n\nThe derivative shows the rate of change at any point."
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        type: responseType,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setActiveTab("image")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Learning Assistant</h1>
                <p className="text-muted-foreground">Multi-modal AI assistant for academic help</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Multi-modal AI
              </Badge>
              <Badge variant="outline">Code Analysis</Badge>
              <Badge variant="outline">Image Recognition</Badge>
              <Badge variant="outline">Chart Generation</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Chat with AI Assistant
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Welcome to Multi-modal AI Assistant!</h3>
                        <p className="text-muted-foreground mb-4">I can help with:</p>
                        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-sm">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">📝 Text Analysis</div>
                          <div className="p-2 bg-green-50 dark:bg-green-950 rounded">💻 Code Review</div>
                          <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded">🖼️ Image Analysis</div>
                          <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded">📊 Chart Creation</div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.type === "code" ? (
                              <pre className="whitespace-pre-wrap code-editor text-sm">{message.content}</pre>
                            ) : (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            )}
                            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                              {message.type === "code" && <Code className="h-3 w-3" />}
                              {message.type === "image" && <ImageIcon className="h-3 w-3" />}
                              {message.type === "chart" && <BarChart3 className="h-3 w-3" />}
                              {message.type === "flowchart" && <GitBranch className="h-3 w-3" />}
                              {message.type === "mindmap" && <Brain className="h-3 w-3" />}
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>

                          {message.role === "user" && (
                            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>AI is analyzing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="text" className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Text
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          Image
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Chart
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="text" className="mt-4">
                        <div className="flex gap-2">
                          <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your studies..."
                            className="flex-1 min-h-[60px] resize-none"
                            disabled={isLoading}
                          />
                          <Button onClick={() => sendMessage("text")} disabled={!input.trim() || isLoading} size="lg">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="mt-4">
                        <div className="space-y-2">
                          <CodeEditor value={code} onChange={setCode} />
                          <div className="flex gap-2">
                            <Textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Describe what you want me to analyze about this code..."
                              className="flex-1 min-h-[40px] resize-none"
                              disabled={isLoading}
                            />
                            <Button onClick={() => sendMessage("code")} disabled={!code || isLoading} size="lg">
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="image" className="mt-4">
                        <div className="space-y-2">
                          <ImageUpload onImageUpload={handleImageUpload} />
                          {uploadedImage && (
                            <div className="p-2 bg-muted rounded border">
                              <p className="text-sm text-muted-foreground">Image uploaded: {uploadedImage}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="What would you like me to analyze about this image?"
                              className="flex-1 min-h-[40px] resize-none"
                              disabled={isLoading}
                            />
                            <Button
                              onClick={() => sendMessage("image")}
                              disabled={!uploadedImage || isLoading}
                              size="lg"
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chart" className="mt-4">
                        <div className="flex gap-2">
                          <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe the chart or visualization you need..."
                            className="flex-1 min-h-[60px] resize-none"
                            disabled={isLoading}
                          />
                          <Button onClick={() => sendMessage("chart")} disabled={!input.trim() || isLoading} size="lg">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tools Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setInput("Generate a flowchart for sorting algorithms")
                      setActiveTab("chart")
                    }}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Generate Flowchart
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setInput("Create a mindmap for machine learning concepts")
                      setActiveTab("chart")
                    }}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Create Mindmap
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setCode("// Write your code here\nfunction example() {\n  return 'Hello World';\n}")
                      setActiveTab("code")
                    }}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="text-primary hover:underline cursor-pointer">Data Structures</div>
                    <div className="text-primary hover:underline cursor-pointer">Machine Learning</div>
                    <div className="text-primary hover:underline cursor-pointer">React Hooks</div>
                    <div className="text-primary hover:underline cursor-pointer">Calculus</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
