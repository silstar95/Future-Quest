"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Lightbulb, ArrowRight, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MaterialScienceExplorationPhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

export function MaterialScienceExplorationPhase({ onComplete, initialData }: MaterialScienceExplorationPhaseProps) {
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0)
  const [isResearching, setIsResearching] = useState(initialData?.isResearching || false)
  const [answers, setAnswers] = useState({
    summary: initialData?.summary || "",
    roles: initialData?.roles || "",
    companies: initialData?.companies || "",
  })
  const [showWarning, setShowWarning] = useState(false)

  const minResearchTime = 1 * 60 // 1 minute in seconds
  const recommendedTime = 5 * 60 // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResearching) {
      interval = setInterval(() => {
        setTimeSpent((prev: any) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResearching])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartResearch = () => {
    setIsResearching(true)
  }

  const handleAnswerChange = (field: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleComplete = () => {
    setIsResearching(false)
    onComplete({
      ...answers,
      timeSpent,
      researchCompleted: timeSpent >= minResearchTime,
      completedAt: new Date().toISOString(),
    })
  }

  const handleContinueWithWarning = () => {
    if (timeSpent < recommendedTime) {
      setShowWarning(true)
    } else {
      handleComplete()
    }
  }

  const canComplete = answers.summary.trim() !== "" && answers.roles.trim() !== "" && answers.companies.trim() !== ""

  const researchProgress = Math.min((timeSpent / recommendedTime) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Header */}
      <Card className="bg-gradient-to-r from-brand-accent/10 to-brand-highlight/10 border-2 border-brand-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-3 h-6 w-6 text-brand-primary" />
            Explore: Research Materials Science Careers
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            Let's start out by exploring the field of materials science. Take some time to search online what a
            materials scientist does. Then, in the text box below, write what you believe a materials scientist does and
            a few places they may work or projects they might work on.
          </p>
        </CardHeader>
      </Card>

      {/* Research Timer */}
      <Card className="border-2 border-brand-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-brand-primary" />
              Research Timer
            </div>
            <Badge variant={timeSpent >= minResearchTime ? "default" : "secondary"}>{formatTime(timeSpent)}</Badge>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Suggested: 5 minutes</span>
              <span>{Math.round(researchProgress)}%</span>
            </div>
            <Progress value={researchProgress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {!isResearching ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Begin by doing an internet search of Materials Science careers. See what you can find about the industry
                and individual roles.
              </p>
              <Button onClick={handleStartResearch} className="bg-brand-primary hover:bg-brand-primary/90">
                <Search className="mr-2 h-4 w-4" />
                Start Research Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-brand-accent/10 p-4 rounded-lg border border-brand-accent/30">
                <h4 className="font-semibold text-brand-primary mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Research Tip
                </h4>
                <p className="text-brand-secondary text-sm">
                  Try searching for materials engineering jobs, research positions, and industry websites to find
                  current openings and detailed role descriptions in materials science.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <h4 className="font-medium">Suggested Search Terms:</h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• "Materials scientist jobs"</li>
                      <li>• "Materials engineer careers"</li>
                      <li>• "Superconductor research"</li>
                      <li>• "Nanotechnology positions"</li>
                      <li>• "Metallurgist roles"</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <h4 className="font-medium">Helpful Websites:</h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• LinkedIn Jobs</li>
                      <li>• Indeed.com</li>
                      <li>• Materials Research Society</li>
                      <li>• Bureau of Labor Statistics</li>
                      <li>• University research pages</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Questions */}
      {isResearching && (
        <div className="space-y-6">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>Research Questions</CardTitle>
              <p className="text-gray-600">
                Review the questions below and take notes that will help you answer them. Once you've spent about 10-15
                minutes researching, fill in your responses to the questions in this section.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Give a 1-2 sentence summary of what Materials Science is.
                </label>
                <Textarea
                  value={answers.summary}
                  onChange={(e) => handleAnswerChange("summary", e.target.value)}
                  placeholder="Describe what materials science involves..."
                  className="min-h-20"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. List 3-4 roles that exist within this industry.
                </label>
                <Textarea
                  value={answers.roles}
                  onChange={(e) => handleAnswerChange("roles", e.target.value)}
                  placeholder="List specific job roles and briefly describe what they do..."
                  className="min-h-24"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Name a few companies that are actively hiring for Materials Science roles.
                </label>
                <Textarea
                  value={answers.companies}
                  onChange={(e) => handleAnswerChange("companies", e.target.value)}
                  placeholder="List companies and what types of materials science roles they're hiring for..."
                  className="min-h-20"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <Card className="border-2 border-brand-highlight/30 bg-brand-highlight/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-brand-primary">Ready to Continue?</h4>
                  <p className="text-sm text-brand-secondary">
                    {timeSpent >= recommendedTime
                      ? "Great job! You've completed the recommended research time."
                      : `Continue researching for ${Math.ceil((recommendedTime - timeSpent) / 60)} more minutes for best results.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-brand-highlight hover:bg-brand-highlight/90"
                        disabled={!canComplete}
                        onClick={handleContinueWithWarning}
                      >
                        Complete Exploration
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                          Quick Check-In
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to move ahead? You have only spent {formatTime(timeSpent)}. We suggest
                          spending at least 5 minutes to get the most out of this experience.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Continue Researching</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete}>Yes, I'm Ready to Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
