import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// Cloud Function to handle user creation
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Create initial user document in Firestore
    await db.collection("users").doc(user.uid).set(
      {
        email: user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        simulationsCompleted: 0,
        simulationsStarted: 0,
        level: 1,
        badges: [],
        achievements: [],
      },
      { merge: true },
    )

    console.log(`User profile created for ${user.uid}`)
  } catch (error) {
    console.error("Error creating user profile:", error)
  }
})

// Cloud Function to handle user deletion
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document from Firestore
    await db.collection("users").doc(user.uid).delete()

    // Delete user's simulations
    const simulationsQuery = await db.collection("userSimulations").where("userId", "==", user.uid).get()

    const batch = db.batch()
    simulationsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    console.log(`User data deleted for ${user.uid}`)
  } catch (error) {
    console.error("Error deleting user data:", error)
  }
})

// User Management Functions
export const createUserProfile = onCall(async (request) => {
  try {
    const { uid, userData } = request.data

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const userProfile = {
      ...userData,
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),

      // Gamification fields (no XP)
      level: 1,
      badges: [],
      completedSimulations: [],
      currentStreak: 0,
      totalHours: 0,

      // City data
      cityData: {
        level: 1,
        buildings: [],
        layout: {},
        decorations: [],
        lastModified: admin.firestore.FieldValue.serverTimestamp(),
      },

      // Progress tracking
      simulationProgress: {},
      achievements: [],

      // Onboarding
      onboardingCompleted: false,
      onboardingAnswers: null,
    }

    await admin.firestore().collection("users").doc(uid).set(userProfile)

    return { success: true, profile: userProfile }
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw new HttpsError("internal", "Failed to create user profile")
  }
})

export const updateUserProgress = onCall(async (request) => {
  try {
    const { userId, simulationId, progress, completed } = request.data

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const userRef = admin.firestore().collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found")
    }

    const userData = userDoc.data()!
    const updates: any = {}

    // Update simulation progress
    updates[`simulationProgress.${simulationId}`] = {
      progress,
      completed,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (completed) {
      // Add to completed simulations if not already there
      const completedSimulations = userData.completedSimulations || []
      if (!completedSimulations.includes(simulationId)) {
        updates.completedSimulations = admin.firestore.FieldValue.arrayUnion(simulationId)

        // Calculate new level based on completed simulations
        const newCompletedCount = completedSimulations.length + 1
        const newLevel = Math.floor(newCompletedCount / 3) + 1

        if (newLevel > userData.level) {
          updates.level = newLevel
          // Award level-up badge
          updates.badges = admin.firestore.FieldValue.arrayUnion(`Level ${newLevel}`)
        }

        // Award simulation-specific badges
        updates.badges = admin.firestore.FieldValue.arrayUnion(`Completed ${simulationId}`)
      }
    }

    await userRef.update(updates)

    return { success: true }
  } catch (error) {
    console.error("Error updating user progress:", error)
    throw new HttpsError("internal", "Failed to update user progress")
  }
})

export const saveCityLayout = onCall(async (request) => {
  try {
    const { userId, layout, buildings } = request.data

    if (!request.auth || request.auth.uid !== userId) {
      throw new HttpsError("permission-denied", "Unauthorized")
    }

    const userRef = admin.firestore().collection("users").doc(userId)

    await userRef.update({
      "cityData.layout": layout,
      "cityData.buildings": buildings,
      "cityData.lastModified": admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error saving city layout:", error)
    throw new HttpsError("internal", "Failed to save city layout")
  }
})

export const purchaseCityItem = onCall(async (request) => {
  try {
    const { userId, itemId, itemType, cost } = request.data

    if (!request.auth || request.auth.uid !== userId) {
      throw new HttpsError("permission-denied", "Unauthorized")
    }

    const userRef = admin.firestore().collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found")
    }

    const userData = userDoc.data()!

    // For now, we'll allow all purchases since we removed currency
    // In the future, this could check for other requirements

    const updates: any = {}

    if (itemType === "building") {
      updates["cityData.buildings"] = admin.firestore.FieldValue.arrayUnion({
        id: itemId,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        position: { x: 0, y: 0 }, // Default position
      })
    } else if (itemType === "decoration") {
      updates["cityData.decorations"] = admin.firestore.FieldValue.arrayUnion({
        id: itemId,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        position: { x: 0, y: 0 },
      })
    }

    await userRef.update(updates)

    return { success: true }
  } catch (error) {
    console.error("Error purchasing city item:", error)
    throw new HttpsError("internal", "Failed to purchase city item")
  }
})

// Simulation Management Functions
export const getSimulations = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const simulationsSnapshot = await admin.firestore().collection("simulations").get()

    const simulations = simulationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { simulations }
  } catch (error) {
    console.error("Error getting simulations:", error)
    throw new HttpsError("internal", "Failed to get simulations")
  }
})

