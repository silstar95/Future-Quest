import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getUserProfile, getUserSimulationProgress } from "./firebase-service"

interface CareerRecommendation {
  title: string
  match: number
  reasoning: string
  nextSteps: string[]
  skills: string[]
  education: string
  salary: string
  growth: string
}

interface AIAnalysisResult {
  personalizedMessage: string
  careerRecommendations: CareerRecommendation[]
  skillsAnalysis: {
    strengths: string[]
    areasToExplore: string[]
    recommendations: string[]
  }
  nextSteps: string[]
  error?: string
}

interface AICareerInsights {
  careerRecommendations: Array<{
  title: string
  overview: string
  averageSalary: string
  educationPath: {
    requiredLevel: string
    commonMajors: string[]
    optionalCertifications?: string[]
  }
  whyThisRole: string
  growthOutlook: string
  keySkills: string[]
  workEnvironment: string
  }>
  suggestedSimulations: string[]
  keyStrengths: string[]
  developmentAreas: string[]
  personalityInsights: string
  nextSteps: string[]
}

interface AlternativePathway {
  title: string
  overview: string
  duration: string
  cost: string
  provider: string
  careerOutcomes: string[]
}

class AICareerService {
  async analyzeStudentReflections(reflectionData: any[], onboardingData?: any): Promise<AICareerInsights> {
    try {
      console.log("🤖 Starting AI analysis with data:", reflectionData)

      // Analyze completed simulations
      const completedSimulations = reflectionData.filter((r) => r.completedAt)

      if (completedSimulations.length === 0) {
        throw new Error("No completed simulations found")
      }

      // Extract key insights from user responses
      const insights = this.extractInsights(completedSimulations, onboardingData)

      // Generate personalized recommendations
      const recommendations = this.generateCareerRecommendations(insights, completedSimulations.map(sim => sim.simulationId))

      return recommendations
    } catch (error) {
      console.error("❌ Error in AI analysis:", error)
      throw error
    }
  }

  private extractInsights(reflectionData: any[], onboardingData?: any) {
    const insights = {
      highestRatedSimulation: null as any,
      averageEnjoyment: 0,
      averageConfidence: 0,
      favoriteTasksThemes: [] as string[],
      skillsLearned: [] as string[],
      careerInterests: [] as string[],
      workStylePreferences: [] as string[],
      challengingAreas: [] as string[],
    }

    // Find highest rated simulation
    let highestEnjoyment = 0
    reflectionData.forEach((data) => {
      if (data.enjoymentRating && data.enjoymentRating > highestEnjoyment) {
        highestEnjoyment = data.enjoymentRating
        insights.highestRatedSimulation = data
      }
    })

    // Calculate averages
    const enjoymentRatings = reflectionData.map((r) => r.enjoymentRating).filter((rating) => rating && !isNaN(rating))

    const confidenceRatings = reflectionData.map((r) => r.confidenceRating).filter((rating) => rating && !isNaN(rating))

    insights.averageEnjoyment =
      enjoymentRatings.length > 0 ? enjoymentRatings.reduce((a, b) => a + b, 0) / enjoymentRatings.length : 0

    insights.averageConfidence =
      confidenceRatings.length > 0 ? confidenceRatings.reduce((a, b) => a + b, 0) / confidenceRatings.length : 0

    // Extract themes from responses
    reflectionData.forEach((data) => {
      if (data.favoriteTask) {
        insights.favoriteTasksThemes.push(data.favoriteTask)
      }
      if (data.skillsLearned) {
        insights.skillsLearned.push(data.skillsLearned)
      }
      if (data.careerInterest) {
        insights.careerInterests.push(data.careerInterest)
      }
      if (data.challengingTask) {
        insights.challengingAreas.push(data.challengingTask)
      }
    })

    return insights
  }

