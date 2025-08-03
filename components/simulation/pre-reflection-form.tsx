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
      <Card className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Pre-Reflection: Understanding Your Starting Point</CardTitle>
              <p className="text-[#f0ad70] mt-1">
                Let's understand your current knowledge about branding and marketing careers
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQ.question}</h3>

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
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 bg-transparent"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-6 bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
              >
                {currentQuestion === questions.length - 1 ? "Complete Pre-Reflection" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-gradient-to-br from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#db9b6c]/30">
        <CardContent className="p-4">
          <p className="text-sm text-[#4e3113]">
            <strong>💡 Tip:</strong> Be honest in your responses! This helps us understand your starting point and
            personalize your learning experience. There are no right or wrong answers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
