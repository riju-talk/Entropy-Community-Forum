"use client"

import { useState, useEffect } from "react"
import mermaid from "mermaid"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MindMapAgent() {
  const [topic, setTopic] = useState("")
  const [diagramType, setDiagramType] = useState("mindmap")
  const [depth, setDepth] = useState(3)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [mermaidCode, setMermaidCode] = useState<string>("")
  const [renderedSvg, setRenderedSvg] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    })
  }, [])

  // Re-render Mermaid when new code arrives
  useEffect(() => {
    if (!mermaidCode) return

    const render = async () => {
      try {
        const { svg } = await mermaid.render("generatedDiagram", mermaidCode)
        setRenderedSvg(svg)
      } catch (err) {
        console.error("Mermaid render error:", err)
        setRenderedSvg("")
      }
    }

    render()
  }, [mermaidCode])

  const generateDiagram = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/ai-agent/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          diagram_type: diagramType,
          detail_level: depth,
          systemPrompt,
        }),
      })

      const data = await res.json()

      if (!data.mermaid_code) throw new Error("No mermaid_code returned")

      setMermaidCode(data.mermaid_code)

      toast({ title: "Diagram generated successfully" })
    } catch (err) {
      toast({ title: "Failed to generate", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Diagram Generator</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Topic</Label>
          <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Diagram Type</Label>
            <Select value={diagramType} onValueChange={setDiagramType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mindmap">Mindmap</SelectItem>
                <SelectItem value="flowchart">Flowchart</SelectItem>
                <SelectItem value="er">ER Diagram</SelectItem>
                <SelectItem value="sequence">Sequence Diagram</SelectItem>
                <SelectItem value="class">Class Diagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Depth</Label>
            <Select value={String(depth)} onValueChange={(v) => setDepth(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Custom Instructions</Label>
            <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={1} />
          </div>
        </div>

        <Button onClick={generateDiagram} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Generate Diagram
        </Button>

        {/* Diagram + Code Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Left: VISUAL DIAGRAM */}
          <div className="border rounded p-4 bg-white dark:bg-slate-900 min-h-[300px]">
            <h3 className="font-semibold mb-2">Diagram Preview</h3>
            {renderedSvg ? (
              <div
                className="overflow-auto"
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
              />
            ) : (
              <div className="text-muted-foreground">No diagram generated yet</div>
            )}
          </div>

          {/* Right: RAW CODE */}
          <div className="border rounded p-4 bg-muted/40 dark:bg-slate-900 min-h-[300px]">
            <h3 className="font-semibold mb-2">Mermaid Source Code</h3>
            {mermaidCode ? (
              <pre className="text-sm whitespace-pre-wrap overflow-auto p-2">
                {mermaidCode}
              </pre>
            ) : (
              <div className="text-muted-foreground">No code available</div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
