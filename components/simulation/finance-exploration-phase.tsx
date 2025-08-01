"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Play, Clock, CheckCircle, ArrowRight, Eye, BookOpen, ExternalLink, Youtube } from "lucide-react"

interface FinanceExplorationPhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

export default function FinanceExplorationPhase({ onComplete, initialData }: FinanceExplorationPhaseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [answers, setAnswers] = useState({
    financeDefinition: initialData?.financeDefinition || "",
    financeRoles: initialData?.financeRoles || "",
    videoWatched: initialData?.videoWatched || false,
    explorationCompleted: initialData?.explorationCompleted || false,
  })

  const steps = [
    {
      id: "framework",
      title: "Exploration Framework",
      description: "Learn about our systematic approach to career exploration",
    },
    {
      id: "video",
      title: "Watch Finance Overview",
      description: "Get introduced to various finance roles and careers",
    },
    {
      id: "research",
      title: "Personal Research",
      description: "Explore specific finance roles that interest you",
    },
    {
      id: "reflection",
      title: "Reflection Questions",
      description: "Summarize your learning and insights",
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        ...answers,
        timeSpent,
        explorationCompleted: true,
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleVideoWatched = () => {
    setAnswers((prev) => ({ ...prev, videoWatched: true }))
  }

  const isStepComplete = () => {
    switch (currentStep) {
      case 0: // Framework
        return true
      case 1: // Video
        return answers.videoWatched
      case 2: // Research
        return true // Allow progression after some time
      case 3: // Reflection
        return answers.financeDefinition.trim().length > 0 && answers.financeRoles.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Explore Finance Careers</CardTitle>
                <CardDescription className="text-white/80">
                  Discover the diverse world of finance through research and exploration
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-blue-100">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Exploration Framework</h3>
                <p className="text-gray-600 mb-6">
                  Before we dive into exploring careers in Finance, here is an exploration framework we are using. This
                  covers all aspects of learning about something new that can be applied in any situation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-4 text-center">The 5 E's Framework</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {["Explore", "Experience", "Engage", "Evaluate", "Envision"].map((step, index) => (
                    <div key={step} className="text-center">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                        {index + 1}
                      </div>
                      <div className="font-semibold text-blue-800">{step}</div>
                    </div>
                  ))}
                </div>
                <p className="text-blue-700 text-sm mt-4 text-center">
                  Review this framework as you can apply it in different situations. The entire module is designed
                  following this framework and you will see that different parts of the module are labeled with parts of
                  this framework.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Finance Career Overview</h3>
                <p className="text-gray-600 mb-6">
                  Let's start out by exploring the field of finance. First, watch the video below for a brief overview
                  of some roles in the field.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Youtube className="w-8 h-8 text-green-600 mr-2" />
                    <h4 className="text-xl font-semibold text-gray-800">Finance Careers Overview</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Watch this video to learn about various finance roles and career paths</p>
                </div>
                
                <div 
                  className="relative w-full h-64 bg-gradient-to-br from-green-500 to-yellow-600 rounded-lg cursor-pointer group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.open('https://www.youtube.com/watch?v=GWVl7kZKNgc', '_blank')}
                >
                  {/* Video Thumbnail Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-red-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="font-medium">Finance Careers Overview</p>
                        <p className="text-sm opacity-90">Learn about various finance roles</p>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-70" />
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-red-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button
                    onClick={handleVideoWatched}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={answers.videoWatched}
                  >
                    {answers.videoWatched ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Video Watched
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Mark as Watched
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Click the video above to watch on YouTube
                  </p>
                </div>
              </div>

              {answers.videoWatched && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 text-center">
                    ✅ Great! Now you have a foundation understanding of finance careers. Let's move on to personal
                    research.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Personal Research Time</h3>
                <p className="text-gray-600 mb-6">
                  Now, do a bit more exploring on your own to learn about 1-2 of these roles that may be interesting to
                  you, and what companies are hiring for that role.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Research Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Look up job descriptions on LinkedIn or Indeed</li>
                      <li>• Research salary ranges for different roles</li>
                      <li>• Find companies that hire for these positions</li>
                      <li>• Read about required skills and qualifications</li>
                      <li>• Explore career progression paths</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Finance Roles to Explore</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        "Financial Analyst",
                        "Investment Advisor",
                        "Corporate Treasurer",
                        "Risk Manager",
                        "Financial Planner",
                        "Investment Banker",
                        "Credit Analyst",
                        "Portfolio Manager",
                      ].map((role) => (
                        <Badge key={role} variant="outline" className="mr-2 mb-2">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-center">
                  💡 Take your time to research. When you're ready, click Next to reflect on what you've learned.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Reflection Questions</h3>
                <p className="text-gray-600 mb-6">
                  Based on your research and the video, please answer the following questions:
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Give a 1-2 sentence summary of what Finance is.
                  </label>
                  <Textarea
                    value={answers.financeDefinition}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, financeDefinition: e.target.value }))}
                    placeholder="Describe what finance is in your own words..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List 3-4 roles that exist within this industry.
                  </label>
                  <Textarea
                    value={answers.financeRoles}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, financeRoles: e.target.value }))}
                    placeholder="List finance roles and briefly describe what each one does..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 bg-transparent"
            >
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="px-6 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-accent"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Complete Exploration
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
