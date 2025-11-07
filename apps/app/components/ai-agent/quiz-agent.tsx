"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function QuizAgent() {
  const [topic, setTopic] = useState("")
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState("medium")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
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
    setShowResults(false)
    setSelectedAnswers({})
    setCurrentQuestion(0)

    try {
      const response = await fetch("/api/ai-agent/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions, difficulty }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()
      setQuestions(data.questions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const score = Object.entries(selectedAnswers).reduce(
    (acc, [idx, answer]) => {
      if (questions[Number(idx)]?.correctAnswer === answer) {
        return acc + 1
      }
      return acc
    },
    0
  )

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic for quiz..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard">Hard</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Quiz
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
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              {showResults && (
                <Badge variant={score / questions.length >= 0.7 ? "default" : "destructive"}>
                  Score: {score}/{questions.length}
                </Badge>
              )}
            </div>
            <Button variant="outline" onClick={() => setQuestions([])}>
              New Quiz
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={String(selectedAnswers[currentQuestion] ?? "")}
                onValueChange={(value) =>
                  setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: Number(value) })
                }
              >
                {questions[currentQuestion].options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      showResults
                        ? idx === questions[currentQuestion].correctAnswer
                          ? "bg-green-500/10 border-green-500"
                          : selectedAnswers[currentQuestion] === idx
                          ? "bg-red-500/10 border-red-500"
                          : ""
                        : ""
                    }`}
                  >
                    <RadioGroupItem value={String(idx)} id={`option-${idx}`} disabled={showResults} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showResults && idx === questions[currentQuestion].correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showResults &&
                      selectedAnswers[currentQuestion] === idx &&
                      idx !== questions[currentQuestion].correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                  </div>
                ))}
              </RadioGroup>

              {showResults && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Explanation:</p>
                  <p className="text-sm">{questions[currentQuestion].explanation}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                {currentQuestion < questions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</Button>
                ) : !showResults ? (
                  <Button onClick={handleSubmit}>Submit Quiz</Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
