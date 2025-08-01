import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Types for AI analysis
interface StudentReflectionData {
  simulationId: string
  simulationType: string
  preReflectionAnswers?: any
  postReflectionAnswers?: any
  taskRatings?: { [taskId: string]: number }
  completedAt: string
  enjoymentRating?: number
  confidenceRating?: number
  interestLevel?: number
  skillsLearned?: string
  favoriteTask?: string
  challengingTask?: string
  careerInterest?: string
  otherCareers?: string
  phaseProgress?: any
}

interface OnboardingData {
  interests?: string[]
  careerGoals?: string
  preferredWorkEnvironment?: string
  strengths?: string[]
  values?: string[]
  onboardingAnswers?: any
}

interface CareerRecommendation {
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
}

interface AIInsights {
  careerRecommendations: CareerRecommendation[]
  suggestedSimulations: string[]
  keyStrengths: string[]
  developmentAreas: string[]
  personalityInsights: string
  nextSteps: string[]
}

// Comprehensive career database organized by themes and interests
const CAREER_DATABASE = {
  creative: [
    {
      title: "Brand Strategist",
      overview:
        "Develops comprehensive brand positioning and marketing strategies to build strong brand identity and market presence.",
      averageSalary: "$75,000 - $95,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Marketing", "Communications", "Business", "Psychology"],
        optionalCertifications: ["Brand Management Certificate", "Digital Marketing"],
      },
      growthOutlook: "Faster than average (10% growth)",
      keySkills: ["Strategic Thinking", "Creative Problem Solving", "Market Research", "Brand Development"],
      workEnvironment: "Creative agency or corporate marketing department, collaborative team environment",
    },
    {
      title: "Creative Director",
      overview:
        "Leads creative teams to develop innovative marketing campaigns, brand identities, and visual communications.",
      averageSalary: "$85,000 - $120,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Graphic Design", "Marketing", "Communications", "Fine Arts"],
        optionalCertifications: ["Adobe Creative Suite", "Project Management"],
      },
      growthOutlook: "Average growth (7% growth)",
      keySkills: ["Creative Leadership", "Visual Design", "Campaign Development", "Team Management"],
      workEnvironment: "Creative agencies, fast-paced collaborative environment with client interaction",
    },
    {
      title: "UX Designer",
      overview:
        "Designs user-centered digital experiences by researching user needs and creating intuitive interfaces.",
      averageSalary: "$80,000 - $110,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Design", "Psychology", "Computer Science", "Human-Computer Interaction"],
        optionalCertifications: ["UX Certification", "Design Thinking", "Figma/Sketch"],
      },
      growthOutlook: "Much faster than average (13% growth)",
      keySkills: ["User Research", "Prototyping", "Design Thinking", "Empathy"],
      workEnvironment: "Tech companies, design studios, remote-friendly collaborative environment",
    },
  ],
  analytical: [
    {
      title: "Financial Analyst",
      overview:
        "Analyzes financial data and market trends to help organizations make informed investment and business decisions.",
      averageSalary: "$70,000 - $90,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Finance", "Economics", "Accounting", "Business"],
        optionalCertifications: ["CFA", "FRM", "Excel Certification"],
      },
      growthOutlook: "Faster than average (9% growth)",
      keySkills: ["Financial Modeling", "Data Analysis", "Excel", "Risk Assessment"],
      workEnvironment: "Corporate office, analytical work with some client interaction",
    },
    {
      title: "Data Scientist",
      overview:
        "Uses statistical analysis and machine learning to extract insights from complex data sets to drive business decisions.",
      averageSalary: "$95,000 - $130,000",
      educationPath: {
        requiredLevel: "Bachelor's or Master's Degree",
        commonMajors: ["Statistics", "Computer Science", "Mathematics", "Data Science"],
        optionalCertifications: ["Python", "R", "Machine Learning", "SQL"],
      },
      growthOutlook: "Much faster than average (22% growth)",
      keySkills: ["Statistical Analysis", "Programming", "Machine Learning", "Data Visualization"],
      workEnvironment: "Tech companies, research institutions, data-driven collaborative environment",
    },
    {
      title: "Investment Advisor",
      overview:
        "Provides personalized financial advice and investment strategies to help clients achieve their financial goals.",
      averageSalary: "$80,000 - $120,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Finance", "Economics", "Business", "Mathematics"],
        optionalCertifications: ["Series 7", "Series 66", "CFP"],
      },
      growthOutlook: "Much faster than average (15% growth)",
      keySkills: ["Client Relations", "Portfolio Management", "Market Analysis", "Communication"],
      workEnvironment: "Client-facing role, mix of office and client meetings",
    },
  ],
  technical: [
    {
      title: "Materials Engineer",
      overview: "Develops and tests materials for use in products ranging from computer chips to aircraft wings.",
      averageSalary: "$85,000 - $110,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Materials Engineering", "Chemical Engineering", "Mechanical Engineering"],
        optionalCertifications: ["PE License", "Materials Characterization"],
      },
      growthOutlook: "Average growth (8% growth)",
      keySkills: ["Materials Testing", "Research", "Problem Solving", "Technical Writing"],
      workEnvironment: "Laboratory and office settings, R&D focused",
    },
    {
      title: "Research Scientist",
      overview: "Conducts experiments and research to advance scientific knowledge and develop new technologies.",
      averageSalary: "$75,000 - $100,000",
      educationPath: {
        requiredLevel: "Master's or PhD",
        commonMajors: ["Chemistry", "Physics", "Materials Science", "Engineering"],
        optionalCertifications: ["Laboratory Certifications", "Research Methods"],
      },
      growthOutlook: "Faster than average (11% growth)",
      keySkills: ["Research Design", "Data Analysis", "Laboratory Techniques", "Scientific Writing"],
      workEnvironment: "Research laboratories, universities, or corporate R&D",
    },
    {
      title: "Product Development Engineer",
      overview: "Designs and develops new products from concept to market, focusing on innovation and functionality.",
      averageSalary: "$80,000 - $105,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Engineering", "Industrial Design", "Materials Science"],
        optionalCertifications: ["CAD Software", "Project Management", "Six Sigma"],
      },
      growthOutlook: "Average growth (7% growth)",
      keySkills: ["Product Design", "Innovation", "Project Management", "Technical Problem Solving"],
      workEnvironment: "Corporate R&D departments, product development teams",
    },
  ],
  leadership: [
    {
      title: "Policy Analyst",
      overview: "Researches and analyzes policy issues to help government officials make informed decisions.",
      averageSalary: "$65,000 - $85,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Political Science", "Public Policy", "Economics", "Public Administration"],
        optionalCertifications: ["Policy Analysis Certificate", "Government Relations"],
      },
      growthOutlook: "Average growth (8% growth)",
      keySkills: ["Research", "Policy Writing", "Data Analysis", "Critical Thinking"],
      workEnvironment: "Government offices, think tanks, research-focused environment",
    },
    {
      title: "Legislative Assistant",
      overview:
        "Supports elected officials by researching issues, drafting legislation, and managing constituent communications.",
      averageSalary: "$45,000 - $65,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Political Science", "Communications", "Public Administration", "Law"],
        optionalCertifications: ["Government Relations", "Legislative Process Training"],
      },
      growthOutlook: "Average growth (6% growth)",
      keySkills: ["Research", "Writing", "Communication", "Political Awareness"],
      workEnvironment: "Capitol buildings, fast-paced political environment",
    },
    {
      title: "Public Affairs Specialist",
      overview:
        "Manages communications between government agencies and the public, handling media relations and public information.",
      averageSalary: "$60,000 - $80,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Communications", "Public Relations", "Journalism", "Political Science"],
        optionalCertifications: ["Public Affairs Certificate", "Crisis Communication"],
      },
      growthOutlook: "Average growth (7% growth)",
      keySkills: ["Public Speaking", "Media Relations", "Writing", "Crisis Management"],
      workEnvironment: "Government agencies, public-facing role with media interaction",
    },
  ],
  social: [
    {
      title: "Marketing Manager",
      overview: "Develops and implements marketing strategies to promote products and services to target audiences.",
      averageSalary: "$70,000 - $95,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Marketing", "Business", "Communications"],
        optionalCertifications: ["Digital Marketing", "Google Analytics", "HubSpot"],
      },
      growthOutlook: "Faster than average (10% growth)",
      keySkills: ["Marketing Strategy", "Campaign Management", "Analytics", "Team Leadership"],
      workEnvironment: "Corporate marketing departments, collaborative team environment",
    },
    {
      title: "Public Relations Specialist",
      overview:
        "Manages public image and communications for organizations, handling media relations and crisis communication.",
      averageSalary: "$60,000 - $80,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Public Relations", "Communications", "Journalism", "Marketing"],
        optionalCertifications: ["APR Certification", "Crisis Communication"],
      },
      growthOutlook: "Average growth (7% growth)",
      keySkills: ["Writing", "Media Relations", "Crisis Management", "Event Planning"],
      workEnvironment: "Fast-paced office environment, frequent client interaction",
    },
    {
      title: "Social Media Manager",
      overview:
        "Creates and manages social media content and strategies to build brand awareness and engage audiences.",
      averageSalary: "$50,000 - $70,000",
      educationPath: {
        requiredLevel: "Bachelor's Degree",
        commonMajors: ["Marketing", "Communications", "Digital Media"],
        optionalCertifications: ["Social Media Marketing", "Content Creation", "Analytics"],
      },
      growthOutlook: "Much faster than average (18% growth)",
      keySkills: ["Content Creation", "Social Media Strategy", "Analytics", "Community Management"],
      workEnvironment: "Digital agencies or in-house marketing teams, creative collaborative environment",
    },
  ],
}

