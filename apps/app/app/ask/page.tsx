"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageSquare, Code, ImageIcon, FileText, X, Plus, Upload, Send } from "lucide-react"
import { createDoubt } from "@/app/actions/doubts"

interface Attachment {
  id: string
  type: "code" | "image" | "document"
  content: string
  name?: string
  language?: string
}

export default function AskPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [activeTab, setActiveTab] = useState("text")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const addAttachment = (type: Attachment["type"], content: string, name?: string, language?: string) => {
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      type,
      content,
      name,
      language,
    }
    setAttachments([...attachments, newAttachment])
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleCodeAdd = () => {
    if (codeContent.trim()) {
      addAttachment("code", codeContent, `${codeLanguage} code`, codeLanguage)
      setCodeContent("")
      setActiveTab("text")
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        addAttachment("image", e.target?.result as string, file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      addAttachment("document", `Document: ${file.name}`, file.name)
    }
  }

  const handleSubmit = async () => {
    // Improved validation - only title and description are mandatory
    const errors: string[] = []
    
    if (!title.trim()) {
      errors.push("Question title is required")
    }
    
    if (!description.trim()) {
      errors.push("Question details are required")
    }

    if (errors.length > 0) {
      alert(errors.join("\n"))
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare content with attachments
      let fullContent = description

      // Add attachments to content
      if (attachments.length > 0) {
        fullContent += "\n\n---\n\n"
        attachments.forEach((att) => {
          if (att.type === "code") {
            fullContent += `\n\`\`\`${att.language || "text"}\n${att.content}\n\`\`\`\n`
          } else if (att.type === "image") {
            fullContent += `\n![${att.name || "Image"}](${att.content})\n`
          } else if (att.type === "document") {
            fullContent += `\n**${att.name || "Document"}**: ${att.content}\n`
          }
        })
      }

      // Send to API - subject, tags, and isAnonymous are optional
      const response = await fetch("/api/doubts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: fullContent,
          subject: subject || "OTHER", // Default to OTHER if not selected
          tags: tags.length > 0 ? tags : [],
          isAnonymous: isAnonymous,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to post question")
      }

      // Redirect to the newly created doubt or community page
      router.push(`/community`)
    } catch (error) {
      console.error("Error creating doubt:", error)
      alert(error instanceof Error ? error.message : "Failed to post question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "code":
        return <Code className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <main>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-bold">Ask a question</h1>
          <p className="text-muted-foreground">Get help from the community with text, code, images, and more</p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <div>
                <CardTitle>Create your question</CardTitle>
                <CardDescription>Fill in the details below to post your question</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Question title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What's your question about?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Be specific and clear about what you're asking</p>
            </div>

            {/* Subject - Now optional with better label */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base font-medium">
                Subject <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a subject (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPUTER_SCIENCE">Computer science</SelectItem>
                  <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                  <SelectItem value="PHYSICS">Physics</SelectItem>
                  <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
                  <SelectItem value="BIOLOGY">Biology</SelectItem>
                  <SelectItem value="ENGINEERING">Engineering</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Help others find your question by selecting a subject</p>
            </div>

            {/* Multi-modal Input */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Question details <span className="text-destructive">*</span>
              </Label>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-muted p-1">
                  <TabsTrigger value="text" className="text-xs md:text-sm">
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs md:text-sm">
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="image" className="text-xs md:text-sm">
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="document" className="text-xs md:text-sm">
                    Document
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Describe your question in detail. You can combine this with code, images, or documents..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </TabsContent>

                <TabsContent value="code" className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger className="w-40 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCodeAdd} disabled={!codeContent.trim()}>
                      Add code
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Paste your code here..."
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="font-mono text-sm min-h-[200px] resize-none"
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mx-auto">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload image
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Upload screenshots, diagrams, or any relevant images
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="document" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <input
                      type="file"
                      onChange={handleDocumentUpload}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="document-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("document-upload")?.click()}
                      className="mx-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload document
                    </Button>
                    <p className="text-sm text-muted-foreground">Upload PDFs, Word documents, or text files</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <Badge key={attachment.id} variant="secondary" className="flex items-center gap-1 pr-1">
                      {getAttachmentIcon(attachment.type)}
                      <span className="text-xs">{attachment.name || attachment.type}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="h-10"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Add up to 5 tags to help others find your question</p>
            </div>

            {/* Anonymous option */}
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous" className="cursor-pointer flex-1">
                Post anonymously
              </Label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" disabled={isSubmitting}>
                Save draft
              </Button>
              <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post question
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
