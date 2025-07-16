import { db, functions } from "./firebase"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  orderBy,
  limit,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"

// Define the interface for user profile data
interface UserProfileData {
  firstName: string
  lastName: string
  email: string
  userType: string
  school: string
  grade?: string
  role?: string
  studentCount?: string
  onboardingCompleted?: boolean
  createdAt?: string
  photoURL?: string
  onboardingAnswers?: any
  interests?: string[]
  recommendedSimulations?: string[]
  completedSimulations?: string[]
  cityLevel?: number
  totalXP?: number
  badges?: string[]
  unlockedBuildings?: string[]
  cityData?: any
}

interface CreateUserProfileParams {
  uid: string
  userData: UserProfileData
}

// Cloud Functions
export const createUserProfileCloudFunction = httpsCallable<CreateUserProfileParams, any>(
  functions,
  "createUserProfile",
)
export const getUserProfileCloudFunction = httpsCallable<{ uid: string }, any>(functions, "getUserProfile")
export const updateUserProfileCloudFunction = httpsCallable<{ uid: string; updates: Partial<UserProfileData> }, any>(
  functions,
  "updateUserProfile",
)
export const saveOnboardingAnswersCloudFunction = httpsCallable<{ uid: string; answers: any }, any>(
  functions,
  "saveOnboardingAnswers",
)
export const generateInsightsCloudFunction = httpsCallable<{ uid: string }, any>(functions, "generateInsights")
export const createClassroomCloudFunction = httpsCallable<any, any>(functions, "createClassroom")
export const inviteStudentToClassroomCloudFunction = httpsCallable<any, any>(functions, "inviteStudentToClassroom")
export const getClassroomStudentsCloudFunction = httpsCallable<{ classroomId: string }, any>(
  functions,
  "getClassroomStudents",
)
export const assignSimulationToStudentCloudFunction = httpsCallable<any, any>(functions, "assignSimulationToStudent")
export const getStudentProgressCloudFunction = httpsCallable<{ studentId: string }, any>(
  functions,
  "getStudentProgress",
)
export const recordSimulationProgressCloudFunction = httpsCallable<any, any>(functions, "recordSimulationProgress")
export const getRecommendedSimulationsCloudFunction = httpsCallable<{ uid: string }, any>(
  functions,
  "getRecommendedSimulations",
)
export const createNotificationCloudFunction = httpsCallable<any, any>(functions, "createNotification")
export const markNotificationAsReadCloudFunction = httpsCallable<{ notificationId: string }, any>(
  functions,
  "markNotificationAsRead",
)
export const getUserNotificationsCloudFunction = httpsCallable<{ uid: string }, any>(functions, "getUserNotifications")
export const recordAnalyticsEventCloudFunction = httpsCallable<any, any>(functions, "recordAnalyticsEvent")

// Firestore Functions - These are the ones being imported in use-auth.ts
export async function createUserProfile(userId: string, userData: any) {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { success: false, error }
  }
}

export async function getUserProfile(uid: string) {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log("User profile retrieved:", userData)
      return {
        success: true,
        data: userData,
        message: "User profile retrieved successfully",
      }
    } else {
      console.log("No user profile found for UID:", uid)
      return {
        success: false,
        error: "User profile not found",
        data: null,
      }
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error)
    return {
      success: false,
      error: error.message || "Failed to get user profile",
      data: null,
    }
  }
}

export async function updateUserProfile(uid: string, updates: any) {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error }
  }
}

export async function saveOnboardingAnswers(uid: string, answers: any) {
  try {
    console.log("Saving onboarding answers for user:", uid, "with data:", answers)
    const userRef = doc(db, "users", uid)

    const updateData = {
      onboardingAnswers: answers,
      onboardingCompleted: true,
      interests: answers.interests || [],
      recommendedSimulations: answers.recommendedSimulations || [],
      updatedAt: serverTimestamp(),
    }

    await updateDoc(userRef, updateData)

    console.log("Onboarding answers saved successfully for user:", uid)

    return {
      success: true,
      data: updateData,
      message: "Onboarding completed successfully",
    }
  } catch (error: any) {
    console.error("Error saving onboarding answers:", error)
    return {
      success: false,
      error: error.message || "Failed to save onboarding answers",
      data: null,
    }
  }
}

