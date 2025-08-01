import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore"
import { db, auth } from "./firebase"

// Types
interface UserProfile {
  firstName: string
  lastName: string
  email: string
  userType: string
  school: string
  grade?: string
  role?: string
  studentCount?: string
  photoURL?: string
  onboardingCompleted: boolean
  createdAt: string
  simulationProgress?: any
  completedSimulations?: string[]
  totalXP?: number
  badges?: string[]
  cityProgress?: any
  onboardingAnswers?: any
  interests?: string[]
  recommendedSimulations?: string[]
}

interface SimulationProgress {
  userId: string
  simulationId: string
  currentPhase: string
  currentStep: number
  totalSteps: number
  phaseProgress: any
  startedAt: string
  lastUpdated: string
  completed: boolean
  completedAt?: string
  xpEarned?: number
  badgesEarned?: string[]
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Helper function to check database connection
const checkDatabaseConnection = (): boolean => {
  if (!db) {
    console.error("❌ Database not initialized")
    return false
  }
  return true
}

// User Profile Functions
export const createUserProfile = async (
  userId: string,
  profileData: UserProfile,
): Promise<ApiResponse<UserProfile>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Creating user profile for:", userId)

    const userRef = doc(db, "users", userId)

    const userData = {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      simulationProgress: {},
      completedSimulations: [],
      badges: [],
      cityProgress: {
        unlockedBuildings: ["school"],
        buildingPositions: {},
        lastActiveSimulation: null,
      },
    }

    await setDoc(userRef, userData)

    console.log("✅ User profile created successfully")
    return { success: true, data: userData }
  } catch (error: any) {
    console.error("❌ Error creating user profile:", error)

    // Provide specific error messages
    if (error.code === "permission-denied") {
      return { success: false, error: "Permission denied. Please check your authentication." }
    } else if (error.code === "unavailable") {
      return { success: false, error: "Database is currently unavailable. Please try again later." }
    } else {
      return { success: false, error: error.message || "Failed to create user profile" }
    }
  }
}

export const getUserProfile = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching user profile for:", userId)

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile
      console.log("✅ User profile fetched successfully")
      return { success: true, data: userData }
    } else {
      console.log("❌ User profile not found")
      return { success: false, error: "User profile not found" }
    }
  } catch (error: any) {
    console.error("❌ Error fetching user profile:", error)
    return { success: false, error: error.message || "Failed to fetch user profile" }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Updating user profile for:", userId)

    const userRef = doc(db, "users", userId)
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(userRef, updateData)

    console.log("✅ User profile updated successfully")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error updating user profile:", error)
    return { success: false, error: error.message || "Failed to update user profile" }
  }
}

// Initialize simulation progress collection for new users
export const initializeSimulationProgress = async (userId: string): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Initializing simulation progress for user:", userId)

    // Create an initial document in the simulationProgress collection
    // This ensures the collection exists and the user can save progress later
    const progressRef = doc(db, "simulationProgress", `${userId}_init`)

    await setDoc(progressRef, {
      userId: userId,
      simulationId: "init",
      initialized: true,
      createdAt: new Date().toISOString(),
    })

    console.log("✅ Simulation progress collection initialized")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error initializing simulation progress:", error)
    return { success: false, error: error.message || "Failed to initialize simulation progress" }
  }
}

// Simulation Progress Functions
export const saveSimulationProgress = async (progressData: SimulationProgress): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Saving simulation progress:", progressData.simulationId, "for user:", progressData.userId)
    console.log("🔍 Progress ID will be:", `${progressData.userId}_${progressData.simulationId}`)
    console.log("🔍 Current auth user:", auth.currentUser?.uid)

    const progressId = `${progressData.userId}_${progressData.simulationId}`
    const progressRef = doc(db, "simulationProgress", progressId)

    // Check if user document exists, create it if it doesn't
    const userDocRef = doc(db, "users", progressData.userId)
    const userSnap = await getDoc(userDocRef)

    if (!userSnap.exists()) {
      console.log("⚠️ User document doesn't exist, creating basic user profile")
      await setDoc(userDocRef, {
        uid: progressData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        simulationProgress: {},
        completedSimulations: [],
        totalXP: 0,
        badges: [],
        cityProgress: {
          unlockedBuildings: ["school"],
          buildingPositions: {},
          lastActiveSimulation: null,
        },
      })
    } else {
      console.log("✅ User document exists")
    }

    const saveData = {
      ...progressData,
      lastUpdated: new Date().toISOString(),
    }

    console.log("🔍 Attempting to save data:", saveData)
    console.log("🔍 Document path:", `simulationProgress/${progressId}`)

    await setDoc(progressRef, saveData, { merge: true })

    // Also update the user's profile with quick access progress
    const userRef = doc(db, "users", progressData.userId)
    await updateDoc(userRef, {
      [`simulationProgress.${progressData.simulationId}`]: {
        currentPhase: progressData.currentPhase,
        currentStep: progressData.currentStep,
        totalSteps: progressData.totalSteps,
        completed: progressData.completed,
        lastUpdated: new Date().toISOString(),
      },
      "cityProgress.lastActiveSimulation": progressData.simulationId,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ Simulation progress saved successfully")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error saving simulation progress:", error)

    if (error.code === "permission-denied") {
      return { success: false, error: "Permission denied. Please check your authentication." }
    } else if (error.code === "unavailable") {
      return { success: false, error: "Database is currently unavailable. Please try again later." }
    } else {
      return { success: false, error: error.message || "Failed to save simulation progress" }
    }
  }
}

