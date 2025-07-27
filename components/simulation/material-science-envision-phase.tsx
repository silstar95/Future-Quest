"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Rocket, Target, BookOpen, Lightbulb } from "lucide-react"

interface MaterialScienceEnvisionData {
  careerGoals: string
  actionPlan: string
  nextSteps: string
}

interface MaterialScienceEnvisionPhaseProps {
  onComplete: (data: MaterialScienceEnvisionData) => void
  initialData?: MaterialScienceEnvisionData
}

export function MaterialScienceEnvisionPhase({ onComplete, initialData }: MaterialScienceEnvisionPhaseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<MaterialScienceEnvisionData>(
    initialData || {
      careerGoals: "",
      actionPlan: "",
      nextSteps: "",
    },
  )

  const questions = [
    {
      id: "careerGoals",
      title: "Envision Your Future",
      question:
        "Based on your experience in this simulation, how do you envision yourself potentially working in materials science? What specific areas or applications interest you most?",
      placeholder:
        "Consider areas like:\n• Superconductor research and development\n• Nanotechnology and advanced materials\n• Sustainable materials and green technology\n• Aerospace and automotive materials\n• Biomedical materials and devices\n\nDescribe what appeals to you and why...",
      icon: Target,
      type: "textarea" as const,
    },
    {
      id: "actionPlan",
      title: "Create Your Action Plan",
      question:
        "What specific steps will you take to explore materials science further? Create a concrete action plan for the next 6-12 months.",
      placeholder:
        "Your action plan might include:\n• Courses to take (chemistry, physics, engineering)\n• Research opportunities to pursue\n• Professionals to connect with\n• Internships or programs to apply for\n• Skills to develop\n• Books or resources to explore\n\nBe specific about timelines and goals...",
      icon: BookOpen,
      type: "textarea" as const,
    },
    {
      id: "nextSteps",
      title: "Immediate Next Steps",
      question:
        "What are the first 3 concrete actions you will take in the next month to move closer to your materials science goals?",
      placeholder:
        "Examples of immediate actions:\n1. Research materials science programs at universities I'm interested in\n2. Reach out to 2 materials scientists from my LinkedIn list for informational interviews\n3. Sign up for an advanced chemistry or physics course\n\nList your specific next steps...",
      icon: Rocket,
      type: "textarea" as const,
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
    const currentValue = formData[currentQ.id as keyof MaterialScienceEnvisionData]
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

  const IconComponent = currentQ.icon

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl flex items-center">
              <Rocket className="mr-3 h-6 w-6 text-green-500" />
              Envision Your Future
            </CardTitle>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">🚀 Plan Your Materials Science Journey</h3>
              <p className="text-gray-700">
                You've explored materials science careers, experienced hands-on research, and connected with
                professionals. Now it's time to envision your future path and create a concrete plan to achieve your
                goals.
              </p>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mr-4">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-1">{currentQ.title}</h3>
                <p className="text-xl text-gray-800 leading-relaxed">{currentQ.question}</p>
              </div>
            </div>

            <div className="mt-6">
              <Textarea
                value={formData[currentQ.id as keyof MaterialScienceEnvisionData]}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[200px] text-base"
                rows={8}
              />
            </div>

            {/* Contextual tips for each question */}
            {currentQuestion === 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Materials Science Career Areas
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700">
                  <div>
                    <strong>Research & Development:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Superconductor research</li>
                      <li>• Nanotechnology</li>
                      <li>• Smart materials</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Industry Applications:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Aerospace materials</li>
                      <li>• Medical devices</li>
                      <li>• Sustainable technology</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion === 1 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Action Plan Framework
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div>
                    <strong>Education:</strong> What courses, degrees, or certifications do you need?
                  </div>
                  <div>
                    <strong>Experience:</strong> What hands-on opportunities will you seek?
                  </div>
                  <div>
                    <strong>Network:</strong> Who will you connect with in the field?
                  </div>
                  <div>
                    <strong>Skills:</strong> What technical and soft skills will you develop?
                  </div>
                  <div>
                    <strong>Timeline:</strong> When will you accomplish each goal?
                  </div>
                </div>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <Rocket className="mr-2 h-4 w-4" />
                  Making It Actionable
                </h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <div>• Be specific: "Research 5 materials science programs" vs "Look into colleges"</div>
                  <div>• Set deadlines: "By next Friday" vs "Soon"</div>
                  <div>• Make it measurable: "Contact 3 professionals" vs "Network more"</div>
                  <div>• Start small: Choose actions you can realistically complete</div>
                </div>
              </div>
            )}
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
              className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {currentQuestion === questions.length - 1 ? "Complete Envision Phase" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