  private generateCareerRecommendations(insights: any, completedSimulations: string[] = []): AICareerInsights {
    const simulationType = insights.highestRatedSimulation?.simulationType || "general"

    // Generate recommendations based on highest rated simulation
    let careerRecommendations = []
    let suggestedSimulations = []
    let keyStrengths = []
    let developmentAreas = []
    let personalityInsights = ""
    let nextSteps = []

    // Helper function to filter out completed simulations
    const filterCompletedSimulations = (simulations: string[]) => {
      return simulations.filter(sim => !completedSimulations.includes(sim))
    }

    switch (simulationType) {
      case "finance-simulation":
        careerRecommendations = [
          {
            title: "Financial Analyst",
      overview:
              "Analyze financial data, create reports, and provide investment recommendations to help businesses and individuals make informed financial decisions.",
            averageSalary: "$65,000 - $95,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Finance", "Economics", "Accounting", "Business Administration"],
              optionalCertifications: ["CFA", "FRM"],
            },
            whyThisRole: `Based on your strong performance in the finance simulation (${insights.averageEnjoyment}/10 enjoyment), you showed aptitude for financial analysis and decision-making.`,
            growthOutlook: "Faster than average growth expected",
            keySkills: ["Financial modeling", "Data analysis", "Excel proficiency", "Risk assessment"],
            workEnvironment: "Office-based, collaborative team environment with client interaction",
          },
          {
            title: "Investment Banking Analyst",
            overview:
              "Support senior bankers in executing transactions, conducting financial analysis, and preparing client presentations for mergers, acquisitions, and capital raising.",
            averageSalary: "$85,000 - $150,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Finance", "Economics", "Mathematics", "Business"],
              optionalCertifications: ["CFA", "Series 7"],
            },
            whyThisRole:
              "Your confidence in handling complex financial scenarios and attention to detail make you well-suited for this demanding but rewarding field.",
            growthOutlook: "Stable growth with high earning potential",
            keySkills: ["Financial modeling", "Valuation", "Presentation skills", "Client relations"],
            workEnvironment: "Fast-paced, high-pressure environment with long hours but excellent career progression",
          },
        ]

        suggestedSimulations = filterCompletedSimulations(["brand-marketing", "government-simulation", "material-science"])
        keyStrengths = ["Analytical thinking", "Financial acumen", "Problem-solving", "Attention to detail"]
        developmentAreas = ["Public speaking", "Creative thinking", "Team leadership"]
        personalityInsights = `You demonstrate strong analytical skills and comfort with numbers and financial concepts. Your methodical approach to problem-solving and ability to work with complex data suggests you thrive in structured, detail-oriented environments.`
        nextSteps = [
          "Consider internships at financial firms or banks",
          "Take additional courses in financial modeling or Excel",
          "Join finance-related clubs or competitions",
          "Network with finance professionals through LinkedIn",
        ]
        break

      case "brand-marketing":
        careerRecommendations = [
          {
            title: "Marketing Manager",
      overview:
              "Develop and execute marketing strategies, manage campaigns, and analyze market trends to promote products and services effectively.",
            averageSalary: "$60,000 - $90,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Marketing", "Communications", "Business", "Psychology"],
              optionalCertifications: ["Google Ads", "HubSpot", "Facebook Blueprint"],
            },
            whyThisRole: `Your creativity and strategic thinking in the branding simulation, combined with your ${insights.averageEnjoyment}/10 enjoyment rating, indicate strong marketing potential.`,
            growthOutlook: "Much faster than average growth",
            keySkills: ["Creative strategy", "Data analysis", "Social media", "Brand management"],
            workEnvironment:
              "Creative, collaborative environment with mix of strategic planning and hands-on execution",
          },
          {
            title: "Brand Strategist",
      overview:
              "Develop brand positioning, messaging, and identity strategies to help companies differentiate themselves in the marketplace.",
            averageSalary: "$55,000 - $85,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Marketing", "Communications", "Graphic Design", "Psychology"],
              optionalCertifications: ["Brand Strategy Certificate", "Design Thinking"],
            },
            whyThisRole:
              "Your understanding of brand development and consumer psychology shows natural aptitude for strategic brand work.",
            growthOutlook: "Faster than average growth",
            keySkills: ["Strategic thinking", "Consumer research", "Creative direction", "Storytelling"],
            workEnvironment: "Agency or in-house teams, mix of research, strategy, and creative collaboration",
          },
        ]

        suggestedSimulations = filterCompletedSimulations(["finance-simulation", "government-simulation", "material-science"])
        keyStrengths = ["Creative thinking", "Strategic planning", "Communication", "Consumer insight"]
        developmentAreas = ["Data analysis", "Technical skills", "Financial literacy"]
        personalityInsights = `You show strong creative and strategic thinking abilities, with a natural understanding of how to connect with audiences. Your approach suggests you enjoy both the creative and analytical aspects of marketing.`
        nextSteps = [
          "Build a portfolio of marketing projects or campaigns",
          "Gain experience with digital marketing tools",
          "Consider internships at marketing agencies or brand companies",
          "Study consumer psychology and market research methods",
        ]
        break

      case "government-simulation":
        careerRecommendations = [
          {
            title: "Policy Analyst",
      overview:
              "Research, analyze, and develop policy recommendations for government agencies, think tanks, or advocacy organizations.",
            averageSalary: "$50,000 - $80,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Political Science", "Public Policy", "Economics", "International Relations"],
              optionalCertifications: ["Policy Analysis Certificate"],
            },
            whyThisRole: `Your engagement with policy processes and ${insights.averageConfidence}/5 confidence level in navigating complex political scenarios shows strong potential for policy work.`,
            growthOutlook: "Average growth",
            keySkills: ["Research", "Writing", "Critical thinking", "Stakeholder engagement"],
            workEnvironment: "Government offices, think tanks, or consulting firms with focus on research and analysis",
          },
          {
            title: "Legislative Assistant",
      overview:
              "Support elected officials by researching issues, drafting legislation, and managing constituent communications.",
            averageSalary: "$35,000 - $55,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Political Science", "Public Administration", "Communications", "History"],
              optionalCertifications: ["Congressional internship experience"],
            },
            whyThisRole:
              "Your understanding of legislative processes and ability to work with diverse stakeholders makes you well-suited for this role.",
            growthOutlook: "Average growth with good advancement opportunities",
            keySkills: ["Writing", "Research", "Communication", "Political awareness"],
            workEnvironment:
              "Fast-paced government offices with direct interaction with elected officials and constituents",
          },
        ]

        suggestedSimulations = filterCompletedSimulations(["finance-simulation", "brand-marketing", "material-science"])
        keyStrengths = ["Critical thinking", "Research skills", "Communication", "Stakeholder management"]
        developmentAreas = ["Technical skills", "Data analysis", "Private sector experience"]
        personalityInsights = `You demonstrate strong analytical and communication skills, with an interest in how systems work and how to improve them. Your approach suggests you're motivated by making a positive impact on society.`
        nextSteps = [
          "Consider internships with government agencies or elected officials",
          "Join Model UN or debate teams",
          "Study current policy issues and legislative processes",
          "Network with professionals in government and policy fields",
        ]
        break

      case "material-science":
        careerRecommendations = [
    {
      title: "Materials Engineer",
            overview:
              "Develop and test new materials for use in products ranging from electronics to aerospace applications.",
            averageSalary: "$70,000 - $100,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Materials Science", "Chemical Engineering", "Mechanical Engineering", "Physics"],
              optionalCertifications: ["ASM International", "Materials Science Certification"],
            },
            whyThisRole: `Your curiosity about materials and ${insights.averageInterest}/5 interest level in scientific exploration shows strong potential for materials engineering.`,
            growthOutlook: "Faster than average growth",
            keySkills: ["Materials testing", "Laboratory skills", "Problem-solving", "Technical writing"],
            workEnvironment: "Laboratory and office settings with hands-on research and development work",
    },
    {
      title: "Research Scientist",
            overview:
              "Conduct research to develop new materials, improve existing ones, and advance scientific understanding in materials science.",
            averageSalary: "$60,000 - $120,000",
      educationPath: {
              requiredLevel: "Master's or PhD degree",
              commonMajors: ["Materials Science", "Physics", "Chemistry", "Engineering"],
              optionalCertifications: ["Research methodology", "Laboratory safety"],
            },
            whyThisRole:
              "Your systematic approach to experimentation and interest in discovery make you well-suited for research roles.",
            growthOutlook: "Strong growth in research and development",
            keySkills: ["Research methodology", "Data analysis", "Laboratory techniques", "Scientific writing"],
            workEnvironment: "Research laboratories with focus on innovation and discovery",
          },
        ]

        suggestedSimulations = filterCompletedSimulations(["finance-simulation", "brand-marketing", "government-simulation"])
        keyStrengths = ["Scientific thinking", "Problem-solving", "Attention to detail", "Curiosity"]
        developmentAreas = ["Communication skills", "Business acumen", "Leadership"]
        personalityInsights = `You demonstrate strong analytical and scientific thinking, with a natural curiosity about how things work. Your methodical approach to problem-solving suggests you enjoy both theoretical and practical aspects of science.`
        nextSteps = [
          "Consider research internships or laboratory experience",
          "Join science clubs or competitions",
          "Study advanced mathematics and physics",
          "Network with materials science professionals",
        ]
        break

      default:
        // General recommendations for users who haven't completed any simulations or have mixed results
        careerRecommendations = [
          {
            title: "Business Analyst",
      overview:
              "Analyze business processes, identify opportunities for improvement, and help organizations make data-driven decisions.",
            averageSalary: "$55,000 - $85,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Business", "Economics", "Information Systems", "Mathematics"],
              optionalCertifications: ["CBAP", "Six Sigma"],
            },
            whyThisRole: "Your analytical thinking and problem-solving abilities make you well-suited for business analysis roles.",
            growthOutlook: "Much faster than average growth",
            keySkills: ["Data analysis", "Process improvement", "Communication", "Problem-solving"],
            workEnvironment: "Office-based with collaboration across different departments",
          },
          {
            title: "Project Manager",
      overview:
              "Plan, execute, and close projects while managing resources, timelines, and stakeholder expectations.",
            averageSalary: "$60,000 - $100,000",
      educationPath: {
              requiredLevel: "Bachelor's degree",
              commonMajors: ["Business", "Engineering", "Information Technology", "Management"],
              optionalCertifications: ["PMP", "PRINCE2", "Agile"],
            },
            whyThisRole: "Your organizational skills and ability to work with diverse teams make you a natural project manager.",
            growthOutlook: "Faster than average growth",
            keySkills: ["Leadership", "Communication", "Organization", "Risk management"],
            workEnvironment: "Dynamic environment with cross-functional team collaboration",
          },
        ]

        suggestedSimulations = filterCompletedSimulations(["finance-simulation", "brand-marketing", "government-simulation", "material-science"])
        keyStrengths = ["Adaptability", "Problem-solving", "Communication", "Learning ability"]
        developmentAreas = ["Technical skills", "Industry knowledge", "Specialized expertise"]
        personalityInsights = `You show strong adaptability and learning ability, with potential to excel in various fields. Your approach suggests you're open to exploring different career paths.`
        nextSteps = [
          "Explore different industries through internships",
          "Develop technical skills in areas of interest",
          "Network with professionals in various fields",
          "Consider graduate education in specialized areas",
        ]
        break
    }

    return {
      careerRecommendations,
      suggestedSimulations,
      keyStrengths,
      developmentAreas,
      personalityInsights,
      nextSteps,
    }
  }

  getAlternativePathways(careerCategories: string[]): AlternativePathway[] {
    const pathways: AlternativePathway[] = []

    if (careerCategories.includes("finance")) {
      pathways.push({
        title: "Financial Planning Bootcamp",
        overview: "Intensive 6-month program covering financial planning, investment strategies, and client relations",
        duration: "6 months",
        cost: "$8,000-$12,000",
        provider: "CFP Board",
        careerOutcomes: ["Financial Planner", "Investment Advisor", "Wealth Manager"],
      })
    }

    if (careerCategories.includes("marketing")) {
      pathways.push({
        title: "Digital Marketing Certificate",
        overview: "Comprehensive online program covering SEO, social media, content marketing, and analytics",
        duration: "3-6 months",
        cost: "$2,000-$5,000",
        provider: "Google/HubSpot",
        careerOutcomes: ["Digital Marketer", "Social Media Manager", "Content Strategist"],
      })
    }

    if (careerCategories.includes("government")) {
      pathways.push({
        title: "Public Administration Certificate",
        overview: "Online program focusing on government operations, policy analysis, and public service",
        duration: "9-12 months",
        cost: "$3,000-$6,000",
        provider: "NASPAA",
        careerOutcomes: ["Government Analyst", "Program Coordinator", "Policy Researcher"],
      })
    }

    if (careerCategories.includes("science")) {
      pathways.push({
        title: "Data Science Bootcamp",
        overview:
          "Intensive program covering programming, statistics, and machine learning for scientific applications",
        duration: "12-16 weeks",
        cost: "$10,000-$15,000",
        provider: "General Assembly",
        careerOutcomes: ["Data Scientist", "Research Analyst", "Lab Technician"],
      })
    }

    // Add some general pathways
    pathways.push(
      {
        title: "Project Management Professional",
        overview: "Industry-recognized certification for managing projects across various industries",
        duration: "3-6 months",
        cost: "$1,500-$3,000",
        provider: "PMI",
        careerOutcomes: ["Project Manager", "Program Coordinator", "Operations Manager"],
      },
      {
        title: "UX/UI Design Bootcamp",
        overview: "Hands-on program covering user experience design, interface design, and prototyping",
        duration: "12-24 weeks",
        cost: "$8,000-$14,000",
        provider: "Springboard",
        careerOutcomes: ["UX Designer", "UI Designer", "Product Designer"],
      },
      {
        title: "Coding Bootcamp",
        overview:
          "Intensive programming course covering web development, software engineering, and computer science fundamentals",
        duration: "12-24 weeks",
        cost: "$10,000-$20,000",
        provider: "Lambda School",
        careerOutcomes: ["Software Developer", "Web Developer", "Full-Stack Engineer"],
      },
    )

    return pathways.slice(0, 6) // Return up to 6 pathways
  }
}

