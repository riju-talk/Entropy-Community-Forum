"use client"

import type React from "react"

import Header from "@/components/header"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageSquare, Code, ImageIcon, FileText, X, Plus, Upload, Mic, MicOff, Send } from "lucide-react"

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
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Add voice recording logic here
  }

  const handleSubmit = () => {
    // Submit logic here
    console.log({
      title,
      description,
      subject,
      tags,
      attachments,
      isAnonymous,
    })
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
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Ask Anything</h1>
            <p className="text-muted-foreground">
              Get help from the community with text, code, images, and more. Ask any combination of questions!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Create Your Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  placeholder="What's your question about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPUTER_SCIENCE">Computer Science</SelectItem>
                    <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                    <SelectItem value="PHYSICS">Physics</SelectItem>
                    <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
                    <SelectItem value="BIOLOGY">Biology</SelectItem>
                    <SelectItem value="ENGINEERING">Engineering</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-modal Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Question Details</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleRecording}
                    className={isRecording ? "text-red-500" : ""}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="document">Document</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <Textarea
                      placeholder="Describe your question in detail. You can combine this with code, images, or documents..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </TabsContent>

                  <TabsContent value="code" className="mt-4 space-y-4">
                    <div className="flex gap-2">
                      <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                        <SelectTrigger className="w-40">
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
                        Add Code
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Paste your code here..."
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </TabsContent>

                  <TabsContent value="image" className="mt-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload screenshots, diagrams, or any relevant images
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="document" className="mt-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
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
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">Upload PDFs, Word documents, or text files</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Attachments</Label>
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
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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
                <p className="text-sm text-muted-foreground">Add up to 5 tags to help others find your question</p>
              </div>

              {/* Anonymous option */}
              <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label htmlFor="anonymous">Post anonymously</Label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
