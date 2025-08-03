"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUserProfile, getUserProfile, initializeSimulationProgress } from "@/lib/firebase-service"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loadUserProfile = async (uid: string) => {
    try {
      const result = await getUserProfile(uid)
      if (result.success) {
        setUserProfile(result.data)
      } else {
        console.error("Failed to load user profile:", result.error)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      const profileResult = await createUserProfile(user.uid, {
        ...userData,
        email: user.email || email,
      })

      if (profileResult.success) {
        // Initialize simulation progress collection
        await initializeSimulationProgress(user.uid)

        setUserProfile(profileResult.data)
        return { success: true }
      } else {
        throw new Error(profileResult.error || "Failed to create user profile")
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user profile exists, create if not
      const profileResult = await getUserProfile(user.uid)
      if (!profileResult.success) {
        // Create basic profile for Google sign-in users
        const userData = {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email || "",
          userType: "student", // Default to student
          school: "",
          photoURL: user.photoURL || "",
          onboardingCompleted: false,
        }

        const createResult = await createUserProfile(user.uid, userData)
        if (createResult.success) {
          await initializeSimulationProgress(user.uid)
          setUserProfile(createResult.data)
        }
      } else {
        setUserProfile(profileResult.data)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUserProfile(null)
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
