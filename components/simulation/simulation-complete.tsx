"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp, Award, Home, RotateCcw, Building, Sparkles } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { completeSimulation } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

interface SimulationCompleteProps {
  simulationData: any
  onReturnToDashboard: () => void
  onViewCity?: () => void
  simulationType?: string
}

export function SimulationComplete({
  simulationData,
  onReturnToDashboard,
  onViewCity,
  simulationType = "general",
}: SimulationCompleteProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const getSimulationContent = () => {
    switch (simulationType) {
      case "finance":
        return {
          title: "Risk, Reward, and Real World Finance",
          field: "Finance",
          icon: "💰",
          building: "Finance Center Building",
          buildingDescription:
            "This building is now available for placement and will help you access finance simulations.",
          achievements: [
            "Financial Analyst Master",
            "Investment Specialist",
            "Risk Management Expert",
            "Corporate Finance Pro",
            "Financial Planning Guru",
          ],
          skills: ["financial analysis", "investment planning", "budgeting", "risk assessment"],
        }
      case "brand-marketing":
        return {
          title: "Make Your Star Shine",
          field: "Brand & Marketing",
          icon: "🎯",
          building: "Marketing Agency Building",
          buildingDescription:
            "This building is now available for placement and will help you access marketing simulations.",
          achievements: [
            "Brand Strategist Master",
            "Partnership Specialist",
            "Social Media Guru",
            "Competitive Analyst",
            "Crisis Management Expert",
          ],
          skills: ["brand strategy", "market research", "creative thinking", "campaign development"],
        }
      case "material-science":
        return {
          title: "MagLev Makers: Engineering a Superconductor",
          field: "Material Science",
          icon: "🔬",
          building: "Research Laboratory Building",
          buildingDescription:
            "This building is now available for placement and will help you access material science simulations.",
          achievements: [
            "Materials Engineer",
            "Research Specialist",
            "Superconductor Expert",
            "Lab Technician Pro",
            "Innovation Leader",
          ],
          skills: ["materials analysis", "research methodology", "laboratory techniques", "scientific thinking"],
        }
      case "government":
        return {
          title: "Inside the Hill",
          field: "Government & Politics",
          icon: "🏛️",
          building: "Government Center Building",
          buildingDescription:
            "This building is now available for placement and will help you access government simulations.",
          achievements: [
            "Policy Analyst",
            "Legislative Expert",
            "Public Affairs Specialist",
            "Government Relations Pro",
            "Civic Engagement Leader",
          ],
          skills: ["policy analysis", "public speaking", "research and writing", "stakeholder management"],
        }
      default:
        return {
          title: "Career Simulation",
          field: "Professional",
          icon: "🎓",
          building: "Professional Development Building",
          buildingDescription:
            "This building is now available for placement and will help you access career simulations.",
          achievements: [
            "Professional Expert",
            "Career Explorer",
            "Skill Builder",
            "Industry Specialist",
            "Future Leader",
          ],
          skills: ["professional skills", "critical thinking", "problem-solving", "communication"],
        }
    }
  }

  const content = getSimulationContent()

  useEffect(() => {
    const processCompletion = async () => {
      if (user) {
        try {
          // Save completion to database
          await completeSimulation(user.uid, simulationType, {
            ...simulationData,
            completedAt: new Date().toISOString(),
            xpEarned: simulationData.totalXP || 875,
            badgesEarned: content.achievements.slice(0, 3),
          })

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
  }, [user, simulationData, toast, simulationType, content.achievements])

  const getCompletionTime = () => {
    if (simulationData.startTime) {
      const totalMinutes = Math.floor((Date.now() - simulationData.startTime) / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }
    return "45m"
  }

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-[#db9b6c]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2d407e] mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-[#2d407e] mb-2">Processing Your Achievement...</h3>
            <p className="text-[#4e3113] mb-4">Saving your progress and unlocking new buildings in your city!</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-[#2d407e] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#2d407e] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#2d407e] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Completion Card */}
      <Card className="bg-gradient-to-r from-[#2d407e] via-[#765889] to-[#db9b6c] text-white border-0 shadow-2xl overflow-hidden relative">
        {showUnlockAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 animate-pulse"></div>
        )}
        <CardHeader className="text-center pb-4 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="h-12 w-12 text-[#f0ad70]" />
            </div>
          </div>
          <CardTitle className="text-4xl mb-2 font-bold">Mission Accomplished!</CardTitle>
          <p className="text-[#f0ad70] text-xl">
            {content.icon} You've successfully completed "{content.title}" - {content.field} Simulation
          </p>
        </CardHeader>
        <CardContent className="text-center relative z-10">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{getCompletionTime()}</div>
              <div className="text-[#f0ad70]">Time Spent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">5/5</div>
              <div className="text-[#f0ad70]">Tasks Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Unlock Notification */}
      {showUnlockAnimation && (
        <Card className="border-2 border-[#713c09]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 shadow-lg animate-pulse">
          <CardHeader>
            <CardTitle className="flex items-center text-[#2d407e]">
              <Building className="mr-3 h-6 w-6" />
              <Sparkles className="mr-2 h-6 w-6 text-[#f0ad70]" />
              New Building Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-6xl">🏢</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2d407e] mb-2">{content.building}</h3>
                <p className="text-[#4e3113] mb-3">
                  Congratulations! You've unlocked the {content.building} in your Future Quest city.{" "}
                  {content.buildingDescription}
                </p>
                {onViewCity && (
                  <Button onClick={onViewCity} className="bg-[#713c09] hover:bg-[#4e3113] text-white">
                    <Building className="mr-2 h-4 w-4" />
                    View Your City
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-3 h-6 w-6 text-[#f0ad70]" />
            Career Roles Mastered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {content.achievements.map((achievement, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="p-3 text-center justify-center bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 text-[#2d407e] border-[#db9b6c]/30"
              >
                <Star className="mr-2 h-4 w-4 text-[#f0ad70]" />
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
            <TrendingUp className="mr-3 h-6 w-6 text-[#713c09]" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Knowledge Growth</h4>
                <div className="flex items-center">
                  <Badge className="bg-[#713c09] text-white">Significantly Improved</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Confidence Level</h4>
                <div className="flex items-center">
                  <Badge className="bg-[#713c09] text-white">Increased</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Skills Developed</h4>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="border-[#db9b6c] text-[#4e3113]">
                      {skill}
                    </Badge>
                  ))}
                </div>
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
              🎉 Amazing work! You've successfully completed your {content.field.toLowerCase()} simulation and unlocked
              the {content.building} in your Future Quest city. Your next challenge awaits - explore other career fields
              by completing additional simulations!
            </p>

            <div className="bg-[#f0ad70]/20 p-4 rounded-lg border border-[#db9b6c]/30">
              <h4 className="font-semibold text-[#2d407e] mb-2">🚀 Continue Your Career Exploration</h4>
              <p className="text-[#4e3113] text-sm">
                Ready to explore other career fields? Complete additional simulations to unlock more buildings and
                continue building your Future Quest city!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {onViewCity && (
                <Button
                  onClick={onViewCity}
                  size="lg"
                  className="flex items-center bg-gradient-to-r from-[#713c09] to-[#4e3113] hover:from-[#4e3113] hover:to-[#231349]"
                >
                  <Building className="mr-2 h-5 w-5" />
                  View Your City
                </Button>
              )}
              <Button
                onClick={onReturnToDashboard}
                size="lg"
                className="flex items-center bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/simulations")}
                className="flex items-center border-[#db9b6c] text-[#4e3113] hover:bg-[#f0ad70]/20"
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
