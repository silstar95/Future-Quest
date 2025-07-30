"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Users, Lightbulb, BarChart, Target, ArrowRight } from "lucide-react"

interface FrameworkExplanationProps {
  onComplete: () => void
  simulationType?: string
}

export function FrameworkExplanation({ onComplete, simulationType = "general" }: FrameworkExplanationProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const getSimulationContent = () => {
    switch (simulationType) {
      case "finance":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Finance Careers",
          field: "finance",
          icon: "💰",
        }
      case "brand-marketing":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Branding & Marketing Careers",
          field: "branding and marketing",
          icon: "🎯",
        }
      case "material-science":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Material Science Careers",
          field: "material science",
          icon: "🔬",
        }
      case "government":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Government & Politics Careers",
          field: "government and politics",
          icon: "🏛️",
        }
      default:
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Career Exploration Journey",
          field: "this field",
          icon: "🎓",
        }
    }
  }

  const content = getSimulationContent()

  const steps = [
    {
      id: "explore",
      title: "Explore",
      phase: "Phase 1",
      icon: Search,
      color: "from-[#2d407e] to-[#765889]",
      description: `Discover different ${content.field} career paths and understand what each role involves.`,
      activities: ["Career role research", "Industry overview", "Skills assessment"],
    },
    {
      id: "experience",
      title: "Experience",
      phase: "Phase 2",
      icon: Users,
      color: "from-[#765889] to-[#db9b6c]",
      description: `Complete real-world tasks as a ${content.field} professional.`,
      activities: ["Hands-on projects", "Role simulations", "Skill development"],
    },
    {
      id: "engage",
      title: "Engage",
      phase: "Phase 3",
      icon: Lightbulb,
      color: "from-[#db9b6c] to-[#f0ad70]",
      description: `Connect with ${content.field} professionals and learn from their career journeys.`,
      activities: ["Professional interviews", "Industry insights", "Career advice"],
    },
    {
      id: "evaluate",
      title: "Evaluate",
      phase: "Phase 4",
      icon: BarChart,
      color: "from-[#f0ad70] to-[#713c09]",
      description: "Reflect on your experiences and assess your interest and fit.",
      activities: ["Self-reflection", "Skills evaluation", "Interest assessment"],
    },
    {
      id: "envision",
      title: "Envision",
      phase: "Phase 5",
      icon: Target,
      color: "from-[#713c09] to-[#4e3113]",
      description: "Plan your future path and create actionable next steps.",
      activities: ["Goal setting", "Action planning", "Next steps"],
    },
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl mb-2">{content.title}</CardTitle>
          <p className="text-[#f0ad70] text-xl">{content.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Introduction */}
      <Card className="bg-gradient-to-br from-[#f0ad70]/10 to-[#db9b6c]/10 border-2 border-[#db9b6c]/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{content.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-[#2d407e] mb-2">
                You're about to experience a research-based career exploration framework!
              </h3>
              <p className="text-[#4e3113] leading-relaxed">
                The 5 E's model is designed to help you systematically explore careers through hands-on experiences,
                professional connections, and thoughtful reflection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#2d407e]">Here's what you'll experience in each phase:</h2>

        {steps.map((step, index) => {
          const StepIcon = step.icon

          return (
            <Card
              key={step.id}
              className="transition-all duration-300 hover:shadow-lg border-2 border-gray-100 hover:border-[#db9b6c]/30"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <StepIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-[#2d407e]">
                        {index + 1}. {step.title}
                      </h3>
                      <Badge className="bg-gradient-to-r from-[#f0ad70] to-[#db9b6c] text-[#4e3113] font-medium">
                        {step.phase}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.activities.map((activity, actIndex) => (
                        <Badge key={actIndex} variant="outline" className="border-[#db9b6c] text-[#4e3113] hover:bg-[#f0ad70]/10">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <Card className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#db9b6c]/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-[#2d407e] mb-3">Ready to Begin Your Journey?</h3>
          <p className="text-[#4e3113] mb-6">
            You'll move through each phase systematically, building knowledge and experience as you go. Let's start with
            the first E: Explore!
          </p>
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349] px-8"
          >
            Start Exploring {content.icon}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
