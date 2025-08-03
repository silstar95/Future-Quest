"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Users, MessageCircle, Linkedin, Play } from "lucide-react"

interface MaterialScienceEngageData {
  linkedinProfiles: string
  questions: string
  videoWatched: boolean
}

interface MaterialScienceEngagePhaseProps {
  onComplete: (data: MaterialScienceEngageData) => void
  initialData?: MaterialScienceEngageData
}

export function MaterialScienceEngagePhase({ onComplete, initialData }: MaterialScienceEngagePhaseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<MaterialScienceEngageData>(
    initialData || {
      linkedinProfiles: "",
      questions: "",
      videoWatched: false,
    },
  )

  const questions = [
    {
      id: "video",
      title: "Learn from Professionals",
      question: "Before you move to the final reflection, please watch this video on what a materials scientist is:",
      videoUrl: "https://www.youtube.com/watch?v=9at6Tm4e-qY",
      type: "video" as const,
    },
    {
      id: "linkedinProfiles",
      title: "Connect with Professionals",
      question:
        "Identify 5 people you would like to speak to learn more about the work they do. Add their LinkedIn profiles.",
      placeholder:
        "Example:\n1. Dr. Sarah Chen - Materials Scientist at Tesla (linkedin.com/in/sarahchen)\n2. Prof. Michael Rodriguez - Materials Engineering at MIT (linkedin.com/in/mrodriguez)\n3. ...",
      icon: Linkedin,
      type: "textarea" as const,
    },
    {
      id: "questions",
      title: "Prepare Your Questions",
      question:
        "Write down 5 questions you would want to ask someone in materials science roles to learn more about what they do and what they do/don't enjoy about their jobs. Frame these questions in a way that you are learning more about the actual work that someone in their role does.",
      placeholder:
        "Example:\n1. What does a typical day look like in your materials science role?\n2. What aspects of materials research do you find most rewarding?\n3. What are the biggest challenges in developing new materials?\n4. What skills are most important for success in materials science?\n5. What advice would you give to someone starting in this career?",
      icon: MessageCircle,
      type: "textarea" as const,
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleInputChange = (value: string) => {
    if (currentQ.id === "video") {
      setFormData((prev) => ({
        ...prev,
        videoWatched: true,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [currentQ.id]: value,
      }))
    }
  }

  const canProceed = () => {
    if (currentQ.id === "video") {
      return formData.videoWatched
    }
    const currentValue = formData[currentQ.id as keyof MaterialScienceEngageData]
    return currentValue && typeof currentValue === "string" && currentValue.trim() !== ""
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

  const IconComponent = currentQ.icon || Play

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl flex items-center">
              <Users className="mr-3 h-6 w-6 text-brand-primary" />
              Engage
            </CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-brand-accent/10 to-brand-highlight/10 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">🎉 Congratulations!</h3>
              <p className="text-gray-700">
                You've finished experiencing a range of projects encountered by materials science roles. Now, it's time
                to learn more through engaging with real people who are in these roles.
              </p>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mr-4">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-primary mb-1">{currentQ.title}</h3>
                <p className="text-xl text-gray-800 leading-relaxed">{currentQ.question}</p>
              </div>
            </div>

            <div className="mt-6">
              {currentQ.type === "video" && (
                <div className="space-y-4">
                  <div className="bg-brand-accent/10 p-4 rounded-lg border border-brand-accent/30">
                    <h4 className="font-semibold text-brand-primary mb-2">📹 Video: What is a Materials Scientist?</h4>
                    <p className="text-brand-secondary text-sm mb-3">
                      Watch this video to learn directly from materials science professionals about their work and
                      career paths.
                    </p>
                    <div className="flex items-center gap-4">
                      <a
                        href={currentQ.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch on YouTube
                      </a>
                      <Button
                        onClick={() => handleInputChange("watched")}
                        variant="outline"
                        className="border-brand-accent text-brand-primary hover:bg-brand-accent/10"
                      >
                        Mark as Watched
                      </Button>
                    </div>
                  </div>

                  {formData.videoWatched && (
                    <div className="bg-brand-highlight/10 p-4 rounded-lg border border-brand-highlight/30">
                      <div className="flex items-center">
                        <ChevronRight className="w-5 h-5 text-brand-highlight mr-2" />
                        <span className="text-brand-primary font-medium">
                          Great! You can now proceed to the next step.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentQ.type === "textarea" && (
                <Textarea
                  value={formData[currentQ.id as keyof MaterialScienceEngageData] as string}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="min-h-[200px] text-base"
                  rows={8}
                />
              )}
            </div>

            {currentQuestion === 1 && (
              <div className="mt-4 p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">💡 Tips for Finding LinkedIn Profiles:</h4>
                <ul className="text-brand-secondary text-sm space-y-1">
                  <li>
                    • Search for job titles like "Materials Scientist," "Materials Engineer," "Research Scientist"
                  </li>
                  <li>• Look at companies like Tesla, Boeing, 3M, Intel, and research universities</li>
                  <li>• Check if your school has alumni working in materials science</li>
                  <li>• Include their full LinkedIn URL for easy reference</li>
                </ul>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="mt-4 p-4 bg-brand-highlight/10 border border-brand-highlight/30 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">💡 Tips for Great Questions:</h4>
                <ul className="text-brand-secondary text-sm space-y-1">
                  <li>• Focus on day-to-day responsibilities and research projects</li>
                  <li>• Ask about both challenges and rewards of materials science work</li>
                  <li>• Inquire about required skills and educational background</li>
                  <li>• Ask for advice on breaking into the materials science field</li>
                  <li>• Be specific about what aspects of materials science interest you most</li>
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
              className="flex items-center bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90"
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
