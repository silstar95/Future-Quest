"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  CheckCircle,
  ArrowRight,
  Users,
  FileText,
  Home,
  ArrowLeft,
  Clock,
  Save,
  Search,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { saveSimulationProgress, getSimulationProgress, completeSimulation } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

// Import phase components
import { PreReflectionForm } from "@/components/simulation/pre-reflection-form"
import GovernmentExperiencePhase from "@/components/simulation/government-experience-phase"
import { EngagePhase } from "@/components/simulation/engage-phase"
import GovernmentPostReflectionForm from "@/components/simulation/government-post-reflection-form"
import { EnvisionPhase } from "@/components/simulation/envision-phase"
import GovernmentExplorationResearch from "@/components/simulation/government-exploration-research"

type SimulationPhase =
  | "intro"
  | "pre-reflection"
  | "exploration"
  | "experience"
  | "engage"
  | "evaluate"
  | "envision"
  | "complete"

interface SimulationData {
  phase: SimulationPhase
  preReflectionAnswers?: any
  explorationAnswers?: any
  experienceAnswers?: any
  engageAnswers?: any
  evaluateAnswers?: any
  envisionAnswers?: any
  startedAt?: string
  completedAt?: string
  startTime?: number
  progressPercentage?: number
  lastUpdated?: string
}

