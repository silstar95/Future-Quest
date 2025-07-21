"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Target,
  Play,
  Users,
  Star,
  Building,
  Globe,
  ChevronRight,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  MapPin,
  Eye,
  Clock,
  Lightbulb,
} from "lucide-react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
  getStudentProgressCloudFunction,
  getCurrentSimulationProgress,
  getSimulationProgress,
} from "@/lib/firebase-service"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserData {
  firstName: string
  lastName: string
  email: string
  completedSimulations: string[]
  cityLevel: number
  badges: string[]
  unlockedBuildings: string[]
  onboardingAnswers?: any
  interests?: string[]
  currentSimulation?: string
  lastActiveSimulation?: string
  simulationProgress?: { [simulationId: string]: number }
  lastActiveAt?: string
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
  progress?: number
}

interface StudentProgress {
  completedSimulations: string[]
  totalHours: number
  badges: string[]
  currentStreak: number
  weeklyGoal: number
  weeklyProgress: number
  recentActivity: any[]
  upcomingDeadlines: any[]
  recommendedSimulations: string[]
  interests: string[]
  cityLevel: number
  unlockedBuildings: any[]
  insights?: {
    industries: string[]
    careers: string[]
    colleges: string[]
    degrees: string[]
    strengths: string[]
    workStyles: string[]
    nextSteps: string[]
  }
  simulationProgress?: { [simulationId: string]: number }
}

