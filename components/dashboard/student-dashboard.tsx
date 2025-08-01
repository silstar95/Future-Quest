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
  Lock,
} from "lucide-react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getStudentProgressCloudFunction, getSimulationProgress } from "@/lib/firebase-service"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChangePasswordModal } from "./change-password-modal"

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
  simulationProgress?: {
    [simulationId: string]: {
      completed: boolean
      completedAt?: string
      currentPhase: string
      currentStep: number
      lastUpdated: string
      totalSteps: number
    }
  }
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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  // Helper function to get completed simulations from simulationProgress
  const getCompletedSimulationsFromProgress = (simulationProgress?: UserData["simulationProgress"]): string[] => {
    if (!simulationProgress) return []

    const completed: string[] = []
    Object.entries(simulationProgress).forEach(([simulationId, progress]) => {
      if (progress && progress.completed === true) {
        completed.push(simulationId)
      }
    })

    console.log("📊 Completed simulations from progress:", completed)
    return completed
  }

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

  const simulations: Simulation[] = [
    {
      id: "brand-marketing",
      title: "Make Your Star Shine",
      description: "Master branding and marketing strategies through celebrity brand building",
      duration: "4-6 hours",
      difficulty: "Beginner",
      category: "Marketing",
      isCompleted: userData?.simulationProgress?.["brand-marketing"]?.completed || false,
      isUnlocked: true, // Always unlocked
      progress: 0, // Will be calculated async
    },
    {
      id: "finance-simulation",
      title: "Risk, Reward, and Real World Finance",
      description: "Navigate the risks and rewards of managing company finances while exploring finance careers",
      duration: "3-4 hours",
      difficulty: "Intermediate",
      category: "Finance",
      isCompleted: userData?.simulationProgress?.["finance-simulation"]?.completed || false,
      isUnlocked: true, // Always unlocked
      progress: 0, // Will be calculated async
    },
    {
      id: "material-science",
      title: "MagLev Makers: Engineering a Superconductor",
      description: "Explore cutting-edge material science and innovation",
      duration: "1-2 hours",
      difficulty: "Intermediate",
      category: "Science",
      isCompleted: userData?.simulationProgress?.["material-science"]?.completed || false,
      isUnlocked: true, // Always unlocked
      progress: 0, // Will be calculated async
    },
    {
      id: "government-simulation",
      title: "Inside the Hill",
      description:
        "Navigate congressional processes and stakeholder engagement to pass the WATER Act through strategic political maneuvering",
      duration: "2-3 hours",
      difficulty: "Advanced",
      category: "Government",
      isCompleted: userData?.simulationProgress?.["government-simulation"]?.completed || false,
      isUnlocked: true, // Always unlocked
      progress: 0, // Will be calculated async
    },
  ]

  const fetchStudentData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Calculate progress for all simulations
      const simulationProgressPromises = simulations.map(async (sim) => {
        try {
          const progress = await calculateProgressPercentage(sim.id)
          return {
            simulationId: sim.id,
            progress: progress,
          }
        } catch (error) {
          console.error(`Error getting progress for ${sim.id}:`, error)
          return {
            simulationId: sim.id,
            progress: 0,
          }
        }
      })

      const progressResults = await Promise.all(simulationProgressPromises)

      // Update simulations with actual progress from database
      const progressMap: { [key: string]: number } = {}
      progressResults.forEach((result) => {
        progressMap[result.simulationId] = result.progress
      })

      // Find current simulation (one with progress > 0 and < 100)
      let currentSimulationData = null
      for (const result of progressResults) {
        if (result.progress > 0 && result.progress < 100) {
          const simulation = simulations.find((s) => s.id === result.simulationId)
          if (simulation) {
            currentSimulationData = {
              simulationId: result.simulationId,
              progress: result.progress,
              title: simulation.title,
            }
            break
          }
        }
      }
      setCurrentSimulationData(currentSimulationData)

      // Calculate stats based ONLY on completed simulations from simulationProgress
      const completedSimulations = getCompletedSimulationsFromProgress(
        userProfile?.simulationProgress || userData?.simulationProgress,
      )
      const completedCount = completedSimulations.length

      // Each simulation takes different hours based on duration
      const getSimulationHours = (simulationId: string) => {
        switch (simulationId) {
          case "brand-marketing":
            return 5 // 4-6 hours average
          case "finance-simulation":
            return 3.5 // 3-4 hours average
          case "material-science":
            return 1 // 50-70 min average
          case "government-simulation":
            return 2.5 // 2-3 hours average
          default:
            return 1
        }
      }

      const totalHours = completedSimulations.reduce((total, simId) => {
        return total + getSimulationHours(simId)
      }, 0)

      // Calculate unique careers explored based on completed simulations
      const getCareersExplored = (completedSims: string[]) => {
        if (completedSims.length === 0) return []

        const careersBySimulation = {
          "brand-marketing": ["Brand Strategist", "Social Media Manager", "Marketing Director", "PR Manager"],
          "finance-simulation": ["Financial Analyst", "Investment Advisor", "Risk Manager", "Corporate Treasurer"],
          "material-science": ["Materials Engineer", "Research Scientist", "Product Developer", "Quality Engineer"],
          "government-simulation": [
            "Legislative Assistant",
            "Policy Analyst",
            "Congressional Staffer",
            "Government Relations Specialist",
          ],
        }

        const allCareers = new Set<string>()
        completedSims.forEach((simId) => {
          const careers = careersBySimulation[simId as keyof typeof careersBySimulation] || []
          careers.forEach((career) => allCareers.add(career))
        })

        return Array.from(allCareers)
      }

      const careersExplored = getCareersExplored(completedSimulations)

      // Fetch student progress data
      const progressResult = await getStudentProgressCloudFunction(user.uid)

      if (progressResult.data?.success) {
        setStudentProgress({
          ...progressResult.data.data,
          totalHours: totalHours, // Use calculated hours
          completedSimulations: completedSimulations,
          cityLevel: completedCount,
          simulationProgress: progressMap,
          interests: careersExplored, // Use careers explored instead of interests
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
          interests: careersExplored, // Use actual careers explored
          cityLevel: completedCount,
          unlockedBuildings: completedSimulations,
          simulationProgress: progressMap,
          insights: {
            industries: ["Technology", "Healthcare", "Creative Arts", "Finance", "Engineering", "Education"],
            careers:
              careersExplored.length > 0
                ? careersExplored
                : [
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
      const completedSimulations = getCompletedSimulationsFromProgress(userProfile?.simulationProgress)
      const completedCount = completedSimulations.length
      const getSimulationHours = (simulationId: string) => {
        switch (simulationId) {
          case "brand-marketing":
            return 5 // 4-6 hours average
          case "finance-simulation":
            return 3.5 // 3-4 hours average
          case "material-science":
            return 1 // 50-70 min average
          case "government-simulation":
            return 2.5 // 2-3 hours average
          default:
            return 1
        }
      }

      const totalHours = completedSimulations.reduce((total, simId) => {
        return total + getSimulationHours(simId)
      }, 0)

      // Calculate unique careers explored based on completed simulations
      const getCareersExplored = (completedSims: string[]) => {
        const careersBySimulation = {
          "brand-marketing": ["Brand Strategist", "Social Media Manager", "Marketing Director", "PR Manager"],
          "finance-simulation": ["Financial Analyst", "Investment Advisor", "Risk Manager", "Corporate Treasurer"],
          "material-science": ["Materials Engineer", "Research Scientist", "Product Developer", "Quality Engineer"],
          "government-simulation": [
            "Legislative Assistant",
            "Policy Analyst",
            "Congressional Staffer",
            "Government Relations Specialist",
          ],
        }

        const allCareers = new Set<string>()
        completedSims.forEach((simId) => {
          const careers = careersBySimulation[simId as keyof typeof careersBySimulation] || []
          careers.forEach((career) => allCareers.add(career))
        })

        return Array.from(allCareers)
      }

      const careersExplored = getCareersExplored(completedSimulations)

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
        interests: careersExplored, // Use careers explored
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
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), async (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          setUserData(data)

          console.log("🔄 Real-time user data update:", data)

          // Update current simulation data with fresh progress calculation
          if (data.lastActiveSimulation && data.simulationProgress) {
            const progressData = data.simulationProgress[data.lastActiveSimulation]
            if (progressData && !progressData.completed) {
              const progress = await calculateProgressPercentage(data.lastActiveSimulation)
              if (progress > 0 && progress < 100) {
                const simulation = simulations.find((s) => s.id === data.lastActiveSimulation)
                if (simulation) {
                  setCurrentSimulationData({
                    simulationId: data.lastActiveSimulation,
                    progress,
                    title: simulation.title,
                  })
                }
              }
            } else {
              setCurrentSimulationData(null)
            }
          }

          // Calculate stats based on completed simulations from simulationProgress
          const completedSimulations = getCompletedSimulationsFromProgress(data.simulationProgress)
          const completedCount = completedSimulations.length

          // Calculate hours based on actual completed simulations
          const getSimulationHours = (simulationId: string) => {
            switch (simulationId) {
              case "brand-marketing":
                return 5 // 4-6 hours average
              case "finance-simulation":
                return 3.5 // 3-4 hours average
              case "material-science":
                return 1 // 50-70 min average
              case "government-simulation":
                return 2.5 // 2-3 hours average
              default:
                return 1
            }
          }

          const calculatedHours = completedSimulations.reduce((total, simId) => {
            return total + getSimulationHours(simId)
          }, 0)

          // Calculate careers explored
          const getCareersExplored = (completedSims: string[]) => {
            if (completedSims.length === 0) return []

            const careersBySimulation = {
              "brand-marketing": ["Brand Strategist", "Social Media Manager", "Marketing Director", "PR Manager"],
              "finance-simulation": ["Financial Analyst", "Investment Advisor", "Risk Manager", "Corporate Treasurer"],
              "material-science": ["Materials Engineer", "Research Scientist", "Product Developer", "Quality Engineer"],
              "government-simulation": [
                "Legislative Assistant",
                "Policy Analyst",
                "Congressional Staffer",
                "Government Relations Specialist",
              ],
            }

            const allCareers = new Set<string>()
            completedSims.forEach((simId) => {
              const careers = careersBySimulation[simId as keyof typeof careersBySimulation] || []
              careers.forEach((career) => allCareers.add(career))
            })

            return Array.from(allCareers)
          }

          const careersExplored = getCareersExplored(completedSimulations)

          // Update student progress with calculated data
          if (studentProgress) {
            setStudentProgress((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                completedSimulations: completedSimulations,
                totalHours: calculatedHours,
                cityLevel: completedCount,
                unlockedBuildings: completedSimulations,
                interests: careersExplored,
                // Keep other fields unchanged
                badges: prev.badges,
                currentStreak: prev.currentStreak,
                weeklyGoal: prev.weeklyGoal,
                weeklyProgress: prev.weeklyProgress,
                recentActivity: prev.recentActivity,
                upcomingDeadlines: prev.upcomingDeadlines,
                recommendedSimulations: prev.recommendedSimulations,
                insights: prev.insights,
              }
            })
          }

          // Generate insights if user has completed at least one simulation
          if (completedSimulations.length > 0 && !insights) {
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
    const completedSimulations = getCompletedSimulationsFromProgress(data.simulationProgress)
    const completedCategories = simulations
      .filter((sim) => completedSimulations.includes(sim.id))
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

  const handleViewFuturePathways = () => {
    console.log("🔮 Viewing Future Pathways")
    router.push("/future-pathways")
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
    completedSimulations: getCompletedSimulationsFromProgress(userProfile?.simulationProgress),
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

  // Get actual completed count from simulationProgress
  const actualCompletedSimulations = getCompletedSimulationsFromProgress(
    userData?.simulationProgress || userProfile?.simulationProgress,
  )
  const completedCount = actualCompletedSimulations.length
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
                          🎯 Continue Your Progress
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

              {/* Build Your Future City or Future Pathways */}
              {completedCount > 0 ? (
                <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <Lightbulb className="mr-3 h-6 w-6" />
                      Your Future Pathways Ready!
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      AI-powered career insights based on your simulation experiences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-2 flex items-center">
                          <Star className="mr-2 h-5 w-5" /> Discover Your Career Path
                        </h4>
                        <p className="text-sm opacity-90 mb-4">
                          Our AI has analyzed your {completedCount} completed simulation{completedCount > 1 ? "s" : ""}{" "}
                          and generated personalized career recommendations just for you!
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">✨ Personalized career matches</div>
                          <div className="text-sm">💰 Salary and education insights</div>
                          <div className="text-sm">🎯 Next simulation recommendations</div>
                          <div className="text-sm">🚀 Alternative career pathways</div>
                        </div>
                      </div>
                      <Button
                        onClick={handleViewFuturePathways}
                        className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        View My Career Pathways
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
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
                            <div className="text-xs opacity-90">Simulations</div>
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
              )}
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
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {(() => {
                        // Calculate actual hours based on completed simulations only
                        const getSimulationHours = (simulationId: string) => {
                          switch (simulationId) {
                            case "brand-marketing":
                              return 5 // 4-6 hours average
                            case "finance-simulation":
                              return 3.5 // 3-4 hours average
                            case "material-science":
                              return 1 // 50-70 min average
                            case "government-simulation":
                              return 2.5 // 2-3 hours average
                            default:
                              return 1
                          }
                        }
                        const actualHours = actualCompletedSimulations.reduce((total, simId) => {
                          return total + getSimulationHours(simId)
                        }, 0)
                        return Math.round(actualHours * 10) / 10
                      })()}
                    </div>
                    <div className="text-sm font-medium text-green-800">Hours Experienced</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {(() => {
                        // Calculate actual careers explored based on completed simulations only
                        const getCareersExplored = (completedSims: string[]) => {
                          if (completedSims.length === 0) return 0

                          const careersBySimulation = {
                            "brand-marketing": [
                              "Brand Strategist",
                              "Social Media Manager",
                              "Marketing Director",
                              "PR Manager",
                            ],
                            "finance-simulation": [
                              "Financial Analyst",
                              "Investment Advisor",
                              "Risk Manager",
                              "Corporate Treasurer",
                            ],
                            "material-science": [
                              "Materials Engineer",
                              "Research Scientist",
                              "Product Developer",
                              "Quality Engineer",
                            ],
                            "government-simulation": [
                              "Legislative Assistant",
                              "Policy Analyst",
                              "Congressional Staffer",
                              "Government Relations Specialist",
                            ],
                          }

                          const allCareers = new Set<string>()
                          completedSims.forEach((simId) => {
                            const careers = careersBySimulation[simId as keyof typeof careersBySimulation] || []
                            careers.forEach((career) => allCareers.add(career))
                          })

                          return allCareers.size
                        }
                        return getCareersExplored(actualCompletedSimulations)
                      })()}
                    </div>
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
                  {simulations.map((simulation) => {
                    // Calculate progress for this simulation
                    const progressPercentage = displayProgress.simulationProgress?.[simulation.id] || 0

                    return (
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
                            {progressPercentage > 0 && (
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} className="h-1" />
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
                              : progressPercentage > 0
                                ? "Continue"
                                : simulation.isUnlocked
                                  ? "Start"
                                  : "Locked"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
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
                {/* <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{displayProgress.currentStreak}</div>
                  <div className="text-sm font-medium text-yellow-800">Day Streak</div>
                </div> */}

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
                {completedCount > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={handleViewFuturePathways}
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    View Career Pathways
                  </Button>
                )}
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
                {/* <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/profile")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Button> */}
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      <ChangePasswordModal open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  )
}
