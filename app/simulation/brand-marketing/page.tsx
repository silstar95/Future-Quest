"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { PreReflectionForm } from "@/components/simulation/pre-reflection-form"
import { ExplorationPhase } from "@/components/simulation/exploration-phase"
import { ExperiencePhase } from "@/components/simulation/experience-phase"
import { PostReflectionForm } from "@/components/simulation/post-reflection-form"
import { SimulationComplete } from "@/components/simulation/simulation-complete"
import { saveSimulationProgress, getSimulationProgress } from "@/lib/firebase-service"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone, Clock, Users, Star, ArrowLeft } from "lucide-react"

type SimulationPhase = "intro" | "pre-reflection" | "exploration" | "experience" | "post-reflection" | "complete"

interface SimulationData {
  phase: SimulationPhase
  preReflectionAnswers?: any
  explorationAnswers?: any
  experienceAnswers?: any
  postReflectionAnswers?: any
  startedAt?: string
  completedAt?: string
  startTime?: number
}

export default function BrandMarketingSimulation() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>("intro")
  const [simulationData, setSimulationData] = useState<SimulationData>({
    phase: "intro",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      loadSimulationProgress()
    }
  }, [user, loading, router])

  const loadSimulationProgress = async () => {
    try {
      if (user?.uid) {
        const progress = await getSimulationProgress(user.uid, "brand-marketing")
        if (progress) {
          setSimulationData(progress)
          setCurrentPhase(progress.phase || "intro")
        }
      }
    } catch (error) {
      console.error("Error loading simulation progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgress = async (data: Partial<SimulationData>) => {
    try {
      if (user?.uid) {
        const updatedData = { ...simulationData, ...data }
        setSimulationData(updatedData)
        await saveSimulationProgress(user.uid, "brand-marketing", updatedData)
      }
    } catch (error) {
      console.error("Error saving simulation progress:", error)
    }
  }

  const handlePhaseComplete = async (phaseData: any, nextPhase: SimulationPhase) => {
    const updateData: Partial<SimulationData> = {
      phase: nextPhase,
      [`${currentPhase}Answers`]: phaseData,
    }

    if (currentPhase === "intro") {
      updateData.startedAt = new Date().toISOString()
      updateData.startTime = Date.now()
    }

    if (nextPhase === "complete") {
      updateData.completedAt = new Date().toISOString()
    }

    await saveProgress(updateData)
    setCurrentPhase(nextPhase)
  }

  const handleReturnToDashboard = () => {
    router.push("/dashboard/student")
  }

  const handleViewCity = () => {
    router.push("/simulations?tab=city")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard/student")
  }

  const getPhaseProgress = () => {
    const phases = ["intro", "pre-reflection", "exploration", "experience", "post-reflection", "complete"]
    const currentIndex = phases.indexOf(currentPhase)
    return ((currentIndex + 1) / phases.length) * 100
  }

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case "intro":
        return "Welcome to Make Your Star Shine"
      case "pre-reflection":
        return "Pre-Reflection Assessment"
      case "exploration":
        return "Explore Branding & Marketing"
      case "experience":
        return "Experience Career Roles"
      case "post-reflection":
        return "Post-Reflection Assessment"
      case "complete":
        return "Simulation Complete"
      default:
        return "Brand & Marketing Simulation"
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your simulation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Make Your Star Shine</h1>
                  <p className="text-sm text-gray-600">Branding & Marketing Career Simulation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                45-60 min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />1 player
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                4.8 rating
              </div>
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Branding & Marketing</Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{getPhaseTitle()}</span>
              <span className="text-sm text-gray-500">{Math.round(getPhaseProgress())}% Complete</span>
            </div>
            <Progress value={getPhaseProgress()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Simulation Content */}
        <div className="max-w-4xl mx-auto">
          {currentPhase === "intro" && (
            <Card className="border-2 border-brand-primary/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Megaphone className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to "Make Your Star Shine"</h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  🌟 You're about to embark on an exciting journey into the world of branding and marketing! In this
                  immersive simulation, you'll strategize to make your chosen celebrity the biggest hit in their
                  industry.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-3 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      What You'll Experience:
                    </h3>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• 🎨 Craft celebrity brand identity</li>
                      <li>• 🤝 Develop partnership strategies</li>
                      <li>• 📱 Create viral social media campaigns</li>
                      <li>• 🔍 Analyze competition</li>
                      <li>• 🛡️ Handle PR crises</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Career Roles You'll Master:
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• 🎯 Brand Strategist</li>
                      <li>• 🤝 Partnerships Manager</li>
                      <li>• 📢 Social Media Strategist</li>
                      <li>• 🛡️ PR Manager</li>
                      <li>• 📊 Competitive Analyst</li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => handlePhaseComplete({}, "pre-reflection")}
                  size="lg"
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-3 rounded-lg font-semibold hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all shadow-lg"
                >
                  🚀 Start Your Journey
                </Button>
              </CardContent>
            </Card>
          )}

          {currentPhase === "pre-reflection" && (
            <PreReflectionForm
              onComplete={(data) => handlePhaseComplete(data, "exploration")}
              initialData={simulationData.preReflectionAnswers}
            />
          )}

          {currentPhase === "exploration" && (
            <ExplorationPhase
              onComplete={(data) => handlePhaseComplete(data, "experience")}
              initialData={simulationData.explorationAnswers}
            />
          )}

          {currentPhase === "experience" && (
            <ExperiencePhase
              onComplete={(data) => handlePhaseComplete(data, "post-reflection")}
              initialData={simulationData.experienceAnswers}
            />
          )}

          {currentPhase === "post-reflection" && (
            <PostReflectionForm
              onComplete={(data) => handlePhaseComplete(data, "complete")}
              initialData={simulationData.postReflectionAnswers}
            />
          )}

          {currentPhase === "complete" && (
            <SimulationComplete
              simulationData={simulationData}
              onReturnToDashboard={handleReturnToDashboard}
              onViewCity={handleViewCity}
            />
          )}
        </div>
      </div>
    </div>
  )
}
