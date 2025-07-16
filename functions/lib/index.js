"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnalyticsReport = exports.suggestSimulation = exports.processClassroomInvite = exports.inviteStudentsToClassroom = exports.createClassroom = exports.startSimulation = exports.getSimulations = exports.purchaseCityItem = exports.saveCityLayout = exports.updateUserProgress = exports.createUserProfile = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Note: Auth triggers are commented out for now due to v2 compatibility issues
// They can be re-enabled once the proper v2 syntax is confirmed
// User Management Functions
exports.createUserProfile = (0, https_1.onCall)(async (request) => {
    try {
        const { uid, userData } = request.data;
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const userProfile = Object.assign(Object.assign({}, userData), { uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), lastLoginAt: admin.firestore.FieldValue.serverTimestamp(), 
            // Gamification fields (no XP)
            level: 1, badges: [], completedSimulations: [], currentStreak: 0, totalHours: 0, 
            // City data
            cityData: {
                level: 1,
                buildings: [],
                layout: {},
                decorations: [],
                lastModified: admin.firestore.FieldValue.serverTimestamp(),
            }, 
            // Progress tracking
            simulationProgress: {}, achievements: [], 
            // Onboarding
            onboardingCompleted: false, onboardingAnswers: null });
        await admin.firestore().collection("users").doc(uid).set(userProfile);
        return { success: true, profile: userProfile };
    }
    catch (error) {
        console.error("Error creating user profile:", error);
        throw new https_1.HttpsError("internal", "Failed to create user profile");
    }
});
exports.updateUserProgress = (0, https_1.onCall)(async (request) => {
    try {
        const { userId, simulationId, progress, completed } = request.data;
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError("not-found", "User not found");
        }
        const userData = userDoc.data();
        const updates = {};
        // Update simulation progress
        updates[`simulationProgress.${simulationId}`] = {
            progress,
            completed,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (completed) {
            // Add to completed simulations if not already there
            const completedSimulations = userData.completedSimulations || [];
            if (!completedSimulations.includes(simulationId)) {
                updates.completedSimulations = admin.firestore.FieldValue.arrayUnion(simulationId);
                // Calculate new level based on completed simulations
                const newCompletedCount = completedSimulations.length + 1;
                const newLevel = Math.floor(newCompletedCount / 3) + 1;
                if (newLevel > userData.level) {
                    updates.level = newLevel;
                    // Award level-up badge
                    updates.badges = admin.firestore.FieldValue.arrayUnion(`Level ${newLevel}`);
                }
                // Award simulation-specific badges
                updates.badges = admin.firestore.FieldValue.arrayUnion(`Completed ${simulationId}`);
            }
        }
        await userRef.update(updates);
        return { success: true };
    }
    catch (error) {
        console.error("Error updating user progress:", error);
        throw new https_1.HttpsError("internal", "Failed to update user progress");
    }
});
exports.saveCityLayout = (0, https_1.onCall)(async (request) => {
    try {
        const { userId, layout, buildings } = request.data;
        if (!request.auth || request.auth.uid !== userId) {
            throw new https_1.HttpsError("permission-denied", "Unauthorized");
        }
        const userRef = admin.firestore().collection("users").doc(userId);
        await userRef.update({
            "cityData.layout": layout,
            "cityData.buildings": buildings,
            "cityData.lastModified": admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error saving city layout:", error);
        throw new https_1.HttpsError("internal", "Failed to save city layout");
    }
});
exports.purchaseCityItem = (0, https_1.onCall)(async (request) => {
    try {
        const { userId, itemId, itemType } = request.data;
        if (!request.auth || request.auth.uid !== userId) {
            throw new https_1.HttpsError("permission-denied", "Unauthorized");
        }
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError("not-found", "User not found");
        }
        // For now, we'll allow all purchases since we removed currency
        // In the future, this could check for other requirements
        const updates = {};
        if (itemType === "building") {
            updates["cityData.buildings"] = admin.firestore.FieldValue.arrayUnion({
                id: itemId,
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                position: { x: 0, y: 0 }, // Default position
            });
        }
        else if (itemType === "decoration") {
            updates["cityData.decorations"] = admin.firestore.FieldValue.arrayUnion({
                id: itemId,
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                position: { x: 0, y: 0 },
            });
        }
        await userRef.update(updates);
        return { success: true };
    }
    catch (error) {
        console.error("Error purchasing city item:", error);
        throw new https_1.HttpsError("internal", "Failed to purchase city item");
    }
});
// Simulation Management Functions
exports.getSimulations = (0, https_1.onCall)(async (request) => {
    try {
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const simulationsSnapshot = await admin.firestore().collection("simulations").get();
        const simulations = simulationsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return { simulations };
    }
    catch (error) {
        console.error("Error getting simulations:", error);
        throw new https_1.HttpsError("internal", "Failed to get simulations");
    }
});
exports.startSimulation = (0, https_1.onCall)(async (request) => {
    try {
        const { userId, simulationId } = request.data;
        if (!request.auth || request.auth.uid !== userId) {
            throw new https_1.HttpsError("permission-denied", "Unauthorized");
        }
        const userRef = admin.firestore().collection("users").doc(userId);
        await userRef.update({
            [`simulationProgress.${simulationId}`]: {
                progress: 0,
                completed: false,
                startedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            },
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error starting simulation:", error);
        throw new https_1.HttpsError("internal", "Failed to start simulation");
    }
});
// Educator Functions
exports.createClassroom = (0, https_1.onCall)(async (request) => {
    try {
        const { name, description, educatorId } = request.data;
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const classroom = {
            name,
            description,
            educatorId,
            students: [],
            pendingInvites: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const classroomRef = await admin.firestore().collection("classrooms").add(classroom);
        return { success: true, classroomId: classroomRef.id };
    }
    catch (error) {
        console.error("Error creating classroom:", error);
        throw new https_1.HttpsError("internal", "Failed to create classroom");
    }
});
exports.inviteStudentsToClassroom = (0, https_1.onCall)(async (request) => {
    try {
        const { classroomId, emails, educatorId } = request.data;
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const classroomRef = admin.firestore().collection("classrooms").doc(classroomId);
        const classroomDoc = await classroomRef.get();
        if (!classroomDoc.exists) {
            throw new https_1.HttpsError("not-found", "Classroom not found");
        }
        const classroomData = classroomDoc.data();
        if (classroomData.educatorId !== educatorId) {
            throw new https_1.HttpsError("permission-denied", "Unauthorized");
        }
        // Add pending invites
        const invites = emails.map((email) => ({
            email,
            invitedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
        }));
        await classroomRef.update({
            pendingInvites: admin.firestore.FieldValue.arrayUnion(...invites),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // TODO: Send email invitations
        return { success: true };
    }
    catch (error) {
        console.error("Error inviting students:", error);
        throw new https_1.HttpsError("internal", "Failed to invite students");
    }
});
// Cloud Function to handle classroom invitations
exports.processClassroomInvite = (0, https_1.onCall)(async (request) => {
    var _a;
    try {
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { classroomId, action } = request.data; // action: 'accept' or 'decline'
        const userId = request.auth.uid;
        // Get user email
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        if (!userData) {
            throw new https_1.HttpsError("not-found", "User profile not found");
        }
        const userEmail = userData.email;
        // Get classroom
        const classroomDoc = await db.collection("classrooms").doc(classroomId).get();
        const classroomData = classroomDoc.data();
        if (!classroomData) {
            throw new https_1.HttpsError("not-found", "Classroom not found");
        }
        // Find pending invite
        const pendingInvite = (_a = classroomData.pendingInvites) === null || _a === void 0 ? void 0 : _a.find((invite) => invite.email === userEmail);
        if (!pendingInvite) {
            throw new https_1.HttpsError("not-found", "No pending invite found");
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
            });
            // Update student's profile
            await db
                .collection("users")
                .doc(userId)
                .update({
                classrooms: admin.firestore.FieldValue.arrayUnion(classroomId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Notify educator
            await db.collection("notifications").add({
                userId: classroomData.educatorId,
                type: "student_joined",
                title: "Student Joined Classroom",
                message: `${userData.firstName} ${userData.lastName} has joined your classroom "${classroomData.name}".`,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { success: true, message: "Successfully joined classroom" };
        }
        else if (action === "decline") {
            // Remove from pending invites
            await db
                .collection("classrooms")
                .doc(classroomId)
                .update({
                pendingInvites: admin.firestore.FieldValue.arrayRemove(pendingInvite),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { success: true, message: "Invitation declined" };
        }
        else {
            throw new https_1.HttpsError("invalid-argument", "Invalid action");
        }
    }
    catch (error) {
        console.error("Error processing classroom invite:", error);
        throw new https_1.HttpsError("internal", "Failed to process invitation");
    }
});
// Cloud Function to send simulation suggestions
exports.suggestSimulation = (0, https_1.onCall)(async (request) => {
    try {
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { studentId, simulationId, message } = request.data;
        const educatorId = request.auth.uid;
        // Verify educator has access to student
        const classroomsQuery = await db
            .collection("classrooms")
            .where("educatorId", "==", educatorId)
            .where("students", "array-contains", studentId)
            .get();
        if (classroomsQuery.empty) {
            throw new https_1.HttpsError("permission-denied", "No access to this student");
        }
        // Get educator and student data
        const [educatorDoc, studentDoc] = await Promise.all([
            db.collection("users").doc(educatorId).get(),
            db.collection("users").doc(studentId).get(),
        ]);
        const educatorData = educatorDoc.data();
        const studentData = studentDoc.data();
        if (!educatorData || !studentData) {
            throw new https_1.HttpsError("not-found", "User data not found");
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
        });
        return { success: true, message: "Simulation suggestion sent" };
    }
    catch (error) {
        console.error("Error suggesting simulation:", error);
        throw new https_1.HttpsError("internal", "Failed to send suggestion");
    }
});
// Cloud Function to calculate and update user levels - Temporarily commented out due to Eventarc permission issues
/*
export const updateUserLevel = onDocumentUpdated("userSimulations/{simulationId}", async (event) => {
  try {
    const simulationData = event.data?.after.data()

    if (!simulationData || simulationData.status !== "completed") {
      return
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
*/
// Cloud Function for analytics and reporting
exports.generateAnalyticsReport = (0, https_1.onCall)(async (request) => {
    try {
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { timeframe } = request.data; // timeframe: 'week' | 'month' | 'year'
        const userId = request.auth.uid;
        // Verify user permissions
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        if (!userData || (userData.userType !== "educator" && userData.role !== "admin")) {
            throw new https_1.HttpsError("permission-denied", "Insufficient permissions");
        }
        const now = new Date();
        let startDate;
        switch (timeframe) {
            case "week":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "year":
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        // Get analytics data
        const [usersQuery, simulationsQuery] = await Promise.all([
            db.collection("users").where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate)).get(),
            db.collection("userSimulations").where("completedAt", ">=", admin.firestore.Timestamp.fromDate(startDate)).get(),
        ]);
        const newUsers = usersQuery.size;
        const completedSimulations = simulationsQuery.size;
        // Calculate engagement metrics
        const activeUsersQuery = await db
            .collection("users")
            .where("updatedAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
            .get();
        const activeUsers = activeUsersQuery.size;
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
        };
        return report;
    }
    catch (error) {
        console.error("Error generating analytics report:", error);
        throw new https_1.HttpsError("internal", "Failed to generate report");
    }
});
// Cloud Function to generate AI insights - Temporarily commented out due to Eventarc permission issues
/*
export const generateInsights = onDocumentUpdated("userSimulations/{simulationId}", async (event) => {
  try {
    const simulationData = event.data?.after.data()

    if (!simulationData || simulationData.status !== "completed") {
      return
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
      return
    }

    // Generate insights based on completed simulations and user data
    // const insights = await generateUserInsights(userData, completedSimulations) // This line was removed

    // Update user profile with new insights
    await db.collection("users").doc(userId).update({
      insights: null, // Set insights to null as generateUserInsights is removed
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
*/
// Triggers - Temporarily commented out due to Eventarc permission issues
// These can be re-enabled once proper permissions are set up
/*
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
*/
//# sourceMappingURL=index.js.map