export async function createClassroom(educatorId: string, classroomData: any) {
  try {
    const classroomRef = collection(db, "classrooms")

    const classroom = {
      ...classroomData,
      educatorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(classroomRef, classroom)

    console.log("Classroom created successfully with ID:", docRef.id)

    return {
      success: true,
      data: { id: docRef.id, ...classroom },
      message: "Classroom created successfully",
    }
  } catch (error: any) {
    console.error("Error creating classroom:", error)
    return {
      success: false,
      error: error.message || "Failed to create classroom",
      data: null,
    }
  }
}

export async function getEducatorClassrooms(educatorId: string) {
  try {
    const classroomsRef = collection(db, "classrooms")
    const q = query(classroomsRef, where("educatorId", "==", educatorId))
    const querySnapshot = await getDocs(q)

    const classrooms = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log("Retrieved classrooms for educator:", classrooms.length)

    return {
      success: true,
      data: classrooms,
      message: "Classrooms retrieved successfully",
    }
  } catch (error: any) {
    console.error("Error getting educator classrooms:", error)
    return {
      success: false,
      error: error.message || "Failed to get classrooms",
      data: [],
    }
  }
}

export async function saveCityLayout(cityData: any) {
  try {
    // This would save the city layout to Firestore
    // For now, just return success
    console.log("Saving city layout:", cityData)

    return {
      success: true,
      data: cityData,
      message: "City layout saved successfully",
    }
  } catch (error: any) {
    console.error("Error saving city layout:", error)
    return {
      success: false,
      error: error.message || "Failed to save city layout",
      data: null,
    }
  }
}

export async function purchaseCityItem(itemData: any) {
  try {
    // This would handle the purchase logic
    // For now, just return success with mock data
    console.log("Purchasing city item:", itemData)

    return {
      success: true,
      data: {
        success: true,
        newCoins: 150, // Mock new coin amount
      },
      message: "Item purchased successfully",
    }
  } catch (error: any) {
    console.error("Error purchasing city item:", error)
    return {
      success: false,
      error: error.message || "Failed to purchase item",
      data: null,
    }
  }
}

// Simulation Progress Functions
export const saveSimulationProgress = async (userId: string, simulationId: string, progressData: any) => {
  try {
    const progressRef = doc(db, "simulationProgress", `${userId}_${simulationId}`)
    await setDoc(
      progressRef,
      {
        userId,
        simulationId,
        ...progressData,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true },
    )

    return { success: true }
  } catch (error) {
    console.error("Error saving simulation progress:", error)
    throw error
  }
}

export const getSimulationProgress = async (userId: string, simulationId: string) => {
  try {
    const progressRef = doc(db, "simulationProgress", `${userId}_${simulationId}`)
    const progressSnap = await getDoc(progressRef)

    if (progressSnap.exists()) {
      return progressSnap.data()
    }
    return null
  } catch (error) {
    console.error("Error getting simulation progress:", error)
    throw error
  }
}

export async function getUserSimulationProgress(userId: string) {
  try {
    const progressQuery = query(collection(db, "simulationProgress"), where("userId", "==", userId))
    const progressSnap = await getDocs(progressQuery)

    const progressData = progressSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: progressData }
  } catch (error) {
    console.error("Error getting user simulation progress:", error)
    return { success: false, error }
  }
}

