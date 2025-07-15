"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { saveOnboardingAnswers } from "@/lib/firebase-service"
import Image from "next/image"

const QUIZ_STEPS = [
  {
    id: "subject-interests",
    title: "Tell us about your academic interests",
    question: "What subject areas are you interested in? (Select 3-5)",
    type: "checkbox",
    maxSelections: 5,
    minSelections: 3,
    options: [
      { value: "mathematics", label: "Mathematics" },
      { value: "algebra", label: "Algebra" },
      { value: "geometry", label: "Geometry" },
      { value: "calculus", label: "Calculus" },
      { value: "statistics", label: "Statistics" },
      { value: "biology", label: "Biology" },
      { value: "chemistry", label: "Chemistry" },
      { value: "physics", label: "Physics" },
      { value: "environmental-science", label: "Environmental Science" },
      { value: "earth-science", label: "Earth Science" },
      { value: "computer-science", label: "Computer Science" },
      { value: "engineering", label: "Engineering" },
      { value: "robotics", label: "Robotics" },
      { value: "english", label: "English/Literature" },
      { value: "creative-writing", label: "Creative Writing" },
      { value: "journalism", label: "Journalism" },
      { value: "speech-debate", label: "Speech & Debate" },
      { value: "history", label: "History" },
      { value: "geography", label: "Geography" },
      { value: "psychology", label: "Psychology" },
      { value: "sociology", label: "Sociology" },
      { value: "economics", label: "Economics" },
      { value: "business", label: "Business Studies" },
      { value: "accounting", label: "Accounting" },
      { value: "marketing", label: "Marketing" },
      { value: "art", label: "Visual Arts" },
      { value: "music", label: "Music" },
      { value: "theater", label: "Theater/Drama" },
      { value: "dance", label: "Dance" },
      { value: "foreign-language", label: "Foreign Languages" },
      { value: "physical-education", label: "Physical Education" },
      { value: "health", label: "Health Sciences" },
      { value: "culinary", label: "Culinary Arts" },
      { value: "philosophy", label: "Philosophy" },
      { value: "political-science", label: "Political Science" },
      { value: "anthropology", label: "Anthropology" },
    ],
  },
  {
    id: "favorite-classes",
    title: "Your current favorites",
    question: "Which two classes are your favorite right now?",
    type: "dual-input",
    placeholder1: "First favorite class...",
    placeholder2: "Second favorite class...",
  },
  {
    id: "disliked-subjects",
    title: "Understanding your preferences",
    question: "Which subject areas do you find less interesting? (Select 2-3)",
    type: "checkbox",
    maxSelections: 3,
    minSelections: 2,
    options: [
      { value: "mathematics", label: "Mathematics" },
      { value: "algebra", label: "Algebra" },
      { value: "geometry", label: "Geometry" },
      { value: "calculus", label: "Calculus" },
      { value: "statistics", label: "Statistics" },
      { value: "biology", label: "Biology" },
      { value: "chemistry", label: "Chemistry" },
      { value: "physics", label: "Physics" },
      { value: "environmental-science", label: "Environmental Science" },
      { value: "earth-science", label: "Earth Science" },
      { value: "computer-science", label: "Computer Science" },
      { value: "engineering", label: "Engineering" },
      { value: "robotics", label: "Robotics" },
      { value: "english", label: "English/Literature" },
      { value: "creative-writing", label: "Creative Writing" },
      { value: "journalism", label: "Journalism" },
      { value: "speech-debate", label: "Speech & Debate" },
      { value: "history", label: "History" },
      { value: "geography", label: "Geography" },
      { value: "psychology", label: "Psychology" },
      { value: "sociology", label: "Sociology" },
      { value: "economics", label: "Economics" },
      { value: "business", label: "Business Studies" },
      { value: "accounting", label: "Accounting" },
      { value: "marketing", label: "Marketing" },
      { value: "art", label: "Visual Arts" },
      { value: "music", label: "Music" },
      { value: "theater", label: "Theater/Drama" },
      { value: "dance", label: "Dance" },
      { value: "foreign-language", label: "Foreign Languages" },
      { value: "physical-education", label: "Physical Education" },
      { value: "health", label: "Health Sciences" },
      { value: "culinary", label: "Culinary Arts" },
      { value: "philosophy", label: "Philosophy" },
      { value: "political-science", label: "Political Science" },
      { value: "anthropology", label: "Anthropology" },
    ],
  },
  {
    id: "activities-hobbies",
    title: "Your activities and interests",
    question: "What activities and hobbies interest you? (Select 3-5)",
    type: "checkbox",
    maxSelections: 5,
    minSelections: 3,
    options: [
      { value: "team-sports", label: "Team Sports (Basketball, Soccer, etc.)" },
      { value: "individual-sports", label: "Individual Sports (Tennis, Track, etc.)" },
      { value: "outdoor-activities", label: "Outdoor Activities (Hiking, Camping)" },
      { value: "fitness", label: "Fitness & Exercise" },
      { value: "martial-arts", label: "Martial Arts" },
      { value: "swimming", label: "Swimming" },
      { value: "cycling", label: "Cycling" },
      { value: "debate-speech", label: "Debate & Public Speaking" },
      { value: "model-un", label: "Model United Nations" },
      { value: "student-government", label: "Student Government" },
      { value: "drama-theater", label: "Drama & Theater" },
      { value: "music-band", label: "Band/Orchestra" },
      { value: "choir-singing", label: "Choir & Singing" },
      { value: "dance", label: "Dance" },
      { value: "visual-arts", label: "Visual Arts & Painting" },
      { value: "photography", label: "Photography" },
      { value: "creative-writing", label: "Creative Writing" },
      { value: "journalism", label: "Journalism & School Newspaper" },
      { value: "coding-programming", label: "Coding & Programming" },
      { value: "robotics", label: "Robotics Club" },
      { value: "science-olympiad", label: "Science Olympiad" },
      { value: "math-competitions", label: "Math Competitions" },
      { value: "chess-club", label: "Chess Club" },
      { value: "volunteer-work", label: "Volunteer Work & Community Service" },
      { value: "environmental-club", label: "Environmental Club" },
      { value: "gaming", label: "Video Gaming" },
      { value: "board-games", label: "Board Games & Strategy Games" },
      { value: "reading", label: "Reading & Literature" },
      { value: "cooking-baking", label: "Cooking & Baking" },
      { value: "fashion-design", label: "Fashion & Design" },
      { value: "entrepreneurship", label: "Entrepreneurship & Business" },
      { value: "investing", label: "Investing & Finance" },
      { value: "tutoring", label: "Tutoring & Teaching Others" },
      { value: "language-learning", label: "Learning Foreign Languages" },
      { value: "travel", label: "Travel & Cultural Exploration" },
    ],
  },
  {
    id: "career-interests",
    title: "Career exploration",
    question: "Which career fields interest you most? (Select exactly 2)",
    type: "checkbox",
    maxSelections: 2,
    minSelections: 2,
    options: [
      { value: "agriculture", label: "Agriculture, Food & Natural Resources" },
      { value: "architecture", label: "Architecture & Construction" },
      { value: "arts-av", label: "Arts, A/V Technology & Communications" },
      { value: "business", label: "Business Management & Administration" },
      { value: "education", label: "Education & Training" },
      { value: "finance", label: "Finance" },
      { value: "government", label: "Government & Public Administration" },
      { value: "health", label: "Health Science" },
      { value: "hospitality", label: "Hospitality & Tourism" },
      { value: "human-services", label: "Human Services" },
      { value: "information-technology", label: "Information Technology" },
      { value: "law-safety", label: "Law, Public Safety, Corrections & Security" },
      { value: "manufacturing", label: "Manufacturing" },
      { value: "marketing", label: "Marketing" },
      { value: "stem", label: "Science, Technology, Engineering & Mathematics" },
      { value: "transportation", label: "Transportation, Distribution & Logistics" },
    ],
  },
  {
    id: "career-knowledge-1",
    title: "Your current knowledge",
    question: "", // Will be dynamically set
    type: "radio",
    options: [
      { value: "beginner", label: "Beginner - I know very little about this field" },
      { value: "some", label: "Some knowledge - I have basic understanding" },
      { value: "moderate", label: "Moderate - I have researched this field" },
      { value: "advanced", label: "Advanced - I have significant knowledge" },
    ],
  },
  {
    id: "career-knowledge-2",
    title: "Your current knowledge",
    question: "", // Will be dynamically set
    type: "radio",
    options: [
      { value: "beginner", label: "Beginner - I know very little about this field" },
      { value: "some", label: "Some knowledge - I have basic understanding" },
      { value: "moderate", label: "Moderate - I have researched this field" },
      { value: "advanced", label: "Advanced - I have significant knowledge" },
    ],
  },
  {
    id: "exploration-methods",
    title: "Your exploration journey",
    question:
      "How have you learned more about the careers/fields you shared above? Share with us all the steps you have taken to explore the careers/fields you are interested in:",
    type: "textarea",
    placeholder: "Tell us about any research, conversations, experiences, or other ways you've explored careers...",
  },
]