// Export the service instance
export const aiCareerService = new AICareerService()

export const generatePersonalizedCareerAnalysis = async (userId: string): Promise<AIAnalysisResult> => {
  try {
    console.log("🤖 Generating personalized career analysis for user:", userId)

    // Get user profile and simulation progress
    const [userProfileResult, simulationProgressResult] = await Promise.all([
      getUserProfile(userId),
      getUserSimulationProgress(userId),
    ])

    if (!userProfileResult.success || !simulationProgressResult.success) {
      throw new Error("Failed to fetch user data")
    }

    const userProfile = userProfileResult.data
    const completedSimulations = simulationProgressResult.data?.filter((sim) => sim.completed) || []

    console.log("📊 User has completed", completedSimulations.length, "simulations")

    if (completedSimulations.length === 0) {
      return {
        personalizedMessage: "Complete your first simulation to receive personalized career recommendations!",
        careerRecommendations: [],
        skillsAnalysis: {
          strengths: [],
          areasToExplore: [],
          recommendations: ["Complete a simulation to discover your career interests"],
        },
        nextSteps: ["Start with a simulation that interests you"],
      }
    }

    // Build detailed context from user's actual responses
    const simulationContext = completedSimulations
      .map((sim) => {
        const phaseProgress = sim.phaseProgress || {}
        return {
          simulationId: sim.simulationId,
          completedAt: sim.completedAt,
          preReflectionAnswers: phaseProgress.preReflectionAnswers || {},
          explorationAnswers: phaseProgress.explorationAnswers || {},
          experienceAnswers: phaseProgress.experienceAnswers || {},
          postReflectionAnswers: phaseProgress.postReflectionAnswers || {},
          envisionAnswers: phaseProgress.envisionAnswers || {},
        }
      })
      .filter((sim) => Object.keys(sim.preReflectionAnswers).length > 0)

    console.log("🔍 Analyzing", simulationContext.length, "simulations with detailed responses")

    // Create comprehensive AI prompt with actual user data
    const prompt = `You are a career counselor analyzing a student's simulation experiences. Provide personalized career recommendations based on their actual responses and performance.

STUDENT PROFILE:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Grade: ${userProfile.grade || "Not specified"}
- School: ${userProfile.school || "Not specified"}
- Interests: ${userProfile.interests?.join(", ") || "Not specified"}
- Total XP: ${userProfile.totalXP || 0}
- Badges Earned: ${userProfile.badges?.join(", ") || "None"}

COMPLETED SIMULATIONS ANALYSIS:
${simulationContext
  .map((sim, index) => {
    const simName = sim.simulationId.replace("-simulation", "").replace("-", " ").toUpperCase()

    return `
SIMULATION ${index + 1}: ${simName}
Completed: ${new Date(sim.completedAt || "").toLocaleDateString()}

Pre-Reflection Responses:
${Object.entries(sim.preReflectionAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Exploration Phase:
${Object.entries(sim.explorationAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Experience Phase (Task Performance):
${Object.entries(sim.experienceAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Post-Reflection:
${Object.entries(sim.postReflectionAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Future Vision:
${Object.entries(sim.envisionAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}
`
  })
  .join("\n---\n")}

ANALYSIS REQUIREMENTS:
1. Reference specific responses, ratings, and feedback from the simulations
2. Identify patterns in their interests, strengths, and preferences
3. Note which tasks they rated highly and enjoyed most
4. Consider their confidence levels and learning outcomes
5. Provide 3-5 specific career recommendations with match percentages
6. Explain reasoning based on their actual simulation performance
7. Suggest concrete next steps for career exploration

Respond with a JSON object containing:
{
  "personalizedMessage": "A warm, encouraging message referencing their specific simulation experiences",
  "careerRecommendations": [
    {
      "title": "Career Title",
      "match": 85,
      "reasoning": "Specific reasoning based on their simulation responses and performance",
      "nextSteps": ["Specific actionable steps"],
      "skills": ["Key skills for this career"],
      "education": "Education requirements",
      "salary": "Salary range",
      "growth": "Job growth outlook"
    }
  ],
  "skillsAnalysis": {
    "strengths": ["Specific strengths identified from their responses"],
    "areasToExplore": ["Areas they showed interest in exploring"],
    "recommendations": ["Specific skill development recommendations"]
  },
  "nextSteps": ["Personalized next steps based on their interests and performance"]
}`

    console.log("🚀 Sending analysis request to AI...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    console.log("✅ Received AI analysis response")

    // Parse the AI response
    const analysisResult = JSON.parse(text) as AIAnalysisResult

    // Validate the response structure
    if (!analysisResult.personalizedMessage || !analysisResult.careerRecommendations) {
      throw new Error("Invalid AI response structure")
    }

    console.log("🎯 Generated", analysisResult.careerRecommendations.length, "career recommendations")

    return analysisResult
  } catch (error: any) {
    console.error("❌ Error generating career analysis:", error)

    // Return fallback analysis
    return {
      personalizedMessage:
        "We're analyzing your simulation experiences to provide personalized recommendations. Please try again in a moment.",
      careerRecommendations: [],
      skillsAnalysis: {
        strengths: ["Problem-solving", "Critical thinking"],
        areasToExplore: ["Career exploration", "Skill development"],
        recommendations: ["Continue completing simulations to discover your interests"],
      },
      nextSteps: ["Complete more simulations to get better recommendations"],
      error: error.message,
    }
  }
}

export const generateSimulationComparison = async (userId: string): Promise<string> => {
  try {
    const simulationProgressResult = await getUserSimulationProgress(userId)

    if (!simulationProgressResult.success) {
      return "Unable to compare simulations at this time."
    }

    const completedSimulations = simulationProgressResult.data?.filter((sim) => sim.completed) || []

    if (completedSimulations.length < 2) {
      return "Complete at least 2 simulations to see a comparison of your experiences."
    }

    const comparisonPrompt = `Compare this student's performance across multiple career simulations and identify patterns:

${completedSimulations
  .map((sim) => {
    const phaseProgress = sim.phaseProgress || {}
    return `
SIMULATION: ${sim.simulationId.replace("-simulation", "").toUpperCase()}
Pre-reflection confidence: ${phaseProgress.preReflectionAnswers?.confidence || "Not provided"}
Post-reflection enjoyment: ${phaseProgress.postReflectionAnswers?.enjoyment || "Not provided"}
Favorite tasks: ${phaseProgress.postReflectionAnswers?.favoriteTasks || "Not provided"}
Skills learned: ${phaseProgress.postReflectionAnswers?.skillsLearned || "Not provided"}
Career interest: ${phaseProgress.postReflectionAnswers?.careerInterest || "Not provided"}
`
  })
  .join("\n")}

Provide a brief comparison highlighting:
1. Which simulation they enjoyed most and why
2. Common themes across their experiences
3. How their confidence/interest evolved
4. Recommended focus areas based on patterns

Keep response under 200 words.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: comparisonPrompt,
      temperature: 0.6,
      maxTokens: 300,
    })

    return text
  } catch (error) {
    console.error("Error generating simulation comparison:", error)
    return "Unable to generate comparison at this time. Please try again later."
  }
}

export const generateCareerPathSuggestions = async (userId: string, careerField: string): Promise<string[]> => {
  try {
    const userProfileResult = await getUserProfile(userId)

    if (!userProfileResult.success) {
      return ["Complete your profile to get personalized suggestions"]
    }

    const userProfile = userProfileResult.data

    const pathPrompt = `Based on this student's profile and interest in ${careerField}, suggest 5 specific next steps:

Student Profile:
- Grade: ${userProfile.grade}
- Interests: ${userProfile.interests?.join(", ")}
- Completed simulations: ${userProfile.completedSimulations?.join(", ")}

Provide 5 actionable next steps for exploring ${careerField} careers, formatted as a JSON array of strings.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: pathPrompt,
      temperature: 0.7,
      maxTokens: 400,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating career path suggestions:", error)
    return [
      "Research entry-level positions in this field",
      "Connect with professionals on LinkedIn",
      "Look for internship opportunities",
      "Take relevant courses or certifications",
      "Join professional organizations or clubs",
    ]
  }
}