export const startSimulation = onCall(async (request) => {
  try {
    const { userId, simulationId } = request.data

    if (!request.auth || request.auth.uid !== userId) {
      throw new HttpsError("permission-denied", "Unauthorized")
    }

    const userRef = admin.firestore().collection("users").doc(userId)

    await userRef.update({
      [`simulationProgress.${simulationId}`]: {
        progress: 0,
        completed: false,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error starting simulation:", error)
    throw new HttpsError("internal", "Failed to start simulation")
  }
})

// Educator Functions
export const createClassroom = onCall(async (request) => {
  try {
    const { name, description, educatorId } = request.data

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const classroom = {
      name,
      description,
      educatorId,
      students: [],
      pendingInvites: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const classroomRef = await admin.firestore().collection("classrooms").add(classroom)

    return { success: true, classroomId: classroomRef.id }
  } catch (error) {
    console.error("Error creating classroom:", error)
    throw new HttpsError("internal", "Failed to create classroom")
  }
})

export const inviteStudentsToClassroom = onCall(async (request) => {
  try {
    const { classroomId, emails, educatorId } = request.data

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const classroomRef = admin.firestore().collection("classrooms").doc(classroomId)
    const classroomDoc = await classroomRef.get()

    if (!classroomDoc.exists) {
      throw new HttpsError("not-found", "Classroom not found")
    }

    const classroomData = classroomDoc.data()!

    if (classroomData.educatorId !== educatorId) {
      throw new HttpsError("permission-denied", "Unauthorized")
    }

    // Add pending invites
    const invites = emails.map((email: string) => ({
      email,
      invitedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending",
    }))

    await classroomRef.update({
      pendingInvites: admin.firestore.FieldValue.arrayUnion(...invites),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // TODO: Send email invitations

    return { success: true }
  } catch (error) {
    console.error("Error inviting students:", error)
    throw new HttpsError("internal", "Failed to invite students")
  }
})

// Cloud Function to handle classroom invitations
export const processClassroomInvite = onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const { classroomId, action } = data // action: 'accept' or 'decline'
    const userId = context.auth.uid

    // Get user email
    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      throw new HttpsError("not-found", "User profile not found")
    }

    const userEmail = userData.email

    // Get classroom
    const classroomDoc = await db.collection("classrooms").doc(classroomId).get()
    const classroomData = classroomDoc.data()

    if (!classroomData) {
      throw new HttpsError("not-found", "Classroom not found")
    }

    // Find pending invite
    const pendingInvite = classroomData.pendingInvites?.find((invite: any) => invite.email === userEmail)

    if (!pendingInvite) {
      throw new HttpsError("not-found", "No pending invite found")
    }

    if (action === "accept") {
      // Add student to classroom and remove from pending invites
      await db
        .collection("classrooms")
        .doc(classroomId)
        .update({
          students: admin.firestore.FieldValue.arrayUnion(userId),
          pendingInvites: admin.firestore.FieldValue.arrayRemove(pendingInvite),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      // Update student's profile
      await db
        .collection("users")
        .doc(userId)
        .update({
          classrooms: admin.firestore.FieldValue.arrayUnion(classroomId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      // Notify educator
      await db.collection("notifications").add({
        userId: classroomData.educatorId,
        type: "student_joined",
        title: "Student Joined Classroom",
        message: `${userData.firstName} ${userData.lastName} has joined your classroom "${classroomData.name}".`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return { success: true, message: "Successfully joined classroom" }
    } else if (action === "decline") {
      // Remove from pending invites
      await db
        .collection("classrooms")
        .doc(classroomId)
        .update({
          pendingInvites: admin.firestore.FieldValue.arrayRemove(pendingInvite),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      return { success: true, message: "Invitation declined" }
    } else {
      throw new HttpsError("invalid-argument", "Invalid action")
    }
  } catch (error) {
    console.error("Error processing classroom invite:", error)
    throw new HttpsError("internal", "Failed to process invitation")
  }
})

// Cloud Function to send simulation suggestions
export const suggestSimulation = onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const { studentId, simulationId, message } = data
    const educatorId = context.auth.uid

    // Verify educator has access to student
    const classroomsQuery = await db
      .collection("classrooms")
      .where("educatorId", "==", educatorId)
      .where("students", "array-contains", studentId)
      .get()

    if (classroomsQuery.empty) {
      throw new HttpsError("permission-denied", "No access to this student")
    }

    // Get educator and student data
    const [educatorDoc, studentDoc] = await Promise.all([
      db.collection("users").doc(educatorId).get(),
      db.collection("users").doc(studentId).get(),
    ])

    const educatorData = educatorDoc.data()
    const studentData = studentDoc.data()

    if (!educatorData || !studentData) {
      throw new HttpsError("not-found", "User data not found")
    }

    // Create notification for student
    await db.collection("notifications").add({
      userId: studentId,
      type: "simulation_suggested",
      title: "New Simulation Suggested",
      message: `${educatorData.firstName} ${educatorData.lastName} suggested you try the "${simulationId}" simulation. ${message || ""}`,
      data: {
        simulationId,
        educatorId,
        educatorName: `${educatorData.firstName} ${educatorData.lastName}`,
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true, message: "Simulation suggestion sent" }
  } catch (error) {
    console.error("Error suggesting simulation:", error)
    throw new HttpsError("internal", "Failed to send suggestion")
  }
})

// Helper function to generate user insights
async function generateUserInsights(userData: any, completedSimulations: any[]) {
  const interests = userData.interests || []
  const onboardingAnswers = userData.onboardingAnswers || {}

  // Industry recommendations based on interests and completed simulations
  const industryMapping: Record<string, string[]> = {
    technology: ["Technology", "Software", "AI & Machine Learning"],
    healthcare: ["Healthcare", "Biotechnology", "Medical Research"],
    business: ["Business & Finance", "Consulting", "Entrepreneurship"],
    engineering: ["Engineering", "Manufacturing", "Construction"],
    arts: ["Creative Arts", "Media & Entertainment", "Design"],
    education: ["Education", "Training & Development", "Academic Research"],
  }

  const careerMapping: Record<string, string[]> = {
    technology: ["Software Developer", "Data Scientist", "UX Designer", "Cybersecurity Analyst"],
    healthcare: ["Healthcare Administrator", "Medical Researcher", "Public Health Specialist"],
    business: ["Business Analyst", "Marketing Manager", "Financial Advisor", "Project Manager"],
    engineering: ["Mechanical Engineer", "Civil Engineer", "Environmental Engineer"],
    arts: ["Graphic Designer", "Creative Director", "Content Creator", "Art Therapist"],
    education: ["Teacher", "Curriculum Developer", "Educational Technology Specialist"],
  }

  const recommendedIndustries = new Set<string>()
  const recommendedCareers = new Set<string>()

  interests.forEach((interest: string) => {
    if (industryMapping[interest]) {
      industryMapping[interest].forEach((industry) => recommendedIndustries.add(industry))
    }
    if (careerMapping[interest]) {
      careerMapping[interest].forEach((career) => recommendedCareers.add(career))
    }
  })

  // Add insights based on completed simulations
  completedSimulations.forEach((simulation) => {
    const category = simulation.simulationId?.toLowerCase() || ""
    if (category.includes("healthcare")) {
      recommendedIndustries.add("Healthcare")
      recommendedCareers.add("Healthcare Administrator")
    } else if (category.includes("technology") || category.includes("software")) {
      recommendedIndustries.add("Technology")
      recommendedCareers.add("Software Developer")
    } else if (category.includes("business") || category.includes("marketing")) {
      recommendedIndustries.add("Business & Finance")
      recommendedCareers.add("Marketing Manager")
    }
  })

  return {
    industries: Array.from(recommendedIndustries).slice(0, 6),
    careers: Array.from(recommendedCareers).slice(0, 8),
    colleges: [
      "MIT",
      "Stanford University",
      "Harvard University",
      "UC Berkeley",
      "Carnegie Mellon University",
      "Georgia Tech",
    ],
    degrees: [
      "Computer Science",
      "Business Administration",
      "Healthcare Administration",
      "Engineering",
      "Digital Media",
      "Data Science",
    ],
    strengths: ["Creative Problem Solving", "Analytical Thinking", "Communication Skills", "Leadership Potential"],
    workStyles: [
      "Collaborative Team Environment",
      "Independent Project Work",
      "Creative & Flexible Setting",
      "Structured & Organized Environment",
    ],
    nextSteps: [
      "Explore advanced simulations in your interest areas",
      "Connect with professionals in your field of interest",
      "Research college programs aligned with your career goals",
      "Consider internship opportunities",
    ],
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
}

// Cloud Function to calculate and update user levels
export const updateUserLevel = onDocumentUpdated("userSimulations/{simulationId}", async (event) => {
  try {
    const simulationData = event.data?.after.data()

    if (!simulationData || simulationData.status !== "completed") {
      return null
    }

    const userId = simulationData.userId

    // Get user's completed simulations count
    const completedSimulationsQuery = await db
      .collection("userSimulations")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .get()

    const completedCount = completedSimulationsQuery.size
    const newLevel = Math.floor(completedCount / 3) + 1

    // Update user level
    await db.collection("users").doc(userId).update({
      level: newLevel,
      simulationsCompleted: completedCount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Check for new badges
    const badges = []
    if (completedCount >= 1) badges.push("First Steps")
    if (completedCount >= 3) badges.push("Explorer")
    if (completedCount >= 5) badges.push("Dedicated Learner")
    if (completedCount >= 10) badges.push("Career Expert")

    if (badges.length > 0) {
      await db
        .collection("users")
        .doc(userId)
        .update({
          badges: admin.firestore.FieldValue.arrayUnion(...badges),
        })

      // Create notification for new badge
      await db.collection("notifications").add({
        userId,
        type: "badge_earned",
        title: "New Badge Earned!",
        message: `Congratulations! You've earned the "${badges[badges.length - 1]}" badge.`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    console.log(`User ${userId} level updated to ${newLevel}`)
  } catch (error) {
    console.error("Error updating user level:", error)
  }
})

// Cloud Function for analytics and reporting
export const generateAnalyticsReport = onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated")
    }

    const { type, timeframe } = data // type: 'educator' | 'admin', timeframe: 'week' | 'month' | 'year'
    const userId = context.auth.uid

    // Verify user permissions
    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()

    if (!userData || (userData.userType !== "educator" && userData.role !== "admin")) {
      throw new HttpsError("permission-denied", "Insufficient permissions")
    }

    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [usersQuery, simulationsQuery] = await Promise.all([
      db.collection("users").where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate)).get(),
      db.collection("userSimulations").where("completedAt", ">=", admin.firestore.Timestamp.fromDate(startDate)).get(),
    ])

    const newUsers = usersQuery.size
    const completedSimulations = simulationsQuery.size

    // Calculate engagement metrics
    const activeUsersQuery = await db
      .collection("users")
      .where("updatedAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
      .get()

    const activeUsers = activeUsersQuery.size

    const report = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      metrics: {
        newUsers,
        activeUsers,
        completedSimulations,
        engagementRate: activeUsers > 0 ? (completedSimulations / activeUsers).toFixed(2) : "0",
      },
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    return report
  } catch (error) {
    console.error("Error generating analytics report:", error)
    throw new HttpsError("internal", "Failed to generate report")
  }
})

// Cloud Function to generate AI insights
export const generateInsights = onDocumentUpdated("userSimulations/{simulationId}", async (event) => {
  try {
    const simulationData = event.data?.after.data()

    if (!simulationData || simulationData.status !== "completed") {
      return null
    }

    const userId = simulationData.userId

    // Get user's completed simulations
    const completedSimulationsQuery = await db
      .collection("userSimulations")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .get()

    const completedSimulations = completedSimulationsQuery.docs.map((doc) => doc.data())

    // Get user profile for onboarding data
    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      console.error("User data not found")
      return null
    }

    // Generate insights based on completed simulations and user data
    const insights = await generateUserInsights(userData, completedSimulations)

    // Update user profile with new insights
    await db.collection("users").doc(userId).update({
      insights,
      insightsGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Create notification for user
    await db.collection("notifications").add({
      userId,
      type: "insights_updated",
      title: "New Career Insights Available!",
      message: "We've updated your career insights based on your latest simulation completion.",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`Insights generated for user ${userId}`)
  } catch (error) {
    console.error("Error generating insights:", error)
  }
})

// Triggers
export const onUserCreated = onDocumentCreated("users/{userId}", async (event) => {
  const userData = event.data?.data()
  const userId = event.params.userId

  if (userData?.userType === "student") {
    // Initialize student-specific data
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        cityData: {
          level: 1,
          buildings: [],
          layout: {},
          decorations: [],
          lastModified: admin.firestore.FieldValue.serverTimestamp(),
        },
      })
  }
})

export const onSimulationCompleted = onDocumentUpdated("users/{userId}", async (event) => {
  const beforeData = event.data?.before.data()
  const afterData = event.data?.after.data()

  if (!beforeData || !afterData) return

  const beforeCompleted = beforeData.completedSimulations || []
  const afterCompleted = afterData.completedSimulations || []

  // Check if a new simulation was completed
  if (afterCompleted.length > beforeCompleted.length) {
    const newSimulations = afterCompleted.filter((sim: string) => !beforeCompleted.includes(sim))

    for (const simulationId of newSimulations) {
      // Award badges, update city, etc.
      console.log(`User ${event.params.userId} completed simulation: ${simulationId}`)

      // TODO: Implement city building unlocks based on simulation completion
      // TODO: Send notifications to educators if student is in a classroom
    }
  }
})
