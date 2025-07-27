"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowRight, CheckCircle, Users, Target, Lightbulb, BarChart, Rocket } from "lucide-react"

interface FrameworkExplanationProps {
  onComplete: () => void
  simulationType: "brand-marketing" | "finance" | "material-science" | "healthcare"
}

export function FrameworkExplanation({ onComplete, simulationType }: FrameworkExplanationProps) {
  const getSimulationConfig = () => {
    switch (simulationType) {
      case "brand-marketing":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Branding & Marketing Careers",
          color: "from-blue-500 to-green-600",
          bgColor: "from-blue-50 to-green-50",
          borderColor: "border-blue-200",
          icon: Target,
          phases: [
            {
              name: "Explore",
              icon: Lightbulb,
              description:
                "Discover different branding and marketing career paths and understand what each role involves.",
              activities: ["Career role research", "Industry overview", "Skills assessment"],
            },
            {
              name: "Experience",
              icon: Users,
              description: "Complete real-world tasks as a Brand Strategist, Social Media Manager, and PR Specialist.",
              activities: ["Celebrity brand workshop", "Social media campaigns", "Crisis management"],
            },
            {
              name: "Engage",
              icon: Target,
              description: "Connect with marketing professionals and learn from their career journeys.",
              activities: ["Professional interviews", "Industry insights", "Career advice"],
            },
            {
              name: "Evaluate",
              icon: BarChart,
              description: "Reflect on your experiences and assess your interest in marketing careers.",
              activities: ["Self-reflection", "Skills evaluation", "Interest assessment"],
            },
            {
              name: "Envision",
              icon: Rocket,
              description: "Plan your future path in branding and marketing based on your discoveries.",
              activities: ["Goal setting", "Action planning", "Next steps identification"],
            },
          ],
        }
      case "finance":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Finance Careers",
          color: "from-blue-500 to-green-600",
          bgColor: "from-blue-50 to-green-50",
          borderColor: "border-blue-200",
          icon: Target,
          phases: [
            {
              name: "Explore",
              icon: Lightbulb,
              description: "Discover different finance career paths and understand what each role involves.",
              activities: ["Career role research", "Industry overview", "Skills assessment"],
            },
            {
              name: "Experience",
              icon: Users,
              description: "Complete real-world tasks as a Financial Analyst, Investment Advisor, and Risk Manager.",
              activities: ["Financial analysis", "Investment planning", "Risk assessment"],
            },
            {
              name: "Engage",
              icon: Target,
              description: "Connect with finance professionals and learn from their career journeys.",
              activities: ["Professional interviews", "Industry insights", "Career advice"],
            },
            {
              name: "Evaluate",
              icon: BarChart,
              description: "Reflect on your experiences and assess your interest in finance careers.",
              activities: ["Self-reflection", "Skills evaluation", "Interest assessment"],
            },
            {
              name: "Envision",
              icon: Rocket,
              description: "Plan your future path in finance based on your discoveries.",
              activities: ["Goal setting", "Action planning", "Next steps identification"],
            },
          ],
        }
      case "material-science":
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Journey Through Material Science Careers",
          color: "from-blue-500 to-green-600",
          bgColor: "from-blue-50 to-green-50",
          borderColor: "border-blue-200",
          icon: Target,
          phases: [
            {
              name: "Explore",
              icon: Lightbulb,
              description: "Discover different material science career paths and understand what each role involves.",
              activities: ["Career role research", "Industry overview", "Skills assessment"],
            },
            {
              name: "Experience",
              icon: Users,
              description: "Complete real-world tasks in the MagLev Makers Lab working with superconductors.",
              activities: ["YBCO synthesis", "Material testing", "Lab experiments"],
            },
            {
              name: "Engage",
              icon: Target,
              description: "Connect with material science professionals and learn from their career journeys.",
              activities: ["Professional interviews", "Industry insights", "Career advice"],
            },
            {
              name: "Evaluate",
              icon: BarChart,
              description: "Reflect on your experiences and assess your interest in material science careers.",
              activities: ["Self-reflection", "Skills evaluation", "Interest assessment"],
            },
            {
              name: "Envision",
              icon: Rocket,
              description: "Plan your future path in material science based on your discoveries.",
              activities: ["Goal setting", "Action planning", "Next steps identification"],
            },
          ],
        }
      default:
        return {
          title: "The 5 E's Framework for Career Exploration",
          subtitle: "Your Career Discovery Journey",
          color: "from-blue-500 to-green-600",
          bgColor: "from-blue-50 to-green-50",
          borderColor: "border-blue-200",
          icon: Target,
          phases: [],
        }
    }
  }

  const config = getSimulationConfig()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={`border-2 ${config.borderColor} shadow-lg`}>
        <CardHeader className={`bg-gradient-to-r ${config.color} text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{config.title}</CardTitle>
              <p className="text-white/90 mt-1">{config.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-xl border ${config.borderColor} mb-6`}>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              🎯 <strong>You're about to experience a research-based career exploration framework!</strong> <br></br>
              The 5 E's
              model is designed to help you systematically explore careers through hands-on experiences, professional
              connections, and thoughtful reflection.
            </p>

          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-6">Here's what you'll experience in each phase:</h3>

          <div className="space-y-4">
            {config.phases.map((phase, index) => {
              const IconComponent = phase.icon
              return (
                <Card key={phase.name} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-800">
                            {index + 1}. {phase.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Phase {index + 1}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{phase.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {phase.activities.map((activity, actIndex) => (
                            <Badge key={actIndex} variant="secondary" className="text-xs">
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

          <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-xl border ${config.borderColor} mt-8`}>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Why This Framework Works</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Research shows that career exploration is most effective when it combines multiple approaches:
                  learning about careers, experiencing real tasks, connecting with professionals, reflecting on
                  experiences, and planning next steps. This framework ensures you get a comprehensive view of your
                  potential career path.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={onComplete}
              size="lg"
              className={`bg-gradient-to-r ${config.color} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg`}
            >
              Ready to Begin Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
