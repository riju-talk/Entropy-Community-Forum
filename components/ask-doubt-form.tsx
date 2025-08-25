"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Eye, EyeOff } from "lucide-react"
import CodeEditor from "@/components/code-editor"
import ImageUpload from "@/components/image-upload"

export default function AskDoubtForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [code, setCode] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("text")

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({
      title,
      content,
      subject,
      tags,
      isAnonymous,
      code,
      uploadedImage,
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your specific question?"
              required
            />
            <p className="text-sm text-muted-foreground">
              Be specific and imagine you're asking a question to another person
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select value={subject} onValueChange={setSubject} required>
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
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="LITERATURE">Literature</SelectItem>
                <SelectItem value="HISTORY">History</SelectItem>
                <SelectItem value="PSYCHOLOGY">Psychology</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Tabs */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your problem in detail. Include what you've tried, error messages, and expected behavior."
                  className="min-h-[150px]"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can use markdown formatting. Include details about what you've already tried.
                </p>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="space-y-4">
                  <CodeEditor value={code} onChange={setCode} />
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe what you want help with regarding this code..."
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <div className="space-y-4">
                  <ImageUpload onImageUpload={handleImageUpload} />
                  {uploadedImage && (
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="text-sm text-muted-foreground">Image uploaded: {uploadedImage}</p>
                    </div>
                  )}
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe what you need help with regarding this image..."
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

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
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Add up to 5 tags to help others find your question</p>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <div>
                <Label htmlFor="anonymous" className="text-sm font-medium">
                  Post anonymously
                </Label>
                <p className="text-xs text-muted-foreground">Your name won't be shown with this question</p>
              </div>
            </div>
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Post Question</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