// Alternative pathways database
const ALTERNATIVE_PATHWAYS = [
  {
    title: "Digital Marketing Certificate",
    overview: "Comprehensive online certification covering SEO, social media, and digital advertising.",
    duration: "3-6 months",
    cost: "$500 - $2,000",
    provider: "Google, HubSpot, Coursera",
    careerOutcomes: ["Digital Marketing Coordinator", "Social Media Specialist", "SEO Specialist"],
  },
  {
    title: "Financial Planning Certificate",
    overview: "Professional certification for personal financial planning and investment advice.",
    duration: "6-12 months",
    cost: "$2,000 - $5,000",
    provider: "CFP Board, Kaplan",
    careerOutcomes: ["Financial Planner", "Investment Advisor", "Wealth Manager"],
  },
  {
    title: "UX/UI Design Bootcamp",
    overview: "Intensive training in user experience and interface design with portfolio development.",
    duration: "3-6 months",
    cost: "$8,000 - $15,000",
    provider: "General Assembly, Springboard, CareerFoundry",
    careerOutcomes: ["UX Designer", "UI Designer", "Product Designer"],
  },
  {
    title: "Data Analytics Certificate",
    overview: "Learn data analysis, visualization, and statistical methods for business insights.",
    duration: "4-8 months",
    cost: "$1,000 - $4,000",
    provider: "Coursera, edX, Udacity",
    careerOutcomes: ["Data Analyst", "Business Analyst", "Marketing Analyst"],
  },
  {
    title: "Project Management Professional (PMP)",
    overview: "Industry-standard certification for project management across various industries.",
    duration: "3-6 months",
    cost: "$2,000 - $4,000",
    provider: "PMI, various training providers",
    careerOutcomes: ["Project Manager", "Program Manager", "Operations Manager"],
  },
]

