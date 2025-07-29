"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { saveSimulationProgress, getSimulationProgress } from "@/lib/firebase-service"
import { Microscope, Clock, ArrowLeft, CheckCircle, Save } from "lucide-react"

// Import simulation components
import { MaterialSciencePreReflectionForm } from "@/components/simulation/material-science-pre-reflection-form"
import { FrameworkExplanation } from "@/components/simulation/framework-explanation"
import { MaterialScienceExplorationPhase } from "@/components/simulation/material-science-exploration-phase"
import { MaterialScienceExperiencePhase } from "@/components/simulation/material-science-experience-phase"
import { MaterialScienceEngagePhase } from "@/components/simulation/material-science-engage-phase"
import { MaterialScienceEnvisionPhase } from "@/components/simulation/material-science-envision-phase"
import { MaterialSciencePostReflectionForm } from "@/components/simulation/material-science-post-reflection-form"
import { SimulationComplete } from "@/components/simulation/simulation-complete"

type SimulationPhase =
  | "intro"
  | "pre-reflection"
  | "framework"
  | "exploration"
  | "experience"
  | "engage"
  | "envision"
  | "post-reflection"
  | "complete"

interface SimulationData {
  currentPhase: SimulationPhase
  preReflectionData?: any
  explorationData?: any
  experienceData?: any
  engageData?: any
  envisionData?: any
  postReflectionData?: any
  startTime?: number
  completedAt?: string
}

