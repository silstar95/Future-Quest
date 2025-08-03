"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  ArrowRight,
  BookOpen,
  AlertTriangle,
} from "lucide-react"

interface GovernmentExplorationPhaseProps {
  onComplete: () => void
}

export default function GovernmentExplorationPhase({ onComplete }: GovernmentExplorationPhaseProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [completedSections, setCompletedSections] = useState<number[]>([])

  const sections = [
    {
      id: "crisis",
      title: "The Water Crisis",
      icon: AlertTriangle,
      color: "text-red-600",
      content: {
        title: "Understanding the Crisis",
        description: "Learn about the scope and urgency of America's water infrastructure crisis.",
        facts: [
          "9.2 million lead service lines are still in use across the United States",
          "$625 billion is needed over 20 years for drinking water infrastructure",
          "49% of tribal homes lack access to reliable water sources",
          "70% of young children in Chicago are exposed to lead through tap water",
          "Native American households are 19x more likely to lack indoor plumbing",
        ],
        keyPoint:
          "The WATER Act would provide $15 billion in federal funding for lead pipe replacement and expanded protections for vulnerable communities.",
      },
    },
    {
      id: "legislative-process",
      title: "How Bills Become Laws",
      icon: Building2,
      color: "text-blue-600",
      content: {
        title: "The Legislative Process",
        description: "Understand the complex journey from bill introduction to becoming law.",
        steps: [
          { step: 1, title: "Bill Introduction", description: "A member of Congress introduces the bill" },
          { step: 2, title: "Committee Review", description: "Committee holds hearings and markup sessions" },
          {
            step: 3,
            title: "Floor Consideration",
            description: "Leadership schedules floor time for debate and voting",
          },
          { step: 4, title: "House Passage", description: "If passed, bill moves to the Senate" },
          { step: 5, title: "Senate Process", description: "Similar process in the Senate" },
          { step: 6, title: "Presidential Action", description: "President signs or vetoes the bill" },
        ],
        keyPoint: "Each step requires different stakeholders to support and advance the legislation.",
      },
    },
    {
      id: "stakeholders",
      title: "Key Players",
      icon: Users,
      color: "text-green-600",
      content: {
        title: "Congressional Stakeholders",
        description: "Meet the five key people you'll need to convince to support the WATER Act.",
        stakeholders: [
          {
            name: "Chief of Staff",
            icon: UserTie,
            role: "Strategic Gatekeeper",
            description: "Manages the Congressmember's priorities and schedule. Focused on political viability.",
            task: "Internal Memo",
            difficulty: "Easy",
            attempts: 2,
          },
          {
            name: "Clean Water Advocacy Group Rep",
            icon: Leaf,
            role: "Environmental Expert",
            description:
              "Represents communities affected by water contamination. Passionate about environmental justice.",
            task: "Stakeholder Call Summary",
            difficulty: "Easy",
            attempts: 2,
          },
          {
            name: "Opposition Cosponsor",
            icon: Scale,
            role: "Bipartisan Bridge",
            description: "Opposition party member who values fiscal responsibility and federalism.",
            task: "Email Pitch",
            difficulty: "Moderate",
            attempts: 2,
          },
          {
            name: "House Committee Chair",
            icon: Gavel,
            role: "Process Guardian",
            description: "Controls when bills get hearings. Needs evidence of support and readiness.",
            task: "Verbal Pitch",
            difficulty: "Moderate",
            attempts: 2,
          },
          {
            name: "House Majority Leader",
            icon: Crown,
            role: "Final Decision Maker",
            description: "Controls floor time. Needs comprehensive proof of passage potential.",
            task: "Final Persuasion Letter",
            difficulty: "Very Hard",
            attempts: 4,
          },
        ],
        keyPoint: "You need to convince 3 out of 5 stakeholders to support the bill for it to advance.",
      },
    },
    {
      id: "writing-types",
      title: "Professional Writing",
      icon: FileText,
      color: "text-purple-600",
      content: {
        title: "Types of Political Writing",
        description: "Learn about the different types of documents used in congressional offices.",
        types: [
          {
            type: "Internal Memo",
            purpose: "Brief leadership on policy priorities and political considerations",
            audience: "Internal staff and elected officials",
            tone: "Strategic and analytical",
            keyElements: ["Executive summary", "Political viability", "Constituent impact", "Recommendation"],
          },
          {
            type: "Stakeholder Call Summary",
            purpose: "Document meetings with advocacy groups and constituents",
            audience: "Internal staff and coalition partners",
            tone: "Professional and detailed",
            keyElements: ["Participants", "Key concerns", "Commitments made", "Next steps"],
          },
          {
            type: "Email Pitch",
            purpose: "Request support from other members of Congress",
            audience: "Other congressional offices",
            tone: "Respectful and persuasive",
            keyElements: ["Clear subject", "Respectful greeting", "Compelling case", "Specific request"],
          },
          {
            type: "Talking Points",
            purpose: "Prepare for verbal presentations and meetings",
            audience: "Speaker reference",
            tone: "Concise and compelling",
            keyElements: ["Key messages", "Supporting evidence", "Anticipated questions", "Call to action"],
          },
          {
            type: "Formal Letter",
            purpose: "Make official requests to leadership",
            audience: "Senior congressional leadership",
            tone: "Formal and comprehensive",
            keyElements: ["Proper format", "Complete evidence", "Clear request", "Professional closing"],
          },
        ],
        keyPoint: "Each stakeholder expects a different type of communication that matches their role and needs.",
      },
    },
  ]

  const handleSectionComplete = (sectionIndex: number) => {
    if (!completedSections.includes(sectionIndex)) {
      setCompletedSections([...completedSections, sectionIndex])
    }

    if (sectionIndex < sections.length - 1) {
      setCurrentSection(sectionIndex + 1)
    }
  }

  const currentSectionData = sections[currentSection]
  const allSectionsCompleted = completedSections.length === sections.length

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore: Congressional Dynamics</h1>
            <p className="text-gray-600">Learn about the legislative process and key stakeholders</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Progress value={(completedSections.length / sections.length) * 100} className="flex-1" />
          <Badge variant="outline">
            {completedSections.length} of {sections.length} completed
          </Badge>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isCompleted = completedSections.includes(index)
          const isCurrent = currentSection === index
          const isAccessible = index === 0 || completedSections.includes(index - 1)

          return (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all ${
                isCurrent
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : isCompleted
                    ? "bg-green-50 border-green-200"
                    : isAccessible
                      ? "hover:bg-gray-50"
                      : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => isAccessible && setCurrentSection(index)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${section.color}`} />
                <h3 className="font-medium text-sm">{section.title}</h3>
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Section Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentSectionData.icon className={`h-6 w-6 ${currentSectionData.color}`} />
            {currentSectionData.content.title}
          </CardTitle>
          <p className="text-gray-600">{currentSectionData.content.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crisis Section */}
          {currentSection === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSectionData.content.facts?.map((fact, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{fact}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="font-medium text-blue-900">{currentSectionData.content.keyPoint}</p>
              </div>
            </div>
          )}

          {/* Legislative Process Section */}
          {currentSection === 1 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {currentSectionData.content.steps?.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="font-medium text-blue-900">{currentSectionData.content.keyPoint}</p>
              </div>
            </div>
          )}

          {/* Stakeholders Section */}
          {currentSection === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {currentSectionData.content.stakeholders?.map((stakeholder, index) => {
                  const StakeholderIcon = stakeholder.icon
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <StakeholderIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{stakeholder.name}</h4>
                            <Badge variant="outline">{stakeholder.role}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{stakeholder.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              <strong>Task:</strong> {stakeholder.task}
                            </span>
                            <span>
                              <strong>Difficulty:</strong> {stakeholder.difficulty}
                            </span>
                            <span>
                              <strong>Attempts:</strong> {stakeholder.attempts}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="font-medium text-green-900">{currentSectionData.content.keyPoint}</p>
              </div>
            </div>
          )}

          {/* Writing Types Section */}
          {currentSection === 3 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {currentSectionData.content.types?.map((type, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{type.type}</h4>
                    <p className="text-sm text-gray-600 mb-3">{type.purpose}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Audience:</strong> {type.audience}
                      </div>
                      <div>
                        <strong>Tone:</strong> {type.tone}
                      </div>
                    </div>
                    <div className="mt-3">
                      <strong className="text-sm">Key Elements:</strong>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {type.keyElements.map((element, i) => (
                          <li key={i}>{element}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="font-medium text-purple-900">{currentSectionData.content.keyPoint}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous Section
            </Button>

            {!completedSections.includes(currentSection) ? (
              <Button onClick={() => handleSectionComplete(currentSection)}>
                Mark Complete
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            ) : currentSection < sections.length - 1 ? (
              <Button onClick={() => setCurrentSection(currentSection + 1)}>
                Next Section
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                Begin Simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