export function OnboardingQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const getCurrentQuestion = () => {
    const question = { ...QUIZ_STEPS[currentStep] }

    if (question.id === "career-knowledge-1") {
      const selectedCareers = answers["career-interests"] || []
      const firstCareer = selectedCareers[0]
      const careerLabel = QUIZ_STEPS[4].options?.find((o) => o.value === firstCareer)?.label
      question.question = `How would you describe your knowledge about ${careerLabel || "this career field"}?`
    } else if (question.id === "career-knowledge-2") {
      const selectedCareers = answers["career-interests"] || []
      const secondCareer = selectedCareers[1]
      const careerLabel = QUIZ_STEPS[4].options?.find((o) => o.value === secondCareer)?.label
      question.question = `How would you describe your knowledge about ${careerLabel || "this career field"}?`
    }

    return question
  }

  const currentQuestion = getCurrentQuestion()
  const isLastStep = currentStep === QUIZ_STEPS.length - 1

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = async () => {
    if (isLastStep) {
      // Save answers to database
      try {
        const onboardingData = {
          ...answers,
          completedAt: new Date().toISOString(),
          interests: generateInterests(answers),
          recommendedSimulations: generateRecommendations(answers),
        }

        if (user?.uid) {
          await saveOnboardingAnswers(user.uid, onboardingData)

          toast({
            title: "🎉 Onboarding Complete!",
            description: "Your preferences have been saved. Welcome to Future Quest!",
          })

          router.push("/dashboard/student")
        }
      } catch (error) {
        console.error("Error saving onboarding answers:", error)
        toast({
          title: "Error saving preferences",
          description: "Please try again or contact support.",
          variant: "destructive",
        })
      }
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const canProceed = () => {
    const answer = answers[currentQuestion.id]
    if (!answer) return false

    if (currentQuestion.type === "checkbox") {
      const minSelections = currentQuestion.minSelections || 1
      return Array.isArray(answer) && answer.length >= minSelections
    }

    if (currentQuestion.type === "textarea") {
      return answer.trim().length > 0
    }

    if (currentQuestion.type === "dual-input") {
      return answer.first && answer.second && answer.first.trim().length > 0 && answer.second.trim().length > 0
    }

    return true
  }

  // Generate interests based on quiz answers
  const generateInterests = (answers: Record<string, any>) => {
    const interests = new Set<string>()

    // Map subjects to interests
    const subjectMapping: Record<string, string[]> = {
      mathematics: ["technology", "finance", "engineering"],
      "computer-science": ["technology", "engineering", "programming"],
      biology: ["healthcare", "science", "research"],
      chemistry: ["healthcare", "engineering", "science"],
      physics: ["engineering", "science", "technology"],
      english: ["marketing", "arts", "education"],
      history: ["law", "education", "government"],
      art: ["arts", "marketing", "creative"],
      music: ["arts", "entertainment", "creative"],
      business: ["business", "finance", "marketing"],
      psychology: ["healthcare", "education", "human-services"],
    }

    // Add interests from enjoyed subjects
    const enjoyedSubjects = answers["subject-interests"] || []
    enjoyedSubjects.forEach((subject: string) => {
      if (subjectMapping[subject]) {
        subjectMapping[subject].forEach((interest) => interests.add(interest))
      }
    })

    // Add career interests directly
    const careerInterests = answers["career-interests"] || []
    careerInterests.forEach((interest: string) => interests.add(interest))

    return Array.from(interests)
  }

  // Generate simulation recommendations based on interests
  const generateRecommendations = (answers: Record<string, any>) => {
    const interests = generateInterests(answers)
    const simulationMapping: Record<string, string[]> = {
      healthcare: ["Healthcare Administrator", "Medical Researcher"],
      technology: ["Software Developer", "Cybersecurity Analyst"],
      business: ["Brand Manager for Celebrity", "Business Consultant"],
      engineering: ["Superconductor Engineer", "Robotics Engineer"],
      finance: ["Financial Analyst", "Investment Banker"],
      marketing: ["Brand Manager for Celebrity", "Digital Marketing Manager"],
      arts: ["Creative Director", "UX Designer"],
      science: ["Environmental Scientist", "Data Scientist"],
    }

    const recommendations = new Set<string>()
    interests.forEach((interest) => {
      if (simulationMapping[interest]) {
        simulationMapping[interest].forEach((sim) => recommendations.add(sim))
      }
    })

    return Array.from(recommendations).slice(0, 5) // Limit to top 5 recommendations
  }

  return (
    <div className="min-h-screen brand-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-20">
        <Image src="/images/logo.png" alt="Future Quest" width={200} height={80} className="h-12 w-auto" />
      </div>

      {/* Soft animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-2xl relative z-10 bg-white/95 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {QUIZ_STEPS.length}
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUIZ_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {currentQuestion.title}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === "radio" && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-base cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "checkbox" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((option) => {
                const selectedItems = answers[currentQuestion.id] || []
                const isSelected = selectedItems.includes(option.value)
                const maxReached = selectedItems.length >= (currentQuestion.maxSelections || 3)

                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={isSelected}
                      disabled={!isSelected && maxReached}
                      onCheckedChange={(checked) => {
                        const current = answers[currentQuestion.id] || []
                        if (checked) {
                          handleAnswer(currentQuestion.id, [...current, option.value])
                        } else {
                          handleAnswer(
                            currentQuestion.id,
                            current.filter((item: string) => item !== option.value),
                          )
                        }
                      }}
                    />
                    <Label
                      htmlFor={option.value}
                      className={`text-base cursor-pointer ${!isSelected && maxReached ? "text-muted-foreground" : ""}`}
                    >
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          )}

          {currentQuestion.type === "textarea" && (
            <Textarea
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="min-h-32"
            />
          )}

          {currentQuestion.type === "dual-input" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first-class">First Favorite Class</Label>
                <Input
                  id="first-class"
                  placeholder={currentQuestion.placeholder1}
                  value={answers[currentQuestion.id]?.first || ""}
                  onChange={(e) =>
                    handleAnswer(currentQuestion.id, {
                      ...answers[currentQuestion.id],
                      first: e.target.value,
                    })
                  }
                  className="border-2 focus:border-brand-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="second-class">Second Favorite Class</Label>
                <Input
                  id="second-class"
                  placeholder={currentQuestion.placeholder2}
                  value={answers[currentQuestion.id]?.second || ""}
                  onChange={(e) =>
                    handleAnswer(currentQuestion.id, {
                      ...answers[currentQuestion.id],
                      second: e.target.value,
                    })
                  }
                  className="border-2 focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90"
            >
              {isLastStep ? "Complete Quiz" : "Next"}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
