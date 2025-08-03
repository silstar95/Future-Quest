"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Users, TrendingUp } from "lucide-react"

interface TaskTwoData {
  productCategories: string
  brandCollaborations: string
  mediaOutlets: string
  trendAlignment: string
  roadmapDiagram: string
}

interface TaskTwoProps {
  onComplete: (data: TaskTwoData) => void
  initialData?: TaskTwoData
  celebrityData?: any
}

export function TaskTwo({ onComplete, initialData, celebrityData }: TaskTwoProps) {
  const [formData, setFormData] = useState<TaskTwoData>(
    initialData || {
      productCategories: "",
      brandCollaborations: "",
      mediaOutlets: "",
      trendAlignment: "",
      roadmapDiagram: "",
    },
  )

  const canComplete = () => {
    return (
      formData.productCategories.trim() !== "" &&
      formData.brandCollaborations.trim() !== "" &&
      formData.mediaOutlets.trim() !== "" &&
      formData.trendAlignment.trim() !== ""
    )
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
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center text-2xl">
              <Users className="mr-3 h-6 w-6" />
              Task 2: The Fame Formula - Long-Term Roadmap
            </CardTitle>
            <p className="text-blue-100">Role: Partnerships Manager | Location: Research Room</p>
          </CardHeader>

          <CardContent className="p-8">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-3">🤝 Your Mission</h3>
          <p className="text-gray-700 mb-4">
            To be most successful, your celebrity will need to secure endorsements, partnerships, and establish a media
            presence. It's important these are aligned with your celebrity's unique identity.
          </p>
          <p className="text-gray-700">Follow the steps below to create a roadmap of how you will grow their image.</p>
        </div>

        {celebrityData && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Your Celebrity: {celebrityData.celebrityName}</h4>
            <p className="text-sm text-gray-600">
              Industry: {celebrityData.industry} | Target Audience: {celebrityData.targetAudience}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Product Categories</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Identify a few product categories that align with the celebrity's image and resonate with their audience
              (e.g., clothing, beauty, wellness, lifestyle accessories, etc.).
            </p>
            <Textarea
              value={formData.productCategories}
              onChange={(e) => setFormData((prev) => ({ ...prev, productCategories: e.target.value }))}
              placeholder="List product categories and explain why they align with your celebrity..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Brand Collaborations</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Think about what established brands you would want to collaborate with that complement the celebrity's
              image and target market (e.g. Nike, Neutrogena, Muscle Milk, etc.)
            </p>
            <Textarea
              value={formData.brandCollaborations}
              onChange={(e) => setFormData((prev) => ({ ...prev, brandCollaborations: e.target.value }))}
              placeholder="List specific brands and explain why they would be good partnerships..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold">Media Presence Strategy</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Consider a few shows, media outlets, podcasts, and so on that you think your celebrity should appear on to
              boost their popularity.
            </p>
            <Textarea
              value={formData.mediaOutlets}
              onChange={(e) => setFormData((prev) => ({ ...prev, mediaOutlets: e.target.value }))}
              placeholder="List media outlets, shows, podcasts and explain the strategic value..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold">Trend Alignment</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Think about a few current trends and pop culture movements. How can your celebrity take advantage of these
              and align it with their image? Jot down an idea or two here.
            </p>
            <Textarea
              value={formData.trendAlignment}
              onChange={(e) => setFormData((prev) => ({ ...prev, trendAlignment: e.target.value }))}
              placeholder="Identify current trends and how your celebrity can authentically participate..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Bonus Step */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                ★
              </div>
              <h3 className="text-lg font-semibold">Bonus: Strategic Roadmap</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Create a diagram or "roadmap" of how each of these areas will complement each other and contribute to your
              celebrity's unique brand.
            </p>
            <Textarea
              value={formData.roadmapDiagram}
              onChange={(e) => setFormData((prev) => ({ ...prev, roadmapDiagram: e.target.value }))}
              placeholder="Describe your strategic roadmap or create a visual plan..."
              className="ml-4 min-h-[80px]"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Partnership Strategy Complete!</h3>
          </div>
          <p className="text-green-700">
            You've created a comprehensive partnership and media strategy that will help build your celebrity's brand
            presence across multiple channels.
          </p>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Complete Partnership Strategy
          </Button>
        </div>
      </CardContent>
        </Card>
      </div>
    </div>
  )
}