export class AICareerService {
  private apiKey: string

  constructor() {
    this.apiKey =
      process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
  }
      

  async analyzeStudentReflections(
    reflectionData: StudentReflectionData[],
    onboardingData?: OnboardingData,
  ): Promise<AIInsights> {
    try {
      console.log("🤖 Starting AI analysis with data:", { reflectionData, onboardingData })

      // Extract detailed reflection responses
      const detailedReflections = this.extractDetailedReflections(reflectionData)

      // Prepare the analysis prompt with actual student responses
      const analysisPrompt = this.buildDetailedAnalysisPrompt(detailedReflections, onboardingData)

      console.log("🤖 Sending prompt to GPT-4o:", analysisPrompt.substring(0, 500) + "...")

      // Generate AI insights
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: analysisPrompt,
        temperature: 0.7,
        maxTokens: 2500,
      })

      console.log("🤖 GPT-4o response:", text)

      // Parse the AI response and match with career database
      const insights = this.parseAIResponse(text, reflectionData)

      console.log("✅ Final insights generated:", insights)
      return insights
    } catch (error) {
      console.error("❌ Error analyzing student reflections:", error)
      // Return personalized fallback recommendations based on actual data
      return this.getPersonalizedFallbackRecommendations(reflectionData, onboardingData)
    }
  }

  private extractDetailedReflections(reflectionData: StudentReflectionData[]): any {
    const extracted = {
      simulations: [] as any[],
      overallPatterns: {
        highEnjoymentTasks: [] as string[],
        lowEnjoymentTasks: [] as string[],
        skillsLearned: [] as string[],
        careerInterests: [] as string[],
        challenges: [] as string[],
      },
    }

    reflectionData.forEach((data) => {
      const simulation = {
        type: data.simulationType,
        enjoymentRating: data.enjoymentRating || 0,
        confidenceRating: data.confidenceRating || 0,
        interestLevel: data.interestLevel || 0,
        favoriteTask: data.favoriteTask || "",
        challengingTask: data.challengingTask || "",
        skillsLearned: data.skillsLearned || "",
        careerInterest: data.careerInterest || "",
        otherCareers: data.otherCareers || "",
        preReflectionAnswers: data.preReflectionAnswers || {},
        postReflectionAnswers: data.postReflectionAnswers || {},
        taskRatings: data.taskRatings || {},
      }

      extracted.simulations.push(simulation)

      // Aggregate patterns
      if (data.favoriteTask) extracted.overallPatterns.highEnjoymentTasks.push(data.favoriteTask)
      if (data.challengingTask) extracted.overallPatterns.challenges.push(data.challengingTask)
      if (data.skillsLearned) extracted.overallPatterns.skillsLearned.push(data.skillsLearned)
      if (data.careerInterest) extracted.overallPatterns.careerInterests.push(data.careerInterest)
      if (data.otherCareers) extracted.overallPatterns.careerInterests.push(data.otherCareers)
    })

    return extracted
  }

  private buildDetailedAnalysisPrompt(detailedReflections: any, onboardingData?: OnboardingData): string {
    const simulationSummaries = detailedReflections.simulations
      .map((sim: any, index: number) => {
        return `
SIMULATION ${index + 1}: ${sim.type}
- Enjoyment Rating: ${sim.enjoymentRating}/10
- Confidence Rating: ${sim.confidenceRating}/5  
- Interest Level: ${sim.interestLevel}/5
- Favorite Task: "${sim.favoriteTask}"
- Most Challenging Task: "${sim.challengingTask}"
- Skills Learned: "${sim.skillsLearned}"
- Career Interest Expressed: "${sim.careerInterest}"
- Other Careers Mentioned: "${sim.otherCareers}"
- Pre-Reflection Responses: ${JSON.stringify(sim.preReflectionAnswers)}
- Post-Reflection Responses: ${JSON.stringify(sim.postReflectionAnswers)}
- Task Ratings: ${JSON.stringify(sim.taskRatings)}
      `
      })
      .join("\n---\n")

    const onboardingInfo = onboardingData
      ? `
ONBOARDING DATA:
- Initial Interests: ${onboardingData.interests?.join(", ") || "Not provided"}
- Career Goals: ${onboardingData.careerGoals || "Not provided"}
- Preferred Work Environment: ${onboardingData.preferredWorkEnvironment || "Not provided"}
- Strengths: ${onboardingData.strengths?.join(", ") || "Not provided"}
- Values: ${onboardingData.values?.join(", ") || "Not provided"}
- Onboarding Answers: ${JSON.stringify(onboardingData.onboardingAnswers || {})}
    `
      : "No onboarding data available."

    return `
You are an expert career counselor analyzing a student's detailed simulation experiences and reflections. Based on the specific responses below, provide highly personalized insights in the following JSON format:

{
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "developmentAreas": ["area1", "area2"],
  "personalityInsights": "Detailed personality assessment based on specific responses and patterns",
  "careerThemes": ["theme1", "theme2", "theme3"],
  "suggestedSimulations": ["simulation1", "simulation2"],
  "specificInsights": {
    "enjoymentPatterns": "What they consistently enjoyed across simulations",
    "skillDevelopment": "Skills they mentioned learning or wanting to develop",
    "careerAlignment": "How their expressed interests align with career paths",
    "workStylePreferences": "Inferred work style preferences from their responses"
  }
}

STUDENT REFLECTION DATA:
${simulationSummaries}

${onboardingInfo}

ANALYSIS INSTRUCTIONS:
1. Look for specific patterns in their favorite tasks, skills learned, and career interests mentioned
2. Pay attention to their enjoyment ratings and what they found challenging
3. Consider their expressed career interests and other careers they mentioned
4. Analyze their pre and post-reflection responses for deeper insights
5. Map their interests to career themes: creative, analytical, technical, leadership, social
6. Suggest simulations they haven't completed that align with their interests
7. Be specific about WHY you're making each recommendation based on their actual responses

Available Career Themes: creative, analytical, technical, leadership, social
Available Simulations: brand-marketing, finance-simulation, material-science, government-simulation

Focus on creating truly personalized recommendations that directly reference their specific responses and demonstrated interests.
    `
  }

  private parseAIResponse(aiResponse: string, reflectionData: StudentReflectionData[]): AIInsights {
    try {
      console.log("🔍 Parsing AI response:", aiResponse)

      // Try to parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log("✅ Successfully parsed AI response:", parsed)

        // Get career recommendations based on identified themes
        const careerRecommendations = this.getCareerRecommendationsByThemes(
          parsed.careerThemes || [],
          reflectionData,
          parsed.specificInsights || {},
        )

        return {
          careerRecommendations,
          suggestedSimulations: parsed.suggestedSimulations || this.getDefaultSuggestedSimulations(reflectionData),
          keyStrengths: parsed.keyStrengths || [],
          developmentAreas: parsed.developmentAreas || [],
          personalityInsights: parsed.personalityInsights || "",
          nextSteps: this.generateNextSteps(parsed, reflectionData),
        }
      }
    } catch (error) {
      console.error("❌ Error parsing AI response:", error)
    }

    // Fallback parsing
    return this.getPersonalizedFallbackRecommendations(reflectionData)
  }

  private getCareerRecommendationsByThemes(
    themes: string[],
    reflectionData: StudentReflectionData[],
    specificInsights: any,
  ): CareerRecommendation[] {
    const recommendations: CareerRecommendation[] = []

    console.log("🎯 Getting career recommendations for themes:", themes)

    // Get careers from identified themes
    themes.forEach((theme) => {
      const careers = CAREER_DATABASE[theme as keyof typeof CAREER_DATABASE]
      if (careers && careers.length > 0) {
        // Select the most relevant career from this theme
        const career = careers[0] // Could be made smarter with additional scoring
        recommendations.push({
          ...career,
          whyThisRole: this.generatePersonalizedWhyThisRole(career, reflectionData, specificInsights, theme),
        })
      }
    })

    // If we don't have enough recommendations, add more based on simulation types
    if (recommendations.length < 3) {
      const completedTypes = reflectionData.map((d) => d.simulationType)
      const themeMapping = {
        "brand-marketing": "creative",
        "finance-simulation": "analytical",
        "material-science": "technical",
        "government-simulation": "leadership",
      }

      completedTypes.forEach((type) => {
        const theme = themeMapping[type as keyof typeof themeMapping]
        if (theme && recommendations.length < 3) {
          const careers = CAREER_DATABASE[theme as keyof typeof CAREER_DATABASE]
          if (careers) {
            careers.forEach((career) => {
              if (recommendations.length < 3 && !recommendations.find((r) => r.title === career.title)) {
                recommendations.push({
                  ...career,
                  whyThisRole: this.generatePersonalizedWhyThisRole(career, reflectionData, specificInsights, theme),
                })
              }
            })
          }
        }
      })
    }

    console.log(
      "✅ Generated recommendations:",
      recommendations.map((r) => r.title),
    )
    return recommendations.slice(0, 3)
  }

  private generatePersonalizedWhyThisRole(
    career: any,
    reflectionData: StudentReflectionData[],
    specificInsights: any,
    theme: string,
  ): string {
    // Find the most relevant simulation data
    const highRatedSim = reflectionData.find((d) => (d.enjoymentRating || 0) >= 7)
    const relevantSim = reflectionData.find((d) => {
      const typeThemeMap = {
        "brand-marketing": "creative",
        "finance-simulation": "analytical",
        "material-science": "technical",
        "government-simulation": "leadership",
      }
      return typeThemeMap[d.simulationType as keyof typeof typeThemeMap] === theme
    })

    const targetSim = relevantSim || highRatedSim || reflectionData[0]

    if (!targetSim) {
      return `This role aligns with your demonstrated interests in ${career.keySkills.slice(0, 2).join(" and ")}.`
    }

    let explanation = ""

    // Reference specific responses
    if (targetSim.favoriteTask) {
      explanation += `You mentioned enjoying "${targetSim.favoriteTask}" in your ${this.formatSimulationType(targetSim.simulationType)} simulation, which aligns with this role's focus on ${career.keySkills[0].toLowerCase()}. `
    }

    if (targetSim.skillsLearned) {
      explanation += `The skills you learned (${targetSim.skillsLearned}) directly relate to ${career.keySkills.slice(0, 2).join(" and ").toLowerCase()}. `
    }

    if (targetSim.careerInterest) {
      explanation += `Your expressed interest in "${targetSim.careerInterest}" shows strong alignment with this career path. `
    }

    if (targetSim.enjoymentRating && targetSim.enjoymentRating >= 7) {
      explanation += `Your high enjoyment rating (${targetSim.enjoymentRating}/10) in the ${this.formatSimulationType(targetSim.simulationType)} simulation suggests you'd thrive in this type of work environment.`
    }

    return (
      explanation ||
      `Based on your simulation experiences, this role matches your demonstrated interests in ${career.keySkills.slice(0, 2).join(" and ").toLowerCase()}.`
    )
  }

  private formatSimulationType(type: string): string {
    const typeMap: { [key: string]: string } = {
      "brand-marketing": "Brand & Marketing",
      "finance-simulation": "Finance",
      "material-science": "Material Science",
      "government-simulation": "Government & Politics",
    }
    return typeMap[type] || type
  }

  private getDefaultSuggestedSimulations(reflectionData: StudentReflectionData[]): string[] {
    const completedTypes = reflectionData.map((d) => d.simulationType)
    const allSimulations = ["brand-marketing", "finance-simulation", "material-science", "government-simulation"]
    return allSimulations.filter((sim) => !completedTypes.includes(sim)).slice(0, 2)
  }

  private generateNextSteps(parsed: any, reflectionData: StudentReflectionData[]): string[] {
    const steps = [
      "Complete additional simulations to explore more career options",
      "Research specific education requirements for careers of interest",
    ]

    // Add personalized steps based on their responses
    const careerInterests = reflectionData.flatMap((d) => [d.careerInterest, d.otherCareers]).filter(Boolean)
    if (careerInterests.length > 0) {
      steps.push(`Connect with professionals in ${careerInterests[0]}`)
    }

    steps.push("Consider internships or shadowing opportunities in your areas of interest")

    return steps
  }

  private getPersonalizedFallbackRecommendations(
    reflectionData: StudentReflectionData[],
    onboardingData?: OnboardingData,
  ): AIInsights {
    console.log("🔄 Generating sophisticated personalized fallback recommendations")

    const completedTypes = Array.from(new Set(reflectionData.map((d) => d.simulationType)))
    const highRatedSimulations = reflectionData.filter(
      (d) => (d.enjoymentRating || 0) >= 7 || (d.interestLevel || 0) >= 4,
    )
    const allSkills = reflectionData
      .flatMap((d) => d.skillsLearned?.split(",").map((s) => s.trim()) || [])
      .filter(Boolean)
    const careerInterests = reflectionData.flatMap((d) => [d.careerInterest, d.otherCareers]).filter(Boolean)

    // Sophisticated mapping: simulation type to specific careers
    const simulationCareerMap: Record<string, string[]> = {
      "brand-marketing": ["Brand Strategist", "Creative Director", "UX Designer"],
      "finance-simulation": ["Financial Analyst", "Data Scientist", "Investment Advisor"],
      "material-science": ["Materials Engineer", "Product Development Engineer", "Research Scientist"],
      "government-simulation": ["Policy Analyst", "Legislative Assistant", "Public Affairs Specialist"],
    }

    // Build a unique, prioritized list of careers based on completed simulations
    const careerRecommendations: CareerRecommendation[] = []
    completedTypes.forEach((type) => {
      const theme = {
        "brand-marketing": "creative",
        "finance-simulation": "analytical",
        "material-science": "technical",
        "government-simulation": "leadership",
      }[type]
      const careerTitles = simulationCareerMap[type] || []
      const careers = theme ? CAREER_DATABASE[theme as keyof typeof CAREER_DATABASE] : []
      careerTitles.forEach((title) => {
        const match = careers.find((c) => c.title === title)
        if (match && !careerRecommendations.find((r) => r.title === match.title)) {
          const relevantReflection = reflectionData.find((d) => d.simulationType === type)
          careerRecommendations.push({
            ...match,
            whyThisRole: this.generatePersonalizedWhyThisRole(match, [relevantReflection!], {}, theme!),
          })
        }
      })
    })
    // If less than 3, fill with other careers from completed themes
    if (careerRecommendations.length < 3) {
      completedTypes.forEach((type) => {
        const theme = {
          "brand-marketing": "creative",
          "finance-simulation": "analytical",
          "material-science": "technical",
          "government-simulation": "leadership",
        }[type]
        const careers = theme ? CAREER_DATABASE[theme as keyof typeof CAREER_DATABASE] : []
        careers.forEach((career) => {
          if (careerRecommendations.length < 3 && !careerRecommendations.find((r) => r.title === career.title)) {
            const relevantReflection = reflectionData.find((d) => d.simulationType === type)
            careerRecommendations.push({
              ...career,
              whyThisRole: this.generatePersonalizedWhyThisRole(career, [relevantReflection!], {}, theme!),
            })
          }
        })
      })
    }

    // Generate unique key strengths based on simulation types
    const keyStrengths: string[] = []
    if (completedTypes.includes("brand-marketing")) keyStrengths.push("Creative Problem Solving")
    if (completedTypes.includes("finance-simulation")) keyStrengths.push("Analytical Thinking")
    if (completedTypes.includes("material-science")) keyStrengths.push("Technical Innovation")
    if (completedTypes.includes("government-simulation")) keyStrengths.push("Strategic Planning")
    if (allSkills.length > 2) keyStrengths.push("Rapid Skill Development")
    if (careerInterests.length > 0) keyStrengths.push("Clear Career Direction")
    if (keyStrengths.length < 4) keyStrengths.push("Problem Solving", "Adaptability")

    // Generate unique development areas
    const developmentAreas: string[] = []
    if (completedTypes.length < 2) {
      developmentAreas.push("Explore More Career Fields")
    } else {
      developmentAreas.push("Deepen Expertise in Your Areas of Interest")
    }
    if (!completedTypes.includes("material-science")) developmentAreas.push("Scientific Thinking")
    if (!completedTypes.includes("government-simulation")) developmentAreas.push("Leadership Experience")
    if (allSkills.length < 3) developmentAreas.push("Technical Skills")

    // Generate unique personality insights
    let personalityInsights = "Based on your simulation experiences, you demonstrate: "
    if (completedTypes.includes("brand-marketing")) personalityInsights += "creative thinking, "
    if (completedTypes.includes("finance-simulation")) personalityInsights += "analytical skills, "
    if (completedTypes.includes("material-science")) personalityInsights += "technical curiosity, "
    if (completedTypes.includes("government-simulation")) personalityInsights += "leadership potential, "
    if (highRatedSimulations.length > 0) personalityInsights += "and high engagement in hands-on learning. "
    if (careerInterests.length > 0) personalityInsights += `Your interest in ${careerInterests.slice(0, 2).join(" and ")} shows focused career exploration. `
    personalityInsights += "You appear to learn best through experiential activities and show curiosity about different career paths."

    return {
      careerRecommendations: careerRecommendations.slice(0, 3),
      suggestedSimulations: this.getDefaultSuggestedSimulations(reflectionData),
      keyStrengths: keyStrengths.slice(0, 4),
      developmentAreas: developmentAreas.slice(0, 3),
      personalityInsights,
      nextSteps: this.generateNextSteps({}, reflectionData),
    }
  }

  getAlternativePathways(careerCategories: string[]): any[] {
    return ALTERNATIVE_PATHWAYS.filter((pathway) =>
      careerCategories.some((category) =>
        pathway.careerOutcomes.some((outcome) => outcome.toLowerCase().includes(category.toLowerCase())),
      ),
    ).slice(0, 3)
  }
}

// Export singleton instance
export const aiCareerService = new AICareerService()
