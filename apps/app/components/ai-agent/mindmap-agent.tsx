"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MindMapAgent() {
  const [topic, setTopic] = useState("")
  const [diagramType, setDiagramType] = useState("mindmap")
  const [loading, setLoading] = useState(false)
  const [mermaidCode, setMermaidCode] = useState("")
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/ai-agent/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, diagramType }),
      })

      if (!response.ok) throw new Error("Failed to generate diagram")

      const data = await response.json()
      setMermaidCode(data.mermaidCode)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate mind map",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([mermaidCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${topic.substring(0, 20)}-diagram.mmd`
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Topic / Concept</Label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic for mind mapping..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Diagram Type</Label>
          <Select value={diagramType} onValueChange={setDiagramType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mindmap">Mind Map</SelectItem>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="sequence">Sequence Diagram</SelectItem>
              <SelectItem value="class">Class Diagram</SelectItem>
              <SelectItem value="gantt">Gantt Chart</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Diagram
              </>
            )}
          </Button>
        </div>
      </div>

      {mermaidCode && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Generated Diagram</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              <code>{mermaidCode}</code>
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Copy this code and paste it into a Mermaid viewer (e.g., mermaid.live)
          </p>
        </Card>
      )}
    </div>
  )
}
