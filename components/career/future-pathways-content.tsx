"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Star,
  TrendingUp,
  Target,
  ArrowRight,
  School,
  Briefcase,
  GraduationCap,
  CheckCircle,
  BookOpen,
  Clock,
  Lightbulb,
} from "lucide-react"
import { aiCareerService } from "@/lib/ai-services"
import { careerDataService } from "@/lib/career-data-service"

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

export function FuturePathwaysContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [aiInsights, setAiInsights] = useState<AICareerInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workYouLoved, setWorkYouLoved] = useState<any[]>([])

  const simulations = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description: "Master branding and marketing strategies through celebrity brand building",
      category: "Marketing",
    },
    {
      id: "finance-simulation",
      title: "Risk, Reward, and Real World Finance",
      description: "Navigate the risks and rewards of managing company finances while exploring finance careers",
      category: "Finance",
    },
    {
      id: "material-science",
      title: "MagLev Makers: Engineering a Superconductor",
      description: "Explore cutting-edge material science and innovation",
      category: "Science",
    },
    {
      id: "government-simulation",
      title: "Inside the Hill",
      description:
        "Navigate congressional processes and stakeholder engagement to pass the WATER Act through strategic political maneuvering",
      category: "Government",
    },
  ]

  // Helper function to format simulation types
  const formatSimulationType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      "brand-marketing": "Brand & Marketing",
      "finance-simulation": "Finance & Investment",
      "material-science": "Material Science",
      "government-simulation": "Government & Politics",
    }
    return typeMap[type] || type
  }

  const handleStartSimulation = (simulationId: string) => {
    router.push(`/simulation/${simulationId}`)
  }

  const generateAIInsights = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      setError(null)

      // Get student career data
      const careerData = await careerDataService.getStudentCareerData(user.uid)
      if (!careerData || careerData.reflectionData.length === 0) {
        setError("No simulation data available. Complete at least one simulation to see career insights.")
        return
      }

      // Analyze with AI
      const insights = await aiCareerService.analyzeStudentReflections(
        careerData.reflectionData,
        careerData.onboardingData,
      )

      setAiInsights(insights)

      // Extract "Work You Loved" from simulation data
      const lovedWork = careerData.reflectionData
        .filter((data) => data.enjoymentRating >= 7 || data.interestLevel >= 4)
        .map((data) => ({
          simulationType: formatSimulationType(data.simulationType),
          enjoymentRating: data.enjoymentRating,
          favoriteTask: data.favoriteTask,
          skillsLearned: data.skillsLearned,
          careerInterest: data.careerInterest,
        }))

      setWorkYouLoved(lovedWork)
    } catch (error) {
      console.error("Error generating AI insights:", error)
      setError("Failed to generate career insights. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.uid) {
      generateAIInsights()
    }
  }, [user?.uid])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Simulation Data...</h2>
          <p className="text-gray-600">Our AI is generating personalized career insights based on your experiences.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Career Insights Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/simulations")} className="bg-blue-600 hover:bg-blue-700">
              Explore Simulations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!aiInsights) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Career Insights Not Available</h2>
            <p className="text-gray-600 mb-6">Complete at least one simulation to unlock AI-powered career insights.</p>
            <Button onClick={() => router.push("/simulations")} className="bg-blue-600 hover:bg-blue-700">
              Start Your First Simulation
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Completion Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-blue-800 mb-2">🎉 Great job on completing your simulations!</h1>
          <p className="text-lg text-blue-600">
            Based on your reflections, here are some careers you might want to explore:
          </p>
        </CardContent>
      </Card>

      {/* Work You Loved Section */}
      {workYouLoved && workYouLoved.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-green-800">
              <Star className="mr-3 h-6 w-6 text-yellow-500" />
              Your Experience Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {workYouLoved.map((work, index) => (
                <Card key={index} className="bg-white border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800 flex items-center">
                      <Star className="mr-2 h-5 w-5 text-yellow-500" />
                      Work You Loved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-900">{work.simulationType}</span>
                        <Badge variant="secondary">{work.enjoymentRating}/10 Stars</Badge>
                      </div>
                      {work.favoriteTask && (
                        <p className="text-sm text-gray-600">
                          <strong>Favorite Task:</strong> {work.favoriteTask}
                        </p>
                      )}
                      {work.skillsLearned && (
                        <p className="text-sm text-gray-600">
                          <strong>Skills Learned:</strong> {work.skillsLearned}
                        </p>
                      )}
                      {work.careerInterest && (
                        <p className="text-sm text-gray-600">
                          <strong>Career Interest:</strong> {work.careerInterest}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Career Recommendations */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-purple-800">
            <TrendingUp className="mr-3 h-6 w-6" />
            Your Aligned Career Pathways
          </CardTitle>
          <CardDescription className="text-purple-600 text-lg">
            Personalized recommendations based on your simulation experiences and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {aiInsights.careerRecommendations.map((career, index) => (
              <Card key={index} className="bg-white border-purple-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-purple-900">{career.title}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {career.averageSalary}/year
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{career.overview}</p>
                      <div className="bg-purple-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-purple-800">
                          <strong>Why this role?</strong> {career.whyThisRole}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="ml-4 bg-transparent">
                      Learn More
                    </Button>
                  </div>

                  {/* Education Path */}
                  <div className="border-t pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <School className="mr-2 h-4 w-4" />
                          Education Path
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Required:</strong> {career.educationPath.requiredLevel}
                          </p>
                          <p>
                            <strong>Common Majors:</strong> {career.educationPath.commonMajors.join(", ")}
                          </p>
                          {career.educationPath.optionalCertifications && (
                            <p>
                              <strong>Certifications:</strong> {career.educationPath.optionalCertifications.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Career Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Growth:</strong> {career.growthOutlook}
                          </p>
                          <p>
                            <strong>Environment:</strong> {career.workEnvironment}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {career.keySkills.slice(0, 4).map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Next Future Quest Adventures */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-cyan-800">
            <Target className="mr-3 h-6 w-6" />
            Your Next Future Quest Adventures
          </CardTitle>
          <CardDescription className="text-cyan-600 text-lg">
            Explore new career paths based on AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {aiInsights.suggestedSimulations.map((simulationId, index) => {
              const simulation = simulations.find((s) => s.id === simulationId)
              if (!simulation) return null

              return (
                <Card key={index} className="bg-white border-cyan-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-cyan-900">{simulation.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {simulation.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{simulation.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Recommended for you
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartSimulation(simulation.id)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        Try This Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Pathways */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-amber-800">
            <GraduationCap className="mr-3 h-6 w-6" />
            Alternative Pathways Without Traditional College
          </CardTitle>
          <CardDescription className="text-amber-600 text-lg">
            Explore faster, career-focused training options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-amber-900 mb-2">PR Certificate Program</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Accelerated training in public relations, media strategy, and communications
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Duration: 6-8 months</p>
                  <p>Cost: $2,000 - $5,000</p>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-amber-900 mb-2">Digital Marketing Bootcamp</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Comprehensive online certification covering SEO, social media, and digital advertising
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Duration: 3-6 months</p>
                  <p>Cost: $500 - $2,000</p>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-bold text-amber-900 mb-2">Portfolio Building</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Create a professional portfolio and gain real-world experience through internships
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Duration: 3-12 months</p>
                  <p>Cost: Varies</p>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button className="bg-amber-600 hover:bg-amber-700">Explore Alternative Pathways</Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-green-800">
            <Lightbulb className="mr-3 h-6 w-6" />
            Ready for Your Next Step?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button className="bg-blue-500 hover:bg-blue-600 h-16 text-lg" onClick={() => router.push("/simulations")}>
              <Target className="mr-2 h-5 w-5" />
              Take Another Simulation
            </Button>
            <Button variant="outline" className="h-16 text-lg border-yellow-300 hover:bg-yellow-50 bg-transparent">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Share Results
            </Button>
            <Button variant="outline" className="h-16 text-lg border-green-300 hover:bg-green-50 bg-transparent">
              <BookOpen className="mr-2 h-5 w-5 text-green-500" />
              Get Guidance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
