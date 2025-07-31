"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { PreReflectionForm } from "@/components/simulation/pre-reflection-form"
import { FrameworkExplanation } from "@/components/simulation/framework-explanation"
import { ExplorationPhase } from "@/components/simulation/exploration-phase"
import { ExperiencePhase } from "@/components/simulation/experience-phase"
import { EngagePhase } from "@/components/simulation/engage-phase"
import { PostReflectionForm } from "@/components/simulation/post-reflection-form"
import { EnvisionPhase } from "@/components/simulation/envision-phase"
import { SimulationComplete } from "@/components/simulation/simulation-complete"
import { SimulationNavigation } from "@/components/simulation/simulation-navigation"
import { saveSimulationProgress, getSimulationProgress, completeSimulation } from "@/lib/firebase-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Megaphone, Users, Star } from "lucide-react"

type SimulationPhase =
  | "intro"
  | "pre-reflection"
  | "framework"
  | "exploration"
  | "experience"
  | "engage"
  | "post-reflection"
  | "envision"
  | "complete"

interface SimulationData {
  phase: SimulationPhase
  preReflectionAnswers?: any
  explorationAnswers?: any
  experienceAnswers?: any
  engageAnswers?: any
  postReflectionAnswers?: any
  envisionAnswers?: any
  startedAt?: string
  completedAt?: string
  startTime?: number
  progressPercentage?: number
  lastUpdated?: string
}

