"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
import { getStudentProgressCloudFunction } from "@/lib/firebase-service"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserData {
  firstName: string
  lastName: string
  email: string
  completedSimulations: string[]
  totalXP: number
  cityLevel: number
  badges: string[]
  unlockedBuildings: string[]
  onboardingAnswers?: any
  interests?: string[]
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
}

interface StudentProgress {
  completedSimulations: string[]
  totalHours: number
  level: number
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
  totalXP: number
  insights?: {
    industries: string[]
    careers: string[]
    colleges: string[]
    degrees: string[]
    strengths: string[]
    workStyles: string[]
    nextSteps: string[]
  }
}

export function StudentDashboard() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)
  const [isNavigating, setIsNavigating] = useState(false)

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
    },
    {
      id: "material-science",
      title: "Future Materials Lab",
      description: "Explore cutting-edge material science and innovation",
      duration: "",
      difficulty: "Intermediate",
      category: "Science",
      isCompleted: userData?.completedSimulations?.includes("material-science") || false,
      isUnlocked: userData?.completedSimulations?.includes("brand-marketing") || false,
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
    },
  ]

  const fetchStudentData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Calculate stats based ONLY on completed simulations
      const completedSimulations = userProfile?.completedSimulations || []
      const completedCount = completedSimulations.length

      // Level up every 2 simulations, starting at level 1
      const level = Math.floor(completedCount / 2) + 1

      // 250 XP per completed simulation
      const totalXP = completedCount * 250

      // Each simulation takes ~1.5 hours
      const totalHours = completedCount * 1.5

      // Fetch student progress data
      const progressResult = await getStudentProgressCloudFunction({ studentId: user.uid })

      if (progressResult.data?.success) {
        setStudentProgress({
          ...progressResult.data.data,
          totalHours: totalHours, // Use calculated hours
          level: level, // Use calculated level
          totalXP: totalXP, // Use calculated XP
          completedSimulations: completedSimulations,
        })
      } else {
        // Set default data if no progress found
        setStudentProgress({
          completedSimulations: completedSimulations,
          totalHours: totalHours,
          level: level,
          totalXP: totalXP,
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
          cityLevel: level,
          unlockedBuildings: completedSimulations,
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
      const level = Math.floor(completedCount / 2) + 1
      const totalXP = completedCount * 250
      const totalHours = completedCount * 1.5

      // Set fallback data
      setStudentProgress({
        completedSimulations: completedSimulations,
        totalHours: totalHours,
        level: level,
        totalXP: totalXP,
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
        cityLevel: level,
        unlockedBuildings: completedSimulations,
      })
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (!loading && userProfile?.userType !== "student") {
      router.push("/dashboard/educator")
      return
    }

    if (user) {
      // Call fetchStudentData first to get initial data
      fetchStudentData()

      // Set up real-time listener for user data
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          setUserData(data)

          // Calculate stats based on completed simulations only
          const completedCount = data.completedSimulations?.length || 0
          const calculatedLevel = Math.floor(completedCount / 2) + 1
          const calculatedXP = completedCount * 250
          const calculatedHours = completedCount * 1.5

          // Update student progress with calculated data
          if (studentProgress) {
            setStudentProgress((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                completedSimulations: data.completedSimulations || prev.completedSimulations,
                totalHours: calculatedHours,
                level: calculatedLevel,
                totalXP: calculatedXP,
                cityLevel: calculatedLevel,
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
        setDataLoading(false)
      })

      return () => unsubscribe()
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

  const handleStartSimulation = (simulationId: string) => {
    router.push(`/simulations?start=${encodeURIComponent(simulationId)}`)
  }

  const handleViewAllSimulations = () => {
    router.push("/simulations")
  }

  const handleViewCity = async () => {
    setIsNavigating(true)
    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push("/simulations?tab=city")
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Future Quest dashboard...</p>
        </div>
      </div>
    )
  }

  if (!studentProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load dashboard data. Please try again.</p>
          <Button onClick={fetchStudentData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const completedCount = userData?.completedSimulations?.length || studentProgress.completedSimulations.length || 0
  const calculatedLevel = Math.floor(completedCount / 2) + 1
  const calculatedXP = completedCount * 250
  const nextSimulation = getNextSimulation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <DashboardHeader
        title={`Welcome back, ${userProfile?.firstName || userData?.firstName || "Explorer"}!`}
        subtitle="Continue your Future Quest journey"
      />

      {/* Welcome Message */}
      <div className="container mx-auto px-4 pt-6">
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Globe className="mr-3 h-8 w-8" />
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
            {/* Continue Where You Left Off */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <Play className="mr-4 h-8 w-8" />
                  Continue Where You Left Off
                </CardTitle>
                <CardDescription className="text-emerald-100 text-lg">
                  Jump back into your career exploration journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nextSimulation ? (
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <h4 className="font-bold text-xl mb-3 flex items-center">
                        <Star className="mr-2 h-6 w-6" />🎯 Recommended for You
                      </h4>
                      <p className="text-sm opacity-90 mb-6">
                        Based on your interests:{" "}
                        {userData?.interests?.join(", ") ||
                          studentProgress.interests.join(", ") ||
                          "General exploration"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{nextSimulation.title}</h3>
                          <p className="text-white/80 mb-2">{nextSimulation.description}</p>
                          <div className="flex items-center gap-4 text-sm text-white/70">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {nextSimulation.duration}
                            </div>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                              {nextSimulation.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                              {nextSimulation.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartSimulation(nextSimulation.id)}
                          size="lg"
                          className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                          Start Simulation
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-14 text-lg"
                      onClick={handleViewCity}
                      disabled={isNavigating}
                    >
                      {isNavigating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          Loading City...
                        </>
                      ) : (
                        <>
                          <Building className="mr-3 h-6 w-6" />
                          Build Your Future City
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="mx-auto h-16 w-16 mb-6 opacity-70" />
                    <p className="text-xl mb-6">Ready to start your Future Quest?</p>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 px-8"
                      onClick={() => router.push("/onboarding")}
                    >
                      Complete Your Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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
                    <div className="text-4xl font-bold text-green-600 mb-2">{studentProgress.totalHours || 0}</div>
                    <div className="text-sm font-medium text-green-800">Hours Experienced</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-4xl font-bold text-purple-600 mb-2">{studentProgress.interests.length}</div>
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
                          {simulation.isCompleted ? "Replay" : simulation.isUnlocked ? "Start" : "Locked"}
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
                {/* Level Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Level {studentProgress.level}</span>
                    <span className="text-sm text-gray-500">Explorer</span>
                  </div>
                  <Progress value={(completedCount % 3) * 33.33} className="h-3" />
                  <p className="text-xs text-gray-500">{3 - (completedCount % 3)} simulations to next level</p>
                </div>

                {/* Current Streak */}
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{studentProgress.currentStreak}</div>
                  <div className="text-sm font-medium text-yellow-800">Day Streak</div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    Badges Earned
                  </h4>
                  <div className="space-y-2">
                    {studentProgress.badges.length > 0 ? (
                      studentProgress.badges.map((badge, index) => (
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
                    {studentProgress.interests.length > 0 ? (
                      studentProgress.interests.map((interest, index) => (
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
