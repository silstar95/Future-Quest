"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, ArrowRight } from "lucide-react"

interface PreReflectionFormProps {
  onComplete: (data: any) => void
  initialData?: any
}

export function PreReflectionForm({ onComplete, initialData }: PreReflectionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({
    knowledge: initialData?.knowledge || "",
    careers: initialData?.careers || "",
    considering: initialData?.considering || "",
    confidence: initialData?.confidence || "",
    steps: initialData?.steps || "",
  })

  const questions = [
    {
      id: "knowledge",
      title: "Knowledge Assessment",
      question: "How would you describe your knowledge about careers in branding and marketing?",
      type: "radio",
      options: [
        "I know nothing about careers in branding and marketing.",
        "I have heard of branding and marketing but don't know much about individual roles.",
        "I have some knowledge of branding and marketing roles but am not sure about the details.",
        "I have a good understanding of branding and marketing roles.",
      ],
    },
    {
      id: "careers",
      title: "Career Awareness",
      question:
        "In your own words, list a few careers in branding and marketing that you are aware of and give a brief explanation of what each role is.",
      type: "textarea",
      placeholder: "List careers and their descriptions...",
    },
    {
      id: "considering",
      title: "Career Interest",
      question: "Are you currently considering pursuing a career in branding and marketing?",
      type: "radio",
      options: [
        "Yes, I am actively considering it",
        "Maybe, I'm exploring my options",
        "No, not at this time",
        "I'm not sure yet",
      ],
    },
    {
      id: "confidence",
      title: "Confidence Level",
      question:
        "If you were to pursue a career in branding and marketing, how confident do you feel in your ability to do so?",
      type: "radio",
      options: [
        "1 - Not at all confident",
        "2 - Slightly confident",
        "3 - Moderately confident",
        "4 - Very confident",
        "5 - Extremely confident",
      ],
    },
    {
      id: "steps",
      title: "Learning Path",
      question:
        "If you were to explore a career in branding and marketing, what steps would you take to learn more? Provide as many details as possible.",
      type: "textarea",
      placeholder: "Describe the steps you would take...",
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const isAnswered = answers[currentQ.id as keyof typeof answers]?.trim() !== ""

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Lightbulb className="mr-3 h-6 w-6 text-indigo-600" />
            Pre-Reflection: Understanding Your Starting Point
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">{currentQ.title}</CardTitle>
          <p className="text-gray-600 leading-relaxed">{currentQ.question}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQ.type === "radio" && (
            <RadioGroup
              value={answers[currentQ.id as keyof typeof answers]}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQ.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} className="mt-1" />
                  <Label htmlFor={`${currentQ.id}-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQ.type === "textarea" && (
            <Textarea
              value={answers[currentQ.id as keyof typeof answers]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQ.placeholder}
              className="min-h-32 resize-none"
              rows={6}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-transparent"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {currentQuestion === questions.length - 1 ? "Complete Pre-Reflection" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Be honest in your responses! This helps us understand your starting point and
            personalize your learning experience. There are no right or wrong answers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
