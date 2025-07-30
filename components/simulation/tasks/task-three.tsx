"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Target, Instagram, Palette, MessageSquare } from "lucide-react"

interface TaskThreeData {
  weeklyMessage: string
  contentStrategy: string
  colorPalette: string
  sampleCaptions: string
  samplePost: string
}

interface TaskThreeProps {
  onComplete: (data: TaskThreeData) => void
  initialData?: TaskThreeData
  celebrityData?: any
}

export function TaskThree({ onComplete, initialData, celebrityData }: TaskThreeProps) {
  const [formData, setFormData] = useState<TaskThreeData>(
    initialData || {
      weeklyMessage: "",
      contentStrategy: "",
      colorPalette: "",
      sampleCaptions: "",
      samplePost: "",
    },
  )

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canComplete = () => {
    return (
      formData.weeklyMessage.trim() !== "" &&
      formData.contentStrategy.trim() !== "" &&
      formData.colorPalette.trim() !== "" &&
      formData.sampleCaptions.trim() !== ""
    )
  }

  const handleComplete = () => {
    if (canComplete()) {
      onComplete(formData)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "application/pdf")) {
      setUploadedFile(file)
      setFormData((prev) => ({ ...prev, samplePost: `Uploaded file: ${file.name}` }))
    } else {
      alert("Please upload a PNG, JPG, or PDF file.")
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Dark Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/task3.jpg)',
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
          <CardHeader className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
            <CardTitle className="flex items-center text-2xl">
              <Target className="mr-3 h-6 w-6" />
              Task 3: #GoingViral
            </CardTitle>
            <p className="text-pink-100">Role: Social Media Strategist | Location: Creative Studio</p>
          </CardHeader>

          <CardContent className="p-8">
        <div className="bg-pink-50 border border-pink-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Instagram className="mr-2 h-5 w-5" />
            Your Mission
          </h3>
          <p className="text-gray-700 mb-4">
            Now that you have crafted the identity of your celebrity, create a one-week Instagram strategy for your
            chosen celebrity. To help you do this seamlessly, follow the steps below.
          </p>
        </div>

        {celebrityData && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Your Celebrity: {celebrityData.celebrityName}</h4>
            <p className="text-sm text-gray-600">
              Target Audience: {celebrityData.targetAudience} | Values: {celebrityData.values}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Weekly Message Strategy</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              What message do you want your audience to receive? Be creative! What do you want to tell your followers
              this week?
            </p>
            <Textarea
              value={formData.weeklyMessage}
              onChange={(e) => setFormData((prev) => ({ ...prev, weeklyMessage: e.target.value }))}
              placeholder="Describe the key message and themes for this week's content..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Content Strategy & Research</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              How are you going to convey your message? How many reels? How many posts? Do some research on what the
              optimal number of posts, reels, likes, shares, comments, etc. is to make your celebrity go viral.
            </p>
            <Textarea
              value={formData.contentStrategy}
              onChange={(e) => setFormData((prev) => ({ ...prev, contentStrategy: e.target.value }))}
              placeholder="Detail your content mix, posting frequency, and engagement strategy based on research..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Brand Color Palette
              </h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Think about colors your celebrity often wears or displays. Choose 3-4 colors to assemble their color
              palette and write the color (or hex) codes here.
            </p>
            <div className="ml-11 space-y-2">
              <Input
                value={formData.colorPalette}
                onChange={(e) => setFormData((prev) => ({ ...prev, colorPalette: e.target.value }))}
                placeholder="e.g., #FF6B9D (Hot Pink), #4ECDC4 (Turquoise), #45B7D1 (Sky Blue)"
              />
              <p className="text-xs text-gray-500">
                Tip: You can use color picker tools online to find hex codes for specific colors
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Sample Captions
              </h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Come up with 1-2 sample captions that reflect your celebrity's voice and this week's message.
            </p>
            <Textarea
              value={formData.sampleCaptions}
              onChange={(e) => setFormData((prev) => ({ ...prev, sampleCaptions: e.target.value }))}
              placeholder="Write engaging captions that match your celebrity's personality and brand voice..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Bonus Step */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                ★
              </div>
              <h3 className="text-lg font-semibold">Bonus: Sample Post Creation</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Create a sample post. You can use Canva.com or describe what the visual would look like.
            </p>
            <div className="ml-11 space-y-3">
              <Textarea
                value={formData.samplePost}
                onChange={(e) => setFormData((prev) => ({ ...prev, samplePost: e.target.value }))}
                placeholder="Describe your sample post design, or upload a file below..."
                className="min-h-[80px]"
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or upload your sample post</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    Choose File (PNG, JPG, PDF)
                  </Button>
                  {uploadedFile && <p className="text-sm text-green-600">✓ Uploaded: {uploadedFile.name}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Target className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Social Media Strategy Complete!</h3>
          </div>
          <p className="text-green-700">
            You've created a comprehensive Instagram strategy that aligns with your celebrity's brand and is designed to
            maximize engagement and reach.
          </p>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            size="lg"
            className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
          >
            Complete Social Media Strategy
          </Button>
        </div>
      </CardContent>
        </Card>
      </div>
    </div>
  )
}
