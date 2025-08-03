"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { DollarSign, ArrowRight, CheckCircle } from "lucide-react"

interface FinancePreReflectionFormProps {
  onComplete: (data: any) => void
  initialData?: any
}

export default function FinancePreReflectionForm({ onComplete, initialData }: FinancePreReflectionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({
    knowledgeLevel: initialData?.knowledgeLevel || "",
    careerAwareness: initialData?.careerAwareness || "",
    careerConsideration: initialData?.careerConsideration || "",
    confidenceLevel: initialData?.confidenceLevel || "",
    learningSteps: initialData?.learningSteps || "",
  })

  const questions = [
    {
      id: "knowledgeLevel",
      title: "How would you describe your knowledge about careers in finance?",
      type: "radio",
      options: [
        "I know nothing about careers in finance.",
        "I have heard of finance but don't know much about individual roles.",
        "I have some knowledge of finance roles but am not sure about the details.",
        "I have a good understanding of finance roles.",
      ],
    },
    {
      id: "careerAwareness",
      title:
        "In your own words, list a few careers in finance that you are aware of and give a brief explanation of what each role is.",
      type: "textarea",
      placeholder: "List finance careers you know and briefly explain what each role does...",
    },
    {
      id: "careerConsideration",
      title: "Are you currently considering pursuing a career in finance?",
      type: "radio",
      options: [
        "Yes, I am actively considering it",
        "Maybe, I'm exploring my options",
        "No, not at this time",
        "I'm not sure yet",
      ],
    },
    {
      id: "confidenceLevel",
      title: "If you were to pursue a career in finance, how confident do you feel in your ability to do so?",
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
      id: "learningSteps",
      title:
        "If you were to explore a career in finance, what steps would you take to learn more? Provide as many details as possible.",
      type: "textarea",
      placeholder: "Describe the steps you would take to learn more about finance careers...",
    },
  ]

  const currentQuestionData = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionData.id]: value,
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

  const isCurrentAnswerValid = () => {
    const currentAnswer = answers[currentQuestionData.id as keyof typeof answers]
    return currentAnswer && currentAnswer.trim().length > 0
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Pre-Reflection Assessment</CardTitle>
              <CardDescription className="text-blue-100">
                Let's understand your current knowledge about finance careers
              </CardDescription>
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

        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQuestionData.title}</h3>

              {currentQuestionData.type === "radio" && (
                <RadioGroup
                  value={answers[currentQuestionData.id as keyof typeof answers]}
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {currentQuestionData.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestionData.type === "textarea" && (
                <Textarea
                  value={answers[currentQuestionData.id as keyof typeof answers]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={currentQuestionData.placeholder}
                  className="min-h-[120px] text-gray-700"
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
                disabled={!isCurrentAnswerValid()}
                className="px-6 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-accent"
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    Complete Assessment
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
