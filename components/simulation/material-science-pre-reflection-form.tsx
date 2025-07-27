"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, ArrowRight } from "lucide-react"

interface MaterialSciencePreReflectionFormProps {
  onComplete: (data: any) => void
  initialData?: any
}

export function MaterialSciencePreReflectionForm({ onComplete, initialData }: MaterialSciencePreReflectionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({
    knowledge: initialData?.knowledge || "",
    chemistryClass: initialData?.chemistryClass || "",
    description: initialData?.description || "",
    considering: initialData?.considering || "",
    confidence: initialData?.confidence || "",
    steps: initialData?.steps || "",
  })

  const questions = [
    {
      id: "knowledge",
      title: "Knowledge Assessment",
      question: "How would you describe your knowledge about careers in materials science?",
      type: "radio",
      options: [
        "I know nothing about careers in materials science.",
        "I have heard of materials science but don't know much about individual roles.",
        "I have some knowledge of materials science roles but am not sure about the details.",
        "I have a good understanding of materials science roles.",
      ],
    },
    {
      id: "chemistryClass",
      title: "Chemistry Background",
      question: "Have you taken a high school chemistry class yet?",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      id: "description",
      title: "Materials Scientist Role",
      question:
        "In your own words, give a brief description of what you believe a materials scientist does. If you're not sure, it is fine to put \"I don't know\".",
      type: "textarea",
      placeholder: "Describe what you think a materials scientist does...",
    },
    {
      id: "considering",
      title: "Career Interest",
      question: "Are you currently considering pursuing a career in materials science?",
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
        "If you were to pursue a career in materials science, how confident do you feel in your ability to do so?",
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
        "If you were to explore a career in materials science, what steps would you take to learn more? Provide as many details as possible.",
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
      <Card className="bg-gradient-to-r from-blue-500 to-green-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Pre-Reflection: Understanding Your Starting Point</CardTitle>
              <p className="text-blue-100 mt-1">
                Let's understand your current knowledge about materials science careers
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
                className="px-6 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700"
              >
                {currentQuestion === questions.length - 1 ? "Complete Pre-Reflection" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
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
