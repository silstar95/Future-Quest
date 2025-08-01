import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface SimulationResponse {
  simulationId: string
  simulationType: string
  preReflectionAnswers?: any
  explorationAnswers?: any
  experienceAnswers?: any
  postReflectionAnswers?: any
  envisionAnswers?: any
  completed: boolean
  completedAt?: string
}

interface UserProfile {
  firstName: string
  lastName: string
  interests?: string[]
  grade?: string
  completedSimulations?: string[]
  onboardingAnswers?: any
}

export async function generatePersonalizedCareerAnalysis(
  userProfile: UserProfile,
  simulationResponses: SimulationResponse[],
): Promise<{
  analysis: string
  topCareerRecommendations: Array<{
    career: string
    matchPercentage: number
    reasoning: string
  nextSteps: string[]
  }>
  skillsAnalysis: string
  personalizedMessage: string
}> {
  try {
    // Filter only completed simulations
    const completedSimulations = simulationResponses.filter((sim) => sim.completed)

    if (completedSimulations.length === 0) {
      return {
        analysis: "Complete your first simulation to receive personalized career recommendations!",
        topCareerRecommendations: [],
        skillsAnalysis: "No simulation data available yet.",
        personalizedMessage: `Hi ${userProfile.firstName}! Start your first career simulation to discover your strengths and interests.`,
      }
    }

    // Create detailed context about user's simulation experiences
    const simulationContext = completedSimulations
      .map((sim) => {
        let context = `\n--- ${sim.simulationType.toUpperCase()} SIMULATION ---\n`

        if (sim.preReflectionAnswers) {
          context += `Pre-Reflection Responses:\n`
          Object.entries(sim.preReflectionAnswers).forEach(([key, value]) => {
            context += `- ${key}: ${JSON.stringify(value)}\n`
          })
        }

        if (sim.explorationAnswers) {
          context += `Exploration Phase:\n`
          Object.entries(sim.explorationAnswers).forEach(([key, value]) => {
            context += `- ${key}: ${JSON.stringify(value)}\n`
          })
        }

        if (sim.experienceAnswers) {
          context += `Experience Phase (Task Performance):\n`
          Object.entries(sim.experienceAnswers).forEach(([key, value]) => {
            if (key.includes("rating") || key.includes("enjoyment") || key.includes("confidence")) {
              context += `- ${key}: ${value}/5\n`
            } else if (key.includes("favorite") || key.includes("challenging")) {
              context += `- ${key}: ${value}\n`
            }
          })
        }

        if (sim.postReflectionAnswers) {
          context += `Post-Reflection Insights:\n`
          Object.entries(sim.postReflectionAnswers).forEach(([key, value]) => {
            context += `- ${key}: ${JSON.stringify(value)}\n`
          })
        }

        if (sim.envisionAnswers) {
          context += `Future Vision:\n`
          Object.entries(sim.envisionAnswers).forEach(([key, value]) => {
            context += `- ${key}: ${JSON.stringify(value)}\n`
          })
        }

        return context
      })
      .join("\n")

    const prompt = `You are an expert career counselor analyzing a student's career simulation experiences. 

STUDENT PROFILE:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Grade: ${userProfile.grade || "Not specified"}
- Initial Interests: ${userProfile.interests?.join(", ") || "Not specified"}
- Completed Simulations: ${completedSimulations.map((s) => s.simulationType).join(", ")}

DETAILED SIMULATION RESPONSES:
${simulationContext}

ANALYSIS REQUIREMENTS:
1. Analyze the student's specific responses, ratings, and feedback from each simulation
2. Identify patterns in their enjoyment levels, confidence ratings, and task preferences
3. Note which specific tasks they rated highly and which they found challenging
4. Consider their career interests expressed in each simulation
5. Look for growth and learning across multiple simulations

Please provide a comprehensive analysis in the following JSON format:

{
  "analysis": "A detailed 3-4 paragraph analysis of the student's career exploration journey, referencing specific responses and ratings from their simulations. Mention specific tasks they enjoyed, skills they demonstrated, and patterns across simulations.",
  "topCareerRecommendations": [
    {
      "career": "Specific career title",
      "matchPercentage": 85,
      "reasoning": "Detailed explanation referencing specific simulation responses, ratings, and expressed interests. Mention specific tasks they excelled at or enjoyed.",
      "nextSteps": ["Specific actionable step 1", "Specific actionable step 2", "Specific actionable step 3"]
    }
  ],
  "skillsAnalysis": "Analysis of skills demonstrated and developed across simulations, referencing specific examples from their responses and task performance.",
  "personalizedMessage": "A warm, encouraging message using their name and referencing their specific journey and achievements in the simulations."
}

Make sure to:
- Reference specific simulation responses and ratings
- Mention actual tasks they enjoyed or found challenging
- Use their actual name and grade level
- Provide career recommendations that truly match their demonstrated interests and abilities
- Give specific, actionable next steps rather than generic advice
- Make it feel personal and tailored to their unique experience`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const result = JSON.parse(cleanedText)

    return result
  } catch (error) {
    console.error("Error generating career analysis:", error)

    // Fallback response
    const completedSimulations = simulationResponses.filter((sim) => sim.completed) // Declare completedSimulations here
    return {
      analysis: `Based on your completed simulations in ${completedSimulations.map((s) => s.simulationType).join(" and ")}, you've shown great engagement in career exploration. Your responses indicate strong potential in multiple career paths.`,
      topCareerRecommendations: [
        {
          career: "Career Counselor",
          matchPercentage: 75,
          reasoning:
            "Your thoughtful approach to career exploration suggests you'd excel at helping others navigate their career journeys.",
          nextSteps: [
            "Research education requirements for career counseling",
            "Consider volunteering as a peer mentor",
            "Explore psychology or counseling programs",
          ],
        },
      ],
      skillsAnalysis:
        "You've demonstrated strong analytical thinking and self-reflection skills through your simulation responses.",
      personalizedMessage: `Hi ${userProfile.firstName}! Your career exploration journey shows great promise. Keep exploring different fields to discover your perfect career match!`,
    }
  }
}

