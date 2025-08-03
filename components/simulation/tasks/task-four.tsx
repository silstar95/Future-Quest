"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone, TrendingUp, Award } from "lucide-react"

interface TaskFourData {
  competitors: string
  competitorStrengths: string
  uniqueFactors: string
  uniqueSellingProposition: string
}

interface TaskFourProps {
  onComplete: (data: TaskFourData) => void
  initialData?: TaskFourData
  celebrityData?: any
}

export function TaskFour({ onComplete, initialData, celebrityData }: TaskFourProps) {
  const [formData, setFormData] = useState<TaskFourData>(
    initialData || {
      competitors: "",
      competitorStrengths: "",
      uniqueFactors: "",
      uniqueSellingProposition: "",
    },
  )

  const canComplete = () => {
    return Object.values(formData).every((value) => value.trim() !== "")
  }

  const handleComplete = () => {
    if (canComplete()) {
      onComplete(formData)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Dark Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/task2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="flex items-center text-2xl">
              <Megaphone className="mr-3 h-6 w-6" />
              Task 4: Outsmart, Outshine, Outlast
            </CardTitle>
            <p className="text-green-100">Role: Brand Strategist | Location: Research Room</p>
          </CardHeader>

          <CardContent className="p-8">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-3">🏆 Your Mission</h3>
          <p className="text-gray-700 mb-4">
            Your celebrity is not the only one working on becoming a big hit. There are many others in the industry
            having the same goal. Figure out what makes your celebrity unique.
          </p>
          <p className="text-gray-700">
            This is work that a brand strategist would do - competitive analysis and positioning.
          </p>
        </div>

        {celebrityData && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Your Celebrity: {celebrityData.celebrityName}</h4>
            <p className="text-sm text-gray-600">
              Industry: {celebrityData.industry} | Values: {celebrityData.values}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Identify Top Competitors</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Find your celebrity's three biggest competitors. These would be other celebrities in the same industry
              doing similar things (but doesn't have to be the exact same).
            </p>
            <Textarea
              value={formData.competitors}
              onChange={(e) => setFormData((prev) => ({ ...prev, competitors: e.target.value }))}
              placeholder="List 3 competitors and briefly explain why they compete with your celebrity..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Competitor Strengths Analysis</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              List out at least two strengths of each of the celebrities you found. What makes them successful?
            </p>
            <Textarea
              value={formData.competitorStrengths}
              onChange={(e) => setFormData((prev) => ({ ...prev, competitorStrengths: e.target.value }))}
              placeholder="For each competitor, identify their key strengths and what they do well..."
              className="ml-4 min-h-[150px]"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold">Unique Differentiation</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              List out at least one way in which your chosen celebrity is unique from each of the other celebrities that
              you found.
            </p>
            <Textarea
              value={formData.uniqueFactors}
              onChange={(e) => setFormData((prev) => ({ ...prev, uniqueFactors: e.target.value }))}
              placeholder="Explain how your celebrity stands out from each competitor..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Unique Selling Proposition
              </h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Create a unique selling proposition for your celebrity. This is a 1-2 sentence statement that you create
              using the unique points you discovered in Step 3.
            </p>
            <Textarea
              value={formData.uniqueSellingProposition}
              onChange={(e) => setFormData((prev) => ({ ...prev, uniqueSellingProposition: e.target.value }))}
              placeholder="Write a compelling 1-2 sentence unique selling proposition..."
              className="ml-4 min-h-[100px]"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Competitive Analysis Complete!</h3>
          </div>
          <p className="text-blue-700">
            You've conducted a thorough competitive analysis and identified what makes your celebrity unique in the
            marketplace. This positioning will guide all future marketing efforts.
          </p>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Complete Competitive Analysis
          </Button>
        </div>
      </CardContent>
        </Card>
      </div>
    </div>
  )
}
