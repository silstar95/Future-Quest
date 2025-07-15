"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Lightbulb, ArrowRight } from "lucide-react"

interface ExplorationPhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

export function ExplorationPhase({ onComplete, initialData }: ExplorationPhaseProps) {
  const [timeSpent, setTimeSpent] = useState(0)
  const [isResearching, setIsResearching] = useState(false)
  const [answers, setAnswers] = useState({
    summary: initialData?.summary || "",
    roles: initialData?.roles || "",
    companies: initialData?.companies || "",
  })

  const minResearchTime = 10 * 60 // 10 minutes in seconds
  const recommendedTime = 15 * 60 // 15 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResearching) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
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
    })
  }

  const canComplete =
    timeSpent >= minResearchTime &&
    answers.summary.trim() !== "" &&
    answers.roles.trim() !== "" &&
    answers.companies.trim() !== ""

  const researchProgress = Math.min((timeSpent / recommendedTime) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-3 h-6 w-6 text-green-600" />
            Explore: Research Branding & Marketing Careers
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            To begin, we'll start with the first E of Career Exploration - <strong>Explore</strong>. Exploring means
            researching to learn more about a specific industry.
          </p>
        </CardHeader>
      </Card>

      {/* Research Timer */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Research Timer
            </div>
            <Badge variant={timeSpent >= minResearchTime ? "default" : "secondary"}>{formatTime(timeSpent)}</Badge>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Minimum: 10 minutes</span>
              <span>Recommended: 15 minutes</span>
            </div>
            <Progress value={researchProgress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {!isResearching ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Begin by doing an internet search of Branding and Marketing careers. See what you can find about the
                industry and individual roles.
              </p>
              <Button onClick={handleStartResearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Start Research Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Research Tip
                </h4>
                <p className="text-blue-700 text-sm">
                  Try searching for job boards, company career pages, and industry websites to find current openings and
                  detailed role descriptions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <h4 className="font-medium">Suggested Search Terms:</h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• "Brand manager jobs"</li>
                      <li>• "Marketing coordinator roles"</li>
                      <li>• "Digital marketing careers"</li>
                      <li>• "Creative director positions"</li>
                      <li>• "Social media manager"</li>
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
                      <li>• Company career pages</li>
                      <li>• Bureau of Labor Statistics</li>
                      <li>• Marketing industry blogs</li>
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
                Once you've spent about 10-15 minutes researching, fill in your responses to the questions below.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Give a 1-2 sentence summary of what Branding & Marketing is.
                </label>
                <Textarea
                  value={answers.summary}
                  onChange={(e) => handleAnswerChange("summary", e.target.value)}
                  placeholder="Describe what branding and marketing involves..."
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
                  3. Name a few companies that are actively hiring for Branding & Marketing roles.
                </label>
                <Textarea
                  value={answers.companies}
                  onChange={(e) => handleAnswerChange("companies", e.target.value)}
                  placeholder="List companies and what types of marketing roles they're hiring for..."
                  className="min-h-20"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Ready to Continue?</h4>
                  <p className="text-sm text-green-700">
                    {timeSpent >= minResearchTime
                      ? "Great job! You've completed the minimum research time."
                      : `Continue researching for ${Math.ceil((minResearchTime - timeSpent) / 60)} more minutes.`}
                  </p>
                </div>
                <Button onClick={handleComplete} disabled={!canComplete} className="bg-green-600 hover:bg-green-700">
                  Complete Exploration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
