"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, Users, FileText, Scale, Building2, ArrowRight, CheckCircle, Target, Zap, Globe } from "lucide-react"

interface GovernmentEnvisionPhaseProps {
  simulationResults: any
  onComplete: (responses: any) => void
}

export default function GovernmentEnvisionPhase({ simulationResults, onComplete }: GovernmentEnvisionPhaseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    policyPriority: "",
    stakeholderStrategy: "",
    writingImprovement: "",
    realWorldApplication: "",
    futureCareer: "",
    systemicChange: "",
    actionPlan: "",
    reflection: "",
  })

  const questions = [
    {
      id: "policyPriority",
      title: "Policy Priority Vision",
      question: "If you were a real Legislative Assistant, what policy issue would you want to work on next?",
      type: "radio",
      options: [
        { value: "healthcare", label: "Healthcare Access - Expanding coverage and reducing costs" },
        { value: "education", label: "Education Reform - Improving schools and college affordability" },
        { value: "climate", label: "Climate Action - Environmental protection and clean energy" },
        { value: "economy", label: "Economic Justice - Jobs, wages, and inequality" },
        { value: "infrastructure", label: "Infrastructure - Roads, bridges, and broadband" },
        { value: "other", label: "Other issue (specify in reflection)" },
      ],
    },
    {
      id: "stakeholderStrategy",
      title: "Stakeholder Management Strategy",
      question: "Based on your experience, what would be your approach to convincing difficult stakeholders?",
      type: "radio",
      options: [
        { value: "research-first", label: "Research First - Learn their priorities and concerns deeply" },
        { value: "coalition-building", label: "Coalition Building - Get their allies to support you" },
        { value: "compromise", label: "Strategic Compromise - Modify proposals to address concerns" },
        { value: "timing", label: "Perfect Timing - Wait for the right political moment" },
        { value: "persistence", label: "Respectful Persistence - Keep trying with improved approaches" },
      ],
    },
    {
      id: "writingImprovement",
      title: "Professional Writing Growth",
      question: "What aspect of professional political writing do you want to improve most?",
      type: "radio",
      options: [
        { value: "persuasion", label: "Persuasive Arguments - Making compelling cases" },
        { value: "audience-adaptation", label: "Audience Adaptation - Writing for different stakeholders" },
        { value: "policy-analysis", label: "Policy Analysis - Understanding complex issues" },
        { value: "conciseness", label: "Concise Communication - Getting to the point quickly" },
        { value: "evidence", label: "Evidence Integration - Using data and examples effectively" },
      ],
    },
    {
      id: "realWorldApplication",
      title: "Real-World Application",
      question: "How might you apply these skills outside of government work?",
      type: "radio",
      options: [
        { value: "advocacy", label: "Advocacy Organizations - Working for causes I care about" },
        { value: "business", label: "Business Communication - Convincing clients and colleagues" },
        { value: "community", label: "Community Organizing - Local change and civic engagement" },
        { value: "education", label: "Education - Teaching others about civic processes" },
        { value: "journalism", label: "Journalism - Reporting on politics and policy" },
      ],
    },
    {
      id: "futureCareer",
      title: "Career Interest",
      question: "Has this simulation influenced your interest in government or policy careers?",
      type: "radio",
      options: [
        { value: "very-interested", label: "Very Interested - I want to pursue this path" },
        { value: "somewhat-interested", label: "Somewhat Interested - I'd like to learn more" },
        { value: "maybe-later", label: "Maybe Later - Interesting but not right now" },
        { value: "different-role", label: "Different Role - Government but not legislative" },
        { value: "not-interested", label: "Not Interested - This confirmed it's not for me" },
      ],
    },
    {
      id: "systemicChange",
      title: "Systemic Change Vision",
      question: "What change would you make to improve how Congress works?",
      type: "radio",
      options: [
        { value: "transparency", label: "More Transparency - Open processes and public access" },
        { value: "bipartisanship", label: "Better Bipartisanship - Incentives for working together" },
        { value: "public-input", label: "More Public Input - Citizens involved in policy making" },
        { value: "expertise", label: "Better Expertise - More technical knowledge in decisions" },
        { value: "efficiency", label: "Improved Efficiency - Faster, more effective processes" },
      ],
    },
    {
      id: "actionPlan",
      title: "Personal Action Plan",
      question: "What specific actions will you take to stay engaged with government and policy?",
      type: "textarea",
      placeholder: "Describe concrete steps you plan to take (voting, volunteering, staying informed, etc.)...",
    },
    {
      id: "reflection",
      title: "Final Reflection",
      question: "What was the most important thing you learned from this congressional simulation?",
      type: "textarea",
      placeholder: "Reflect on your key insights and how this experience changed your understanding...",
    },
  ]

  const handleResponse = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
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
  const isAnswered = responses[currentQuestion.id as keyof typeof responses]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Envision: Future Applications</h1>
            <p className="text-gray-600">Reflect on your experience and plan for the future</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Progress value={(currentStep / questions.length) * 100} className="flex-1" />
          <Badge variant="outline">
            {currentStep + 1} of {questions.length}
          </Badge>
        </div>
      </div>

      {/* Simulation Results Summary */}
      {currentStep === 0 && simulationResults && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Target className="h-6 w-6" />
              Your Simulation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-3xl font-bold ${simulationResults.success ? "text-green-600" : "text-red-600"}`}>
                  {simulationResults.success ? "SUCCESS" : "INCOMPLETE"}
                </div>
                <p className="text-sm text-gray-600">Mission Status</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{simulationResults.yesVotes || 0} / 5</div>
                <p className="text-sm text-gray-600">Stakeholders Convinced</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Object.values(simulationResults.gameState?.attempts || {}).reduce(
                    (a: number, b: number) => a + b,
                    0,
                  )}
                </div>
                <p className="text-sm text-gray-600">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 0 && <Target className="h-5 w-5 text-blue-600" />}
            {currentStep === 1 && <Users className="h-5 w-5 text-green-600" />}
            {currentStep === 2 && <FileText className="h-5 w-5 text-purple-600" />}
            {currentStep === 3 && <Globe className="h-5 w-5 text-orange-600" />}
            {currentStep === 4 && <Building2 className="h-5 w-5 text-red-600" />}
            {currentStep === 5 && <Scale className="h-5 w-5 text-indigo-600" />}
            {currentStep >= 6 && <Zap className="h-5 w-5 text-yellow-600" />}
            {currentQuestion.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={responses[currentQuestion.id as keyof typeof responses]}
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
                value={responses[currentQuestion.id as keyof typeof responses]}
                onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={6}
                className="w-full"
              />
            )}
          </div>

          {/* Contextual Information */}
          {currentStep === 1 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-2">Stakeholder Management Tips</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Each stakeholder has different motivations and concerns</li>
                  <li>• Building relationships takes time and multiple interactions</li>
                  <li>• Understanding their perspective is key to persuasion</li>
                  <li>• Sometimes compromise is necessary for progress</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Professional Writing Skills</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Different audiences require different communication styles</li>
                  <li>• Clear, concise writing is more persuasive than lengthy arguments</li>
                  <li>• Evidence and examples strengthen your case</li>
                  <li>• Professional formatting shows respect and competence</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-red-800 mb-2">Government Career Paths</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
                  <div>
                    <strong>Legislative Branch:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Congressional staff</li>
                      <li>• Committee staff</li>
                      <li>• Legislative research</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Executive Branch:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Policy analysis</li>
                      <li>• Agency work</li>
                      <li>• White House staff</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>

            <Button onClick={handleNext} disabled={!isAnswered}>
              {currentStep === questions.length - 1 ? (
                <>
                  Complete Envision Phase
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
