"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Users, FileText, Scale, Crown, UserIcon as UserTie } from "lucide-react"

interface GovernmentPreReflectionFormProps {
  onComplete: (responses: any) => void
}

export default function GovernmentPreReflectionForm({ onComplete }: GovernmentPreReflectionFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    politicalKnowledge: "",
    stakeholderExperience: "",
    writingConfidence: "",
    legislativeProcess: "",
    waterCrisisAwareness: "",
    persuasionStrategy: "",
    expectations: "",
    concerns: "",
  })

  const questions = [
    {
      id: "politicalKnowledge",
      title: "Political Process Knowledge",
      question: "How familiar are you with the U.S. legislative process?",
      type: "radio",
      options: [
        { value: "very-familiar", label: "Very familiar - I understand how bills become laws" },
        { value: "somewhat-familiar", label: "Somewhat familiar - I know the basics" },
        { value: "limited", label: "Limited knowledge - I know Congress exists" },
        { value: "unfamiliar", label: "Unfamiliar - This is new to me" },
      ],
    },
    {
      id: "stakeholderExperience",
      title: "Stakeholder Management",
      question: "Have you ever had to convince different people with different priorities?",
      type: "radio",
      options: [
        { value: "extensive", label: "Yes, extensively - I do this regularly" },
        { value: "some", label: "Some experience - In school or work projects" },
        { value: "limited", label: "Limited - Only with friends and family" },
        { value: "none", label: "No - This will be my first time" },
      ],
    },
    {
      id: "writingConfidence",
      title: "Professional Writing",
      question: "How confident are you writing professional documents (memos, emails, letters)?",
      type: "radio",
      options: [
        { value: "very-confident", label: "Very confident - I write professionally often" },
        { value: "confident", label: "Confident - I can write formal documents" },
        { value: "somewhat-confident", label: "Somewhat confident - With some guidance" },
        { value: "not-confident", label: "Not confident - I need lots of help" },
      ],
    },
    {
      id: "legislativeProcess",
      title: "Legislative Understanding",
      question: "What do you think is the most important factor in getting a bill passed?",
      type: "radio",
      options: [
        { value: "good-idea", label: "Having a good idea that helps people" },
        { value: "bipartisan-support", label: "Getting support from both political parties" },
        { value: "leadership-backing", label: "Having powerful leaders support it" },
        { value: "public-pressure", label: "Public pressure and media attention" },
      ],
    },
    {
      id: "waterCrisisAwareness",
      title: "Water Crisis Knowledge",
      question: "Before this simulation, how aware were you of water infrastructure problems in the U.S.?",
      type: "radio",
      options: [
        { value: "very-aware", label: "Very aware - I knew about lead pipes and infrastructure needs" },
        { value: "somewhat-aware", label: "Somewhat aware - I heard about Flint, Michigan" },
        { value: "limited-awareness", label: "Limited awareness - I knew water could be unsafe" },
        { value: "unaware", label: "Unaware - This is news to me" },
      ],
    },
    {
      id: "persuasionStrategy",
      title: "Persuasion Approach",
      question: "When trying to convince someone, what approach do you usually take?",
      type: "radio",
      options: [
        { value: "emotional", label: "Emotional appeal - Focus on how it affects people" },
        { value: "logical", label: "Logical argument - Present facts and data" },
        { value: "practical", label: "Practical benefits - Show what they gain" },
        { value: "authority", label: "Authority/credibility - Reference experts and leaders" },
      ],
    },
    {
      id: "expectations",
      title: "Learning Expectations",
      question: "What do you hope to learn most from this congressional simulation?",
      type: "textarea",
      placeholder: "Share what you hope to gain from this experience...",
    },
    {
      id: "concerns",
      title: "Concerns or Challenges",
      question: "What aspects of this simulation do you think will be most challenging for you?",
      type: "textarea",
      placeholder: "What are you most worried about or curious about?",
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
          <Scale className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inside the Hill</h1>
            <p className="text-gray-600">Pre-Simulation Reflection</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Progress value={(currentStep / questions.length) * 100} className="flex-1" />
          <Badge variant="outline">
            {currentStep + 1} of {questions.length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 0 && <Users className="h-5 w-5 text-blue-600" />}
            {currentStep === 1 && <UserTie className="h-5 w-5 text-green-600" />}
            {currentStep === 2 && <FileText className="h-5 w-5 text-purple-600" />}
            {currentStep === 3 && <Scale className="h-5 w-5 text-orange-600" />}
            {currentStep === 4 && <Crown className="h-5 w-5 text-red-600" />}
            {currentStep >= 5 && <CheckCircle className="h-5 w-5 text-blue-600" />}
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
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
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
                rows={4}
                className="w-full"
              />
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>

            <Button onClick={handleNext} disabled={!isAnswered}>
              {currentStep === questions.length - 1 ? "Complete Reflection" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Water Crisis Preview */}
      {currentStep === 4 && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">The Water Crisis by the Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">9.2M</div>
                <p className="text-sm text-gray-600">Lead service lines in use</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">$625B</div>
                <p className="text-sm text-gray-600">Needed for infrastructure</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">49%</div>
                <p className="text-sm text-gray-600">Tribal homes lack clean water</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">70%</div>
                <p className="text-sm text-gray-600">Chicago children exposed to lead</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