export async function generateCareerComparison(
  simulation1: SimulationResponse,
  simulation2: SimulationResponse,
  userProfile: UserProfile,
): Promise<string> {
  try {
    const prompt = `Compare ${userProfile.firstName}'s experience in two career simulations:

SIMULATION 1 - ${simulation1.simulationType.toUpperCase()}:
${JSON.stringify(simulation1, null, 2)}

SIMULATION 2 - ${simulation2.simulationType.toUpperCase()}:
${JSON.stringify(simulation2, null, 2)}

Provide a detailed comparison focusing on:
1. Which simulation they enjoyed more based on their ratings and feedback
2. Different skills they demonstrated in each
3. How their confidence levels compared
4. Which career path seems to align better with their interests
5. Specific recommendations based on this comparison

Make it personal and reference their specific responses and ratings.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error("Error generating career comparison:", error)
    return `Based on your experiences in ${simulation1.simulationType} and ${simulation2.simulationType}, both simulations have provided valuable insights into your career interests and abilities.`
  }
}

export async function generateNextSimulationRecommendation(
  userProfile: UserProfile,
  completedSimulations: SimulationResponse[],
): Promise<{
  recommendedSimulation: string
  reasoning: string
  expectedLearnings: string[]
}> {
  try {
    const availableSimulations = [
      "finance-simulation",
      "healthcare-simulation",
      "government-simulation",
      "material-science",
      "brand-marketing",
    ]

    const completedTypes = completedSimulations.map((s) => s.simulationId)
    const remainingSimulations = availableSimulations.filter((s) => !completedTypes.includes(s))

    if (remainingSimulations.length === 0) {
      return {
        recommendedSimulation: "All simulations completed!",
        reasoning: "You've completed all available simulations. Great job exploring different career paths!",
        expectedLearnings: [
          "Continue researching your top career interests",
          "Consider internships or job shadowing",
          "Connect with professionals in your fields of interest",
        ],
      }
    }

    const prompt = `Based on ${userProfile.firstName}'s completed simulations and responses:

COMPLETED SIMULATIONS:
${completedSimulations
  .map(
    (sim) => `
${sim.simulationType}: 
- Enjoyment ratings: ${JSON.stringify(sim.experienceAnswers)}
- Career interests: ${JSON.stringify(sim.envisionAnswers)}
`,
  )
  .join("\n")}

AVAILABLE SIMULATIONS: ${remainingSimulations.join(", ")}

Recommend the next simulation that would:
1. Build on their demonstrated interests
2. Explore complementary skills
3. Help them discover new career possibilities
4. Address any gaps in their career exploration

Provide response in JSON format:
{
  "recommendedSimulation": "simulation-name",
  "reasoning": "Detailed explanation based on their specific responses and interests",
  "expectedLearnings": ["specific learning 1", "specific learning 2", "specific learning 3"]
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error generating next simulation recommendation:", error)
    const availableSimulations = [
      "finance-simulation",
      "healthcare-simulation",
      "government-simulation",
      "material-science",
      "brand-marketing",
    ]
    const completedTypes = completedSimulations.map((s) => s.simulationId)
    const remainingSimulations = availableSimulations.filter((s) => !completedTypes.includes(s)) // Declare remainingSimulations here
    return {
      recommendedSimulation: remainingSimulations[0] || "No more simulations available",
      reasoning: "Continue exploring different career fields to broaden your understanding of various industries.",
      expectedLearnings: [
        "Discover new career possibilities",
        "Develop additional skills",
        "Gain broader career perspective",
      ],
    }
  }
}