export function StudentDashboard() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentSimulationData, setCurrentSimulationData] = useState<{
    simulationId: string
    progress: number
    title: string
  } | null>(null)

  // Helper function to calculate progress percentage based on current phase
  const calculateProgressPercentage = (simulationId: string): number => {
    const progressData = userData?.simulationProgress?.[simulationId] || studentProgress?.simulationProgress?.[simulationId]
    if (!progressData) return 0
    
    // If it's already a number, return it
    if (typeof progressData === 'number') return progressData
    
    // If it's an object with currentPhase, calculate based on phase
    if (typeof progressData === 'object' && progressData !== null) {
      const phaseProgress = {
        intro: 5,
        "pre-reflection": 15,
        exploration: 35,
        experience: 75,
        "post-reflection": 90,
        complete: 100,
      }
      
      const currentPhase = (progressData as any).currentPhase
      return phaseProgress[currentPhase as keyof typeof phaseProgress] || 0
    }
    
    return 0
  }

  const simulations: Simulation[] = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description: "Master branding and marketing strategies through celebrity brand building",
      duration: "4-6 hours",
      difficulty: "Beginner",
      category: "Marketing",
      isCompleted: userData?.completedSimulations?.includes("brand-marketing") || false,
      isUnlocked: true,
      progress: calculateProgressPercentage("brand-marketing"),
    },
    {
      id: "material-science",
      title: "Future Materials Lab",
      description: "Explore cutting-edge material science and innovation",
      duration: "50-70 min",
      difficulty: "Intermediate",
      category: "Science",
      isCompleted: userData?.completedSimulations?.includes("material-science") || false,
      isUnlocked: userData?.completedSimulations?.includes("brand-marketing") || false,
      progress: calculateProgressPercentage("material-science"),
    },
    {
      id: "finance-simulation",
      title: "Financial Strategist",
      description: "Learn investment strategies and financial planning",
      duration: "60-80 min",
      difficulty: "Advanced",
      category: "Finance",
      isCompleted: userData?.completedSimulations?.includes("finance-simulation") || false,
      isUnlocked: userData?.completedSimulations?.includes("material-science") || false,
      progress: calculateProgressPercentage("finance-simulation"),
    },
    {
      id: "healthcare-simulation",
      title: "Healthcare Hero",
      description: "Navigate healthcare management and patient care",
      duration: "55-75 min",
      difficulty: "Advanced",
      category: "Healthcare",
      isCompleted: userData?.completedSimulations?.includes("healthcare-simulation") || false,
      isUnlocked: userData?.completedSimulations?.includes("finance-simulation") || false,
      progress: calculateProgressPercentage("healthcare-simulation"),
    },
  ]

  const fetchStudentData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Get current simulation progress from database
      const currentProgress = await getCurrentSimulationProgress(user.uid)
      if (currentProgress.success) {
        const { lastActiveSimulation, simulationProgress } = currentProgress.data

        // Find the last active simulation that's not completed
        if (
          lastActiveSimulation &&
          simulationProgress[lastActiveSimulation] > 0 &&
          simulationProgress[lastActiveSimulation] < 100
        ) {
          const simulation = simulations.find((s) => s.id === lastActiveSimulation)
          if (simulation) {
            setCurrentSimulationData({
              simulationId: lastActiveSimulation,
              progress: simulationProgress[lastActiveSimulation],
              title: simulation.title,
            })
          }
        }
      }

      // Get detailed simulation progress for each simulation
      const simulationProgressPromises = simulations.map(async (sim) => {
        try {
          const progress = await getSimulationProgress(user.uid, sim.id)
          return {
            simulationId: sim.id,
            progress: progress.success && progress.data ? Math.round((progress.data.currentStep / progress.data.totalSteps) * 100) : 0,
            data: progress.success ? progress.data : null,
          }
        } catch (error) {
          console.error(`Error getting progress for ${sim.id}:`, error)
          return {
            simulationId: sim.id,
            progress: 0,
            data: null,
          }
        }
      })

      const progressResults = await Promise.all(simulationProgressPromises)

      // Update userData with actual progress from database
      const progressMap: { [key: string]: number } = {}
      progressResults.forEach((result) => {
        progressMap[result.simulationId] = result.progress
      })

      // Calculate stats based ONLY on completed simulations
      const completedSimulations = userProfile?.completedSimulations || []
      const completedCount = completedSimulations.length

      // Each simulation takes ~1.5 hours
      const totalHours = completedCount * 1.5

      // Fetch student progress data
      const progressResult = await getStudentProgressCloudFunction(user.uid)

      if (progressResult.data?.success) {
        setStudentProgress({
          ...progressResult.data.data,
          totalHours: totalHours, // Use calculated hours
          completedSimulations: completedSimulations,
          cityLevel: completedCount,
          simulationProgress: progressMap, // Add actual progress from database
        })
      } else {
        // Set default data if no progress found
        setStudentProgress({
          completedSimulations: completedSimulations,
          totalHours: totalHours,
          badges: completedCount > 0 ? ["First Steps"] : [],
          currentStreak: 1,
          weeklyGoal: 3,
          weeklyProgress: completedCount,
          recentActivity: [],
          upcomingDeadlines: [],
          recommendedSimulations: [
            "Healthcare Administrator",
            "Software Developer",
            "Brand Manager",
            "Superconductor Engineer",
            "Creative Director",
            "Financial Analyst",
          ],
          interests: userProfile?.interests || [],
          cityLevel: completedCount,
          unlockedBuildings: completedSimulations,
          simulationProgress: progressMap, // Add actual progress from database
          insights: {
            industries: ["Technology", "Healthcare", "Creative Arts", "Finance", "Engineering", "Education"],
            careers: [
              "Software Developer",
              "UX Designer",
              "Data Scientist",
              "Healthcare Administrator",
              "Creative Director",
              "Financial Analyst",
              "Marketing Manager",
              "Project Manager",
            ],
            colleges: [
              "MIT",
              "Stanford University",
              "Harvard University",
              "UC Berkeley",
              "Carnegie Mellon",
              "Georgia Tech",
            ],
            degrees: [
              "Computer Science",
              "Business Administration",
              "Healthcare Administration",
              "Engineering",
              "Digital Media",
              "Data Science",
            ],
            strengths: [
              "Creative Problem Solving",
              "Analytical Thinking",
              "Communication Skills",
              "Leadership Potential",
            ],
            workStyles: [
              "Collaborative Team Environment",
              "Independent Project Work",
              "Creative & Flexible Setting",
              "Structured & Organized Environment",
            ],
            nextSteps: [
              "Explore advanced simulations",
              "Connect with professionals",
              "Research college programs",
              "Consider internship opportunities",
            ],
          },
        })
      }
    } catch (error) {
      console.error("Error fetching student data:", error)

      // Calculate fallback data using the same logic
      const completedSimulations = userProfile?.completedSimulations || []
      const completedCount = completedSimulations.length
      const totalHours = completedCount * 1.5

      // Set fallback data
      setStudentProgress({
        completedSimulations: completedSimulations,
        totalHours: totalHours,
        badges: completedCount > 0 ? ["First Steps"] : [],
        currentStreak: 1,
        weeklyGoal: 3,
        weeklyProgress: completedCount,
        recentActivity: [],
        upcomingDeadlines: [],
        recommendedSimulations: [
          "Healthcare Administrator",
          "Software Developer",
          "Brand Manager",
          "Superconductor Engineer",
        ],
        interests: userProfile?.interests || [],
        cityLevel: completedCount,
        unlockedBuildings: completedSimulations,
        simulationProgress: {}, // Empty progress map as fallback
      })
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    console.log("StudentDashboard useEffect - user:", user?.uid, "userProfile:", userProfile, "loading:", loading)

    if (!loading && !user) {
      console.log("No user, redirecting to login")
      router.push("/auth/login")
      return
    }

    // Only redirect if userType is explicitly "educator" or "counselor"
    // Allow students and users without a clear userType to stay on student dashboard
    if (!loading && userProfile && userProfile.userType && userProfile.userType !== "student") {
      console.log("User is not a student, redirecting to:", userProfile.userType, "dashboard")
      if (userProfile.userType === "educator") {
        router.push("/dashboard/educator")
        return
      } else if (userProfile.userType === "counselor") {
        router.push("/dashboard/counselor")
        return
      }
    }

    if (user) {
      // Call fetchStudentData first to get initial data
      fetchStudentData()

      // Set up real-time listener for user data
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          setUserData(data)

          // Update current simulation data
          if (data.lastActiveSimulation && data.simulationProgress) {
            const progress = data.simulationProgress[data.lastActiveSimulation] || 0
            if (progress > 0 && progress < 100) {
              const simulation = simulations.find((s) => s.id === data.lastActiveSimulation)
              if (simulation) {
                setCurrentSimulationData({
                  simulationId: data.lastActiveSimulation,
                  progress,
                  title: simulation.title,
                })
              }
            } else {
              setCurrentSimulationData(null)
            }
          }

          // Calculate stats based on completed simulations only
          const completedCount = data.completedSimulations?.length || 0
          const calculatedHours = completedCount * 1.5

          // Update student progress with calculated data
          if (studentProgress) {
            setStudentProgress((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                completedSimulations: data.completedSimulations || prev.completedSimulations,
                totalHours: calculatedHours,
                cityLevel: completedCount,
                unlockedBuildings: data.completedSimulations || prev.unlockedBuildings,
                // Keep other fields unchanged
                badges: prev.badges,
                currentStreak: prev.currentStreak,
                weeklyGoal: prev.weeklyGoal,
                weeklyProgress: prev.weeklyProgress,
                recentActivity: prev.recentActivity,
                upcomingDeadlines: prev.upcomingDeadlines,
                recommendedSimulations: prev.recommendedSimulations,
                interests: prev.interests,
                insights: prev.insights,
              }
            })
          }

          // Generate insights if user has completed at least one simulation
          if (data.completedSimulations && data.completedSimulations.length > 0 && !insights) {
            generateInsights(data)
          }
        }
        // Always set dataLoading to false, even if no data exists
        setDataLoading(false)
      })

      // Set a timeout to ensure dataLoading is set to false even if the listener doesn't fire
      const timeout = setTimeout(() => {
        setDataLoading(false)
      }, 3000)

      return () => {
        unsubscribe()
        clearTimeout(timeout)
      }
    }
  }, [user, userProfile, loading, router])

  const generateInsights = (data: UserData) => {
    // AI-generated insights based on completed simulations and interests
    const completedCategories = simulations
      .filter((sim) => data.completedSimulations?.includes(sim.id))
      .map((sim) => sim.category)

    const mockInsights = {
      industries: [
        "Digital Marketing & Advertising",
        "Brand Management",
        "Creative Industries",
        "Media & Communications",
      ],
      careers: ["Brand Strategist", "Digital Marketing Manager", "Creative Director", "Social Media Strategist"],
      colleges: [
        "Stanford University - Marketing Program",
        "Northwestern University - Integrated Marketing",
        "University of Pennsylvania - Wharton School",
        "New York University - Stern School",
      ],
      degrees: [
        "Bachelor of Business Administration (Marketing)",
        "Bachelor of Arts in Communications",
        "Master of Marketing",
        "MBA with Marketing Concentration",
      ],
    }

    setInsights(mockInsights)
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const firstName = userData?.firstName || userProfile?.firstName || "Student"

    if (hour < 12) {
      return `Good morning, ${firstName}! Ready to explore your future?`
    } else if (hour < 17) {
      return `Good afternoon, ${firstName}! Let's continue your journey.`
    } else {
      return `Good evening, ${firstName}! Time for some career exploration.`
    }
  }

  const getNextSimulation = () => {
    return simulations.find((sim) => sim.isUnlocked && !sim.isCompleted)
  }

  const handleContinueSimulation = () => {
    if (currentSimulationData) {
      console.log("🔄 Continuing simulation:", currentSimulationData.simulationId)
      router.push(`/simulation/${currentSimulationData.simulationId}`)
    }
  }

  const handleStartSimulation = (simulationId: string) => {
    console.log("▶️ Starting simulation:", simulationId)
    router.push(`/simulation/${simulationId}`)
  }

  const handleViewAllSimulations = () => {
    console.log("👀 Viewing all simulations")
    router.push("/simulations")
  }

  const handleViewCity = async () => {
    console.log("🏙️ Viewing city")
    setIsNavigating(true)
    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push("/simulations?tab=city")
  }

  // Only show loading screen if we don't have any user data at all
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Future Quest dashboard...</p>
        </div>
      </div>
    )
  }

  // Create fallback data if studentProgress is null
  const fallbackProgress: StudentProgress = {
    completedSimulations: userProfile?.completedSimulations || [],
    totalHours: 0,
    badges: [],
    currentStreak: 1,
    weeklyGoal: 3,
    weeklyProgress: 0,
    recentActivity: [],
    upcomingDeadlines: [],
    recommendedSimulations: [
      "Healthcare Administrator",
      "Software Developer",
      "Brand Manager",
      "Superconductor Engineer",
      "Creative Director",
      "Financial Analyst",
    ],
    interests: userProfile?.interests || [],
    cityLevel: 1,
    unlockedBuildings: [],
    insights: {
      industries: ["Technology", "Healthcare", "Creative Arts", "Finance", "Engineering", "Education"],
      careers: [
        "Software Developer",
        "UX Designer",
        "Data Scientist",
        "Healthcare Administrator",
        "Creative Director",
        "Financial Analyst",
        "Marketing Manager",
        "Project Manager",
      ],
      colleges: ["MIT", "Stanford University", "Harvard University", "UC Berkeley", "Carnegie Mellon", "Georgia Tech"],
      degrees: [
        "Computer Science",
        "Business Administration",
        "Healthcare Administration",
        "Engineering",
        "Digital Media",
        "Data Science",
      ],
      strengths: ["Creative Problem Solving", "Analytical Thinking", "Communication Skills", "Leadership Potential"],
      workStyles: [
        "Collaborative Team Environment",
        "Independent Project Work",
        "Creative & Flexible Setting",
        "Structured & Organized Environment",
      ],
      nextSteps: [
        "Explore advanced simulations",
        "Connect with professionals",
        "Research college programs",
        "Consider internship opportunities",
      ],
    },
  }

  // Use studentProgress if available, otherwise use fallback
  const displayProgress = studentProgress || fallbackProgress

  const completedCount = userData?.completedSimulations?.length || displayProgress.completedSimulations.length || 0
  const nextSimulation = getNextSimulation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <DashboardHeader
        title={`Welcome back, ${userProfile?.firstName || userData?.firstName || "Explorer"}!`}
        subtitle="Continue your Future Quest journey"
      />

      {/* Welcome Message with Logo */}
      <div className="container mx-auto px-4 pt-6">
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold">Welcome to Future Quest</h2>
            </div>
            <p className="text-lg text-indigo-100 leading-relaxed">
              Explore different career paths through immersive simulations and hands-on experiences. Discover your
              interests, build skills, and shape your future.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Side-by-side cards */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Continue Where You Left Off */}
              <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Play className="mr-3 h-6 w-6" />
                    Continue Where You Left Off
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Jump back into your career exploration journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentSimulationData ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-2 flex items-center">
                          <Star className="mr-2 h-5 w-5" />🎯 Continue Your Progress
                        </h4>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-white">{currentSimulationData.title}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(currentSimulationData.progress)}%</span>
                            </div>
                            <Progress value={currentSimulationData.progress} className="h-2 bg-white/20" />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/70">
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                              In Progress
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleContinueSimulation}
                        className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        Continue Simulation
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : nextSimulation ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-2 flex items-center">
                          <Star className="mr-2 h-5 w-5" />🎯 Recommended for You
                        </h4>
                        <p className="text-sm opacity-90 mb-4">
                          Based on your interests:{" "}
                          {userData?.interests?.join(", ") ||
                            displayProgress.interests.join(", ") ||
                            "General exploration"}
                        </p>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-white">{nextSimulation.title}</h3>
                          <p className="text-white/80 text-sm">{nextSimulation.description}</p>
                          <div className="flex items-center gap-3 text-xs text-white/70">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {nextSimulation.duration}
                            </div>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                              {nextSimulation.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                              {nextSimulation.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartSimulation(nextSimulation.id)}
                        className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        Start Simulation
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="mx-auto h-12 w-12 mb-4 opacity-70" />
                      <p className="text-lg mb-4">Ready to start your Future Quest?</p>
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        onClick={() => router.push("/onboarding")}
                      >
                        Complete Your Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Build Your Future City */}
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Building className="mr-3 h-6 w-6" />
                    Build Your Future City
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Design your career city as you unlock new paths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <h4 className="font-bold text-lg mb-2">🏗️ City Progress</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{completedCount}</div>
                          <div className="text-xs opacity-90">City Level</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{completedCount}</div>
                          <div className="text-xs opacity-90">Buildings</div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleViewCity}
                      disabled={isNavigating}
                      className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {isNavigating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Loading City...
                        </>
                      ) : (
                        <>
                          <Building className="mr-2 h-4 w-4" />
                          Open City Builder
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Your Exploration Journey */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <MapPin className="mr-3 h-6 w-6 text-blue-600" />
                  Your Exploration Journey
                </CardTitle>
                <CardDescription className="text-lg">Overview of your career exploration progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{completedCount}</div>
                    <div className="text-sm font-medium text-blue-800">Simulations Completed</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="text-4xl font-bold text-green-600 mb-2">{displayProgress.totalHours || 0}</div>
                    <div className="text-sm font-medium text-green-800">Hours Experienced</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-4xl font-bold text-purple-600 mb-2">{displayProgress.interests.length}</div>
                    <div className="text-sm font-medium text-purple-800">Careers Explored</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Simulations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl">
                  <div className="flex items-center">
                    <Target className="mr-3 h-6 w-6 text-indigo-600" />
                    Available Simulations
                  </div>
                  <Button variant="outline" onClick={handleViewAllSimulations}>
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </CardTitle>
                <CardDescription className="text-lg">
                  Curated simulations based on your interests and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {simulations.map((simulation) => (
                    <div
                      key={simulation.id}
                      className={`p-4 rounded-lg border transition-all ${
                        simulation.isCompleted
                          ? "border-green-200 bg-green-50"
                          : simulation.isUnlocked
                            ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                            : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{simulation.title}</h4>
                            {simulation.isCompleted && <Trophy className="w-4 h-4 text-yellow-500" />}
                            {!simulation.isUnlocked && <span className="text-gray-400">🔒</span>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{simulation.description}</p>

                          {/* Progress Bar */}
                          {(simulation.progress ?? 0) > 0 && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium">{Math.round(simulation.progress ?? 0)}%</span>
                              </div>
                              <Progress value={simulation.progress ?? 0} className="h-1" />
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {simulation.duration}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {simulation.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {simulation.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartSimulation(simulation.id)}
                          disabled={!simulation.isUnlocked}
                          variant={simulation.isCompleted ? "outline" : "default"}
                          size="sm"
                        >
                          {simulation.isCompleted
                            ? "Replay"
                            : (simulation.progress ?? 0) > 0
                              ? "Continue"
                              : simulation.isUnlocked
                                ? "Start"
                                : "Locked"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI-Generated Insights Panel */}
            {insights && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-purple-800">
                    <Lightbulb className="mr-2 h-6 w-6" />
                    Your Personalized Career Insights
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Based on your simulation performance and interests, here are AI-generated recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Industries to Explore
                      </h4>
                      <ul className="space-y-2">
                        {insights.industries.map((industry: string, index: number) => (
                          <li key={index} className="text-sm text-purple-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {industry}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Careers to Explore
                      </h4>
                      <ul className="space-y-2">
                        {insights.careers.map((career: string, index: number) => (
                          <li key={index} className="text-sm text-purple-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {career}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Colleges to Explore
                      </h4>
                      <ul className="space-y-2">
                        {insights.colleges.map((college: string, index: number) => (
                          <li key={index} className="text-sm text-purple-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {college}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Degree Options to Explore
                      </h4>
                      <ul className="space-y-2">
                        {insights.degrees.map((degree: string, index: number) => (
                          <li key={index} className="text-sm text-purple-700 flex items-start">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {degree}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Career Journey Stats */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Trophy className="mr-3 h-6 w-6 text-indigo-600" />
                  Your Career Journey Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Streak */}
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{displayProgress.currentStreak}</div>
                  <div className="text-sm font-medium text-yellow-800">Day Streak</div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    Badges Earned
                  </h4>
                  <div className="space-y-2">
                    {displayProgress.badges.length > 0 ? (
                      displayProgress.badges.map((badge, index) => (
                        <Badge key={index} variant="outline" className="w-full justify-start">
                          🏆 {badge}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">Complete simulations to earn badges</p>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Your Interests
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {displayProgress.interests.length > 0 ? (
                      displayProgress.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">Complete simulations to discover interests</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleViewCity}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Building className="mr-2 h-4 w-4" />
                      Build Your Future City
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleViewAllSimulations}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Explore All Simulations
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/profile")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
