"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Target, GraduationCap, Calendar, Users2, Lightbulb } from "lucide-react"

interface EnvisionData {
  careerInterest: string
  educationPlan: string
  skillDevelopment: string
  networkingPlan: string
  actionPlan: string
}

interface EnvisionPhaseProps {
  onComplete: (data: EnvisionData) => void
  initialData?: EnvisionData
  simulationType?: string
}

export function EnvisionPhase({ onComplete, initialData, simulationType = "general" }: EnvisionPhaseProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<EnvisionData>(
    initialData || {
      careerInterest: "",
      educationPlan: "",
      skillDevelopment: "",
      networkingPlan: "",
      actionPlan: "",
    },
  )

  const getSimulationContent = () => {
    switch (simulationType) {
      case "finance":
        return {
          field: "finance",
          fieldCapitalized: "Finance",
          icon: "💰",
        }
      case "brand-marketing":
        return {
          field: "branding and marketing",
          fieldCapitalized: "Branding and Marketing",
          icon: "🎯",
        }
      case "material-science":
        return {
          field: "material science",
          fieldCapitalized: "Material Science",
          icon: "🔬",
        }
      case "government":
        return {
          field: "government and politics",
          fieldCapitalized: "Government and Politics",
          icon: "🏛️",
        }
      default:
        return {
          field: "this field",
          fieldCapitalized: "This Field",
          icon: "🎓",
        }
    }
  }

  const content = getSimulationContent()

  const questions = [
    {
      id: "careerInterest",
      title: "Career Vision",
      question: "Could I see myself in one of these roles? If so, what do I need to do to get there?",
      placeholder: "Reflect on which roles resonated with you most and what steps you'd need to take to pursue them...",
      icon: Target,
      color: "from-[#2d407e] to-[#765889]",
    },
    {
      id: "educationPlan",
      title: "Education Requirements",
      question:
        "What type of education is required? 2-year or 4-year college, or a certificate program? If there's a particular program, what classes should I be taking now to make me a strong candidate for admission?",
      placeholder: "Research the educational requirements for your target roles and plan your academic path...",
      icon: GraduationCap,
      color: "from-[#765889] to-[#db9b6c]",
    },
    {
      id: "skillDevelopment",
      title: "Skill Building",
      question:
        "Are there extracurriculars or supplemental activities I can engage in now to better prepare me to succeed in this career?",
      placeholder:
        "Consider clubs, volunteer work, side projects, or other activities that would build relevant skills...",
      icon: Lightbulb,
      color: "from-[#db9b6c] to-[#f0ad70]",
    },
    {
      id: "networkingPlan",
      title: "Experience & Networking",
      question:
        "What internships are available so I can get more experience? Who else should I talk to in order to learn more about this career?",
      placeholder: "Research internship opportunities and identify additional professionals to connect with...",
      icon: Users2,
      color: "from-[#f0ad70] to-[#713c09]",
    },
    {
      id: "actionPlan",
      title: "Action Timeline",
      question: "Create short and long-term goals with a timeline and milestones to keep you on your path.",
      placeholder:
        "Example:\nShort-term (6 months): Join marketing club, take business electives\nMedium-term (1-2 years): Apply for marketing internships, build portfolio\nLong-term (3-5 years): Complete degree, secure entry-level marketing role...",
      icon: Calendar,
      color: "from-[#713c09] to-[#4e3113]",
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }))
  }

  const canProceed = () => {
    const currentValue = formData[currentQ.id as keyof EnvisionData]
    return currentValue && currentValue.trim() !== ""
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const IconComponent = currentQ.icon

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl flex items-center">
              <Target className="mr-3 h-6 w-6 text-[#2d407e]" />
              Envision
            </CardTitle>
            <span className="text-sm text-gray-500">
              Step {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 p-6 rounded-lg mb-6 border border-[#db9b6c]/30">
              <h3 className="text-lg font-semibold mb-2 text-[#2d407e]">🚀 Envision Your Future</h3>
              <p className="text-[#4e3113]">
                The last step in the 5 E's of Career Exploration is to Envision your path forward. Envisioning includes
                imagining where you may like to be, and creating a plan moving backwards from there.
              </p>
            </div>

            <div className="flex items-start mb-6">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentQ.color} flex items-center justify-center mr-4 flex-shrink-0`}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2d407e] mb-2">{currentQ.title}</h3>
                <p className="text-xl text-gray-800 leading-relaxed mb-4">{currentQ.question}</p>
              </div>
            </div>

            <div className="mt-6">
              <Textarea
                value={formData[currentQ.id as keyof EnvisionData]}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-[180px] text-base"
                rows={7}
              />
            </div>

            {/* Helpful tips for each question */}
            {currentQuestion === 0 && (
              <div className="mt-4 p-4 bg-[#f0ad70]/20 border border-[#db9b6c]/30 rounded-lg">
                <h4 className="font-semibold text-[#2d407e] mb-2">💡 Reflection Tips:</h4>
                <ul className="text-[#4e3113] text-sm space-y-1">
                  <li>• Think about which tasks energized you most during the simulation</li>
                  <li>• Consider which work environments felt most comfortable</li>
                  <li>• Reflect on your natural strengths and interests</li>
                </ul>
              </div>
            )}

            {currentQuestion === 1 && (
              <div className="mt-4 p-4 bg-[#f0ad70]/20 border border-[#db9b6c]/30 rounded-lg">
                <h4 className="font-semibold text-[#2d407e] mb-2">📚 Education Planning:</h4>
                <ul className="text-[#4e3113] text-sm space-y-1">
                  <li>• Research specific degree programs at colleges you're interested in</li>
                  <li>• Look at course catalogs to see what classes are required</li>
                  <li>• Consider prerequisites you might need to take in high school</li>
                </ul>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="mt-4 p-4 bg-[#f0ad70]/20 border border-[#db9b6c]/30 rounded-lg">
                <h4 className="font-semibold text-[#2d407e] mb-2">🎯 Skill Building Ideas:</h4>
                <ul className="text-[#4e3113] text-sm space-y-1">
                  <li>• Join DECA, FBLA, or marketing clubs</li>
                  <li>• Start a social media account for a cause you care about</li>
                  <li>• Volunteer to help local businesses with their marketing</li>
                  <li>• Take online courses in design, analytics, or digital marketing</li>
                </ul>
              </div>
            )}

            {currentQuestion === 3 && (
              <div className="mt-4 p-4 bg-[#f0ad70]/20 border border-[#db9b6c]/30 rounded-lg">
                <h4 className="font-semibold text-[#2d407e] mb-2">🤝 Experience & Networking:</h4>
                <ul className="text-[#4e3113] text-sm space-y-1">
                  <li>• Search for summer internships at marketing agencies or companies</li>
                  <li>• Attend industry events or webinars</li>
                  <li>• Connect with professionals on LinkedIn</li>
                  <li>• Ask for informational interviews</li>
                </ul>
              </div>
            )}

            {currentQuestion === 4 && (
              <div className="mt-4 p-4 bg-[#f0ad70]/20 border border-[#db9b6c]/30 rounded-lg">
                <h4 className="font-semibold text-[#2d407e] mb-2">📅 Planning Tips:</h4>
                <ul className="text-[#4e3113] text-sm space-y-1">
                  <li>• Set specific, measurable goals with deadlines</li>
                  <li>• Break large goals into smaller, actionable steps</li>
                  <li>• Review and adjust your plan regularly</li>
                  <li>• Remember: plans can change as you learn and grow!</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center bg-transparent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
            >
              {currentQuestion === questions.length - 1 ? "Complete Simulation" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
