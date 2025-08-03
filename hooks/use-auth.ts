"use client"

import { useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUserProfile, getUserProfile, initializeSimulationProgress } from "@/lib/firebase-service"
import { useAuth as useAuthContext } from "@/components/providers/auth-provider"

interface SignUpData {
  firstName: string
  lastName: string
  school: string
  userType: string
  grade?: string
  role?: string
  studentCount?: string
  onboardingAnswers?: any
  interests?: string[]
  recommendedSimulations?: string[]
}

interface GoogleSignUpData {
  userType: string
  school: string
  grade?: string
  role?: string
  studentCount?: string
  onboardingAnswers?: any
  interests?: string[]
  recommendedSimulations?: string[]
}

export function useAuth() {
  const { user, loading } = useAuthContext()
  const [authLoading, setAuthLoading] = useState(false)

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    setAuthLoading(true)
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

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      })

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
        // Don't throw error here, just log warning as user profile was created successfully
      }

      console.log("✅ User profile and simulation progress initialized successfully")
      return firebaseUser
    } catch (error: any) {
      console.error("❌ Sign up error:", error)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const signUpWithGoogle = async (additionalData: GoogleSignUpData) => {
    setAuthLoading(true)
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
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true)
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
    } finally {
      setAuthLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setAuthLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")

      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      // Check if user profile exists
      const userProfile = await getUserProfileData(firebaseUser.uid)

      if (userProfile) {
        // User exists, sign them in
        console.log("Existing user signed in with Google:", firebaseUser.uid)
        return userProfile
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
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      console.log("User signed out successfully")
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw new Error("Failed to sign out. Please try again.")
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

  const getUserProfileData = async (uid: string) => {
    try {
      const result = await getUserProfile(uid)
      if (result.success) {
        return result.data
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  return {
    user,
    loading: loading || authLoading,
    signUp,
    signUpWithGoogle,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    getUserProfileData,
  }
}
