"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile } from "@/lib/firebase-service"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshUserProfile: async () => null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const result = await getUserProfile(user.uid)
        if (result.success) {
          setUserProfile(result.data)
          return result.data
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error)
      }
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile
        try {
          const result = await getUserProfile(user.uid)
          if (result.success) {
            setUserProfile(result.data)

            // Only redirect if user is on a page that requires authentication
            // and they haven't completed onboarding (for students)
            const profile = result.data
            const isOnLandingPage = pathname === "/"
            const isOnAuthPage = pathname.startsWith("/auth/")
            const isOnOnboardingPage = pathname === "/onboarding"
            const isOnDashboardPage = pathname.startsWith("/dashboard/")
            const isOnSimulationPage = pathname.startsWith("/simulation") || pathname.startsWith("/simulations")
            const isOnCityPage = pathname.includes("city") || pathname.includes("simulations?tab=city")
            
            console.log("Auth provider - Current pathname:", pathname)
            console.log("Auth provider - Page checks:", {
              isOnLandingPage,
              isOnAuthPage,
              isOnOnboardingPage,
              isOnDashboardPage,
              isOnSimulationPage,
              isOnCityPage
            })
            
            // Don't redirect if user is on landing page, auth pages, or valid app pages
            if (isOnLandingPage || isOnAuthPage || isOnDashboardPage || isOnSimulationPage || isOnCityPage) {
              // Let the user stay on these pages
              console.log("Auth provider - User is on valid page, not redirecting")
              setLoading(false)
              return
            }

                        // For authenticated users on other pages, check onboarding status
            if (profile && profile.userType === "student") {
              if (!profile.onboardingCompleted && !isOnOnboardingPage) {
                // Student needs onboarding and is not on onboarding page
                console.log("Student needs onboarding, redirecting to /onboarding")
                router.push("/onboarding")
              }
              // Don't redirect students who have completed onboarding - let them navigate freely
            } else if (profile && profile.userType === "educator") {
              // Educators don't need onboarding, redirect directly to their dashboard
              if (pathname !== "/dashboard/educator") {
                console.log("Educator, redirecting to /dashboard/educator")
                router.push("/dashboard/educator")
              }
            } else if (profile && profile.userType === "counselor") {
              // Counselors redirect to counselor dashboard
              if (pathname !== "/dashboard/counselor") {
                console.log("Counselor, redirecting to /dashboard/counselor")
                router.push("/dashboard/counselor")
              }
            }
          } else {
            // Profile not found, redirect to onboarding for students
            if (!pathname.startsWith("/auth/") && pathname !== "/") {
              router.push("/onboarding")
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        setUserProfile(null)
        // If user is not authenticated and trying to access protected routes, redirect to login
        if (pathname.startsWith("/dashboard") || pathname === "/onboarding") {
          router.push("/auth/login")
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, pathname, toast])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
