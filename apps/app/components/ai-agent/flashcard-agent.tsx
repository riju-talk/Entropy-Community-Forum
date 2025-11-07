"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RotateCcw, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Flashcard {
  front: string
  back: string
  topic: string
}

export function FlashcardAgent() {
  const [topic, setTopic] = useState("")
  const [focusTopics, setFocusTopics] = useState("")
  const [numCards, setNumCards] = useState(10)
  const [loading, setLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
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
    setCurrentCard(0)
    setFlipped(false)

    try {
      const response = await fetch("/api/ai-agent/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, focusTopics, numCards }),
      })

      if (!response.ok) throw new Error("Failed to generate flashcards")

      const data = await response.json()
      setFlashcards(data.flashcards)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setFlipped(false)
    }
  }

  return (
    <div className="space-y-4">
      {flashcards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Main Topic</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter main topic..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Focus Topics (Optional)</Label>
              <Input
                value={focusTopics}
                onChange={(e) => setFocusTopics(e.target.value)}
                placeholder="Comma-separated subtopics to focus on..."
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Cards</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
              />
            </div>

            <Button onClick={handleGenerate} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Card {currentCard + 1} of {flashcards.length}
              </h3>
              <Badge variant="secondary">{flashcards[currentCard].topic}</Badge>
            </div>
            <Button variant="outline" onClick={() => setFlashcards([])}>
              New Set
            </Button>
          </div>

          <Card
            className="h-[400px] cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Badge>{flipped ? "Answer" : "Question"}</Badge>
                <p className="text-2xl font-medium">
                  {flipped
                    ? flashcards[currentCard].back
                    : flashcards[currentCard].front}
                </p>
                <Button variant="ghost" size="sm" className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Click to flip
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCard === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentCard === flashcards.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
