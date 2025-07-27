"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, Star, TrendingUp } from "lucide-react"

interface PostReflectionFormProps {
  onComplete: (answers: any) => void
  initialData?: any
  preReflectionData?: any
  simulationType?: string
}

export function PostReflectionForm({
  onComplete,
  initialData,
  preReflectionData,
  simulationType = "general",
}: PostReflectionFormProps) {
  const [answers, setAnswers] = useState({
    enjoymentRating: initialData?.enjoymentRating || [7],
    knowledgeLevel: initialData?.knowledgeLevel || "",
    confidenceRating: initialData?.confidenceRating || [3],
    interestLevel: initialData?.interestLevel || [4],
    favoriteTask: initialData?.favoriteTask || "",
    challengingTask: initialData?.challengingTask || "",
    skillsLearned: initialData?.skillsLearned || "",
    careerInterest: initialData?.careerInterest || "",
    otherCareers: initialData?.otherCareers || "",
    feedback: initialData?.feedback || "",
  })

  // Get simulation-specific content
  const getSimulationContent = () => {
    switch (simulationType) {
      case "finance":
        return {
          field: "finance",
          fieldCapitalized: "Finance",
          icon: "💰",
          roles: ["Financial Analyst", "Investment Advisor", "Corporate Treasurer", "Risk Manager"],
          skills: "financial analysis, investment planning, budgeting, risk assessment",
        }
      case "brand-marketing":
        return {
          field: "branding and marketing",
          fieldCapitalized: "Branding and Marketing",
          icon: "🎯",
          roles: ["Brand Manager", "Marketing Strategist", "Creative Director", "Market Researcher"],
          skills: "brand strategy, market research, creative thinking, campaign development",
        }
      case "healthcare":
        return {
          field: "healthcare",
          fieldCapitalized: "Healthcare",
          icon: "🏥",
          roles: ["Healthcare Administrator", "Medical Researcher", "Public Health Specialist", "Healthcare Analyst"],
          skills: "healthcare systems, patient care, medical research, health policy",
        }
      default:
        return {
          field: "this field",
          fieldCapitalized: "This Field",
          icon: "🎓",
          roles: ["Professional Role 1", "Professional Role 2", "Professional Role 3", "Professional Role 4"],
          skills: "professional skills, critical thinking, problem-solving, communication",
        }
    }
  }

  const content = getSimulationContent()

  const knowledgeOptions = [
    `I know nothing about careers in ${content.field}.`,
    `I know what ${content.field} is but don't know much about individual roles.`,
    `I have some knowledge of ${content.field} roles but still am unsure about the details.`,
    `I have a good understanding of ${content.field} roles.`,
  ]

  const handleSubmit = () => {
    onComplete(answers)
  }

  const isComplete = () => {
    return (
      answers.knowledgeLevel !== "" &&
      answers.favoriteTask.trim().length > 0 &&
      answers.challengingTask.trim().length > 0 &&
      answers.skillsLearned.trim().length > 0 &&
      answers.careerInterest.trim().length > 0
    )
  }

  // Detect growth from pre-reflection to post-reflection
  const detectGrowth = () => {
    if (!preReflectionData) return null

    const preKnowledge = preReflectionData.knowledgeLevel || ""
    const postKnowledge = answers.knowledgeLevel

    const knowledgeGrowth = knowledgeOptions.indexOf(postKnowledge) > knowledgeOptions.indexOf(preKnowledge)

    if (knowledgeGrowth) {
      return `🎉 Amazing growth! You've expanded your knowledge about ${content.field} careers through this simulation!`
    }
    return null
  }

  const growthMessage = detectGrowth()

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-green-600 text-white">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8" />
          <div>
            <CardTitle className="text-xl">Post-Simulation Reflection</CardTitle>
            <CardDescription className="text-blue-100">
              {content.icon} Reflect on your {content.field} journey and growth
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {growthMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Growth Detected!</span>
            </div>
            <p className="text-green-700 mt-1">{growthMessage}</p>
          </div>
        )}

        {/* Enjoyment Rating */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              On a scale of 1-10, how much did you enjoy this simulation?
            </h3>
            <div className="px-4">
              <Slider
                value={answers.enjoymentRating}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, enjoymentRating: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 - Not enjoyable</span>
                <span className="font-medium text-lg text-blue-600">{answers.enjoymentRating[0]}</span>
                <span>10 - Very enjoyable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Level */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            After doing this simulation, how would you describe your knowledge about careers in {content.field}?
          </h3>
          <RadioGroup
            value={answers.knowledgeLevel}
            onValueChange={(value) => setAnswers((prev) => ({ ...prev, knowledgeLevel: value }))}
            className="space-y-3"
          >
            {knowledgeOptions.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={option} id={`knowledge-${index}`} className="mt-1" />
                <Label htmlFor={`knowledge-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Confidence Rating */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              How confident do you feel in your ability to pursue a career in {content.field} in the future?
            </h3>
            <div className="px-4">
              <Slider
                value={answers.confidenceRating}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, confidenceRating: value }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 - Not at all confident</span>
                <span className="font-medium text-lg text-blue-600">{answers.confidenceRating[0]}</span>
                <span>5 - Very confident</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Level */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Would you like to learn more about a career in {content.field}?
            </h3>
            <div className="px-4">
              <Slider
                value={answers.interestLevel}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, interestLevel: value }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 - Not at all</span>
                <span className="font-medium text-lg text-blue-600">{answers.interestLevel[0]}</span>
                <span>5 - Most definitely</span>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Task */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Which task or role did you enjoy the most? Why?</h3>
          <Textarea
            value={answers.favoriteTask}
            onChange={(e) => setAnswers((prev) => ({ ...prev, favoriteTask: e.target.value }))}
            placeholder={`Describe which ${content.field} role you found most engaging and why...`}
            className="min-h-[100px]"
          />
        </div>

        {/* Most Challenging Task */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Which task did you find most challenging? What did you learn from it?
          </h3>
          <Textarea
            value={answers.challengingTask}
            onChange={(e) => setAnswers((prev) => ({ ...prev, challengingTask: e.target.value }))}
            placeholder="Describe the most challenging aspect and what you learned..."
            className="min-h-[100px]"
          />
        </div>

        {/* Skills Learned */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            What new skills or insights did you gain from this simulation?
          </h3>
          <Textarea
            value={answers.skillsLearned}
            onChange={(e) => setAnswers((prev) => ({ ...prev, skillsLearned: e.target.value }))}
            placeholder={`Reflect on the ${content.skills} skills you developed...`}
            className="min-h-[100px]"
          />
        </div>

        {/* Career Interest */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Has this simulation influenced your interest in pursuing {content.field} as a career? How?
          </h3>
          <Textarea
            value={answers.careerInterest}
            onChange={(e) => setAnswers((prev) => ({ ...prev, careerInterest: e.target.value }))}
            placeholder={`Explain how this simulation has affected your interest in ${content.field} careers...`}
            className="min-h-[100px]"
          />
        </div>

        {/* Other Careers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            What other careers would you be interested in experiencing?
          </h3>
          <Textarea
            value={answers.otherCareers}
            onChange={(e) => setAnswers((prev) => ({ ...prev, otherCareers: e.target.value }))}
            placeholder="List other career fields you'd like to explore through simulations..."
            className="min-h-[80px]"
          />
        </div>

        {/* Additional Feedback */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Any additional feedback about this simulation experience?
          </h3>
          <Textarea
            value={answers.feedback}
            onChange={(e) => setAnswers((prev) => ({ ...prev, feedback: e.target.value }))}
            placeholder="Share any suggestions, improvements, or additional thoughts..."
            className="min-h-[80px]"
          />
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-800">Your {content.fieldCapitalized} Journey Summary</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{answers.enjoymentRating[0]}/10</div>
                <div className="text-blue-700">Enjoyment Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{answers.confidenceRating[0]}/5</div>
                <div className="text-green-700">Confidence Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{answers.interestLevel[0]}/5</div>
                <div className="text-purple-700">Future Interest</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete()}
            size="lg"
            className="px-8 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700"
          >
            Complete Reflection
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