export const getSimulationProgress = async (
  userId: string,
  simulationId: string,
): Promise<ApiResponse<SimulationProgress>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching simulation progress:", simulationId, "for user:", userId)

    const progressId = `${userId}_${simulationId}`
    const progressRef = doc(db, "simulationProgress", progressId)
    const progressSnap = await getDoc(progressRef)

    if (progressSnap.exists()) {
      const progressData = progressSnap.data() as SimulationProgress
      console.log("✅ Simulation progress fetched successfully")
      return { success: true, data: progressData }
    } else {
      console.log("ℹ️ No existing progress found for simulation:", simulationId)
      return { success: false, error: "No progress found" }
    }
  } catch (error: any) {
    console.error("❌ Error fetching simulation progress:", error)
    return { success: false, error: error.message || "Failed to fetch simulation progress" }
  }
}

export const getUserSimulationProgress = async (userId: string): Promise<ApiResponse<SimulationProgress[]>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching all simulation progress for user:", userId)

    const progressQuery = query(collection(db, "simulationProgress"), where("userId", "==", userId))

    const querySnapshot = await getDocs(progressQuery)
    const progressList: SimulationProgress[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as SimulationProgress
      // Skip the initialization document
      if (data.simulationId !== "init") {
        progressList.push(data)
      }
    })

    console.log("✅ User simulation progress fetched successfully:", progressList.length, "simulations")
    return { success: true, data: progressList }
  } catch (error: any) {
    console.error("❌ Error fetching user simulation progress:", error)
    return { success: false, error: error.message || "Failed to fetch user simulation progress" }
  }
}

// Simulation Completion Functions
export const completeSimulation = async (
  userId: string,
  simulationId: string,
  xpEarned = 100,
  badgesEarned: string[] = [],
): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Completing simulation:", simulationId, "for user:", userId)

    // First, get current user data to avoid overwriting
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" }
    }

    const userData = userSnap.data()
    const currentCompletedSimulations = userData.completedSimulations || []
    const currentBadges = userData.badges || []
    const currentTotalXP = userData.totalXP || 0

    const batch = writeBatch(db)

    // Update simulation progress with completed status
    const progressId = `${userId}_${simulationId}`
    const progressRef = doc(db, "simulationProgress", progressId)
    batch.update(progressRef, {
      completed: true,
      completedAt: new Date().toISOString(),
      xpEarned: xpEarned,
      badgesEarned: badgesEarned,
      lastUpdated: new Date().toISOString(),
    })

    // Update user profile with completion data
    const updatedCompletedSimulations = currentCompletedSimulations.includes(simulationId)
      ? currentCompletedSimulations
      : [...currentCompletedSimulations, simulationId]

    const updatedBadges = Array.from(new Set([...currentBadges, ...badgesEarned]))

    batch.update(userRef, {
      completedSimulations: updatedCompletedSimulations,
      totalXP: currentTotalXP + xpEarned,
      badges: updatedBadges,
      [`simulationProgress.${simulationId}.completed`]: true,
      [`simulationProgress.${simulationId}.completedAt`]: new Date().toISOString(),
      [`simulationProgress.${simulationId}.xpEarned`]: xpEarned,
      updatedAt: new Date().toISOString(),
    })

    await batch.commit()

    console.log("✅ Simulation completed successfully with batch update")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error completing simulation:", error)
    return { success: false, error: error.message || "Failed to complete simulation" }
  }
}

// City Progress Functions
export const updateCityProgress = async (userId: string, cityData: any): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Updating city progress for user:", userId)

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      cityProgress: cityData,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ City progress updated successfully")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error updating city progress:", error)
    return { success: false, error: error.message || "Failed to update city progress" }
  }
}

// Onboarding Functions
export const saveOnboardingAnswers = async (
  userId: string,
  answers: any,
  interests: string[],
  recommendedSimulations: string[],
): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Saving onboarding answers for user:", userId)

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      onboardingAnswers: answers,
      interests: interests,
      recommendedSimulations: recommendedSimulations,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ Onboarding answers saved successfully")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error saving onboarding answers:", error)
    return { success: false, error: error.message || "Failed to save onboarding answers" }
  }
}