export default function BrandMarketingSimulation() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>("intro")
  const [simulationData, setSimulationData] = useState<SimulationData>({
    phase: "intro",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      loadSimulationProgress()
    }
  }, [user, loading, router])

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (user && currentPhase !== "intro" && currentPhase !== "complete") {
      const interval = setInterval(() => {
        saveCurrentProgress(true) // true for auto-save
      }, 30000) // Auto-save every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user, currentPhase, simulationData])

  const loadSimulationProgress = async () => {
    try {
      if (user?.uid) {
        console.log("🔄 Loading simulation progress for user:", user.uid)
        setIsLoading(true)

        const result = await getSimulationProgress(user.uid, "brand-marketing")

        if (result.success && result.data) {
          console.log("✅ Loaded existing progress:", result.data)

          // Convert SimulationProgress to SimulationData format
          const loadedData: SimulationData = {
            phase: result.data.currentPhase as SimulationPhase,
            ...result.data.phaseProgress, // Include any additional phase-specific data
            startedAt: result.data.startedAt,
            lastUpdated: result.data.lastUpdated,
          }

          setSimulationData(loadedData)
          setCurrentPhase(loadedData.phase)

          toast({
            title: "Progress Loaded",
            description: `Continuing from ${loadedData.phase} phase`,
          })
        } else {
          console.log("ℹ️ No existing progress found, starting fresh")
          // Initialize with intro phase
          setSimulationData({
            phase: "intro",
            startTime: Date.now(),
          })

          // If there was an error (not just no data), show it
          if (result.error && result.error !== "No progress found") {
            console.error("Database error:", result.error)
            toast({
              title: "Database Connection Issue",
              description: result.error,
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading simulation progress:", error)
      setSaveError("Failed to load progress")
      toast({
        title: "Error Loading Progress",
        description: "Database connection failed. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentProgress = async (isAutoSave = false) => {
    if (!user?.uid || isSaving) return

    try {
      setIsSaving(true)
      setSaveError(null)

      const progressData = {
        ...simulationData,
        lastUpdated: new Date().toISOString(),
      }

      console.log("💾 Saving progress:", progressData)

      const simulationProgressData = {
        userId: user.uid,
        simulationId: "brand-marketing",
        currentPhase: progressData.phase,
        currentStep: getPhaseStep(progressData.phase),
        totalSteps: 9, // Updated to include framework phase
        phaseProgress: progressData,
        startedAt: progressData.startedAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        completed: false,
      }

      const result = await saveSimulationProgress(simulationProgressData)

      if (result.success) {
        setLastSaved(new Date())

        if (!isAutoSave) {
          // Calculate progress percentage based on current phase
          const progressPercentage = getPhaseProgress()

          toast({
            title: "Progress Saved",
            description: `${progressPercentage}% complete`,
          })
        }

        console.log("✅ Progress saved successfully:", result)
      } else {
        throw new Error(result.error || "Failed to save progress")
      }
    } catch (error: any) {
      console.error("❌ Error saving simulation progress:", error)
      const errorMessage = error?.message || "Failed to save progress"
      setSaveError(errorMessage)

      if (!isAutoSave) {
        toast({
          title: "Save Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const saveProgress = async (data: Partial<SimulationData>) => {
    try {
      if (user?.uid && !isSaving) {
        setIsSaving(true)
        setSaveError(null)

        const updatedData = {
          ...simulationData,
          ...data,
          lastUpdated: new Date().toISOString(),
        }

        setSimulationData(updatedData)

        console.log("💾 Saving progress with data:", updatedData)

        const simulationProgressData = {
          userId: user.uid,
          simulationId: "brand-marketing",
          currentPhase: updatedData.phase,
          currentStep: getPhaseStep(updatedData.phase),
          totalSteps: 9, // Updated to include framework phase
          phaseProgress: updatedData,
          startedAt: updatedData.startedAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          completed: false,
        }

        const result = await saveSimulationProgress(simulationProgressData)

        if (result.success) {
          setLastSaved(new Date())
          console.log("✅ Progress saved successfully:", result)

          // Calculate progress percentage based on current phase
          const progressPercentage = getPhaseProgress()

          toast({
            title: "Progress Saved",
            description: `${progressPercentage}% complete`,
          })
        } else {
          throw new Error("Failed to save progress")
        }
      }
    } catch (error) {
      console.error("❌ Error saving simulation progress:", error)
      setSaveError("Failed to save progress")

      toast({
        title: "Save Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhaseComplete = async (phaseData: any, nextPhase: SimulationPhase) => {
    console.log(`🎯 Completing phase: ${currentPhase} → ${nextPhase}`)

    const updateData: Partial<SimulationData> = {
      phase: nextPhase,
      [`${currentPhase}Answers`]: phaseData,
      lastUpdated: new Date().toISOString(),
    }

    if (currentPhase === "intro") {
      updateData.startedAt = new Date().toISOString()
      updateData.startTime = Date.now()
    }

    if (nextPhase === "complete") {
      updateData.completedAt = new Date().toISOString()

      // Complete the simulation and unlock next content
      try {
        console.log("🏆 Completing simulation...")

        const completionResult = await completeSimulation(user!.uid, "brand-marketing", 100, [])

        if (completionResult.success) {
          console.log("✅ Simulation completed:", completionResult)

          toast({
            title: "🎉 Simulation Complete!",
            description: "Your progress has been saved and new buildings unlocked!",
          })
        } else {
          throw new Error(completionResult.error || "Failed to complete simulation")
        }
      } catch (error) {
        console.error("❌ Error completing simulation:", error)
        toast({
          title: "Completion Error",
          description: "Failed to complete simulation. Please try again.",
          variant: "destructive",
        })
        return // Don't proceed if completion failed
      }
    }

    await saveProgress(updateData)
    setCurrentPhase(nextPhase)
  }

  const handleReturnToDashboard = () => {
    // Save progress before leaving if not completed
    if (currentPhase !== "intro" && currentPhase !== "complete") {
      saveCurrentProgress()
    }
    router.push("/dashboard/student")
  }

  const handleViewCity = () => {
    router.push("/simulations?tab=city")
  }

  const handleBackToDashboard = () => {
    // Save progress before leaving
    if (currentPhase !== "intro" && currentPhase !== "complete") {
      saveCurrentProgress()
    }
    router.push("/dashboard/student")
  }

  const handlePreviousStep = () => {
    const phases: SimulationPhase[] = [
      "intro",
      "pre-reflection",
      "framework",
      "exploration",
      "experience",
      "engage",
      "post-reflection",
      "envision",
      "complete",
    ]
    const currentIndex = phases.indexOf(currentPhase)

    if (currentIndex > 0) {
      const previousPhase = phases[currentIndex - 1]
      setCurrentPhase(previousPhase)

      // Update simulation data
      const updateData: Partial<SimulationData> = {
        phase: previousPhase,
        lastUpdated: new Date().toISOString(),
      }

      saveProgress(updateData)
    }
  }

  const canGoBack = () => {
    const phases: SimulationPhase[] = [
      "intro",
      "pre-reflection",
      "framework",
      "exploration",
      "experience",
      "engage",
      "post-reflection",
      "envision",
      "complete",
    ]
    const currentIndex = phases.indexOf(currentPhase)
    return currentIndex > 0 && currentPhase !== "complete"
  }

  const getPhaseStep = (phase: SimulationPhase): number => {
    const phaseSteps = {
      intro: 1,
      "pre-reflection": 2,
      framework: 3,
      exploration: 4,
      experience: 5,
      engage: 6,
      "post-reflection": 7,
      envision: 8,
      complete: 9,
    }
    return phaseSteps[phase] || 1
  }

  const getPhaseProgress = () => {
    const phaseProgress = {
      intro: 5,
      "pre-reflection": 15,
      framework: 25,
      exploration: 35,
      experience: 55,
      engage: 70,
      "post-reflection": 85,
      envision: 95,
      complete: 100,
    }
    return phaseProgress[currentPhase] || 0
  }

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case "intro":
        return "Welcome to Make Your Star Shine"
      case "pre-reflection":
        return "Pre-Reflection Assessment"
      case "framework":
        return "Understanding the 5 E's Framework"
      case "exploration":
        return "Explore Branding & Marketing"
      case "experience":
        return "Experience Career Roles"
      case "engage":
        return "Engage with Professionals"
      case "post-reflection":
        return "Evaluate Your Experience"
      case "envision":
        return "Envision Your Future Path"
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2d407e] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your simulation...</p>
          <p className="text-gray-500 text-sm mt-2">Retrieving your progress from database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <SimulationNavigation
        title="Make Your Star Shine"
        subtitle="Branding & Marketing Career Simulation"
        icon={<Megaphone className="w-6 h-6 text-white" />}
        duration="4-6 hours"
        category="Branding & Marketing"
        categoryColor="bg-gradient-to-r from-[#2d407e] to-[#765889]"
        currentPhase={currentPhase} // Pass the actual phase ID, not the title
        progress={getPhaseProgress()}
        onBackToDashboard={handleBackToDashboard}
        onPreviousStep={handlePreviousStep}
        canGoBack={canGoBack()}
        isSaving={isSaving}
        saveError={saveError}
        lastSaved={lastSaved}
        onManualSave={() => saveCurrentProgress()}
        showSaveButton={currentPhase !== "intro" && currentPhase !== "complete"}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Simulation Content */}
        <div className="max-w-4xl mx-auto">
          {currentPhase === "intro" && (
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#2d407e] to-[#765889] rounded-full flex items-center justify-center shadow-lg">
                  <Megaphone className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to "Make Your Star Shine"</h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  🌟 You're about to embark on an exciting journey through the 5 E's of Career Exploration! In this
                  immersive simulation, you'll strategize to make your chosen celebrity the biggest hit in their
                  industry while exploring branding and marketing careers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      The 5 E's You'll Experience:
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>
                        • 🔍 <strong>Explore</strong> - Discover career roles
                      </li>
                      <li>
                        • 🎯 <strong>Experience</strong> - Complete real tasks
                      </li>
                      <li>
                        • 🤝 <strong>Engage</strong> - Connect with professionals
                      </li>
                      <li>
                        • 📊 <strong>Evaluate</strong> - Reflect on your journey
                      </li>
                      <li>
                        • 🚀 <strong>Envision</strong> - Plan your future path
                      </li>
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
                      <li>• 🛡️ Public Relations Manager</li>
                      <li>• 📊 Competitive Analyst</li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => handlePhaseComplete({}, "pre-reflection")}
                  size="lg"
                  className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#0e3968] hover:to-[#231349] transition-all shadow-lg"
                >
                  🚀 Start Your Journey
                </Button>
              </CardContent>
            </Card>
          )}

          {currentPhase === "pre-reflection" && (
            <PreReflectionForm
              onComplete={(data) => handlePhaseComplete(data, "framework")}
              initialData={simulationData.preReflectionAnswers}
            />
          )}

          {currentPhase === "framework" && (
            <FrameworkExplanation
              simulationType="brand-marketing"
              onComplete={() => handlePhaseComplete({}, "exploration")}
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
              onComplete={(data) => handlePhaseComplete(data, "engage")}
              initialData={simulationData.experienceAnswers}
            />
          )}

          {currentPhase === "engage" && (
            <EngagePhase
              onComplete={(data) => handlePhaseComplete(data, "post-reflection")}
              initialData={simulationData.engageAnswers}
            />
          )}

          {currentPhase === "post-reflection" && (
            <PostReflectionForm
              onComplete={(data) => handlePhaseComplete(data, "envision")}
              initialData={simulationData.postReflectionAnswers}
              preReflectionData={simulationData.preReflectionAnswers}
              simulationType="brand-marketing"
            />
          )}

          {currentPhase === "envision" && (
            <EnvisionPhase
              onComplete={(data) => handlePhaseComplete(data, "complete")}
              initialData={simulationData.envisionAnswers}
              simulationType="brand-marketing"
            />
          )}

          {currentPhase === "complete" && (
            <SimulationComplete
              simulationData={simulationData}
              onReturnToDashboard={handleReturnToDashboard}
              onViewCity={handleViewCity}
              simulationType="brand-marketing"
            />
          )}
        </div>
      </div>
    </div>
  )
}
