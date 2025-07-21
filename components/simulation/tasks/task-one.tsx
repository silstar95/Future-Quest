"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star, Heart } from "lucide-react"

interface TaskOneData {
  celebrityName: string
  industry: string
  targetAudience: string
  values: string
}

interface TaskOneProps {
  onComplete: (data: TaskOneData) => void
  initialData?: TaskOneData
  celebrityData?: any
}

export function TaskOne({ onComplete, initialData }: TaskOneProps) {
  const [formData, setFormData] = useState<TaskOneData>(
    initialData || {
      celebrityName: "",
      industry: "",
      targetAudience: "",
      values: "",
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center text-2xl">
          <Star className="mr-3 h-6 w-6" />
          Task #1: Crafting Your Celebrity's Identity
        </CardTitle>
        <p className="text-purple-100">Role: Brand Strategist | Location: Whiteboard Room</p>
      </CardHeader>

      <CardContent className="p-8">
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-3">🎯 Your Mission</h3>
          <p className="text-gray-700 mb-4">
            Select a celebrity as a team that you want to make even more famous. This could be
            Taylor Swift, Bad Bunny, Serena Williams, Mr. Beast, Greta Thunberg, Alexandria Ocasio-Cortez (AOC), or
            anyone else. You can also make up your own celebrity!
          </p>
          <p className="text-gray-700">
            Complete the following steps to establish your celebrity's identity. Use your responses to inform all future tasks.
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Choose your celebrity and write down their name</h3>
            </div>
            <Input
              value={formData.celebrityName}
              onChange={(e) => setFormData((prev) => ({ ...prev, celebrityName: e.target.value }))}
              placeholder="e.g., Taylor Swift, Mr. Beast, or create your own celebrity..."
              className="ml-11"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Which industry are they in?</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Get as detailed as possible, e.g. "Serena Williams is in the sports industry. She plays women's tennis."
            </p>
            <Textarea
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              placeholder="Describe their industry and specific area of expertise..."
              className="ml-11 min-h-[80px]"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold">Identify your target audience</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              To make your celebrity even more famous, who do you want to know more about them? Which group of people
              are you targeting? E.g., Teen girls in the USA
            </p>
            <Textarea
              value={formData.targetAudience}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="Describe your target audience demographics, interests, and characteristics..."
              className="ml-11 min-h-[80px]"
            />
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold">What does your celebrity care about most?</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              What are the top two values for your celebrity? This will guide all future marketing decisions.
            </p>
            <Textarea
              value={formData.values}
              onChange={(e) => setFormData((prev) => ({ ...prev, values: e.target.value }))}
              placeholder="List and explain their core values and what they stand for..."
              className="ml-11 min-h-[80px]"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Heart className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Wonderful!</h3>
          </div>
          <p className="text-green-700">
            Now use this identity in all the individual tasks that follow. This foundation will guide your marketing
            strategy and ensure consistency across all campaigns.
          </p>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Complete Celebrity Identity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
