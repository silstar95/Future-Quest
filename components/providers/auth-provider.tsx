"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile } from "@/lib/firebase-service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshUserProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const result = await getUserProfile(user.uid)
        if (result.success) {
          setUserProfile(result.data)
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error)
      }
    }
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

            // Smooth redirect based on user type and onboarding status
            const profile = result.data
            if (!profile.onboardingCompleted) {
              router.push("/onboarding")
            } else {
              // Redirect to appropriate dashboard
              const dashboardPath =
                profile.userType === "student"
                  ? "/dashboard/student"
                  : profile.userType === "educator"
                    ? "/dashboard/educator"
                    : profile.userType === "counselor"
                      ? "/dashboard/counselor"
                      : "/dashboard"

              router.push(dashboardPath)
            }
          } else {
            // Profile not found, redirect to onboarding
            router.push("/onboarding")
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
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, toast])

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
