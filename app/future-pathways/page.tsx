"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { careerDataService, type StudentCareerData } from "@/lib/career-data-service"
import { aiCareerService } from "@/lib/ai-services"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Target,
  DollarSign,
  Clock,
  Star,
  ArrowRight,
  Download,
  RefreshCw,
  GraduationCap,
  Lightbulb,
  School,
  CheckCircle,
  Brain,
  Sparkles,
  BookOpen,
} from "lucide-react"

interface AICareerInsights {
  careerRecommendations: Array<{
    title: string
    overview: string
    averageSalary: string
    educationPath: {
      requiredLevel: string
      commonMajors: string[]
      optionalCertifications?: string[]
    }
    whyThisRole: string
    growthOutlook: string
    keySkills: string[]
    workEnvironment: string
  }>
  suggestedSimulations: string[]
  keyStrengths: string[]
  developmentAreas: string[]
  personalityInsights: string
  nextSteps: string[]
}

export default function FuturePathwaysPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentCareerData | null>(null)
  const [aiInsights, setAiInsights] = useState<AICareerInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workYouLoved, setWorkYouLoved] = useState<any[]>([])
  const [analysisAttempts, setAnalysisAttempts] = useState(0)

  const simulations = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description: "Master branding and marketing strategies through celebrity brand building",
      duration: "4-6 hours",
      category: "Marketing",
    },
    {
      id: "finance-simulation",
      title: "Risk, Reward, and Real World Finance",
      description: "Navigate the risks and rewards of managing company finances while exploring finance careers",
      duration: "3-4 hours",
      category: "Finance",
    },
    {
      id: "material-science",
      title: "MagLev Makers: Engineering a Superconductor",
      description: "Explore cutting-edge material science and innovation",
      duration: "1-2 hours",
      category: "Science",
    },
    {
      id: "government-simulation",
      title: "Inside the Hill",
      description:
        "Navigate congressional processes and stakeholder engagement to pass the WATER Act through strategic political maneuvering",
      duration: "2-3 hours",
      category: "Government",
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadStudentData()
    }
  }, [user, loading, router])

  const loadStudentData = async () => {
    if (!user) return

    try {
      setIsAnalyzing(true)
      setError(null)
      setAnalysisAttempts((prev) => prev + 1)

      console.log("🔄 Loading student career data...")

      // Get student data
      const data = await careerDataService.getStudentCareerData(user.uid)
      if (!data) {
        setError("Unable to load your career data. Please try again.")
        return
      }

      console.log("📊 Student data loaded:", data)
      console.log(
        "📝 Reflection data details:",
        data.reflectionData.map((r) => ({
          simulation: r.simulationType,
          completed: r.completedAt ? "Yes" : "No",
          enjoyment: r.enjoymentRating,
          favorite: r.favoriteTask,
          skills: r.skillsLearned,
          career: r.careerInterest,
        })),
      )

      setStudentData(data)

      // Check if student has completed any simulations
      if (data.reflectionData.length === 0) {
        setError("Complete at least one simulation to see your personalized career insights!")
        return
      }

      console.log("🤖 Starting AI analysis with reflection data:", data.reflectionData.length, "simulations")

      // Analyze with AI - pass more detailed context
      const insights = await aiCareerService.analyzeStudentReflections(data.reflectionData, data.onboardingData)

      console.log("✅ AI analysis complete:", insights)
      setAiInsights(insights)

      // Extract "Work You Loved" with more specific criteria
      const lovedWork = data.reflectionData
        .filter((data) => {
          const enjoyment = data.enjoymentRating
          const interest = data.interestLevel
          const hasMeaningfulResponses =
            (data.favoriteTask && data.favoriteTask.length > 10) ||
            (data.careerInterest && data.careerInterest.length > 5) ||
            (data.skillsLearned && data.skillsLearned.length > 10)

          return (enjoyment && enjoyment >= 6) || (interest && interest >= 3) || hasMeaningfulResponses
        })
        .map((data) => ({
          simulationType: formatSimulationType(data.simulationType),
          enjoymentRating: data.enjoymentRating,
          interestLevel: data.interestLevel,
          favoriteTask: data.favoriteTask,
          skillsLearned: data.skillsLearned,
          careerInterest: data.careerInterest,
          challengingTask: data.challengingTask,
          completedAt: data.completedAt,
        }))

      console.log("💖 Work you loved data:", lovedWork)
      setWorkYouLoved(lovedWork)
    } catch (error) {
      console.error("❌ Error loading student data:", error)
      setError("An error occurred while analyzing your career data. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatSimulationType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      "brand-marketing": "Brand & Marketing",
      "finance-simulation": "Finance & Investment",
      "material-science": "Material Science",
      "government-simulation": "Government & Politics",
    }
    return typeMap[type] || type
  }

  const handleSimulationStart = (simulationId: string) => {
    router.push(`/simulation/${simulationId}`)
  }

  const handleDownloadReport = () => {
    // Generate and download a PDF report
    console.log("Downloading career report...")
    // This would integrate with a PDF generation service
    alert("Report download feature coming soon!")
  }

  const getAlternativePathways = () => {
    if (!aiInsights) return []

    const careerCategories = aiInsights.careerRecommendations.map((career) =>
      career.title.toLowerCase().includes("marketing") || career.title.toLowerCase().includes("brand")
        ? "marketing"
        : career.title.toLowerCase().includes("financial") || career.title.toLowerCase().includes("analyst")
          ? "finance"
          : career.title.toLowerCase().includes("materials") || career.title.toLowerCase().includes("engineer")
            ? "science"
            : career.title.toLowerCase().includes("policy") || career.title.toLowerCase().includes("government")
              ? "government"
              : "general",
    )
    return aiCareerService.getAlternativePathways(careerCategories)
  }

  const getCompletedSimulationsCount = () => {
    if (!studentData || !studentData.reflectionData) return 0
    // Count unique simulationType values
    const unique = new Set(studentData.reflectionData.map((r: any) => r.simulationType))
    return unique.size
  }

  const getCompletedSimulationTitles = () => {
    if (!studentData || !studentData.reflectionData) return []
    const unique = new Set(studentData.reflectionData.map((r: any) => formatSimulationType(r.simulationType)))
    return Array.from(unique)
  }

  if (loading || isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <DashboardHeader
          title="Future Pathways"
          subtitle="AI-powered career insights based on your simulation experiences"
          showBackButton={true}
          backUrl="/dashboard/student"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2">
                {loading ? "Loading..." : "Analyzing Your Career Journey..."}
              </h3>
              <p className="text-blue-600 mb-4">
                {loading
                  ? "Please wait while we load your data"
                  : `Our AI is analyzing your ${getCompletedSimulationsCount()} completed simulation${getCompletedSimulationsCount() > 1 ? "s" : ""} to provide personalized career recommendations`}
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              {isAnalyzing && (
                <div className="mt-4 text-sm text-blue-600">
                  <p>🤖 Processing your reflection responses...</p>
                  <p>🎯 Matching your interests to career paths...</p>
                  <p>✨ Generating personalized recommendations...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <DashboardHeader
          title="Future Pathways"
          subtitle="AI-powered career insights based on your simulation experiences"
          showBackButton={true}
          backUrl="/dashboard/student"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <Brain className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Unable to Load Career Insights</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <div className="space-x-4">
                <Button onClick={loadStudentData} className="bg-red-600 text-white hover:bg-red-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again {analysisAttempts > 1 && `(Attempt ${analysisAttempts})`}
                </Button>
                <Button
                  onClick={() => router.push("/simulations")}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Explore Simulations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!studentData || !aiInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        <DashboardHeader
          title="Future Pathways"
          subtitle="AI-powered career insights based on your simulation experiences"
          showBackButton={true}
          backUrl="/dashboard/student"
        />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-6">Complete some simulations to see your personalized career insights!</p>
              <Button onClick={() => router.push("/simulations")} className="bg-blue-600 text-white hover:bg-blue-700">
                Start Your First Simulation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <DashboardHeader
        title="Your Future Pathways"
        subtitle="AI-powered career insights based on your simulation experiences"
        showBackButton={true}
        backUrl="/dashboard/student"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Success Banner */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1 text-green-800">
                    🎉 Great job on completing your simulation{getCompletedSimulationsCount() > 1 ? "s" : ""}!
                  </h1>
                  <p className="text-green-700 text-lg">
                    Based on your reflections from {getCompletedSimulationTitles().join(", ")}, here are some careers
                    you might want to explore:
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">{getCompletedSimulationsCount()}</div>
                <div className="text-green-600 text-sm">
                  Simulation{getCompletedSimulationsCount() > 1 ? "s" : ""} Complete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work You Loved Section */}
        {workYouLoved && workYouLoved.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-blue-800">
                <Star className="mr-3 h-6 w-6 text-yellow-500" />
                Work You Loved
              </CardTitle>
              <CardDescription className="text-blue-600 text-lg">
                Highlights from your simulation experiences that show your interests and strengths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {workYouLoved.map((work, index) => (
                  <Card key={index} className="bg-white border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-blue-900">{work.simulationType}</span>
                        <div className="flex gap-2">
                          {work.enjoymentRating && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {work.enjoymentRating}/10 ⭐
                            </Badge>
                          )}
                          {work.interestLevel && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Interest: {work.interestLevel}/5
                            </Badge>
                          )}
                        </div>
                      </div>
                      {work.favoriteTask && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Favorite Task:</span>
                          <p className="text-sm text-gray-600 mt-1">"{work.favoriteTask}"</p>
                        </div>
                      )}
                      {work.skillsLearned && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Skills Learned:</span>
                          <p className="text-sm text-gray-600 mt-1">{work.skillsLearned}</p>
                        </div>
                      )}
                      {work.careerInterest && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Career Interest:</span>
                          <p className="text-sm text-gray-600 mt-1">{work.careerInterest}</p>
                        </div>
                      )}
                      {work.challengingTask && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Growth Area:</span>
                          <p className="text-sm text-gray-600 mt-1">{work.challengingTask}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Insights */}
        {aiInsights.personalityInsights && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-purple-800">
                <Brain className="mr-3 h-6 w-6" />
                Your Learning & Work Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 text-lg leading-relaxed mb-4">{aiInsights.personalityInsights}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Your Key Strengths:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.keyStrengths.map((strength, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Areas for Growth:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.developmentAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="border-purple-300 text-purple-700">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Next Future Quest Adventures */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-cyan-800">
              <Target className="mr-3 h-6 w-6" />
              Your Next Future Quest Adventures
            </CardTitle>
            <CardDescription className="text-cyan-600 text-lg">
              Recommended simulations based on your interests and career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {aiInsights.suggestedSimulations.slice(0, 4).map((simulationId: string, index: number) => {
                const simulation = simulations.find((s) => s.id === simulationId)
                if (!simulation) return null

                return (
                  <Card key={index} className="bg-white border-cyan-200 hover:border-cyan-400 transition-colors">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex-1">
                        <h4 className="font-semibold text-cyan-900 mb-1">{simulation.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{simulation.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2 h-5">
                          <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {simulation.duration}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                            {simulation.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSimulationStart(simulationId)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 mt-auto"
                      >
                        Try This Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aligned Career Pathways */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-purple-800">
              <TrendingUp className="mr-3 h-6 w-6" />
              Your Aligned Career Pathways
            </CardTitle>
            <CardDescription className="text-purple-600 text-lg">
              Personalized career recommendations based on your simulation experiences and reflections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {aiInsights.careerRecommendations.map((career: any, index: number) => (
                <Card key={index} className="bg-white border-purple-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-purple-900">{career.title}</h3>
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            {career.growthOutlook.includes("faster") || career.growthOutlook.includes("Much faster")
                              ? "Growing Fast"
                              : "Stable Growth"}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-4">{career.overview}</p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Avg Salary:</span>
                            <span className="text-green-600 font-bold">{career.averageSalary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Education:</span>
                            <span>{career.educationPath.requiredLevel}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Key Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {career.keySkills.map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Common Majors:</h4>
                          <div className="flex flex-wrap gap-1">
                            {career.educationPath.commonMajors.map((major: string, majorIndex: number) => (
                              <Badge key={majorIndex} variant="secondary" className="text-xs">
                                {major}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-purple-800">Why this role matches you:</span>
                              <p className="text-sm text-purple-700 mt-1">{career.whyThisRole}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Work Environment:</strong> {career.workEnvironment}
                          </p>
                          <p>
                            <strong>Growth Outlook:</strong> {career.growthOutlook}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                        onClick={() => {
                          // Open career research in new tab
                          window.open(
                            `https://www.onetonline.org/find/quick?s=${encodeURIComponent(career.title)}`,
                            "_blank",
                          )
                        }}
                      >
                        Research Career
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alternative Pathways */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-amber-800">
              <School className="h-6 w-6 mr-3" />
              Alternative Pathways Without Traditional College
            </CardTitle>
            <CardDescription className="text-amber-600 text-lg">
              Explore faster, more flexible routes to your career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {getAlternativePathways().map((pathway: any, index: number) => (
                <Card key={index} className="bg-white border-amber-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">{pathway.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{pathway.overview}</p>
                    <div className="space-y-2 text-xs text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{pathway.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-medium">{pathway.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provider:</span>
                        <span className="font-medium text-xs">{pathway.provider}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-1">Career Outcomes:</div>
                      {pathway.careerOutcomes.slice(0, 2).map((outcome: string, outcomeIndex: number) => (
                        <Badge key={outcomeIndex} variant="outline" className="text-xs mr-1 mb-1">
                          {outcome}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  window.open("https://www.coursera.org/browse", "_blank")
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Alternative Pathways
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-green-800">
              <ArrowRight className="mr-3 h-6 w-6" />
              Ready for Your Next Step?
            </CardTitle>
            <CardDescription className="text-green-600 text-lg">
              Take action on your career exploration journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Immediate Actions:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  {aiInsights.nextSteps.slice(0, 3).map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Long-term Planning:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Research college programs for your top career choices
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Connect with professionals in your fields of interest
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Look for internship or job shadowing opportunities
                  </li>
                </ul>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/simulations")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Target className="mr-2 h-5 w-5" />
                Take Another Simulation
              </Button>
        
              <Button
                size="lg"
                variant="outline"
                onClick={loadStudentData}
                className="border-purple-400 text-purple-700 hover:bg-purple-50 bg-transparent"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
