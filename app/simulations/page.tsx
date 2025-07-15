"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { GameifiedCityViewer } from "@/components/city/gamified-city-viewer"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Clock, Trophy, Play, Building, Star } from "lucide-react"

interface UserData {
  completedSimulations: string[]
  totalXP: number
  cityLevel: number
  unlockedBuildings: string[]
}

interface Simulation {
  id: string
  title: string
  description: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  xpReward: number
  isCompleted: boolean
  isUnlocked: boolean
  completionRate?: number
}

export default function SimulationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [tabLoading, setTabLoading] = useState(false)

  // Get initial tab from URL params
  const initialTab = searchParams?.get("tab") || "simulations"
  const [activeTab, setActiveTab] = useState(initialTab)

  const categories = ["All", "Marketing", "Science", "Finance", "Healthcare"]
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

  const allSimulations: Simulation[] = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description:
        "Master branding and marketing strategies through celebrity brand building. Learn to create compelling brand narratives and marketing campaigns.",
      duration: "4-6 hours",
      difficulty: "Beginner",
      category: "Marketing",
      xpReward: 250,
      isCompleted: userData?.completedSimulations?.includes("brand-marketing") || false,
      isUnlocked: true,
      completionRate: 85,
    },
    {
      id: "material-science",
      title: "Future Materials Lab",
      description:
        "Explore cutting-edge material science and innovation. Discover new materials that could revolutionize technology and industry.",
      duration: "50-70 min",
      difficulty: "Intermediate",
      category: "Science",
      xpReward: 350,
      isCompleted: userData?.completedSimulations?.includes("material-science") || false,
      isUnlocked: userData?.completedSimulations?.includes("brand-marketing") || false,
      completionRate: 72,
    },
    {
      id: "finance-simulation",
      title: "Financial Strategist",
      description:
        "Learn investment strategies and financial planning. Navigate complex financial markets and make strategic investment decisions.",
      duration: "60-80 min",
      difficulty: "Advanced",
      category: "Finance",
      xpReward: 450,
      isCompleted: userData?.completedSimulations?.includes("finance-simulation") || false,
      isUnlocked: userData?.completedSimulations?.includes("material-science") || false,
      completionRate: 68,
    },
    {
      id: "healthcare-simulation",
      title: "Healthcare Hero",
      description:
        "Navigate healthcare management and patient care. Experience the challenges and rewards of working in healthcare systems.",
      duration: "55-75 min",
      difficulty: "Advanced",
      category: "Healthcare",
      xpReward: 400,
      isCompleted: userData?.completedSimulations?.includes("healthcare-simulation") || false,
      isUnlocked: userData?.completedSimulations?.includes("finance-simulation") || false,
      completionRate: 74,
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      // Set up real-time listener for user data
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          setUserData(data)
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
    isUnlocked:
      sim.id === "brand-marketing" ||
      (userData?.completedSimulations?.length || 0) >= allSimulations.findIndex((s) => s.id === sim.id),
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
    const totalXP = userData?.totalXP || 0
    const cityLevel = userData?.cityLevel || 1

    return { completed, total, totalXP, cityLevel }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {stats.completed}/{stats.total}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.totalXP.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.cityLevel}</div>
              <div className="text-sm text-gray-600">City Level</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{userData?.unlockedBuildings?.length || 1}</div>
              <div className="text-sm text-gray-600">Buildings</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="simulations" className="flex items-center gap-2" disabled={tabLoading}>
              {tabLoading && activeTab === "simulations" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Simulations
            </TabsTrigger>
            <TabsTrigger value="city" className="flex items-center gap-2" disabled={tabLoading}>
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
                  <CardContent className="p-6">
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

                      <div className="flex gap-4">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {difficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
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
                          : simulation.isUnlocked
                            ? "border-blue-200 hover:border-blue-300"
                            : "border-gray-200 bg-gray-50 opacity-75"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {simulation.title}
                              {simulation.isCompleted && <Trophy className="w-5 h-5 text-yellow-500" />}
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
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 text-purple-700 border-purple-500"
                            >
                              <Star className="w-3 h-3" />
                              {simulation.xpReward} XP
                            </Badge>
                          </div>

                          {/* Progress Bar for Completion Rate */}
                          {simulation.completionRate && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Student Success Rate</span>
                                <span className="font-medium">{simulation.completionRate}%</span>
                              </div>
                              <Progress value={simulation.completionRate} className="h-2" />
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            onClick={() => handleSimulationStart(simulation.id)}
                            disabled={!simulation.isUnlocked}
                            className={`w-full ${
                              simulation.isCompleted
                                ? "bg-green-600 hover:bg-green-700"
                                : simulation.isUnlocked
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  : ""
                            }`}
                            variant={simulation.isUnlocked ? "default" : "outline"}
                          >
                            {simulation.isCompleted ? (
                              <>
                                <Trophy className="mr-2 h-4 w-4" />
                                Replay Simulation
                              </>
                            ) : simulation.isUnlocked ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Start Simulation
                              </>
                            ) : (
                              <>🔒 Complete Previous Simulation</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredSimulations.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
                      <p className="text-gray-600">Try adjusting your search terms or filters.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="city">
            {tabLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading city builder...</p>
                </div>
              </div>
            ) : (
              <GameifiedCityViewer
                userProgress={{
                  completedSimulations: userData?.completedSimulations || [],
                  unlockedBuildings: userData?.unlockedBuildings || [],
                  cityLevel: userData?.cityLevel || 1,
                  totalXP: userData?.totalXP || 0,
                }}
                onBuildingClick={handleBuildingClick}
                onSimulationStart={handleSimulationStart}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
