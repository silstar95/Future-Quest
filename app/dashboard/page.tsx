"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth() 
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/auth/login")
        return
      }

      if (userProfile) {
        // Redirect based on user type
        if (userProfile.userType === "student") {
          router.push("/dashboard/student")
        } else if (userProfile.userType === "educator") {
          router.push("/dashboard/educator")
        } else {
          // Fallback - redirect to onboarding if user type is unclear
          router.push("/onboarding")
        }
      }
    }
  }, [user, userProfile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
