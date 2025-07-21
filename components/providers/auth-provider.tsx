"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  type User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, createUserProfile, initializeSimulationProgress } from "@/lib/firebase-service"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<any>
  signIn: (email: string, password: string) => Promise<User>
  signInWithGoogle: () => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<User>
  signUpWithGoogle: (additionalData: any) => Promise<User>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshUserProfile: async () => null,
  signIn: async () => { throw new Error("AuthProvider not initialized") },
  signInWithGoogle: async () => { throw new Error("AuthProvider not initialized") },
  signUp: async () => { throw new Error("AuthProvider not initialized") },
  signUpWithGoogle: async () => { throw new Error("AuthProvider not initialized") },
  resetPassword: async () => { throw new Error("AuthProvider not initialized") },
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

  const signIn = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      console.log("User signed in successfully:", firebaseUser.uid)
      return firebaseUser
    } catch (error: any) {
      console.error("Sign in error:", error)
      // Handle specific Firebase Auth errors
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email. Please sign up first.")
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.")
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.")
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("Invalid email or password. Please check your credentials.")
      } else {
        throw new Error(error.message || "An error occurred during sign in.")
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")

      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      // Check if user profile exists
      const result = await getUserProfile(firebaseUser.uid)
      if (result.success && result.data) {
        // User exists, sign them in
        console.log("Existing user signed in with Google:", firebaseUser.uid)
        return result.data
      } else {
        // User doesn't exist, they need to sign up first
        await firebaseSignOut(auth)
        throw new Error("No account found. Please sign up first to create your profile.")
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in was cancelled. Please try again.")
      } else if (error.code === "auth/popup-blocked") {
        throw new Error("Popup was blocked. Please allow popups and try again.")
      } else {
        throw error
      }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("🔄 Starting signup process for:", email)

      // Check if email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)
      console.log("Sign-in methods for email:", signInMethods)

      if (signInMethods.length > 0) {
        throw new Error("An account with this email already exists. Please sign in instead.")
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      console.log("✅ Firebase user created:", firebaseUser.uid)

      // Create user profile in Firestore with proper initialization
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: email,
        school: userData.school,
        userType: userData.userType,
        onboardingCompleted: userData.userType === "educator", // Educators skip onboarding
        createdAt: new Date().toISOString(),
        simulationProgress: {}, // Initialize empty simulation progress
        completedSimulations: [],
        totalXP: 0,
        badges: [],
        cityProgress: {
          unlockedBuildings: ["school"], // Start with school unlocked
          buildingPositions: {},
          lastActiveSimulation: null,
        },
        ...(userData.grade && { grade: userData.grade }),
        ...(userData.role && { role: userData.role }),
        ...(userData.studentCount && { studentCount: userData.studentCount }),
        // Include onboarding data if available
        ...(userData.onboardingAnswers && {
          onboardingAnswers: userData.onboardingAnswers,
          interests: userData.interests || [],
          recommendedSimulations: userData.recommendedSimulations || [],
        }),
      }

      console.log("Creating user profile with data:", profileData)

      const result = await createUserProfile(firebaseUser.uid, profileData)

      if (!result.success) {
        console.error("❌ Failed to create user profile:", result.error)
        throw new Error(result.error || "Failed to create user profile")
      }

      // Initialize simulation progress collection
      console.log("🔄 Initializing simulation progress collection...")
      const progressResult = await initializeSimulationProgress(firebaseUser.uid)

      if (!progressResult.success) {
        console.warn("⚠️ Warning: Could not initialize simulation progress:", progressResult.error)
      }

      console.log("✅ User profile and simulation progress initialized successfully")
      return firebaseUser
    } catch (error: any) {
      console.error("❌ Sign up error:", error)
      throw error
    }
  }

  const signUpWithGoogle = async (additionalData: any) => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")

      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      // Create user profile using the additional data
      const [firstName, ...lastNameParts] = (firebaseUser.displayName || "").split(" ")
      const lastName = lastNameParts.join(" ")

      const profileData = {
        firstName: firstName || "User",
        lastName: lastName || "",
        email: firebaseUser.email || "",
        school: additionalData.school,
        userType: additionalData.userType,
        onboardingCompleted: additionalData.userType === "educator", // Educators skip onboarding
        createdAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL,
        simulationProgress: {}, // Initialize empty simulation progress
        completedSimulations: [],
        totalXP: 0,
        badges: [],
        cityProgress: {
          unlockedBuildings: ["school"], // Start with school unlocked
          buildingPositions: {},
          lastActiveSimulation: null,
        },
        ...(additionalData.grade && { grade: additionalData.grade }),
        ...(additionalData.role && { role: additionalData.role }),
        ...(additionalData.studentCount && { studentCount: additionalData.studentCount }),
        // Include onboarding data if available
        ...(additionalData.onboardingAnswers && {
          onboardingAnswers: additionalData.onboardingAnswers,
          interests: additionalData.interests || [],
          recommendedSimulations: additionalData.recommendedSimulations || [],
        }),
      }

      const result = await createUserProfile(firebaseUser.uid, profileData)

      if (!result.success) {
        console.error("❌ Failed to create user profile:", result.error)
        throw new Error(result.error || "Failed to create user profile")
      }

      // Initialize simulation progress collection
      const progressResult = await initializeSimulationProgress(firebaseUser.uid)

      if (!progressResult.success) {
        console.warn("⚠️ Warning: Could not initialize simulation progress:", progressResult.error)
      }

      console.log("✅ User profile created with Google:", result)
      return firebaseUser
    } catch (error: any) {
      console.error("Google sign up error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log("Password reset email sent to:", email)
    } catch (error: any) {
      console.error("Password reset error:", error)
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email address.")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.")
      } else {
        throw new Error(error.message || "Failed to send password reset email.")
      }
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signOut, 
      refreshUserProfile,
      signIn,
      signInWithGoogle,
      signUp,
      signUpWithGoogle,
      resetPassword
    }}>
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
