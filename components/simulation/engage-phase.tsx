"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Users, MessageCircle, Linkedin } from "lucide-react"

interface EngageData {
  linkedinProfiles: string
  questions: string
}

interface EngagePhaseProps {
  onComplete: (data: EngageData) => void
  initialData?: EngageData
}

export function EngagePhase({ onComplete, initialData }: EngagePhaseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<EngageData>(
    initialData || {
      linkedinProfiles: "",
      questions: "",
    },
  )

  const questions = [
    {
      id: "linkedinProfiles",
      title: "Connect with Professionals",
      question:
        "Identify 5 people you would like to speak to learn more about the work they do. Add their LinkedIn profiles.",
      placeholder:
        "Example:\n1. John Smith - Brand Manager at Nike (linkedin.com/in/johnsmith)\n2. Sarah Johnson - Marketing Director at Apple (linkedin.com/in/sarahjohnson)\n3. ...",
      icon: Linkedin,
      type: "textarea" as const,
    },
    {
      id: "questions",
      title: "Prepare Your Questions",
      question:
        "Write down 5 questions you would want to ask someone in these roles to learn more about what they do and what they do/don't enjoy about their jobs. Frame these questions in a way that you are learning more about the actual work that someone in their role does.",
      placeholder:
        "Example:\n1. What does a typical day look like in your role?\n2. What aspects of your job do you find most rewarding?\n3. What challenges do you face regularly in your work?\n4. What skills are most important for success in this field?\n5. What advice would you give to someone starting in this career?",
      icon: MessageCircle,
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
    const currentValue = formData[currentQ.id as keyof EngageData]
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
              <Users className="mr-3 h-6 w-6 text-blue-500" />
              Engage
            </CardTitle>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">🎉 Congratulations!</h3>
              <p className="text-gray-700">
                You've finished experiencing a range of projects encountered by branding and marketing roles. Now, it's
                time to learn more through engaging with real people who are in these roles.
              </p>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-1">{currentQ.title}</h3>
                <p className="text-xl text-gray-800 leading-relaxed">{currentQ.question}</p>
              </div>
            </div>

            <div className="mt-6">
              <Textarea
                value={formData[currentQ.id as keyof EngageData]}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[200px] text-base"
                rows={8}
              />
            </div>

            {currentQuestion === 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Finding LinkedIn Profiles:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Search for job titles like "Brand Manager," "Marketing Director," "Social Media Strategist"</li>
                  <li>• Look at companies you admire and browse their employee profiles</li>
                  <li>• Check if your school has alumni working in these roles</li>
                  <li>• Include their full LinkedIn URL for easy reference</li>
                </ul>
              </div>
            )}

            {currentQuestion === 1 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">💡 Tips for Great Questions:</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Focus on day-to-day responsibilities and tasks</li>
                  <li>• Ask about both challenges and rewards of the role</li>
                  <li>• Inquire about required skills and qualifications</li>
                  <li>• Ask for advice on breaking into the field</li>
                  <li>• Be specific about what you want to learn</li>
                </ul>
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
              className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {currentQuestion === questions.length - 1 ? "Continue to Evaluation" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
