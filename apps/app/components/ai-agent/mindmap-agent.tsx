"use client"

import { useState, useEffect, useRef } from "react"
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
  const [depth, setDepth] = useState<number>(3)
  const [loading, setLoading] = useState(false)
  const [mermaidCode, setMermaidCode] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [colorScheme, setColorScheme] = useState<string>("auto")
  const [studentLevel, setStudentLevel] = useState<string>("beginner")
  const [themeVars, setThemeVars] = useState<Record<string,string> | null>(null)
  const { toast } = useToast()
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null)

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
    setMermaidCode("")

    try {
      const response = await fetch("/api/ai-agent/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          diagramType,
          depth,
          customPrompt: customPrompt.trim() || undefined,
          colorScheme,
          studentLevel
        }),
      })

      if (!response.ok) throw new Error("Failed to generate diagram")

      const data = await response.json() as { mermaidCode: string; themeVars?: Record<string,string> }
      setMermaidCode(data.mermaidCode || "")
      setThemeVars(data.themeVars || null)
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

  // ✅ Correct Mermaid rendering logic
  useEffect(() => {
    if (!mermaidCode) {
      if (mermaidContainerRef.current) mermaidContainerRef.current.innerHTML = ""
      setParseError(null)
      return
    }

    let cancelled = false
    let timer: any

    timer = setTimeout(async () => {
      try {
        const mermaidModule: any = await import("mermaid")
        await import("@mermaid-js/mermaid-mindmap")
        const mermaid = mermaidModule.default || mermaidModule

        const themeVariables = {
          background: "transparent",
          fontFamily: "Inter, system-ui, sans-serif",
          primaryTextColor: "#e6edf3",
          lineColor: "#e6edf3",
          ...(themeVars || {})
        }

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "antiscript",
          theme: "default",
          themeVariables
        })

        try {
          if (mermaid.parse) mermaid.parse(mermaidCode)
          setParseError(null)
        } catch (err: any) {
          setParseError(err?.message ?? String(err))
        }

        if (!mermaidContainerRef.current) return
        mermaidContainerRef.current.innerHTML = ""

        const id = "mm-" + Math.random().toString(36).slice(2, 9)
        const { svg, bindFunctions } = await mermaid.render(id, mermaidCode)

        if (cancelled) return
        mermaidContainerRef.current.innerHTML = svg
        bindFunctions?.(mermaidContainerRef.current)

        const svgEl = mermaidContainerRef.current.querySelector("svg")
        if (svgEl) {
          svgEl.setAttribute("width", "100%")
          svgEl.setAttribute("height", "auto")
          svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet")
        }
      } catch (err) {
        setParseError(String(err))
      }
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [mermaidCode, themeVars])

  const handleDownload = () => {
    const blob = new Blob([mermaidCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${topic.substring(0, 20)}-diagram.mmd`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Topic / Concept</Label>
          <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagram-type">Diagram Type</Label>
          <Select value={diagramType} onValueChange={setDiagramType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mindmap">Mind Map</SelectItem>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="erDiagram">ER Diagram</SelectItem>
              <SelectItem value="sequenceDiagram">Sequence Diagram</SelectItem>
              <SelectItem value="classDiagram">Class Diagram</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-2 flex items-center gap-3">
            <Label htmlFor="depth" className="text-sm">Depth</Label>
            <input
              id="depth"
              type="number"
              min={1}
              max={6}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-20 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2">
            <Label className="text-sm">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (backend chooses)</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="ocean">Ocean (blue)</SelectItem>
                <SelectItem value="sunset">Sunset (warm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2">
            <Label className="text-sm">Student level</Label>
            <Select value={studentLevel} onValueChange={setStudentLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Generate Diagram</>}
          </Button>
        </div>
      </div>

      {mermaidCode && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Generated Diagram</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Mermaid Source</Label>
              <Textarea value={mermaidCode} onChange={(e) => setMermaidCode(e.target.value)} rows={20} className="font-mono text-xs" />
              {parseError && <div className="text-sm text-red-400 mt-2"><strong>Error:</strong> {parseError}</div>}
            </div>

            <div>
              <Label>Rendered Diagram</Label>
              <div className="bg-muted rounded-lg p-4 overflow-auto" style={{ minHeight: 320 }}>
                <div ref={mermaidContainerRef} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
