"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, Star, TrendingUp, Microscope } from "lucide-react"

interface MaterialSciencePostReflectionFormProps {
  onComplete: (answers: any) => void
  initialData?: any
  preReflectionData?: any
}

export function MaterialSciencePostReflectionForm({
  onComplete,
  initialData,
  preReflectionData,
}: MaterialSciencePostReflectionFormProps) {
  const [answers, setAnswers] = useState({
    enjoymentRating: initialData?.enjoymentRating || [7],
    knowledgeLevel: initialData?.knowledgeLevel || "",
    materialScientistDescription: initialData?.materialScientistDescription || "",
    careerPursuit: initialData?.careerPursuit || "",
    confidenceRating: initialData?.confidenceRating || [3],
    interestLevel: initialData?.interestLevel || [4],
    otherCareers: initialData?.otherCareers || "",
  })

  const knowledgeOptions = [
    "I know nothing about materials science.",
    "I know what materials science is but don't know much about individual roles.",
    "I have some knowledge of materials science roles but still am unsure about the details.",
    "I have a good understanding of materials science.",
  ]

  const careerPursuitOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ]

  const handleSubmit = () => {
    onComplete(answers)
  }

  const isComplete = () => {
    return (
      answers.knowledgeLevel !== "" &&
      answers.materialScientistDescription.trim().length > 0 &&
      answers.careerPursuit !== "" &&
      answers.otherCareers.trim().length > 0
    )
  }

  // Detect growth from pre-reflection to post-reflection
  const detectGrowth = () => {
    if (!preReflectionData) return null

    const preKnowledge = preReflectionData.knowledgeLevel || ""
    const postKnowledge = answers.knowledgeLevel

    const knowledgeGrowth = knowledgeOptions.indexOf(postKnowledge) > knowledgeOptions.indexOf(preKnowledge)

    if (knowledgeGrowth) {
      return "🎉 Amazing growth! You've expanded your knowledge about materials science careers through this simulation!"
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
            <CardTitle className="text-xl">Post Reflection</CardTitle>
            <CardDescription className="text-blue-100">
              🔬 Congratulations! You've completed your simulation. Take a moment to reflect on how you felt working on
              this task and the wider project.
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              On a scale of 1-10, how much did you enjoy this project? Circle a number on the following scale
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
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
              <div className="text-center mt-2">
                <span className="font-medium text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {answers.enjoymentRating[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Level */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            After this experience, how would you describe your knowledge about materials science?
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

        {/* Materials Scientist Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            After this experience, please describe what you believe a materials scientist does.
          </h3>
          <Textarea
            value={answers.materialScientistDescription}
            onChange={(e) => setAnswers((prev) => ({ ...prev, materialScientistDescription: e.target.value }))}
            placeholder="Describe what you think a materials scientist does in their daily work..."
            className="min-h-[120px]"
          />
        </div>

        {/* Career Pursuit */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Would you want to pursue a career in materials science?
          </h3>
          <RadioGroup
            value={answers.careerPursuit}
            onValueChange={(value) => setAnswers((prev) => ({ ...prev, careerPursuit: value }))}
            className="flex gap-8"
          >
            {careerPursuitOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={option.value} id={`career-${option.value}`} />
                <Label htmlFor={`career-${option.value}`} className="cursor-pointer font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Confidence Rating */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              If you are to pursue a career in materials science, how confident do you feel in your ability to do so?
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
                <span>Not at all confident = 1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5 = Very confident</span>
              </div>
              <div className="text-center mt-2">
                <span className="font-medium text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {answers.confidenceRating[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Level */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Would you like to learn more about a career in materials science?
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
                <span>Not at all = 1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5 = Most Definitely</span>
              </div>
              <div className="text-center mt-2">
                <span className="font-medium text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {answers.interestLevel[0]}
                </span>
              </div>
            </div>
          </div>
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
            className="min-h-[100px]"
          />
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-800">Your Materials Science Journey Summary</h4>
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
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Microscope className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Career Interest:{" "}
                  {answers.careerPursuit === "yes"
                    ? "✅ Yes"
                    : answers.careerPursuit === "no"
                      ? "❌ No"
                      : "Not selected"}
                </span>
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
