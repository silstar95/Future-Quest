"use client"

import { useState, useEffect, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import dynamic from "next/dynamic"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getSimulationProgress } from "@/lib/firebase-service"
import { Search, Clock, Trophy, Play, Building, Star } from "lucide-react"

// Dynamically import the city viewer to prevent SSR issues
const GameifiedCityViewer = dynamic(
  () => import("@/components/city/gamified-city-viewer").then((mod) => ({ default: mod.GameifiedCityViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading city builder...</p>
        </div>
      </div>
    ),
  },
)

interface UserData {
  completedSimulations: string[]
  cityLevel: number
  unlockedBuildings: string[]
  simulationProgress?: { [simulationId: string]: any }
}

interface Simulation {
  id: string
  title: string
  description: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  isCompleted: boolean
  isUnlocked: boolean
  progress?: number // Student's progress in this simulation (0-100)
}

function SimulationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [tabLoading, setTabLoading] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState<{ [key: string]: number }>({})

  // Get initial tab from URL params
  const initialTab = searchParams?.get("tab") || "simulations"
  const [activeTab, setActiveTab] = useState(initialTab)

  const categories = ["All", "Marketing", "Science", "Finance", "Government"]
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

  // Helper function to calculate progress percentage based on current phase and step
  const calculateProgressPercentage = async (simulationId: string): Promise<number> => {
    if (!user?.uid) return 0

    try {
      // Get detailed progress from database
      const result = await getSimulationProgress(user.uid, simulationId)

      if (result.success && result.data) {
        const progressData = result.data

        // If simulation is completed, return 100%
        if (progressData.completed) return 100

        // Calculate based on current step and total steps
        if (progressData.currentStep && progressData.totalSteps) {
          const percentage = Math.round((progressData.currentStep / progressData.totalSteps) * 100)
          console.log(
            `📊 ${simulationId} progress: ${progressData.currentStep}/${progressData.totalSteps} = ${percentage}%`,
          )
          return percentage
        }

        // Fallback: calculate based on phase for government simulation
        if (simulationId === "government-simulation" && progressData.currentPhase) {
          const phaseProgress = {
            intro: 12.5,
            framework: 25,
            "pre-reflection": 37.5,
            exploration: 50,
            experience: 62.5,
            envision: 75,
            "post-reflection": 87.5,
            complete: 100,
          }
          const percentage = phaseProgress[progressData.currentPhase as keyof typeof phaseProgress] || 0
          console.log(`📊 ${simulationId} phase progress: ${progressData.currentPhase} = ${percentage}%`)
          return percentage
        }

        // For other simulations, use existing logic
        const phaseProgress = {
          intro: 5,
          "pre-reflection": 15,
          exploration: 35,
          experience: 75,
          "post-reflection": 90,
          complete: 100,
        }

        const currentPhase = progressData.currentPhase
        const percentage = phaseProgress[currentPhase as keyof typeof phaseProgress] || 0
        console.log(`📊 ${simulationId} fallback progress: ${currentPhase} = ${percentage}%`)
        return percentage
      }
    } catch (error) {
      console.error(`❌ Error calculating progress for ${simulationId}:`, error)
    }

    return 0
  }

  const allSimulations: Simulation[] = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description:
        "Master branding and marketing strategies through celebrity brand building. Learn to create compelling brand narratives and marketing campaigns.",
      duration: "4-6 hours",
      difficulty: "Beginner",
      category: "Marketing",
      isCompleted: userData?.completedSimulations?.includes("brand-marketing") || false,
      isUnlocked: true, // Always unlocked
      progress: simulationProgress["brand-marketing"] || 0,
    },
    {
      id: "finance-simulation",
      title: "Risk, Reward, and Real World Finance",
      description:
        "Navigate the risks and rewards of managing company finances while exploring finance careers. Experience real-world financial decision making.",
      duration: "3-4 hours",
      difficulty: "Intermediate",
      category: "Finance",
      isCompleted: userData?.completedSimulations?.includes("finance-simulation") || false,
      isUnlocked: true, // Always unlocked
      progress: simulationProgress["finance-simulation"] || 0,
    },
    {
      id: "material-science",
      title: "Future Materials Lab",
      description:
        "Explore cutting-edge material science and innovation. Discover new materials that could revolutionize technology and industry.",
      duration: "50-70 min",
      difficulty: "Intermediate",
      category: "Science",
      isCompleted: userData?.completedSimulations?.includes("material-science") || false,
      isUnlocked: true, // Always unlocked
      progress: simulationProgress["material-science"] || 0,
    },
    {
      id: "government-simulation",
      title: "Inside the Hill",
      description:
        "Navigate congressional processes and stakeholder engagement to pass the WATER Act. Experience real-world political strategy and legislative writing.",
      duration: "2-3 hours",
      difficulty: "Advanced",
      category: "Government",
      isCompleted: userData?.completedSimulations?.includes("government-simulation") || false,
      isUnlocked: true, // Always unlocked
      progress: simulationProgress["government-simulation"] || 0,
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      // Set up real-time listener for user data
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), async (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          console.log("📊 Real-time user data update:", data)
          setUserData(data)

          // Calculate progress for all simulations
          const progressPromises = allSimulations.map(async (sim) => {
            const progress = await calculateProgressPercentage(sim.id)
            return { simulationId: sim.id, progress }
          })

          const progressResults = await Promise.all(progressPromises)
          const progressMap: { [key: string]: number } = {}
          progressResults.forEach((result) => {
            progressMap[result.simulationId] = result.progress
          })

          setSimulationProgress(progressMap)
          console.log("📊 Updated simulation progress:", progressMap)
        }
        setLoadingData(false)
      })

      return () => unsubscribe()
    }
  }, [user, loading, router])

  // Update simulations with real user data
  const simulations = allSimulations.map((sim) => ({
    ...sim,
    isCompleted: userData?.completedSimulations?.includes(sim.id) || false,
    isUnlocked: true, // All simulations are now unlocked
    progress: simulationProgress[sim.id] || 0,
  }))

  const filteredSimulations = simulations.filter((simulation) => {
    const matchesSearch =
      simulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      simulation.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || simulation.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || simulation.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleSimulationStart = (simulationId: string) => {
    console.log("🚀 Starting/Continuing simulation:", simulationId)
    router.push(`/simulation/${simulationId}`)
  }

  const handleBuildingClick = (building: any) => {
    if (building.isUnlocked) {
      handleSimulationStart(building.simulationId)
    }
  }

  const getProgressStats = () => {
    const completed = simulations.filter((s) => s.isCompleted).length
    const total = simulations.length

    return { completed, total }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Simulations"
          subtitle="Explore career paths through immersive simulations"
          showBackButton={true}
          backUrl="/dashboard/student"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading simulations...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = getProgressStats()

  const handleTabChange = async (value: string) => {
    setTabLoading(true)
    // Add smooth transition delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    setActiveTab(value)
    setTabLoading(false)
  }

  const handleBackToDashboard = () => {
    // Determine the appropriate dashboard based on user type
    // For now, default to student dashboard since this is primarily for students
    router.push("/dashboard/student")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Simulations"
        subtitle="Explore career paths through immersive simulations"
        showBackButton={true}
        backUrl="/dashboard/student"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Career Simulations & City Builder
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Explore careers through immersive simulations and build your future city
          </p>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {stats.completed}/{stats.total}
                  </div>
                  <div className="text-blue-100 font-medium">Simulations</div>
                </div>
                <div className="text-4xl opacity-80">🎯</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{userData?.unlockedBuildings?.length || 1}</div>
                  <div className="text-orange-100 font-medium">Buildings</div>
                </div>
                <div className="text-4xl opacity-80">🏗️</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white shadow-lg border-2 border-gray-200">
            <TabsTrigger
              value="simulations"
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              disabled={tabLoading}
            >
              {tabLoading && activeTab === "simulations" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Simulations
            </TabsTrigger>
            <TabsTrigger
              value="city"
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              disabled={tabLoading}
            >
              {tabLoading && activeTab === "city" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Building className="w-4 h-4" />
              )}
              City Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulations" className="space-y-6">
            {tabLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading simulations...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-6 w-2/3 mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search simulations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulations Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredSimulations.map((simulation) => (
                    <Card
                      key={simulation.id}
                      className={`transition-all hover:shadow-lg ${
                        simulation.isCompleted
                          ? "border-green-200 bg-green-50"
                          : simulation.progress > 0
                            ? "border-blue-200 bg-blue-50 hover:border-blue-300"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {simulation.title}
                              {simulation.isCompleted && <Trophy className="w-5 h-5 text-yellow-500" />}
                              {simulation.progress > 0 && simulation.progress < 100 && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                  In Progress
                                </Badge>
                              )}
                              {!simulation.isUnlocked && <span className="text-gray-400">🔒</span>}
                            </CardTitle>
                            <CardDescription className="mt-2">{simulation.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-4">
                          {/* Simulation Details */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {simulation.duration}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                simulation.difficulty === "Beginner"
                                  ? "border-green-500 text-green-700"
                                  : simulation.difficulty === "Intermediate"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-red-500 text-red-700"
                              }
                            >
                              {simulation.difficulty}
                            </Badge>
                            <Badge variant="outline">{simulation.category}</Badge>
                          </div>

                          {/* Progress Bar for Student Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Your Progress</span>
                              <span className="font-medium">{Math.round(simulation.progress)}%</span>
                            </div>
                            <Progress
                              value={simulation.progress}
                              className={`h-2 ${simulation.progress > 0 ? "bg-blue-100" : "bg-gray-100"}`}
                            />
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() => handleSimulationStart(simulation.id)}
                            disabled={false} // Remove disabled state since all are unlocked
                            className={`w-full ${
                              simulation.isCompleted
                                ? "bg-green-600 hover:bg-green-700"
                                : simulation.progress > 0
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            }`}
                            variant="default" // Always use default variant since all are unlocked
                          >
                            {simulation.isCompleted ? (
                              <>
                                <Trophy className="mr-2 h-4 w-4" />
                                Replay Simulation
                              </>
                            ) : simulation.progress > 0 ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Continue Simulation ({Math.round(simulation.progress)}%)
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Start Simulation
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredSimulations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="city" className="space-y-6">
            {tabLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading city builder...</p>
                </div>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-6 h-6 text-orange-600" />
                      Build Your Future City
                    </CardTitle>
                    <CardDescription>
                      Design your career city as you unlock new paths through simulations. Each completed simulation
                      unlocks a new building representing different career opportunities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">City Stats</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-4xl font-bold text-green-600">{stats.completed}</div>
                          <div className="text-md text-green-700">Buildings Unlocked</div>
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-orange-600">{stats.total - stats.completed}</div>
                          <div className="text-md text-orange-700">Buildings Locked</div>
                        </div>
                      </div>
                    </div>

                    <GameifiedCityViewer
                      userProgress={{
                        completedSimulations: userData?.completedSimulations || [],
                        unlockedBuildings: userData?.unlockedBuildings || [],
                        cityLevel: userData?.cityLevel || 1,
                      }}
                      onBuildingClick={handleBuildingClick}
                      onSimulationStart={handleSimulationStart}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SimulationsPageContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading simulations...</p>
          </div>
        </div>
      }
    >
      <SimulationsPage />
    </Suspense>
  )
}

export default SimulationsPageContent
