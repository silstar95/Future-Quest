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

interface GovernmentExplorationResearchProps {
  onComplete: (data: any) => void
  initialData?: any
}

export default function GovernmentExplorationResearch({ onComplete, initialData }: GovernmentExplorationResearchProps) {
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0)
  const [isResearching, setIsResearching] = useState(initialData?.isResearching || false)
  const [answers, setAnswers] = useState({
    summary: initialData?.summary || "",
    roles: initialData?.roles || "",
    organizations: initialData?.organizations || "",
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

  const canComplete =
    answers.summary.trim() !== "" && answers.roles.trim() !== "" && answers.organizations.trim() !== ""

  const researchProgress = Math.min((timeSpent / recommendedTime) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Header */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-3 h-6 w-6" />
            Explore: Research Government & Politics Careers
          </CardTitle>
          <p className="text-[#f0ad70] leading-relaxed">
            To begin, we'll start with the first E of Career Exploration - <strong>Explore</strong>. Exploring means
            researching to learn more about a specific industry.
          </p>
        </CardHeader>
      </Card>

      {/* Research Timer */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-[#2d407e]" />
              Research Timer
            </div>
            <Badge variant={timeSpent >= minResearchTime ? "default" : "secondary"} className="bg-[#2d407e] text-white">
              {formatTime(timeSpent)}
            </Badge>
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
                Begin by doing an internet search of Government and Politics careers. See what you can find about the
                industry and individual roles.
              </p>
              <Button onClick={handleStartResearch} className="bg-[#2d407e] hover:bg-[#0e3968]">
                <Search className="mr-2 h-4 w-4" />
                Start Research Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 p-4 rounded-lg border border-[#db9b6c]/30">
                <h4 className="font-semibold text-[#2d407e] mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Research Tip
                </h4>
                <p className="text-[#4e3113] text-sm">
                  Try searching for government job boards, political organizations, and public administration programs
                  to find current openings and detailed role descriptions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <h4 className="font-medium">Suggested Search Terms:</h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• "Government jobs"</li>
                      <li>• "Political careers"</li>
                      <li>• "Public administration roles"</li>
                      <li>• "Congressional staff positions"</li>
                      <li>• "Policy analyst jobs"</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <h4 className="font-medium">Helpful Websites:</h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• USAJobs.gov</li>
                      <li>• Congress.gov</li>
                      <li>• Government career pages</li>
                      <li>• Bureau of Labor Statistics</li>
                      <li>• Political organization websites</li>
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
          <Card className="border-2 border-gray-200 shadow-lg">
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
                  1. Give a 1-2 sentence summary of what Government & Politics careers involve.
                </label>
                <Textarea
                  value={answers.summary}
                  onChange={(e) => handleAnswerChange("summary", e.target.value)}
                  placeholder="Describe what government and politics careers involve..."
                  className="min-h-20"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. List 3-4 roles that exist within the government and politics industry.
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
                  3. Name a few organizations or agencies that actively hire for Government & Politics roles.
                </label>
                <Textarea
                  value={answers.organizations}
                  onChange={(e) => handleAnswerChange("organizations", e.target.value)}
                  placeholder="List government agencies, political organizations, or related employers..."
                  className="min-h-20"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <Card className="border-2 border-[#f0ad70]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#2d407e]">Ready to Continue?</h4>
                  <p className="text-sm text-[#4e3113]">
                    {timeSpent >= recommendedTime
                      ? "Great job! You've completed the recommended research time."
                      : `Continue researching for ${Math.ceil((recommendedTime - timeSpent) / 60)} more minutes for best results.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349] text-white"
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
