"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MindMapAgent() {
  const [topic, setTopic] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [diagramType, setDiagramType] = useState("mindmap")
  const [depth, setDepth] = useState<number>(3)
  const [loading, setLoading] = useState(false)
  const [mermaidCode, setMermaidCode] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"preview" | "code" | "both">("both")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const renderIdRef = useRef(0)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!mermaidCode) {
      setSvg(null)
      return
    }

    if (typeof window === "undefined") {
      return
    }

    let cancelled = false
    const id = `mermaid-${++renderIdRef.current}`

    const renderMermaidCompat = async (code: string) => {
      // dynamic import and compatibility handling for different mermaid builds
      const mod: any = await import("mermaid").catch((err) => {
        throw new Error(`Failed to load mermaid: ${err?.message || err}`)
      })
      const mer = mod.default ?? mod

      // If DOM not usable, warn and return the source as fallback (no render)
      const canUseDOM = typeof document !== "undefined" && typeof document.createElementNS === "function" && typeof window !== "undefined"
      if (!canUseDOM) {
        try {
          toast({
            title: "Render unavailable",
            description: "Diagram preview not available in this environment. Showing source instead (alpha).",
            variant: "warning",
          })
        } catch (_) {}
        // return the source so caller can display it instead of crashing
        return code
      }

      // Initialize mermaid (try multiple entry points)
      const initOptions = {
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        flowchart: { useMaxWidth: false },
        mindmap: { useMaxWidth: false },
      }
      try {
        if (typeof mer.initialize === "function") {
          mer.initialize(initOptions)
        } else if (mer.mermaidAPI && typeof mer.mermaidAPI.initialize === "function") {
          mer.mermaidAPI.initialize(initOptions)
        } else if (typeof mer.init === "function") {
          mer.init()
        }
      } catch (initErr) {
        console.warn("[MINDMAP] mermaid init warning:", initErr)
      }

      // Render via available API
      if (mer.mermaidAPI && typeof mer.mermaidAPI.render === "function") {
        // Try promise/returning form first, then callback form.
        try {
          const maybe = mer.mermaidAPI.render(id, code)
          if (maybe && typeof maybe.then === "function") {
            const svg = await maybe
            return typeof svg === "string" ? svg : svg?.svg ?? String(svg)
          }
          if (typeof maybe === "string") return maybe
          if (maybe && maybe.svg) return maybe.svg

          // fallback to callback-style, wrapped in try/catch to avoid unhandled exceptions
          return await new Promise<string>((resolve) => {
            try {
              mer.mermaidAPI.render(id, code, (svgCode: string) => resolve(svgCode))
            } catch (e) {
              // If callback form fails, show a gentle alpha warning and fallback to source
              try {
                toast({
                  title: "Alpha warning",
                  description: "Some mindmaps may not render correctly — showing source instead.",
                  variant: "warning",
                })
              } catch (_) {}
              resolve(code)
            }
          })
        } catch (e) {
          // Top-level render error: show warning and fallback to source
          try {
            toast({
              title: "Alpha warning",
              description: "Some mindmaps may not render correctly — showing source instead.",
              variant: "warning",
            })
          } catch (_) {}
          return code
        }
      }

      // Next fallback: mer.render (older/newer builds)
      if (typeof mer.render === "function") {
        try {
          const out = mer.render(id, code)
          if (typeof out === "string") return out
          if (out && typeof out.then === "function") {
            const res = await out
            if (typeof res === "string") return res
            return res?.svg ?? String(res)
          }
          if (out && out.svg) return out.svg
          return String(out)
        } catch (e) {
          try {
            toast({
              title: "Alpha warning",
              description: "Some mindmaps may not render correctly — showing source instead.",
              variant: "warning",
            })
          } catch (_) {}
          return code
        }
      }

      // No render API found — return the source as fallback
      try {
        toast({
          title: "Render unsupported",
          description: "Cannot render diagrams with the installed mermaid build. Showing source.",
          variant: "warning",
        })
      } catch (_) {}
      return code
    }

    ;(async () => {
      try {
        const svgResult = await renderMermaidCompat(mermaidCode!)
        if (!cancelled) {
          // If result looks like raw source (not svg), show source instead of setting svg
          const looksLikeSvg = typeof svgResult === "string" && svgResult.trim().startsWith("<svg")
          if (looksLikeSvg) {
            setSvg(svgResult)
          } else {
            // treat as source fallback — render will not be available, keep svg null and keep mermaidCode for code view
            setSvg(null)
          }
          setError(null)
        }
      } catch (err: any) {
        console.error("[MINDMAP] mermaid render error:", err)
        if (!cancelled) {
          setError(`Failed to render diagram: ${err?.message ?? err}`)
          try {
            toast({
              title: "Render Error",
              description: "Failed to render the diagram. Please check the Mermaid syntax.",
              variant: "destructive",
            })
          } catch (_) {}
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [mermaidCode, toast])

  const handleGenerate = async () => {
    setError(null)
    setSvg(null)
    setMermaidCode(null)
    setZoom(1) // Reset zoom on new generation

    if (!topic.trim()) {
      toast({ 
        title: "Topic required", 
        description: "Please enter a topic for the diagram", 
        variant: "destructive" 
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/ai-agent/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          systemPrompt: systemPrompt.trim() || undefined,
          diagram_type: diagramType,
          depth,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || `HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      
      if (!data.mermaid_code) {
        throw new Error("No Mermaid code returned from server")
      }

      setMermaidCode(data.mermaid_code)
      
      toast({ 
        title: "Success", 
        description: `${getDiagramTypeName(diagramType)} generated successfully` 
      })
    } catch (err: any) {
      console.error("[DIAGRAM] Error generating diagram:", err)
      const errorMessage = err.message || "Failed to generate diagram"
      setError(errorMessage)
      toast({ 
        title: "Generation Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const getDiagramTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      mindmap: "Mind Map",
      flowchart: "Flowchart",
      er: "ER Diagram",
      sequence: "Sequence Diagram",
      class: "UML Class Diagram",
      state: "System State Diagram"
    }
    return names[type] || "Diagram"
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  const copyToClipboard = async () => {
    if (!mermaidCode) return
    
    try {
      await navigator.clipboard.writeText(mermaidCode)
      toast({
        title: "Copied!",
        description: "Mermaid code copied to clipboard"
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      })
    }
  }

  // new: download rendered SVG
  const downloadSvg = async () => {
    if (!svg) {
      toast({ title: "No diagram", description: "There is no rendered diagram to download.", variant: "destructive" })
      return
    }
    try {
      const filename = (topic && topic.trim() ? topic.trim().replace(/\s+/g, "_") : "diagram") + ".svg"
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: "Downloaded", description: "SVG downloaded to your device." })
    } catch (err) {
      console.error("[MINDMAP] downloadSvg error:", err)
      toast({ title: "Download failed", description: "Could not download SVG.", variant: "destructive" })
    }
  }

  // --- New: pan/drag handlers ---
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      e.preventDefault()
      const lp = lastPosRef.current
      if (!lp) return
      const x = e.clientX
      const y = e.clientY
      const dx = x - lp.x
      const dy = y - lp.y
      lastPosRef.current = { x, y }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
    const onUp = () => {
      draggingRef.current = false
      lastPosRef.current = null
      document.body.style.cursor = ""
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    // only start drag on primary button
    if (e.button !== 0) return
    draggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    document.body.style.cursor = "grabbing"
  }

  const onDoubleClick = () => {
    // reset pan & zoom
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // touch support
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const t = e.touches[0]
      const lp = lastPosRef.current
      if (!lp || !t) return
      const dx = t.clientX - lp.x
      const dy = t.clientY - lp.y
      lastPosRef.current = { x: t.clientX, y: t.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
    const onTouchEnd = () => {
      draggingRef.current = false
      lastPosRef.current = null
    }
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd)
    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Diagram Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="topic">Topic or Description</Label>
          <Textarea 
            id="topic"
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            rows={2} 
            placeholder="Describe what you want to diagram, e.g., 'Machine Learning workflow' or 'User authentication system'"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="diagram-type">Diagram Type</Label>
            <Select value={diagramType} onValueChange={setDiagramType}>
              <SelectTrigger id="diagram-type" className="w-full">
                <SelectValue placeholder="Select diagram type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mindmap">Mind Map</SelectItem>
                <SelectItem value="flowchart">Flowchart</SelectItem>
                <SelectItem value="er">ER Diagram</SelectItem>
                <SelectItem value="sequence">Sequence Diagram</SelectItem>
                <SelectItem value="class">UML Class Diagram</SelectItem>
                <SelectItem value="state">System State Diagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="depth">Detail Level</Label>
            <Select value={depth.toString()} onValueChange={(v) => setDepth(Number(v))}>
              <SelectTrigger id="depth" className="w-full">
                <SelectValue placeholder="Select depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Basic</SelectItem>
                <SelectItem value="2">Simple</SelectItem>
                <SelectItem value="3">Detailed</SelectItem>
                <SelectItem value="4">Comprehensive</SelectItem>
                <SelectItem value="5">Very Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="system-prompt">Custom Instructions (optional)</Label>
            <Textarea 
              id="system-prompt"
              value={systemPrompt} 
              onChange={(e) => setSystemPrompt(e.target.value)} 
              rows={1} 
              placeholder="Optional: Add specific formatting requirements or focus areas"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Generate {getDiagramTypeName(diagramType)}
              </>
            )}
          </Button>

          <div className="ml-auto flex gap-2">
            <Button 
              variant={view === "preview" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setView("preview")}
            >
              Preview
            </Button>
            <Button 
              variant={view === "code" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setView("code")}
            >
              Code
            </Button>
            <Button 
              variant={view === "both" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setView("both")}
            >
              Both
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
            <div className="text-sm text-destructive font-medium">Error: {error}</div>
          </div>
        )}

        {/* Render area: Preview / Code / Both */}
        <div>
          {view === "preview" && (
            <div className="border rounded-lg bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Diagram Preview</h3>
                {svg && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="mr-2 h-4 w-4" /> Zoom In
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="mr-2 h-4 w-4" /> Zoom Out
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetZoom}>
                      Reset Zoom
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg}>
                      Download SVG
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview container */}
              <div 
                ref={svgContainerRef}
                className="overflow-auto border rounded bg-white dark:bg-slate-800 min-h-[280px] max-h-[420px] flex items-center justify-center"
                onDoubleClick={onDoubleClick}
                // pointer handlers for starting drag
                onMouseDown={onMouseDown}
                onTouchStart={(e) => {
                  const t = e.touches[0]
                  if (!t) return
                  draggingRef.current = true
                  lastPosRef.current = { x: t.clientX, y: t.clientY }
                }}
                style={{ touchAction: "none", cursor: draggingRef.current ? "grabbing" : "grab" }}
              >
                {svg ? (
                  <div
                    // apply translate + scale so pan + zoom work together
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                      display: "inline-block",
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ) : (
                  <div className="text-muted-foreground text-center p-8">
                    <p>Your diagram preview will appear here</p>
                    <p className="text-sm mt-2">Generate a diagram to see the visualization</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "code" && (
            <div className="border rounded-lg bg-muted/50 dark:bg-slate-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mermaid Source Code</h3>
                <div className="flex items-center gap-2">
                  {mermaidCode && (
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      Copy Code
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg}>
                    Download SVG
                  </Button>
                </div>
              </div>
              <div className="bg-background dark:bg-slate-900 border rounded p-0 h-64 overflow-auto">
                {mermaidCode ? (
                  <pre className="text-sm whitespace-pre-wrap overflow-auto p-4 h-full">
                    {mermaidCode}
                  </pre>
                ) : (
                  <div className="text-muted-foreground text-center p-4">
                    <p>Mermaid source code will appear here</p>
                    <p className="text-sm mt-2">Generate a diagram to see the code</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "both" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Diagram Preview</h3>
                  {svg && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="mr-2 h-4 w-4" /> Zoom In
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="mr-2 h-4 w-4" /> Zoom Out
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleResetZoom}>
                        Reset Zoom
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg}>
                        Download SVG
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview container */}
                <div className="overflow-auto border rounded bg-white dark:bg-slate-800 min-h-[280px] max-h-[420px] flex items-center justify-center"
                  onDoubleClick={onDoubleClick}
                  onMouseDown={onMouseDown}
                  onTouchStart={(e) => {
                    const t = e.touches[0]
                    if (!t) return
                    draggingRef.current = true
                    lastPosRef.current = { x: t.clientX, y: t.clientY }
                  }}
                  style={{ touchAction: "none", cursor: draggingRef.current ? "grabbing" : "grab" }}
                >
                  {svg ? (
                    <div
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        display: "inline-block",
                      }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ) : (
                    <div className="text-muted-foreground text-center p-4">
                      Diagram preview will appear here
                    </div>
                  )}
                </div>
              </div>

              {/* Source code panel remains unchanged and scrollable */}
              <div className="border rounded-lg bg-muted/50 dark:bg-slate-900 p-4">
                <div className="bg-background dark:bg-slate-900 border rounded h-64 overflow-auto p-0">
                  {mermaidCode ? (
                    <pre className="text-sm whitespace-pre-wrap overflow-auto p-4 h-full">
                      {mermaidCode}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground text-center p-4">
                      Mermaid source code will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}