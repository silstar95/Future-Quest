"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, TrendingUp, BarChart3 } from "lucide-react"

interface PostReflectionData {
  enjoymentRating: string
  knowledgeLevel: string
  confidenceLevel: string
  futureInterest: string
  otherCareers: string
}

interface PostReflectionFormProps {
  onComplete: (data: PostReflectionData) => void
  initialData?: PostReflectionData
  preReflectionData?: any
}

export function PostReflectionForm({ onComplete, initialData, preReflectionData }: PostReflectionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<PostReflectionData>(
    initialData || {
      enjoymentRating: "",
      knowledgeLevel: "",
      confidenceLevel: "",
      futureInterest: "",
      otherCareers: "",
    },
  )

  const questions = [
    {
      id: "enjoymentRating",
      title: "Project Enjoyment",
      question: "On a scale of 1-10, how much did you enjoy this project?",
      type: "scale",
      scaleRange: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      id: "knowledgeLevel",
      title: "Knowledge Assessment",
      question:
        "After doing this project, how would you describe your knowledge about careers in branding and marketing?",
      type: "radio",
      options: [
        "I know nothing about careers in branding and marketing.",
        "I know what branding and marketing is but don't know much about individual roles.",
        "I have some knowledge of branding and marketing roles but still am unsure about the details.",
        "I have a good understanding of branding and marketing roles.",
      ],
    },
    {
      id: "confidenceLevel",
      title: "Confidence Assessment",
      question: "How confident do you feel in your ability to pursue a career in brand and marketing in the future?",
      type: "scale",
      scaleRange: [1, 2, 3, 4, 5],
      scaleLabels: ["Not at all confident", "Very confident"],
    },
    {
      id: "futureInterest",
      title: "Future Learning Interest",
      question: "Would you like to learn more about a career in brand and marketing?",
      type: "scale",
      scaleRange: [1, 2, 3, 4, 5],
      scaleLabels: ["Not at all", "Most Definitely"],
    },
    {
      id: "otherCareers",
      title: "Career Exploration",
      question: "What other careers would you be interested in experiencing?",
      type: "textarea",
      placeholder: "List other career fields or specific roles you'd like to explore through simulations...",
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }))
  }

  const canProceed = () => {
    const currentValue = formData[currentQ.id as keyof PostReflectionData]
    return currentValue && currentValue.trim() !== ""
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const getGrowthInsight = () => {
    if (!preReflectionData || currentQuestion !== 1) return null

    const preKnowledge = preReflectionData.knowledgeLevel
    const postKnowledge = formData.knowledgeLevel

    if (preKnowledge && postKnowledge && preKnowledge !== postKnowledge) {
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-800">Knowledge Growth Detected!</span>
          </div>
          <p className="text-green-700 text-sm">
            You've shown improvement in your understanding of branding and marketing careers through this simulation.
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-green-500" />
              Evaluate
            </CardTitle>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">📊 Time to Evaluate</h3>
              <p className="text-gray-700">
                Now that you've engaged with professionals in the field, it's time to evaluate your experience and
                reflect on what you've learned throughout this simulation.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-purple-600 mb-2">{currentQ.title}</h3>
            <p className="text-xl text-gray-800 mb-6 leading-relaxed">{currentQ.question}</p>

            {currentQ.type === "radio" && (
              <RadioGroup
                value={formData[currentQ.id as keyof PostReflectionData]}
                onValueChange={handleInputChange}
                className="space-y-3"
              >
                {currentQ.options?.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="text-gray-700 leading-relaxed cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "textarea" && (
              <Textarea
                value={formData[currentQ.id as keyof PostReflectionData]}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[120px] text-base"
              />
            )}

            {currentQ.type === "scale" && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData[currentQ.id as keyof PostReflectionData]}
                  onValueChange={handleInputChange}
                  className="flex justify-between"
                >
                  {currentQ.scaleRange?.map((num) => (
                    <div key={num} className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value={num.toString()} id={`scale-${num}`} />
                      <Label htmlFor={`scale-${num}`} className="text-sm font-medium">
                        {num}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {currentQ.scaleLabels && (
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{currentQ.scaleLabels[0]}</span>
                    <span>{currentQ.scaleLabels[1]}</span>
                  </div>
                )}
              </div>
            )}

            {getGrowthInsight()}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center bg-transparent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {currentQuestion === questions.length - 1 ? "Complete Simulation" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
