"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  Users,
  FileText,
  Scale,
  Building2,
  ArrowRight,
  Star,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react"

interface GovernmentPostReflectionFormProps {
  simulationResults: any
  onComplete: (responses: any) => void
}

export default function GovernmentPostReflectionForm({
  simulationResults,
  onComplete,
}: GovernmentPostReflectionFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    overallExperience: [7],
    mostDifficult: "",
    skillDevelopment: {
      politicalWriting: [5],
      stakeholderManagement: [5],
      strategicThinking: [5],
      persuasiveArguments: [5],
      processUnderstanding: [5],
    },
    surprisingLearning: "",
    realWorldRelevance: "",
    improvementSuggestions: "",
    confidenceChange: "",
    futureInterest: "",
    keyInsights: "",
    recommendToOthers: "",
  })

  const questions = [
    {
      id: "overallExperience",
      title: "Overall Experience Rating",
      question: "How would you rate your overall experience with this congressional simulation?",
      type: "slider",
      min: 1,
      max: 10,
      labels: ["Poor", "Excellent"],
    },
    {
      id: "mostDifficult",
      title: "Greatest Challenge",
      question: "Which stakeholder or aspect of the simulation was most challenging for you?",
      type: "radio",
      options: [
        { value: "chief-of-staff", label: "Chief of Staff - Strategic memo writing" },
        { value: "advocacy-rep", label: "Advocacy Group Rep - Environmental justice focus" },
        { value: "opposition-cosponsor", label: "Opposition Cosponsor - Bipartisan persuasion" },
        { value: "committee-chair", label: "Committee Chair - Process and readiness" },
        { value: "majority-leader", label: "Majority Leader - Comprehensive case building" },
        { value: "writing-quality", label: "Professional writing quality" },
        { value: "understanding-process", label: "Understanding the legislative process" },
      ],
    },
    {
      id: "skillDevelopment",
      title: "Skill Development Assessment",
      question: "Rate your improvement in these key areas (1 = No improvement, 10 = Significant improvement):",
      type: "multi-slider",
    },
    {
      id: "surprisingLearning",
      title: "Unexpected Insights",
      question: "What surprised you most about the congressional process or stakeholder management?",
      type: "textarea",
      placeholder: "Describe something that was different from what you expected...",
    },
    {
      id: "realWorldRelevance",
      title: "Real-World Connection",
      question: "How relevant do you think these skills are to careers outside of government?",
      type: "radio",
      options: [
        { value: "highly-relevant", label: "Highly Relevant - These skills apply to many careers" },
        { value: "somewhat-relevant", label: "Somewhat Relevant - Useful in some situations" },
        { value: "government-specific", label: "Government Specific - Mainly useful for political work" },
        { value: "not-sure", label: "Not Sure - Need to think about it more" },
      ],
    },
    {
      id: "improvementSuggestions",
      title: "Simulation Improvements",
      question: "What would you change or add to make this simulation more effective?",
      type: "textarea",
      placeholder: "Suggest improvements to content, structure, difficulty, or features...",
    },
    {
      id: "confidenceChange",
      title: "Confidence in Civic Engagement",
      question: "How has this simulation affected your confidence in engaging with government processes?",
      type: "radio",
      options: [
        { value: "much-more-confident", label: "Much More Confident - I feel prepared to engage" },
        { value: "more-confident", label: "More Confident - I have a better understanding" },
        { value: "same-confidence", label: "Same Confidence - No significant change" },
        { value: "less-confident", label: "Less Confident - It seems more complex than I thought" },
      ],
    },
    {
      id: "futureInterest",
      title: "Future Learning Interest",
      question: "What related topics would you like to explore further?",
      type: "radio",
      options: [
        { value: "policy-analysis", label: "Policy Analysis - Understanding complex issues" },
        { value: "campaign-politics", label: "Campaign Politics - Elections and voter engagement" },
        { value: "local-government", label: "Local Government - City and state politics" },
        { value: "advocacy-organizing", label: "Advocacy and Organizing - Grassroots movements" },
        { value: "international-relations", label: "International Relations - Global politics" },
        { value: "public-administration", label: "Public Administration - Government operations" },
      ],
    },
    {
      id: "keyInsights",
      title: "Key Insights",
      question: "What are the three most important things you learned from this experience?",
      type: "textarea",
      placeholder: "List and explain your top three takeaways from the simulation...",
    },
    {
      id: "recommendToOthers",
      title: "Recommendation",
      question: "Would you recommend this simulation to other students? Why or why not?",
      type: "textarea",
      placeholder: "Explain whether you would recommend this experience and why...",
    },
  ]

  const skillAreas = [
    { key: "politicalWriting", label: "Political Writing", icon: FileText },
    { key: "stakeholderManagement", label: "Stakeholder Management", icon: Users },
    { key: "strategicThinking", label: "Strategic Thinking", icon: Target },
    { key: "persuasiveArguments", label: "Persuasive Arguments", icon: Scale },
    { key: "processUnderstanding", label: "Process Understanding", icon: Building2 },
  ]

  const handleResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSkillResponse = (skillKey: string, value: number[]) => {
    setResponses((prev) => ({
      ...prev,
      skillDevelopment: {
        ...prev.skillDevelopment,
        [skillKey]: value,
      },
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(responses)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentQuestion = questions[currentStep]

  const isAnswered = () => {
    const response = responses[currentQuestion.id as keyof typeof responses]
    if (currentQuestion.type === "multi-slider") {
      return true // Always considered answered for multi-slider
    }
    if (currentQuestion.type === "slider") {
      return Array.isArray(response) && response.length > 0
    }
    return response && response !== ""
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post-Simulation Reflection</h1>
            <p className="text-gray-600">Evaluate your learning and experience</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Progress value={(currentStep / questions.length) * 100} className="flex-1" />
          <Badge variant="outline">
            {currentStep + 1} of {questions.length}
          </Badge>
        </div>
      </div>

      {/* Results Summary */}
      {currentStep === 0 && simulationResults && (
        <Card className="border-2 border-[#f0ad70]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-[#2d407e] flex items-center gap-2">
              <Star className="h-6 w-6" />
              Your Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${simulationResults.success ? "text-green-600" : "text-red-600"}`}>
                  {simulationResults.success ? "PASSED" : "INCOMPLETE"}
                </div>
                <p className="text-sm text-gray-600">Final Result</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#2d407e]">{simulationResults.yesVotes || 0} / 5</div>
                <p className="text-sm text-gray-600">Stakeholders Won</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#765889]">
                  {Object.values(simulationResults.gameState?.attempts || {}).reduce(
                    (a: number, b: number) => a + b,
                    0,
                  )}
                </div>
                <p className="text-sm text-gray-600">Total Attempts</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f0ad70]">{simulationResults.success ? "A" : "B"}</div>
                <p className="text-sm text-gray-600">Grade Estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#2d407e] to-[#765889] text-white">
          <CardTitle className="flex items-center gap-2">
            {currentStep === 0 && <Star className="h-5 w-5" />}
            {currentStep === 1 && <Target className="h-5 w-5" />}
            {currentStep === 2 && <TrendingUp className="h-5 w-5" />}
            {currentStep === 3 && <Lightbulb className="h-5 w-5" />}
            {currentStep >= 4 && <CheckCircle className="h-5 w-5" />}
            {currentQuestion.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

            {currentQuestion.type === "slider" && (
              <div className="space-y-4">
                <Slider
                  value={responses[currentQuestion.id as keyof typeof responses] as number[]}
                  onValueChange={(value) => handleResponse(currentQuestion.id, value)}
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {currentQuestion.labels?.[0]} ({currentQuestion.min})
                  </span>
                  <span className="font-medium">
                    Current:{" "}
                    {(responses[currentQuestion.id as keyof typeof responses] as number[])?.[0] || currentQuestion.min}
                  </span>
                  <span>
                    {currentQuestion.labels?.[1]} ({currentQuestion.max})
                  </span>
                </div>
              </div>
            )}

            {currentQuestion.type === "multi-slider" && (
              <div className="space-y-6">
                {skillAreas.map((skill) => {
                  const Icon = skill.icon
                  return (
                    <div key={skill.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#2d407e]" />
                        <Label className="font-medium">{skill.label}</Label>
                        <Badge variant="outline">
                          {responses.skillDevelopment[skill.key as keyof typeof responses.skillDevelopment][0]}
                        </Badge>
                      </div>
                      <Slider
                        value={responses.skillDevelopment[skill.key as keyof typeof responses.skillDevelopment]}
                        onValueChange={(value) => handleSkillResponse(skill.key, value)}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>No improvement (1)</span>
                        <span>Significant improvement (10)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={responses[currentQuestion.id as keyof typeof responses] as string}
                onValueChange={(value) => handleResponse(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="font-medium">{option.label.split(" - ")[0]}</div>
                      {option.label.includes(" - ") && (
                        <div className="text-sm text-gray-600 mt-1">{option.label.split(" - ")[1]}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                value={responses[currentQuestion.id as keyof typeof responses] as string}
                onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={6}
                className="w-full"
              />
            )}
          </div>

          {/* Contextual Tips */}
          {currentStep === 2 && (
            <Card className="border-[#f0ad70]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-[#2d407e] mb-2">Skill Development Reflection</h4>
                <p className="text-sm text-[#4e3113]">
                  Consider not just what you learned, but how much you improved from where you started. Even small
                  improvements in complex skills like stakeholder management are significant achievements.
                </p>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="border-[#f0ad70]/30 bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-[#2d407e] mb-2">Improvement Suggestions</h4>
                <p className="text-sm text-[#4e3113]">
                  Your feedback helps improve this simulation for future students. Consider aspects like: difficulty
                  level, clarity of instructions, realism, engagement, and learning effectiveness.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isAnswered()}
              className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
            >
              {currentStep === questions.length - 1 ? (
                <>
                  Complete Reflection
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
