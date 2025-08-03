import { getUserProfile, getUserSimulationProgress } from "./firebase-service"

export interface StudentCareerData {
  userId: string
  completedSimulations: string[]
  reflectionData: any[]
  onboardingData?: any
  totalXP: number
  badges: string[]
  lastUpdated: string
}

export class CareerDataService {
  async getStudentCareerData(userId: string): Promise<StudentCareerData | null> {
    try {
      console.log("🔄 Fetching career data for user:", userId)

      // Get user profile
      const profileResult = await getUserProfile(userId)
      if (!profileResult.success || !profileResult.data) {
        console.error("❌ Failed to get user profile:", profileResult.error)
        return null
      }

      // Get simulation progress
      const progressResult = await getUserSimulationProgress(userId)
      if (!progressResult.success) {
        console.error("❌ Failed to get simulation progress:", progressResult.error)
        return null
      }

      const userProfile = profileResult.data
      const simulationProgress = progressResult.data || []

      console.log("📊 Raw simulation progress data:", simulationProgress)

      // Extract detailed reflection data from completed simulations
      const reflectionData = simulationProgress
        .filter((progress) => progress.completed)
        .map((progress) => {
          console.log(`📝 Processing reflection data for ${progress.simulationId}:`, progress.phaseProgress)

          // Extract all reflection answers from different phases
          const preReflectionAnswers = progress.phaseProgress?.["pre-reflection"]?.answers || {}
          const postReflectionAnswers = progress.phaseProgress?.["post-reflection"]?.answers || {}
          const taskRatings = progress.phaseProgress?.taskRatings || {}

          // Extract specific reflection fields with better error handling
          const extractAnswer = (answers: any, field: string) => {
            if (!answers || !answers[field]) return undefined
            const value = answers[field]
            // Handle both array and direct values
            if (Array.isArray(value)) {
              return value.length > 0 ? value[0] : undefined
            }
            return value
          }

          const reflectionEntry = {
            simulationId: progress.simulationId,
            simulationType: progress.simulationId,
            completedAt: progress.completedAt,
            phaseProgress: progress.phaseProgress,

            // Pre-reflection data
            preReflectionAnswers,

            // Post-reflection data
            postReflectionAnswers,
            taskRatings,

            // Specific extracted fields
            enjoymentRating:
              extractAnswer(postReflectionAnswers, "enjoymentRating") ||
              extractAnswer(postReflectionAnswers, "overallEnjoyment") ||
              extractAnswer(postReflectionAnswers, "simulationRating"),
            confidenceRating:
              extractAnswer(postReflectionAnswers, "confidenceRating") ||
              extractAnswer(postReflectionAnswers, "confidenceLevel"),
            interestLevel:
              extractAnswer(postReflectionAnswers, "interestLevel") ||
              extractAnswer(postReflectionAnswers, "careerInterestLevel"),
            skillsLearned:
              extractAnswer(postReflectionAnswers, "skillsLearned") ||
              extractAnswer(postReflectionAnswers, "newSkills") ||
              extractAnswer(postReflectionAnswers, "learnings"),
            favoriteTask:
              extractAnswer(postReflectionAnswers, "favoriteTask") ||
              extractAnswer(postReflectionAnswers, "mostEnjoyedTask") ||
              extractAnswer(postReflectionAnswers, "bestTask"),
            challengingTask:
              extractAnswer(postReflectionAnswers, "challengingTask") ||
              extractAnswer(postReflectionAnswers, "mostChallengingTask") ||
              extractAnswer(postReflectionAnswers, "difficultTask"),
            careerInterest:
              extractAnswer(postReflectionAnswers, "careerInterest") ||
              extractAnswer(postReflectionAnswers, "futureCareer") ||
              extractAnswer(postReflectionAnswers, "careerPath"),
            otherCareers:
              extractAnswer(postReflectionAnswers, "otherCareers") ||
              extractAnswer(postReflectionAnswers, "additionalCareers") ||
              extractAnswer(postReflectionAnswers, "relatedCareers"),
          }

          console.log(`✅ Processed reflection for ${progress.simulationId}:`, {
            enjoymentRating: reflectionEntry.enjoymentRating,
            favoriteTask: reflectionEntry.favoriteTask,
            skillsLearned: reflectionEntry.skillsLearned,
            careerInterest: reflectionEntry.careerInterest,
          })

          return reflectionEntry
        })

      console.log("📊 Final reflection data:", reflectionData)

      const careerData: StudentCareerData = {
        userId,
        completedSimulations: userProfile.completedSimulations || [],
        reflectionData,
        onboardingData: {
          interests: userProfile.interests,
          onboardingAnswers: userProfile.onboardingAnswers,
          recommendedSimulations: userProfile.recommendedSimulations,
          careerGoals: userProfile.onboardingAnswers?.careerGoals,
          preferredWorkEnvironment: userProfile.onboardingAnswers?.workEnvironment,
          strengths: userProfile.onboardingAnswers?.strengths,
          values: userProfile.onboardingAnswers?.values,
        },
        totalXP: userProfile.totalXP || 0,
        badges: userProfile.badges || [],
        lastUpdated: new Date().toISOString(),
      }

      console.log("✅ Career data fetched successfully:", careerData)
      return careerData
    } catch (error) {
      console.error("❌ Error fetching student career data:", error)
      return null
    }
  }

  async getSimulationInsights(userId: string, simulationId: string): Promise<any> {
    try {
      // This would fetch specific insights for a simulation
      // For now, return basic structure
      return {
        simulationId,
        completedTasks: [],
        taskRatings: {},
        reflectionAnswers: {},
        timeSpent: 0,
        completionDate: null,
      }
    } catch (error) {
      console.error("❌ Error fetching simulation insights:", error)
      return null
    }
  }

  // Helper method to format simulation type names
  formatSimulationType(simulationType: string): string {
    const typeMap: { [key: string]: string } = {
      "brand-marketing": "Brand & Marketing",
      "finance-simulation": "Finance",
      "material-science": "Material Science",
      "government-simulation": "Government & Politics",
    }
    return typeMap[simulationType] || simulationType
  }

  // Helper method to get simulation completion stats
  getCompletionStats(reflectionData: any[]): {
    totalCompleted: number
    averageEnjoyment: number
    averageConfidence: number
    averageInterest: number
  } {
    const completed = reflectionData.filter((r) => r.completedAt)
    const totalCompleted = completed.length

    const enjoymentRatings = completed
      .map((r) => r.enjoymentRating)
      .filter((rating) => rating !== undefined && rating !== null && !isNaN(rating))

    const confidenceRatings = completed
      .map((r) => r.confidenceRating)
      .filter((rating) => rating !== undefined && rating !== null && !isNaN(rating))

    const interestRatings = completed
      .map((r) => r.interestLevel)
      .filter((rating) => rating !== undefined && rating !== null && !isNaN(rating))

    return {
      totalCompleted,
      averageEnjoyment:
        enjoymentRatings.length > 0 ? enjoymentRatings.reduce((a, b) => a + b, 0) / enjoymentRatings.length : 0,
      averageConfidence:
        confidenceRatings.length > 0 ? confidenceRatings.reduce((a, b) => a + b, 0) / confidenceRatings.length : 0,
      averageInterest:
        interestRatings.length > 0 ? interestRatings.reduce((a, b) => a + b, 0) / interestRatings.length : 0,
    }
  }
}

export const careerDataService = new CareerDataService()
