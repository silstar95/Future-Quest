"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Users,
  FileText,
  Scale,
  Crown,
  UserIcon as UserTie,
  Gavel,
  Leaf,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  RotateCcw,
  Send,
  Eye,
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GovernmentExperiencePhaseProps {
  onComplete: (results: any) => void
}

// Game State Management
interface GameState {
  attempts: { [key: string]: number }
  stakeholderResults: { [key: string]: boolean | null }
  writingResponses: { [key: string]: string }
  maxAttempts: { [key: string]: number }
  stakeholderFeedback: { [key: string]: string[] }
}

const STAKEHOLDERS = [
  "Chief of Staff",
  "Clean Water Advocacy Group Representative",
  "Opposition Cosponsor",
  "House Committee Chair",
  "House Majority Leader",
]

export default function GovernmentExperiencePhase({ onComplete }: GovernmentExperiencePhaseProps) {
  const { toast } = useToast()
  const [gamePhase, setGamePhase] = useState<"welcome" | "stakeholder" | "results">("welcome")
  const [currentStakeholder, setCurrentStakeholder] = useState(0)
  const [gameState, setGameState] = useState<GameState>({
    attempts: {
      "Chief of Staff": 0,
      "Clean Water Advocacy Group Representative": 0,
      "Opposition Cosponsor": 0,
      "House Committee Chair": 0,
      "House Majority Leader": 0,
    },
    stakeholderResults: {
      "Chief of Staff": null,
      "Clean Water Advocacy Group Representative": null,
      "Opposition Cosponsor": null,
      "House Committee Chair": null,
      "House Majority Leader": null,
    },
    writingResponses: {
      "Chief of Staff": "",
      "Clean Water Advocacy Group Representative": "",
      "Opposition Cosponsor": "",
      "House Committee Chair": "",
      "House Majority Leader": "",
    },
    maxAttempts: {
      "Chief of Staff": 2,
      "Clean Water Advocacy Group Representative": 2,
      "Opposition Cosponsor": 2,
      "House Committee Chair": 2,
      "House Majority Leader": 4,
    },
    stakeholderFeedback: {
      "Chief of Staff": [],
      "Clean Water Advocacy Group Representative": [],
      "Opposition Cosponsor": [],
      "House Committee Chair": [],
      "House Majority Leader": [],
    },
  })
  const [currentResponse, setCurrentResponse] = useState("")
  const [showTemplate, setShowTemplate] = useState(false)

  // Stakeholder Data
  const getStakeholderData = (stakeholderName: string) => {
    const stakeholderData: { [key: string]: any } = {
      "Chief of Staff": {
        name: "Chief of Staff",
        role: "Gatekeeper of Congressional Priorities",
        task: "Internal Memo",
        icon: UserTie,
        color: "text-[#2d407e]",
        description:
          "The Chief of Staff manages the Congressmember's schedule and priorities. They're strategic and practical, focused on what will advance the office's agenda.",
        assignment:
          "Write a one-page internal memo to the Congressmember explaining why the WATER Act should be prioritized on our legislative agenda. Your memo should address: 1) Political viability, 2) Constituent impact, 3) Timeline for action. Focus on strategic considerations rather than just moral arguments.",
        keyPoints: [
          "Demonstrate bipartisan support potential",
          "Show constituent demand and electoral benefits",
          "Present realistic timeline for passage",
          "Address resource allocation concerns",
        ],
        exampleOpening:
          "MEMORANDUM: TO: Congressmember [Name] FROM: Legislative Assistant RE: Prioritizing the WATER Act on 2025 Legislative Agenda...",
        sampleTemplate: `MEMORANDUM
TO: Congressmember [Name]
FROM: Legislative Assistant
DATE: [Date]
RE: [Brief description of your recommendation]

EXECUTIVE SUMMARY:
[One sentence explaining your main recommendation and why]

POLITICAL VIABILITY:
• [Explain bipartisan appeal - why both parties might support this]
• [Mention proven track record or similar successful policies]
• [Provide realistic timeline for legislative action]

CONSTITUENT IMPACT:
• [Specific data about how this affects people in your district]
• [Economic benefits like job creation]
• [Electoral advantages - why voters care about this issue]

RECOMMENDATION:
[Clear action you want the Congressmember to take with timing]`,
        templateLink: "https://www.congress.gov/help/legislative-glossary#glossary_memorandum",
        successCriteria: "Strategic focus on political viability and constituent benefits",
        difficulty: "easy",
      },
      "Clean Water Advocacy Group Representative": {
        name: "Clean Water Advocacy Group Representative",
        role: "Environmental Policy Expert",
        task: "Stakeholder Call Summary",
        icon: Leaf,
        color: "text-green-600",
        description:
          "A passionate advocate who has spent years fighting for clean water access. They represent communities affected by the 9.2 million lead service lines nationwide.",
        assignment:
          "Write a stakeholder call summary documenting our discussion about the WATER Act. Your summary should capture: 1) Key concerns raised by advocacy groups, 2) Specific commitments made regarding environmental justice, 3) Next steps for coalition building. Emphasize how the bill prioritizes vulnerable communities.",
        keyPoints: [
          "Address tribal communities' 19x higher risk of lacking clean water",
          "Reference 70% of Chicago children exposed to lead in tap water",
          "Commit to environmental justice provisions in the bill",
          "Outline specific protections for low-income communities",
        ],
        exampleOpening:
          "CALL SUMMARY: Date: [Date] Participants: Legislative Assistant, Clean Water Advocacy Coalition Representatives Topic: WATER Act Environmental Justice Provisions...",
        sampleTemplate: `STAKEHOLDER CALL SUMMARY
Date: [Date]
Participants: [List who participated in the call]
Topic: [Brief description of discussion topic]

KEY CONCERNS RAISED:
• [Major issue affecting tribal communities - reference statistics]
• [Specific concern about children's health - cite data]
• [Problem affecting low-income communities]
• [Legal/policy language needs they mentioned]

COMMITMENTS MADE:
• [Specific funding promise you made]
• [Assessment requirement you agreed to include]
• [Community involvement process you committed to]
• [Prioritization system you promised]

NEXT STEPS:
• [Action item with deadline]
• [Follow-up meeting to schedule]
• [Coalition building task]`,
        templateLink: "https://www.epa.gov/environmentaljustice/learn-about-environmental-justice",
        successCriteria: "Clear commitment to environmental justice and vulnerable community protections",
        difficulty: "easy",
      },
      "Opposition Cosponsor": {
        name: "Opposition Cosponsor",
        role: "Bipartisan Bridge Builder",
        task: "Email Pitch",
        icon: Scale,
        color: "text-[#765889]",
        description:
          "A practical member of the opposition party who knows that the $625 billion needed for water pipes requires federal help, but wants responsible spending and state involvement.",
        assignment:
          "Draft a professional email to the Opposition Cosponsor requesting their support for the WATER Act. Your email should address: 1) Fiscal responsibility measures, 2) State-federal partnership structure, 3) Phased implementation timeline, 4) Bipartisan benefits. Emphasize conservative principles of federalism and responsible spending.",
        keyPoints: [
          "Reference the proven Clean Water State Revolving Fund model",
          "Propose phased 10-year implementation with state matching funds",
          "Highlight job creation in construction and infrastructure sectors",
          "Address concerns about federal overreach and spending",
        ],
        exampleOpening:
          "Dear Congressmember [Name], I am writing to request your consideration as a cosponsor of the WATER Act. As a member who values fiscal responsibility and federalism...",
        sampleTemplate: `Subject: [Clear subject line about cosponsorship request]

Dear Congressmember [Name],

[Opening: State your request and acknowledge their political values]

FISCAL RESPONSIBILITY:
• [Reference proven funding model with track record]
• [Explain state matching requirements - shows shared responsibility]
• [Describe implementation timeline to avoid budget spikes]
• [Include return on investment data]

STATE-FEDERAL PARTNERSHIP:
• [Explain how states maintain control]
• [Clarify limited federal role]
• [Show respect for state sovereignty]
• [Demonstrate federalism principles]

ECONOMIC BENEFITS:
• [Job creation in their district]
• [Healthcare cost savings]
• [Property value protection]

[Closing: Offer to discuss further]

Respectfully,
[Your name]`,
        templateLink: "https://www.house.gov/the-house-explained/open-government/statement-of-disbursements",
        successCriteria: "Balances federal action with state partnership and fiscal discipline",
        difficulty: "moderate_first_hard",
      },
      "House Committee Chair": {
        name: "House Committee Chair",
        role: "Legislative Process Guardian",
        task: "Verbal Pitch",
        icon: Gavel,
        color: "text-[#f0ad70]",
        description:
          "An experienced member of Congress who leads the Energy and Commerce Committee that handles water laws. They know the EPA's new rule makes this urgent, but they need to be sure they have enough support.",
        assignment:
          "Prepare talking points for a verbal pitch to the Committee Chair asking them to schedule hearings on the WATER Act. Your pitch should include: 1) Evidence of leadership support, 2) Why this committee should handle it, 3) List of witnesses for hearings, 4) Timeline for voting. Focus on showing you're ready and have the votes to win.",
        keyPoints: [
          "Confirm the Majority Leader will give us time for a vote",
          "Explain why this committee should handle the bill",
          "Present a list of witnesses (advocates, experts, affected communities)",
          "Suggest a realistic schedule for hearings and voting",
        ],
        exampleOpening:
          "Chair [Name], I'm requesting your consideration to schedule hearings on the WATER Act. Leadership has indicated support for this priority, and our committee's jurisdiction over EPA oversight makes us the natural venue...",
        sampleTemplate: `COMMITTEE CHAIR TALKING POINTS
[Brief title of your request]

LEADERSHIP SUPPORT CONFIRMED:
• [Evidence that Majority Leader supports scheduling floor time]
• [Ranking Member's position on bipartisan approach]
• [Number of committee members who support moving forward]

COMMITTEE JURISDICTION:
• [Why this committee has authority over this issue]
• [Reference to relevant laws under committee purview]
• [Current regulations that create urgency]

PROPOSED WITNESS LIST:
• [Government official who can speak to implementation]
• [Community representatives from affected areas]
• [State-level officials with practical experience]
• [Experts who can provide analysis]

HEARING SCHEDULE:
• [Week 1: Type of hearing and focus]
• [Week 2: Different perspective/technical focus]
• [Week 3: Committee action timeline]

REQUEST: [Specific action with realistic timeline]`,
        templateLink: "https://www.congress.gov/about/how-congress-is-organized/house-committees",
        successCriteria: "Shows you have support and are ready for committee action",
        difficulty: "moderate",
      },
      "House Majority Leader": {
        name: "House Majority Leader",
        role: "Final Decision Maker",
        task: "Final Persuasion Letter",
        icon: Crown,
        color: "text-[#db9b6c]",
        description:
          "The most powerful person who decides what bills get voted on in the House. They know that 9.2 million lead pipes are a national emergency, but there's limited time and many bills competing for attention.",
        assignment:
          "Write a formal letter to the House Majority Leader asking for time to vote on the WATER Act. Your letter should show: 1) Complete coalition support, 2) Committee is ready, 3) How many votes you have, 4) How it can pass the Senate too. This is your final chance to get the bill passed - make a strong case for why this bill deserves voting time.",
        keyPoints: [
          "Show committee approved it and both parties support it",
          "List all the advocacy groups and stakeholders who back it",
          "Give realistic numbers on how many votes you have",
          "Explain how it can also pass in the Senate",
        ],
        exampleOpening:
          "Dear Majority Leader [Name], I respectfully request your consideration to schedule floor time for the WATER Act. After extensive coalition building, we have assembled the necessary support for passage...",
        sampleTemplate: `The Honorable [Name]
Majority Leader
United States House of Representatives

Dear Majority Leader [Name],

[Opening: State your request and summarize why you're ready]

COMMITTEE STATUS:
• [Committee name and vote margin showing bipartisan support]
• [Status of amendments and readiness for floor]
• [Procedural status - no obstacles remaining]

VOTE COUNT ANALYSIS:
• [Confirmed YES votes: specific numbers from both parties = total]
• [Probable YES: additional members who might support]
• [Safety margin above the 218 threshold needed]

COALITION SUPPORT:
• [Number of organizations endorsing across different sectors]
• [Local officials requesting action]
• [Industry associations supporting investment]
• [Business community citing benefits]

SENATE PROSPECTS:
• [Senate sponsor committed to companion bill]
• [Republican Senators expressing openness]
• [Path to 60-vote threshold through existing coalitions]

TIMING REQUEST:
• [Floor consideration timeframe to maintain momentum]
• [Coordination with relevant deadlines]
• [Senate action timeline considerations]

[Closing: Emphasize crisis scope and job creation. Confirm readiness.]

Respectfully submitted,
[Your name]
Legislative Assistant`,
        templateLink: "https://www.congress.gov/about/leadership",
        successCriteria: "Complete proof you're ready for a vote and can win",
        difficulty: "very_hard",
      },
    }

    return stakeholderData[stakeholderName] || {}
  }

  // Analysis Logic (keeping the same logic but updating colors)
  const analyzeWritingResponse = (stakeholderName: string, writingResponse: string, attemptNumber: number) => {
    const stakeholderData = getStakeholderData(stakeholderName)
    const difficulty = stakeholderData.difficulty
    const responseLower = writingResponse.toLowerCase()
    const wordCount = writingResponse.split(" ").length

    if (stakeholderName === "Chief of Staff") {
      const requiredConcepts = ["bipartisan", "support", "strategy", "priority", "political", "agenda", "constituent"]
      const conceptCount = requiredConcepts.filter((concept) => responseLower.includes(concept)).length

      const success = conceptCount >= 2 && wordCount >= 10

      if (success) {
        return {
          success: true,
          feedback:
            "Excellent! Your memo demonstrates strategic thinking and shows you understand how this bill fits into the broader political landscape. The Chief of Staff is convinced!",
        }
      } else {
        return {
          success: false,
          feedback:
            "Your memo needs more strategic focus. Chiefs of Staff want to see how this bill fits with other priorities and has support from both parties. Try emphasizing the political benefits and building coalitions.",
        }
      }
    }

    if (stakeholderName === "Clean Water Advocacy Group Representative") {
      const requiredConcepts = ["community", "justice", "tribal", "environmental", "vulnerable", "lead", "water"]
      const conceptCount = requiredConcepts.filter((concept) => responseLower.includes(concept)).length

      const success = conceptCount >= 2 && wordCount >= 10

      if (success) {
        return {
          success: true,
          feedback:
            "Great work! Your call summary shows strong commitment to environmental justice and vulnerable communities. The advocacy representative is on board!",
        }
      } else {
        return {
          success: false,
          feedback:
            "Your summary needs more focus on environmental justice. Advocacy groups care most about protecting vulnerable communities. Try emphasizing how the bill helps tribal and low-income communities specifically.",
        }
      }
    }

    if (stakeholderName === "Opposition Cosponsor") {
      const requiredConcepts = ["fiscal", "responsible", "state", "partnership", "federal", "funding", "conservative"]
      const conceptCount = requiredConcepts.filter((concept) => responseLower.includes(concept)).length

      const hasGreeting = ["dear", "hello", "congressmember", "representative"].some((word) =>
        responseLower.includes(word),
      )
      const hasRequest = ["request", "ask", "support", "cosponsor", "bill", "water"].some((word) =>
        responseLower.includes(word),
      )
      const isProperEmail = hasGreeting && hasRequest && wordCount >= 10

      if (attemptNumber === 1) {
        if (!isProperEmail) {
          return {
            success: false,
            feedback: `**Please revise your email:**
Your message appears incomplete or too brief. Opposition members expect professional, detailed correspondence. Please write a proper email that:
• **Includes a greeting** (Dear Congressmember...)
• **Makes a clear request** (asking for cosponsorship) 
• **Provides some reasoning** (why they should support the bill)
• **Is substantial enough** (at least a paragraph)

Try again with a complete email before I provide detailed feedback.`,
          }
        } else {
          return {
            success: false,
            feedback: `**The Opposition Cosponsor responded to your email:**

"Thank you for reaching out about the WATER Act. I appreciate your outreach, but I need to see more concrete details about fiscal responsibility before I can consider cosponsoring. Here are my specific concerns:

• **Cost Control**: How will we prevent the cost overruns that plague federal infrastructure projects?
• **State Sovereignty**: What safeguards ensure states maintain control over their water systems?  
• **Federal Dependency**: How does this bill avoid creating permanent federal dependency?

I'm particularly interested in hearing about the Clean Water State Revolving Fund model and how state matching fund requirements would work. Can you send me a follow-up email that addresses these three concerns with concrete policy details? I need to understand the federalism principles and how states keep control.

If you can address these points, I'll give this bill serious consideration."

**Your task:** Write a NEW email responding to the Opposition Cosponsor's specific concerns above.`,
          }
        }
      } else if (attemptNumber === 2) {
        if (!isProperEmail) {
          return {
            success: false,
            feedback:
              "**No response received.**\n\nYour email was still incomplete or unprofessional. Opposition members won't engage with correspondence that doesn't meet basic standards. This Opposition members won't engage with correspondence that doesn't meet basic standards. This stakeholder attempt has failed.",
          }
        } else {
          const hasSpecificPolicy = ["state revolving fund", "matching funds", "state control", "federalism"].some(
            (phrase) => responseLower.includes(phrase),
          )
          const success = conceptCount >= 1 && wordCount >= 8 && hasSpecificPolicy

          if (success) {
            return {
              success: true,
              feedback: `**The Opposition Cosponsor replied to your follow-up email:**

"Thank you for addressing my concerns! Your detailed explanation of the state partnership model and fiscal safeguards convinces me this is responsible policy that respects federalism principles. I'll be happy to cosponsor the WATER Act."

**Result: ✅ Opposition Cosponsor Support Secured!**`,
            }
          } else {
            return {
              success: false,
              feedback: `**The Opposition Cosponsor responded:**

"I still need more specifics about state control and fiscal responsibility. Please reference the Clean Water State Revolving Fund model and explain the state matching fund requirements. Your email needs to address the three concerns I mentioned earlier."

**Your task:** Revise your email to include the specific policy details requested.`,
            }
          }
        }
      }
    }

    if (stakeholderName === "House Committee Chair") {
      const requiredPoints = ["leadership", "support", "hearing", "ready", "witnesses", "schedule"]
      const conceptCount = requiredPoints.filter((concept) => responseLower.includes(concept)).length

      const success = conceptCount >= 2 && wordCount >= 10

      if (success) {
        return {
          success: true,
          feedback:
            "Perfect! Your talking points demonstrate readiness and leadership support. The Committee Chair will schedule hearings!",
        }
      } else {
        const missingElements = []
        if (!responseLower.includes("leadership") && !responseLower.includes("leader")) {
          missingElements.push("confirmation from House leadership")
        }
        if (!responseLower.includes("hearing")) {
          missingElements.push("specific hearing schedule proposal")
        }
        if (!responseLower.includes("witness")) {
          missingElements.push("witness list for hearings")
        }
        if (!responseLower.includes("ready") && !responseLower.includes("prepared")) {
          missingElements.push("evidence you're prepared for committee action")
        }

        return {
          success: false,
          feedback: `Your pitch is missing key elements I need to move forward: ${missingElements.join(", ")}. Committee Chairs need complete information before scheduling hearings. Please include these specific details.`,
        }
      }
    }

    if (stakeholderName === "House Majority Leader") {
      const requiredEvidence = ["votes", "coalition", "senate", "committee", "passage", "support"]
      const conceptCount = requiredEvidence.filter((concept) => responseLower.includes(concept)).length

      const hasNumbers = ["218", "225", "230", "vote count", "confirmed votes"].some((num) =>
        responseLower.includes(num),
      )
      const hasSenateplan = ["senate strategy", "60 votes", "senator", "bipartisan"].some((phrase) =>
        responseLower.includes(phrase),
      )
      const hasCoalition = ["organizations", "mayors", "groups", "coalition"].some((phrase) =>
        responseLower.includes(phrase),
      )

      if (attemptNumber === 1) {
        const success = conceptCount >= 2 && hasNumbers && hasSenateplan && hasCoalition && wordCount >= 15
        if (success) {
          return {
            success: true,
            feedback:
              "Outstanding! Your letter proves you have the votes and a clear path to passage. The Majority Leader will schedule floor time!",
          }
        } else {
          return {
            success: false,
            feedback:
              "Your request lacks the detailed evidence I need to allocate precious floor time. I need specific vote counts, confirmed Senate strategy, and comprehensive coalition support. Floor time is limited - prove you can win.",
          }
        }
      } else if (attemptNumber === 2) {
        const success = conceptCount >= 3 && (hasNumbers || hasSenateplan) && wordCount >= 40
        if (success) {
          return {
            success: true,
            feedback:
              "Better! Your revised letter shows more concrete evidence. The Majority Leader will consider scheduling floor time.",
          }
        } else {
          return {
            success: false,
            feedback:
              "Getting closer, but I still need either specific vote counts OR a clear Senate passage strategy. Which swing votes have you secured? What's your path to 60 Senate votes?",
          }
        }
      } else if (attemptNumber === 3) {
        const success = conceptCount >= 3 && wordCount >= 40
        if (success) {
          return {
            success: true,
            feedback:
              "Your persistence and improved case convince me. The Majority Leader will schedule floor time for the WATER Act.",
          }
        } else {
          return {
            success: false,
            feedback:
              "This is your final opportunity. I need concrete evidence of vote counts, coalition support, AND Senate viability. Show me the numbers.",
          }
        }
      } else {
        const success = conceptCount >= 2 && wordCount >= 30
        if (success) {
          return {
            success: true,
            feedback: "Your final letter makes the case adequately. The Majority Leader will schedule floor time.",
          }
        } else {
          return {
            success: false,
            feedback:
              "I cannot justify floor time without stronger evidence of passage. The WATER Act will not be scheduled at this time.",
          }
        }
      }
    }

    return {
      success: false,
      feedback: "Unknown stakeholder.",
    }
  }

  const handleSubmitWriting = () => {
    if (!currentResponse.trim()) {
      return
    }

    const stakeholderName = STAKEHOLDERS[currentStakeholder]
    const currentAttempt = gameState.attempts[stakeholderName] + 1

    // Store the response
    const newGameState = {
      ...gameState,
      writingResponses: {
        ...gameState.writingResponses,
        [stakeholderName]: currentResponse,
      },
      attempts: {
        ...gameState.attempts,
        [stakeholderName]: currentAttempt,
      },
    }

    // Analyze the response
    const analysis = analyzeWritingResponse(stakeholderName, currentResponse, currentAttempt)

    // Update feedback
    newGameState.stakeholderFeedback[stakeholderName] = [
      ...gameState.stakeholderFeedback[stakeholderName],
      analysis.feedback,
    ]

    if (analysis.success) {
      // Success - mark as convinced
      newGameState.stakeholderResults[stakeholderName] = true
      setGameState(newGameState)

      // Show success message immediately
      toast({
        title: "🎉 Stakeholder Convinced!",
        description: `${stakeholderName} supports the WATER Act!`,
        duration: 3000,
      })

      // Wait a moment to show the success, then move to next stakeholder or results
      setTimeout(() => {
        if (currentStakeholder < STAKEHOLDERS.length - 1) {
          setCurrentStakeholder(currentStakeholder + 1)
          setCurrentResponse("")
        } else {
          setGamePhase("results")
        }
      }, 2000)
    } else {
      // Failed attempt
      newGameState.stakeholderResults[stakeholderName] = false

      // Check if can retry
      const canRetry = currentAttempt < gameState.maxAttempts[stakeholderName]

      if (canRetry) {
        // Show retry message
        toast({
          title: "❌ Not Convinced Yet",
          description: `${stakeholderName} needs more convincing. Try again!`,
          variant: "destructive",
          duration: 3000,
        })
        // Stay on same stakeholder for retry
        setGameState(newGameState)
        setCurrentResponse("")
      } else {
        // No more attempts, show final failure message
        toast({
          title: "❌ Stakeholder Not Convinced",
          description: `${stakeholderName} will not support the WATER Act.`,
          variant: "destructive",
          duration: 3000,
        })

        setGameState(newGameState)

        // Wait a moment then move to next stakeholder or results
        setTimeout(() => {
          if (currentStakeholder < STAKEHOLDERS.length - 1) {
            setCurrentStakeholder(currentStakeholder + 1)
            setCurrentResponse("")
          } else {
            setGamePhase("results")
          }
        }, 2000)
      }
    }
  }

  const resetGame = () => {
    setGamePhase("welcome")
    setCurrentStakeholder(0)
    setCurrentResponse("")
    setGameState({
      attempts: {
        "Chief of Staff": 0,
        "Clean Water Advocacy Group Representative": 0,
        "Opposition Cosponsor": 0,
        "House Committee Chair": 0,
        "House Majority Leader": 0,
      },
      stakeholderResults: {
        "Chief of Staff": null,
        "Clean Water Advocacy Group Representative": null,
        "Opposition Cosponsor": null,
        "House Committee Chair": null,
        "House Majority Leader": null,
      },
      writingResponses: {
        "Chief of Staff": "",
        "Clean Water Advocacy Group Representative": "",
        "Opposition Cosponsor": "",
        "House Committee Chair": "",
        "House Majority Leader": "",
      },
      maxAttempts: {
        "Chief of Staff": 2,
        "Clean Water Advocacy Group Representative": 2,
        "Opposition Cosponsor": 2,
        "House Committee Chair": 2,
        "House Majority Leader": 4,
      },
      stakeholderFeedback: {
        "Chief of Staff": [],
        "Clean Water Advocacy Group Representative": [],
        "Opposition Cosponsor": [],
        "House Committee Chair": [],
        "House Majority Leader": [],
      },
    })
  }

  // Welcome Phase
  if (gamePhase === "welcome") {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-12 w-12 text-[#2d407e]" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Inside the Hill</h1>
              <p className="text-xl text-gray-600">A Congressional Simulation Game</p>
            </div>
          </div>
        </div>

        {/* Mission Brief */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Your Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-lg mb-4">
              You are a <strong>Legislative Assistant</strong> in a U.S. congressional office. Your goal is to build
              support and successfully move a clean water bill through Congress.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#2d407e] mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  The Challenge
                </h4>
                <p>
                  Convince <strong>3 out of 5</strong> key stakeholders to support the WATER Act
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Learn About
                </h4>
                <ul className="space-y-1">
                  <li>• Policy writing</li>
                  <li>• Stakeholder management</li>
                  <li>• Political strategy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Crisis Stats */}
        <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              The Clean Water Crisis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-red-600">9.2M</div>
                <p className="text-sm text-gray-600">Lead service lines still in use nationwide</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">$625B</div>
                <p className="text-sm text-gray-600">Needed for drinking water infrastructure over 20 years</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2d407e]">49%</div>
                <p className="text-sm text-gray-600">Of tribal homes lack reliable water access</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#765889]">70%</div>
                <p className="text-sm text-gray-600">Of Chicago children under 6 exposed to lead in tap water</p>
              </div>
            </div>
            <p className="text-center mt-4 font-medium text-red-900">
              The WATER Act would modernize the Clean Water Act with $15 billion in federal funding for lead pipe
              replacement and expanded protections for vulnerable communities.
            </p>
          </CardContent>
        </Card>

        {/* Stakeholders Preview */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Key Stakeholders You'll Meet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {STAKEHOLDERS.map((stakeholder, index) => {
                const data = getStakeholderData(stakeholder)
                const Icon = data.icon
                return (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${data.color}`} />
                    <h4 className="font-medium text-sm mb-1">{data.name}</h4>
                    <p className="text-xs text-gray-600">{data.role}</p>
                  </div>
                )
              })}
            </div>
            <p className="text-center mt-4 text-gray-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Each stakeholder has unique concerns and retry opportunities
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => setGamePhase("stakeholder")}
            size="lg"
            className="px-8 bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
          >
            <Send className="mr-2 h-5 w-5" />
            Start Your Mission
          </Button>
          <p className="text-gray-600 mt-3">Ready to navigate the halls of Congress?</p>
        </div>
      </div>
    )
  }

  // Results Phase
  if (gamePhase === "results") {
    const yesVotes = Object.values(gameState.stakeholderResults).filter((result) => result === true).length
    const totalStakeholders = STAKEHOLDERS.length
    const success = yesVotes >= 3

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="text-center mb-8">
          {success ? (
            <div>
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-green-600 mb-3">Mission Accomplished!</h1>
              <p className="text-xl text-gray-600">The WATER Act is moving to the House floor for a vote.</p>
            </div>
          ) : (
            <div>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-red-600 mb-3">Mission Incomplete</h1>
              <p className="text-xl text-gray-600">The bill didn't gain enough support to move forward.</p>
            </div>
          )}
        </div>

        {/* Score Card */}
        <Card className={`border-2 shadow-lg ${success ? "border-green-500" : "border-red-500"}`}>
          <CardHeader className={`${success ? "bg-green-500" : "bg-red-500"} text-white text-center`}>
            <CardTitle>Final Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className={`text-6xl font-bold mb-4 ${success ? "text-green-600" : "text-red-600"}`}>
              {yesVotes} / {totalStakeholders}
            </div>
            <p className="text-xl mb-4">Stakeholders Convinced</p>
            <hr className="my-4" />
            <p className="text-gray-600">
              {success ? (
                <>
                  <CheckCircle className="inline h-5 w-5 text-green-600 mr-2" />
                  You needed 3 supporters - Mission Successful!
                </>
              ) : (
                <>
                  <AlertTriangle className="inline h-5 w-5 text-yellow-600 mr-2" />
                  You needed 3 supporters to pass the bill
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Stakeholder Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAKEHOLDERS.map((stakeholder, index) => {
                const data = getStakeholderData(stakeholder)
                const Icon = data.icon
                const result = gameState.stakeholderResults[stakeholder]
                const attempts = gameState.attempts[stakeholder]

                return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      result === true
                        ? "border-green-500 bg-green-50"
                        : result === false
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <Icon
                        className={`h-8 w-8 mx-auto mb-2 ${
                          result === true ? "text-green-600" : result === false ? "text-red-600" : "text-gray-400"
                        }`}
                      />
                      <h4 className="font-medium mb-2">{data.name}</h4>

                      {result === true && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Convinced
                        </Badge>
                      )}
                      {result === false && (
                        <Badge variant="destructive">
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Convinced
                        </Badge>
                      )}
                      {result === null && (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Not Approached
                        </Badge>
                      )}

                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Attempts: {attempts}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={resetGame} size="lg" variant="outline">
            <RotateCcw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
          <Button
            onClick={() => onComplete({ success, yesVotes, totalStakeholders, gameState })}
            size="lg"
            className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Continue to Next Phase
          </Button>
        </div>
      </div>
    )
  }

  // Stakeholder Interaction Phase
  const stakeholderName = STAKEHOLDERS[currentStakeholder]
  const stakeholderData = getStakeholderData(stakeholderName)
  const Icon = stakeholderData.icon
  const currentAttempts = gameState.attempts[stakeholderName]
  const maxAttempts = gameState.maxAttempts[stakeholderName]
  const latestFeedback =
    gameState.stakeholderFeedback[stakeholderName][gameState.stakeholderFeedback[stakeholderName].length - 1]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Progress: Stakeholder {currentStakeholder + 1} of 5</h3>
            <Badge variant="outline">
              {Object.values(gameState.stakeholderResults).filter((result) => result === true).length} / 3 supporters
              needed
            </Badge>
          </div>
          <Progress value={((currentStakeholder + 1) / STAKEHOLDERS.length) * 100} />
        </CardContent>
      </Card>

      {/* Stakeholder Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Icon className="h-6 w-6" />
                {stakeholderData.name}
              </CardTitle>
              <p className="text-[#f0ad70] mb-1">{stakeholderData.role}</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <FileText className="h-4 w-4 mr-1" />
                Task: {stakeholderData.task}
              </Badge>
            </div>
            <div className="text-right">
              {maxAttempts > 1 ? (
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  Attempt {currentAttempts + 1} / {maxAttempts}
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-500/80 text-white border-white/30">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  One Chance Only
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Description */}
          <Alert>
            <AlertDescription>{stakeholderData.description}</AlertDescription>
          </Alert>

          {/* Previous Feedback */}
          {latestFeedback && (
            <Alert
              className={
                gameState.stakeholderResults[stakeholderName] === true
                  ? "border-green-500 bg-green-50"
                  : "border-yellow-500 bg-yellow-50"
              }
            >
              <AlertDescription>
                <div className="whitespace-pre-line">{latestFeedback}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status Indicator */}
          {gameState.stakeholderResults[stakeholderName] !== null && (
            <Alert
              className={
                gameState.stakeholderResults[stakeholderName] === true
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }
            >
              <AlertDescription>
                <div className="flex items-center gap-2">
                  {gameState.stakeholderResults[stakeholderName] === true ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">✅ {stakeholderName} supports the WATER Act!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">❌ {stakeholderName} is not convinced yet.</span>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Assignment */}
          <Card className="border-[#f0ad70]/30 bg-gradient-to-r from-[#f0ad70]/10 to-[#db9b6c]/10">
            <CardHeader>
              <CardTitle className="text-[#2d407e] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{stakeholderData.assignment}</p>

              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Key Points to Address:
                </h4>
                <ul className="space-y-1">
                  {stakeholderData.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Alert className="border-[#2d407e]/30 bg-[#2d407e]/10">
                <AlertDescription>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Example Opening:
                  </h4>
                  <em className="text-[#2d407e]">{stakeholderData.exampleOpening}</em>
                </AlertDescription>
              </Alert>

              {/* Sample Template */}
              <div>
                <div className="flex gap-2 mb-3">
                  <Button variant="outline" size="sm" onClick={() => setShowTemplate(!showTemplate)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {showTemplate ? "Hide" : "View"} Sample Template
                  </Button>
                  {stakeholderData.templateLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={stakeholderData.templateLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Resource Link
                      </a>
                    </Button>
                  )}
                </div>

                {showTemplate && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-sm">Sample {stakeholderData.task} Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm whitespace-pre-wrap font-mono">{stakeholderData.sampleTemplate}</pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Writing Area */}
              <div>
                <label className="block font-medium mb-2">Write your {stakeholderData.task}:</label>
                <Textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder={`Begin writing your ${stakeholderData.task.toLowerCase()} here...`}
                  rows={12}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">Focus on: {stakeholderData.successCriteria}</p>
              </div>

              {/* Retry Warning */}
              {currentAttempts > 0 && maxAttempts > 1 && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Retry Attempt:</strong> You have {maxAttempts - currentAttempts} more chance(s) with this
                    stakeholder. Based on the feedback above, try adjusting your approach!
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <Button
                  onClick={handleSubmitWriting}
                  disabled={!currentResponse.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Submit {stakeholderData.task}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