// Reflection responses
export async function saveReflectionResponse(userId: string, simulationId: string, phase: string, responses: any) {
  try {
    const reflectionRef = doc(db, "reflections", `${userId}_${simulationId}_${phase}`)
    await setDoc(reflectionRef, {
      userId,
      simulationId,
      phase,
      responses,
      submittedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error saving reflection response:", error)
    return { success: false, error }
  }
}

export async function getReflectionResponse(userId: string, simulationId: string, phase: string) {
  try {
    const reflectionRef = doc(db, "reflections", `${userId}_${simulationId}_${phase}`)
    const reflectionSnap = await getDoc(reflectionRef)

    if (reflectionSnap.exists()) {
      return { success: true, data: reflectionSnap.data() }
    } else {
      return { success: false, error: "Reflection not found" }
    }
  } catch (error) {
    console.error("Error getting reflection response:", error)
    return { success: false, error }
  }
}

// Task completion tracking
export async function saveTaskCompletion(userId: string, simulationId: string, taskId: string, completionData: any) {
  try {
    const taskRef = doc(db, "taskCompletions", `${userId}_${simulationId}_${taskId}`)
    await setDoc(taskRef, {
      userId,
      simulationId,
      taskId,
      ...completionData,
      completedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error saving task completion:", error)
    return { success: false, error }
  }
}

export async function getTaskCompletion(userId: string, simulationId: string, taskId: string) {
  try {
    const taskRef = doc(db, "taskCompletions", `${userId}_${simulationId}_${taskId}`)
    const taskSnap = await getDoc(taskRef)

    if (taskSnap.exists()) {
      return { success: true, data: taskSnap.data() }
    } else {
      return { success: false, error: "Task completion not found" }
    }
  } catch (error) {
    console.error("Error getting task completion:", error)
    return { success: false, error }
  }
}

// Building positions for city builder
export async function saveBuildingPositions(
  userId: string,
  positions: { [buildingId: string]: { x: number; y: number } },
) {
  try {
    const positionsRef = doc(db, "buildingPositions", userId)
    await setDoc(positionsRef, {
      userId,
      positions,
      updatedAt: serverTimestamp(),
    })
    console.log("Building positions saved successfully:", positions)
    return { success: true }
  } catch (error) {
    console.error("Error saving building positions:", error)
    return { success: false, error }
  }
}

export async function getBuildingPositions(userId: string) {
  try {
    const positionsRef = doc(db, "buildingPositions", userId)
    const positionsSnap = await getDoc(positionsRef)

    if (positionsSnap.exists()) {
      const data = positionsSnap.data()
      console.log("Building positions loaded successfully:", data.positions)
      return { success: true, data: data.positions }
    } else {
      console.log("No building positions found for user:", userId)
      return { success: false, error: "Positions not found" }
    }
  } catch (error) {
    console.error("Error getting building positions:", error)
    return { success: false, error }
  }
}

// Smooth building position saving with debouncing
const saveQueue = new Map<string, { buildingId: string; x: number; y: number; timestamp: number }>()
const SAVE_DEBOUNCE_MS = 1000 // Wait 1 second before saving

export async function saveBuildingPositionSmooth(userId: string, buildingId: string, x: number, y: number) {
  const key = `${userId}_${buildingId}`

  // Add to save queue
  saveQueue.set(key, {
    buildingId,
    x,
    y,
    timestamp: Date.now(),
  })

  // Debounce the actual save
  setTimeout(async () => {
    const queueItem = saveQueue.get(key)
    if (queueItem && Date.now() - queueItem.timestamp >= SAVE_DEBOUNCE_MS - 100) {
      try {
        // Get current positions
        const currentPositions = await getBuildingPositions(userId)
        const positions = currentPositions.success ? currentPositions.data : {}

        // Update with new position
        positions[buildingId] = { x: queueItem.x, y: queueItem.y }

        // Save to database
        await saveBuildingPositions(userId, positions)

        // Remove from queue
        saveQueue.delete(key)

        console.log(`Smooth saved position for ${buildingId}:`, { x: queueItem.x, y: queueItem.y })
      } catch (error) {
        console.error("Error in smooth save:", error)
        // Keep in queue for retry
      }
    }
  }, SAVE_DEBOUNCE_MS)
}

export async function forceSavePendingPositions(userId: string) {
  const pendingItems = Array.from(saveQueue.entries()).filter(([key]) => key.startsWith(userId))

  if (pendingItems.length === 0) return

  try {
    // Get current positions
    const currentPositions = await getBuildingPositions(userId)
    const positions = currentPositions.success ? currentPositions.data : {}

    // Update with all pending positions
    pendingItems.forEach(([key, item]) => {
      positions[item.buildingId] = { x: item.x, y: item.y }
      saveQueue.delete(key)
    })

    // Save to database
    await saveBuildingPositions(userId, positions)

    console.log("Force saved all pending positions:", positions)
  } catch (error) {
    console.error("Error force saving pending positions:", error)
  }
}

// Analytics and reporting
export async function logUserAction(userId: string, action: string, metadata: any = {}) {
  try {
    const actionRef = collection(db, "userActions")
    await addDoc(actionRef, {
      userId,
      action,
      metadata,
      timestamp: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error logging user action:", error)
    return { success: false, error }
  }
}

export async function getUserActions(userId: string, limitCount = 50) {
  try {
    const actionsQuery = query(
      collection(db, "userActions"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    )
    const actionsSnap = await getDocs(actionsQuery)

    const actions = actionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: actions }
  } catch (error) {
    console.error("Error getting user actions:", error)
    return { success: false, error }
  }
}

// Batch operations for performance
export async function batchUpdateUserProgress(
  userId: string,
  updates: Array<{
    collection: string
    docId: string
    data: any
  }>,
) {
  try {
    const batch = writeBatch(db)

    updates.forEach((update) => {
      const docRef = doc(db, update.collection, update.docId)
      batch.set(
        docRef,
        {
          ...update.data,
          userId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })

    await batch.commit()
    return { success: true }
  } catch (error) {
    console.error("Error in batch update:", error)
    return { success: false, error }
  }
}

// Real-time building unlock function
export const unlockBuilding = async (userId: string, buildingId: string) => {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      unlockedBuildings: arrayUnion(buildingId),
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error unlocking building:", error)
    throw error
  }
}

// Complete simulation function
export const completeSimulation = async (userId: string, simulationId: string, completionData: any) => {
  try {
    const userRef = doc(db, "users", userId)
    const simulationProgressRef = doc(db, "simulationProgress", `${userId}_${simulationId}`)
    
    // Update user profile with completed simulation
    await updateDoc(userRef, {
      completedSimulations: arrayUnion(simulationId),
      updatedAt: serverTimestamp(),
    })
    
    // Save detailed completion data
    await setDoc(simulationProgressRef, {
      userId,
      simulationId,
      completed: true,
      completedAt: serverTimestamp(),
      ...completionData,
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error completing simulation:", error)
    return { success: false, error }
  }
}
