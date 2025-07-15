"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, TrendingUp, Award, Home, RotateCcw, Building, Sparkles, Zap } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { completeSimulation } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

interface SimulationCompleteProps {
  simulationData: any
  onReturnToDashboard: () => void
  onViewCity?: () => void
}

export function SimulationComplete({ simulationData, onReturnToDashboard, onViewCity }: SimulationCompleteProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const { user, refreshUserProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const processCompletion = async () => {
      if (user) {
        try {
          // Save completion to database
          await completeSimulation(user.uid, "brand-marketing", {
            ...simulationData,
            completedAt: new Date().toISOString(),
            xpEarned: simulationData.totalXP || 875,
            badgesEarned: ["Brand Strategist", "Social Media Expert", "PR Professional"],
          })

          // Refresh user profile to get updated data
          await refreshUserProfile()

          // Show unlock animation
          setTimeout(() => {
            setShowUnlockAnimation(true)
            setIsProcessing(false)
          }, 1000)

          toast({
            title: "🎉 Simulation Complete!",
            description: "Your progress has been saved and new buildings unlocked!",
          })
        } catch (error) {
          console.error("Error completing simulation:", error)
          setIsProcessing(false)
          toast({
            title: "Error",
            description: "Failed to save progress. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    processCompletion()
  }, [user, simulationData, refreshUserProfile, toast])

  const getCompletionTime = () => {
    if (simulationData.startTime) {
      const totalMinutes = Math.floor((Date.now() - simulationData.startTime) / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }
    return "45m"
  }

  const achievements = [
    "Brand Strategist Master",
    "Partnership Specialist",
    "Social Media Guru",
    "Competitive Analyst",
    "Crisis Management Expert",
  ]

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-blue-800 mb-2">Processing Your Achievement...</h3>
            <p className="text-blue-600 mb-4">Saving your progress and unlocking new buildings in your city!</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Completion Card */}
      <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white border-0 shadow-2xl overflow-hidden relative">
        {showUnlockAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
        )}
        <CardHeader className="text-center pb-4 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
          <CardTitle className="text-4xl mb-2 font-bold">Mission Accomplished!</CardTitle>
          <p className="text-purple-100 text-xl">
            🌟 You've successfully completed "Make Your Star Shine" - Brand & Marketing Simulation
          </p>
        </CardHeader>
        <CardContent className="text-center relative z-10">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold flex items-center justify-center">
                <Zap className="mr-2 h-6 w-6 text-yellow-300" />
                {simulationData.totalXP || 875}
              </div>
              <div className="text-purple-100">XP Earned</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{getCompletionTime()}</div>
              <div className="text-purple-100">Time Spent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">5/5</div>
              <div className="text-purple-100">Tasks Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">Level {simulationData.playerLevel || 5}</div>
              <div className="text-purple-100">Final Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Unlock Notification */}
      {showUnlockAnimation && (
        <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-pulse">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Building className="mr-3 h-6 w-6" />
              <Sparkles className="mr-2 h-6 w-6 text-yellow-500" />
              New Building Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-6xl">🏢</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-2">Marketing Agency Building</h3>
                <p className="text-green-700 mb-3">
                  Congratulations! You've unlocked the Marketing Agency building in your Future Quest city. This
                  building is now available for placement and will help you access marketing simulations.
                </p>
                <Button onClick={onViewCity} className="bg-green-600 hover:bg-green-700 text-white">
                  <Building className="mr-2 h-4 w-4" />
                  View Your City
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-3 h-6 w-6 text-yellow-600" />
            Career Roles Mastered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="p-3 text-center justify-center bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200"
              >
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                {achievement}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Growth */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Knowledge Growth</h4>
                <div className="flex items-center">
                  <Badge className="bg-green-600">Significantly Improved</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Confidence Level</h4>
                <div className="flex items-center">
                  <Badge className="bg-green-600">Increased</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Skills Developed</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Brand Strategy</Badge>
                  <Badge variant="outline">Social Media</Badge>
                  <Badge variant="outline">PR Management</Badge>
                  <Badge variant="outline">Partnership Development</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Career Interest</h4>
                <Progress value={85} className="h-2" />
                <p className="text-sm text-gray-600 mt-1">High interest in marketing careers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>What's Next in Your Journey?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              🎉 Amazing work! You've successfully completed your first career simulation and unlocked the Marketing
              Agency building in your Future Quest city. Your next challenge awaits - explore healthcare careers by
              completing the "Healthcare Hero" simulation!
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🏥 Next Simulation: Healthcare Hero</h4>
              <p className="text-blue-700 text-sm">
                Ready to explore healthcare careers? Complete the Healthcare Hero simulation to unlock the Hospital
                building and continue building your Future Quest city!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={onViewCity}
                size="lg"
                className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Building className="mr-2 h-5 w-5" />
                View Your City
              </Button>
              <Button
                onClick={onReturnToDashboard}
                size="lg"
                className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/simulations")}
                className="flex items-center"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Explore More Simulations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
