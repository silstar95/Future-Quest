"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Heart, Clock, ArrowLeft, Construction, CheckCircle } from "lucide-react"

export default function HealthcareSimulation() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
  }, [user, loading, router])

  const handleBackToDashboard = () => {
    router.push("/dashboard/student")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Healthcare Hero</h1>
                  <p className="text-sm text-gray-600">Healthcare Career Simulation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                55-75 min
              </div>
              <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white">Healthcare</Badge>

              {/* Save Status - Placeholder for consistency */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Welcome to Healthcare Hero</span>
              <span className="text-sm text-gray-500">0% Complete</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Construction className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                🏥 The Healthcare Hero simulation is currently under development. This comprehensive simulation will let
                you navigate healthcare management and patient care, experiencing the challenges and rewards of working
                in healthcare systems.
              </p>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200 mb-8">
                <h3 className="font-bold text-red-800 mb-3">What You'll Experience:</h3>
                <ul className="text-sm text-red-700 space-y-2 text-left max-w-md mx-auto">
                  <li>• 🏥 Healthcare administration challenges</li>
                  <li>• 👩‍⚕️ Patient care coordination</li>
                  <li>• 📊 Medical data analysis</li>
                  <li>• 💊 Treatment planning and management</li>
                  <li>• 🤝 Healthcare team collaboration</li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Complete the <strong>Future Materials Lab</strong> simulation to unlock this experience.
                </p>
                <Button
                  onClick={handleBackToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