export default function GovernmentSimulationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>("intro")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [simulationData, setSimulationData] = useState<SimulationData>({
    phase: "intro",
  })

  const phases = [
    { id: "intro", name: "Introduction", icon: Building2, color: "text-[#2d407e]" },
    { id: "pre-reflection", name: "Pre-reflection", icon: Users, color: "text-[#765889]" },
    { id: "exploration", name: "Explore", icon: Search, color: "text-[#f0ad70]" },
    { id: "experience", name: "Experience", icon: Building2, color: "text-[#2d407e]" },
    { id: "engage", name: "Engage", icon: Users, color: "text-[#765889]" },
    { id: "evaluate", name: "Evaluate", icon: FileText, color: "text-[#f0ad70]" },
    { id: "envision", name: "Envision", icon: Target, color: "text-[#db9b6c]" },
    { id: "complete", name: "Complete", icon: CheckCircle, color: "text-green-600" },
  ]

  const getCurrentPhaseIndex = () => phases.findIndex((phase) => phase.id === currentPhase)
  const progress = ((getCurrentPhaseIndex() + 1) / phases.length) * 100
  const completionPercentage = Math.round(progress)

  const getPhaseStep = (phase: SimulationPhase): number => {
    const phaseSteps = {
      intro: 1,
      "pre-reflection": 2,
      exploration: 3,
      experience: 4,
      engage: 5,
      evaluate: 6,
      envision: 7,
      complete: 8,
    }
    return phaseSteps[phase] || 1
  }

  const getPhaseProgress = () => {
    const phaseProgress = {
      intro: 5,
      "pre-reflection": 15,
      exploration: 25,
      experience: 45,
      engage: 60,
      evaluate: 75,
      envision: 85,
      complete: 100,
    }
    return phaseProgress[currentPhase] || 0
  }

  // Clean data to remove non-serializable objects before saving to Firebase
  const cleanDataForFirebase = (data: any): any => {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === "object") {
      if (data.nativeEvent || data.target || data.currentTarget || data.type) {
        return null
      }

      if (Array.isArray(data)) {
        return data.map((item) => cleanDataForFirebase(item))
      }

      const cleaned: any = {}
      for (const [key, value] of Object.entries(data)) {
        const cleanedValue = cleanDataForFirebase(value)
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue
        }
      }
      return cleaned
    }

    return data
  }

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user) {
      loadSimulationProgress()
    }
  }, [user, router])

  useEffect(() => {
    if (user && currentPhase !== "intro" && currentPhase !== "complete") {
      const interval = setInterval(() => {
        saveCurrentProgress(true)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user, currentPhase, simulationData])

  const loadSimulationProgress = async () => {
    try {
      if (user?.uid) {
        setIsLoading(true)

        const result = await getSimulationProgress(user.uid, "government-simulation")

        if (result.success && result.data) {
          const loadedData: SimulationData = {
            phase: result.data.currentPhase as SimulationPhase,
            ...result.data.phaseProgress,
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
          setSimulationData({
            phase: "intro",
            startTime: Date.now(),
          })

          if (result.error && result.error !== "No progress found") {
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

      const progressData = {
        ...simulationData,
        lastUpdated: new Date().toISOString(),
      }

      const cleanedData = cleanDataForFirebase(progressData)

      const simulationProgressData = {
        userId: user.uid,
        simulationId: "government-simulation",
        currentPhase: progressData.phase,
        currentStep: getPhaseStep(progressData.phase),
        totalSteps: 8,
        phaseProgress: cleanedData,
        startedAt: progressData.startedAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        completed: progressData.phase === "complete",
      }

      const result = await saveSimulationProgress(simulationProgressData)

      if (result.success) {
        setLastSaved(new Date())

        if (!isAutoSave) {
          const progressPercentage = getPhaseProgress()
          toast({
            title: "Progress Saved",
            description: `${progressPercentage}% complete`,
          })
        }
      } else {
        throw new Error(result.error || "Failed to save progress")
      }
    } catch (error: any) {
      if (!isAutoSave) {
        toast({
          title: "Save Error",
          description: error?.message || "Failed to save progress",
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

        const updatedData = {
          ...simulationData,
          ...data,
          lastUpdated: new Date().toISOString(),
        }

        setSimulationData(updatedData)

        const cleanedData = cleanDataForFirebase(updatedData)

        const simulationProgressData = {
          userId: user.uid,
          simulationId: "government-simulation",
          currentPhase: updatedData.phase,
          currentStep: getPhaseStep(updatedData.phase),
          totalSteps: 8,
          phaseProgress: cleanedData,
          startedAt: updatedData.startedAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          completed: updatedData.phase === "complete",
        }

        const result = await saveSimulationProgress(simulationProgressData)

        if (result.success) {
          setLastSaved(new Date())
        } else {
          throw new Error("Failed to save progress")
        }
      }
    } catch (error) {
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

      try {
        const completionResult = await completeSimulation(user!.uid, "government-simulation", 150, [
          "government-expert",
        ])

        if (completionResult.success) {
          toast({
            title: "🎉 Simulation Complete!",
            description: "Your progress has been saved and new buildings unlocked!",
          })
        } else {
          throw new Error(completionResult.error || "Failed to complete simulation")
        }
      } catch (error) {
        toast({
          title: "Completion Error",
          description: "Failed to complete simulation. Please try again.",
          variant: "destructive",
        })
        return
      }
    }

    setSimulationData((prev) => ({
      ...prev,
      ...updateData,
    }))

    await saveProgress(updateData)
    setCurrentPhase(nextPhase)

    if (nextPhase !== "complete") {
      const phaseProgress = {
        intro: 5,
        "pre-reflection": 15,
        exploration: 25,
        experience: 45,
        engage: 60,
        evaluate: 75,
        envision: 85,
        complete: 100,
      }
      const progressPercentage = phaseProgress[nextPhase] || 0
      toast({
        title: "Progress Saved",
        description: `${progressPercentage}% complete`,
      })
    }
  }

  const handleBackStep = async () => {
    const phaseOrder: SimulationPhase[] = [
      "intro",
      "pre-reflection",
      "exploration",
      "experience",
      "engage",
      "evaluate",
      "envision",
      "complete",
    ]

    const currentIndex = phaseOrder.indexOf(currentPhase)
    if (currentIndex > 0) {
      const previousPhase = phaseOrder[currentIndex - 1]
      setCurrentPhase(previousPhase)
      await saveProgress({ phase: previousPhase })
    }
  }

  const handleManualSave = async () => {
    await saveProgress({ phase: currentPhase })
  }

  useEffect(() => {
    if (user?.uid && currentPhase && !isLoading && currentPhase !== "intro") {
      saveProgress({ phase: currentPhase })
    }
  }, [currentPhase, user?.uid, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-[#2d407e] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your simulation progress...</p>
        </div>
      </div>
    )
  }

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case "intro":
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Building2 className="h-16 w-16 text-[#2d407e]" />
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Inside the Hill</h1>
                  <p className="text-xl text-gray-600">Government & Politics Career Simulation</p>
                </div>
              </div>
            </div>

            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
                <CardTitle className="text-center">Welcome to Your Congressional Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-6">
                    Step into the role of a Legislative Assistant and experience the complex world of congressional
                    politics. Your mission: build support for the WATER Act and navigate the intricate process of
                    turning ideas into law.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2d407e]">What You'll Experience:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real stakeholder interactions and negotiations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Professional political writing tasks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Strategic decision-making under pressure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Understanding of the legislative process</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#765889]">Skills You'll Develop:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Persuasive communication and writing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Stakeholder management and negotiation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Political strategy and coalition building</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Critical thinking and problem-solving</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#f0ad70]/10 to-[#db9b6c]/10 p-6 rounded-lg border-l-4 border-[#f0ad70]">
                  <h4 className="font-semibold text-[#2d407e] mb-2">The Challenge</h4>
                  <p className="text-[#4e3113]">
                    America faces a water crisis: 9.2 million lead service lines, $625 billion in infrastructure needs,
                    and vulnerable communities without clean water access. The WATER Act could provide solutions, but
                    only if you can convince enough stakeholders to support it.
                  </p>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => handlePhaseComplete({}, "pre-reflection")}
                    size="lg"
                    className="px-8 bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
                  >
                    Begin Your Congressional Experience
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "pre-reflection":
        return (
          <PreReflectionForm
            onComplete={(data) => handlePhaseComplete(data, "exploration")}
            initialData={simulationData.preReflectionAnswers}
          />
        )

      case "exploration":
        return (
          <GovernmentExplorationResearch
            onComplete={(data) => handlePhaseComplete(data, "experience")}
            initialData={simulationData.explorationAnswers}
          />
        )

      case "experience":
        return <GovernmentExperiencePhase onComplete={(data) => handlePhaseComplete(data, "engage")} />

      case "engage":
        return (
          <EngagePhase
            onComplete={(data) => handlePhaseComplete(data, "evaluate")}
            initialData={simulationData.engageAnswers}
          />
        )

      case "evaluate":
        return (
          <GovernmentPostReflectionForm
            simulationResults={simulationData.experienceAnswers}
            onComplete={(data) => handlePhaseComplete(data, "envision")}
          />
        )

      case "envision":
        return (
          <EnvisionPhase
            onComplete={(data) => handlePhaseComplete(data, "complete")}
            initialData={simulationData.envisionAnswers}
            simulationType="government"
          />
        )

      case "complete":
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Simulation Complete!</h1>
              <p className="text-xl text-gray-600">
                Congratulations on completing the Inside the Hill congressional simulation.
              </p>
            </div>

            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
                <CardTitle className="text-center">Your Congressional Journey Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[#2d407e] mb-3">Experience Highlights:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>✓ Completed pre-simulation reflection</li>
                      <li>✓ Explored government and politics careers</li>
                      <li>✓ Learned congressional dynamics and processes</li>
                      <li>✓ Engaged with key congressional stakeholders</li>
                      <li>✓ Practiced professional political writing</li>
                      <li>✓ Evaluated your learning experience</li>
                      <li>✓ Envisioned future applications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#765889] mb-3">Skills Developed:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Stakeholder management and persuasion</li>
                      <li>• Professional writing and communication</li>
                      <li>• Political strategy and coalition building</li>
                      <li>• Understanding of legislative processes</li>
                      <li>• Critical thinking and problem-solving</li>
                      <li>• Civic engagement and participation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#f0ad70]/10 to-[#db9b6c]/10 p-6 rounded-lg border-l-4 border-[#f0ad70]">
                  <h4 className="font-semibold text-[#2d407e] mb-2">What's Next?</h4>
                  <p className="text-[#4e3113] mb-3">
                    You've gained valuable insights into the congressional process and developed important civic
                    engagement skills. Consider how you can apply these skills in your future career and civic
                    participation.
                  </p>
                  <ul className="text-sm text-[#4e3113] space-y-1">
                    <li>• Stay informed about policy issues that matter to you</li>
                    <li>• Practice professional communication in your studies and work</li>
                    <li>• Consider internships or volunteer opportunities in government</li>
                    <li>• Engage with your representatives on issues you care about</li>
                  </ul>
                </div>

                <div className="text-center space-y-4">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    size="lg"
                    className="px-8 bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Return to Dashboard
                  </Button>
                  <p className="text-sm text-gray-600">
                    Thank you for participating in the Inside the Hill simulation!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Loading...</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation and Progress - Matching Finance Simulation Style */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#2d407e] to-[#765889] rounded-lg shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Inside the Hill</h1>
                  <p className="text-sm text-gray-600">Government & Politics Career Simulation</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>2-3 hours</span>
              </div>

              <Badge className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">Government</Badge>

              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-xs text-green-600 hidden sm:inline">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="text-xs bg-transparent"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Navigate Congressional Processes</span>
                {getCurrentPhaseIndex() > 0 && currentPhase !== "complete" && (
                  <Button variant="outline" size="sm" onClick={handleBackStep} className="text-xs bg-transparent">
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Previous Step
                  </Button>
                )}
              </div>
              <span className="text-sm font-medium text-gray-600">{completionPercentage}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Phase Navigation - Centered */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 overflow-x-auto max-w-6xl">
              {phases.map((phase, index) => {
                const Icon = phase.icon
                const isCompleted = getCurrentPhaseIndex() > index
                const isCurrent = currentPhase === phase.id

                return (
                  <div
                    key={phase.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 text-[#2d407e]"
                        : isCompleted
                          ? "bg-green-100 text-green-800"
                          : "text-gray-500"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isCurrent ? "text-[#2d407e]" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span>{phase.name}</span>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">{renderCurrentPhase()}</main>
    </div>
  )
}