export default function MaterialScienceSimulation() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>("intro")
  const [simulationData, setSimulationData] = useState<SimulationData>({
    currentPhase: "intro",
    startTime: Date.now(),
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      loadUserProgress()
    }
  }, [user, loading, router])

  const loadUserProgress = async () => {
    if (!user) return

    try {
      const result = await getSimulationProgress(user.uid, "material-science")
      if (result.success && result.data) {
        setCurrentPhase(result.data.currentPhase as SimulationPhase)
        setSimulationData(result.data.phaseProgress || { currentPhase: result.data.currentPhase })
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  const saveProgress = async (phase: SimulationPhase, data: any) => {
    if (!user) return

    setIsSaving(true)
    try {
      const updatedData = {
        ...simulationData,
        currentPhase: phase,
        ...data,
      }

      const progressData = {
        userId: user.uid,
        simulationId: "material-science",
        currentPhase: phase,
        currentStep: getPhaseStep(phase),
        totalSteps: 9,
        phaseProgress: updatedData,
        startedAt: simulationData.startTime
          ? new Date(simulationData.startTime).toISOString()
          : new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        completed: phase === "complete",
      }

      await saveSimulationProgress(progressData)
      setSimulationData(updatedData)
      setLastSaved(new Date())

      toast({
        title: "Progress Saved",
        description: "Your simulation progress has been saved.",
      })
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Save Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhaseComplete = async (phase: SimulationPhase, data: any) => {
    const nextPhaseMap: Record<SimulationPhase, SimulationPhase> = {
      intro: "pre-reflection",
      "pre-reflection": "framework",
      framework: "exploration",
      exploration: "experience",
      experience: "engage",
      engage: "envision",
      envision: "post-reflection",
      "post-reflection": "complete",
      complete: "complete",
    }

    const nextPhase = nextPhaseMap[phase]
    await saveProgress(nextPhase, data)
    setCurrentPhase(nextPhase)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard/student")
  }

  const handleViewCity = () => {
    router.push("/simulations?tab=city")
  }

  const getPhaseStep = (phase: SimulationPhase): number => {
    const phaseSteps = {
      intro: 1,
      "pre-reflection": 2,
      framework: 3,
      exploration: 4,
      experience: 5,
      engage: 6,
      envision: 7,
      "post-reflection": 8,
      complete: 9,
    }
    return phaseSteps[phase] || 1
  }

  const getPhaseProgress = () => {
    const phases: SimulationPhase[] = [
      "intro",
      "pre-reflection",
      "framework",
      "exploration",
      "experience",
      "engage",
      "envision",
      "post-reflection",
      "complete",
    ]
    const currentIndex = phases.indexOf(currentPhase)
    return Math.round(((currentIndex + 1) / phases.length) * 100)
  }

  const getPhaseTitle = () => {
    const titles: Record<SimulationPhase, string> = {
      intro: "Welcome to Material Science",
      "pre-reflection": "Pre-Reflection Assessment",
      framework: "Learning Framework",
      exploration: "Explore Material Science Careers",
      experience: "Experience: MagLev Makers Lab",
      engage: "Engage with Professionals",
      envision: "Envision Your Future",
      "post-reflection": "Post-Reflection Assessment",
      complete: "Simulation Complete",
    }
    return titles[currentPhase]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your simulation...</p>
          <p className="text-gray-500 text-sm mt-2">Retrieving your progress from database...</p>
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">MagLev Makers: Engineering a Superconductor</h1>
                  <p className="text-sm text-gray-600">Material Science Career Simulation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                1-2 hours
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-green-600 text-white">Science</Badge>

              {/* Save Status */}
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span className="text-xs">Saving...</span>
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs">Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Save className="w-3 h-3" />
                    <span className="text-xs">Not saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{getPhaseTitle()}</span>
              <span className="text-sm text-gray-500">{getPhaseProgress()}% Complete</span>
            </div>
            <Progress value={getPhaseProgress()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Intro Phase */}
        {currentPhase === "intro" && (
          <Card className="max-w-4xl mx-auto border-2 border-blue-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Microscope className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to MagLev Makers!</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                🔬 Ready to engineer the future of transportation? In this simulation, you'll identify and create a
                superconductive material for Magnetic Levitation Trains. You'll explore material science careers while
                working with YBCO (Yttrium Barium Copper Oxide) superconductors.
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200 mb-8">
                <h3 className="font-bold text-blue-800 mb-3">Your Mission:</h3>
                <ul className="text-sm text-blue-700 space-y-2 text-left max-w-md mx-auto">
                  <li>• 🧪 Learn about material science careers</li>
                  <li>• ⚗️ Understand YBCO superconductor properties</li>
                  <li>• 🔬 Conduct virtual synthesis experiments</li>
                  <li>• 🚄 Create materials for MagLev trains</li>
                  <li>• 💡 Explore your future in materials engineering</li>
                </ul>
              </div>

              <Button
                onClick={() => handlePhaseComplete("intro", {})}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-700 transition-all shadow-lg"
              >
                Begin Your Material Science Journey
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pre-Reflection Phase */}
        {currentPhase === "pre-reflection" && (
          <MaterialSciencePreReflectionForm
            onComplete={(data) => handlePhaseComplete("pre-reflection", { preReflectionData: data })}
            initialData={simulationData.preReflectionData}
          />
        )}

        {/* Framework Phase */}
        {currentPhase === "framework" && (
          <FrameworkExplanation
            onComplete={() => handlePhaseComplete("framework", {})}
            simulationType="material-science"
          />
        )}

        {/* Exploration Phase */}
        {currentPhase === "exploration" && (
          <MaterialScienceExplorationPhase
            onComplete={(data) => handlePhaseComplete("exploration", { explorationData: data })}
            initialData={simulationData.explorationData}
          />
        )}

        {/* Experience Phase */}
        {currentPhase === "experience" && (
          <MaterialScienceExperiencePhase
            onComplete={(data) => handlePhaseComplete("experience", { experienceData: data })}
            initialData={simulationData.experienceData}
          />
        )}

        {/* Engage Phase */}
        {currentPhase === "engage" && (
          <MaterialScienceEngagePhase
            onComplete={(data) => handlePhaseComplete("engage", { engageData: data })}
            initialData={simulationData.engageData}
          />
        )}

        {/* Envision Phase */}
        {currentPhase === "envision" && (
          <MaterialScienceEnvisionPhase
            onComplete={(data) => handlePhaseComplete("envision", { envisionData: data })}
            initialData={simulationData.envisionData}
          />
        )}

        {/* Post-Reflection Phase */}
        {currentPhase === "post-reflection" && (
          <MaterialSciencePostReflectionForm
            onComplete={(data) => handlePhaseComplete("post-reflection", { postReflectionData: data })}
            initialData={simulationData.postReflectionData}
            preReflectionData={simulationData.preReflectionData}
          />
        )}

        {/* Complete Phase */}
        {currentPhase === "complete" && (
          <SimulationComplete
            simulationData={simulationData}
            onReturnToDashboard={handleBackToDashboard}
            onViewCity={handleViewCity}
          />
        )}
      </div>
    </div>
  )
}