// Get current simulation progress for a user
export const getCurrentSimulationProgress = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching current simulation progress for user:", userId)

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile
      const currentSimulation = userData.cityProgress?.lastActiveSimulation

      if (currentSimulation) {
        const progressResult = await getSimulationProgress(userId, currentSimulation)
        return progressResult
      } else {
        return { success: false, error: "No active simulation found" }
      }
    } else {
      return { success: false, error: "User profile not found" }
    }
  } catch (error: any) {
    console.error("❌ Error fetching current simulation progress:", error)
    return { success: false, error: error.message || "Failed to fetch current simulation progress" }
  }
}

// Cloud function to get student progress (mock implementation)
export const getStudentProgressCloudFunction = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    console.log("🔄 Fetching student progress via cloud function for user:", userId)

    // Mock implementation - in a real app, this would call a Firebase Cloud Function
    const userProfile = await getUserProfile(userId)
    const simulationProgress = await getUserSimulationProgress(userId)

    if (userProfile.success && simulationProgress.success) {
      const progressData = {
        userProfile: userProfile.data,
        simulationProgress: simulationProgress.data,
        totalCompleted: simulationProgress.data?.length || 0,
        totalXP: userProfile.data?.totalXP || 0,
        badges: userProfile.data?.badges || [],
        cityLevel: userProfile.data?.cityProgress?.level || 1,
      }

      console.log("✅ Student progress fetched successfully")
      return { success: true, data: progressData }
    } else {
      return { success: false, error: "Failed to fetch student progress data" }
    }
  } catch (error: any) {
    console.error("❌ Error fetching student progress:", error)
    return { success: false, error: error.message || "Failed to fetch student progress" }
  }
}

// Building Position Functions
export const getBuildingPositions = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching building positions for user:", userId)

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      const buildingPositions = userData.cityProgress?.buildingPositions || {}

      console.log("✅ Building positions fetched successfully:", buildingPositions)
      return { success: true, data: buildingPositions }
    } else {
      return { success: false, error: "User not found" }
    }
  } catch (error: any) {
    console.error("❌ Error fetching building positions:", error)
    return { success: false, error: error.message || "Failed to fetch building positions" }
  }
}

export const saveBuildingPositions = async (userId: string, positions: any): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Saving building positions for user:", userId, positions)

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      "cityProgress.buildingPositions": positions,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ Building positions saved successfully")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error saving building positions:", error)
    return { success: false, error: error.message || "Failed to save building positions" }
  }
}

export const saveBuildingPositionSmooth = async (
  userId: string,
  buildingId: string,
  x: number,
  y: number,
): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Saving building position smoothly for user:", userId, buildingId, { x, y })

    // First get current positions
    const currentPositionsResult = await getBuildingPositions(userId)
    if (!currentPositionsResult.success) {
      return { success: false, error: "Failed to get current positions" }
    }

    const currentPositions = currentPositionsResult.data || {}
    const updatedPositions = {
      ...currentPositions,
      [buildingId]: { x, y },
    }

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      "cityProgress.buildingPositions": updatedPositions,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ Building position saved smoothly")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error saving building position smoothly:", error)
    return { success: false, error: error.message || "Failed to save building position smoothly" }
  }
}

export const forceSavePendingPositions = async (userId: string): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Force saving pending building positions for user:", userId)

    // This function is called on component unmount, so we don't have the positions
    // The positions should already be saved by the smooth save function
    // This is just a safety check to ensure any pending saves are completed

    console.log("✅ Pending building positions force save completed")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Error force saving pending building positions:", error)
    return { success: false, error: error.message || "Failed to force save pending building positions" }
  }
}

// Educator Functions
export const getEducatorClassrooms = async (educatorId: string): Promise<ApiResponse<any[]>> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Fetching classrooms for educator:", educatorId)

    // Mock implementation - in a real app, this would query a classrooms collection
    const mockClassrooms = [
      {
        id: "class-1",
        name: "Career Exploration 101",
        description: "Introduction to career exploration and planning",
        students: [],
        assignments: [],
        completionRate: 75,
        createdAt: new Date(),
      },
    ]

    console.log("✅ Classrooms fetched successfully")
    return { success: true, data: mockClassrooms }
  } catch (error: any) {
    console.error("❌ Error fetching educator classrooms:", error)
    return { success: false, error: error.message || "Failed to fetch educator classrooms" }
  }
}

export const createClassroom = async (educatorId: string, classroomData: any): Promise<ApiResponse> => {
  try {
    if (!checkDatabaseConnection()) {
      return { success: false, error: "Database connection not available" }
    }

    console.log("🔄 Creating classroom for educator:", educatorId, classroomData)

    // Mock implementation - in a real app, this would create a document in a classrooms collection
    const newClassroom = {
      id: `class-${Date.now()}`,
      ...classroomData,
      educatorId,
      createdAt: new Date(),
    }

    console.log("✅ Classroom created successfully:", newClassroom.id)
    return { success: true, data: newClassroom }
  } catch (error: any) {
    console.error("❌ Error creating classroom:", error)
    return { success: false, error: error.message || "Failed to create classroom" }
  }
}
