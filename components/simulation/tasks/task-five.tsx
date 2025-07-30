"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Shield, AlertTriangle, MessageCircle, Newspaper } from "lucide-react"

interface TaskFiveData {
  responseStrategy: string
  impactAssessment: string
  futureCommitment: string
  voiceKeywords: string
  pressRelease: string
}

interface TaskFiveProps {
  onComplete: (data: TaskFiveData) => void
  initialData?: TaskFiveData
  celebrityData?: any
}

export function TaskFive({ onComplete, initialData, celebrityData }: TaskFiveProps) {
  const [formData, setFormData] = useState<TaskFiveData>(
    initialData || {
      responseStrategy: "",
      impactAssessment: "",
      futureCommitment: "",
      voiceKeywords: "",
      pressRelease: "",
    },
  )

  const canComplete = () => {
    return (
      formData.responseStrategy.trim() !== "" &&
      formData.impactAssessment.trim() !== "" &&
      formData.futureCommitment.trim() !== "" &&
      formData.voiceKeywords.trim() !== ""
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
          backgroundImage: 'url(/images/task5.jpg)',
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
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardTitle className="flex items-center text-2xl">
              <Shield className="mr-3 h-6 w-6" />
              Task #5: Damage Control
            </CardTitle>
            <p className="text-red-100">Role: PR Manager | Location: Media Studio</p>
          </CardHeader>

          <CardContent className="p-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Crisis Situation!</h3>
          </div>
          <p className="text-gray-700 mb-4">
            There's been a disastrous public relations scandal - your celebrity was called out online for sending mean
            DMs to their rival. Now you need to do damage control and write a heartfelt, 2-paragraph press release that
            your celebrity will post on their social media.
          </p>
          <p className="text-gray-700">
            This is a task that a PR manager would do. Follow the steps below to make your statement most impactful.
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
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Response Strategy</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Think about what was said, and how much detail your celebrity should give. Should they admit full guilt?
              Should they brush over the situation entirely? Come up with a few ideas of how they should address this.
            </p>
            <Textarea
              value={formData.responseStrategy}
              onChange={(e) => setFormData((prev) => ({ ...prev, responseStrategy: e.target.value }))}
              placeholder="Outline different approaches and decide on the best strategy for addressing the situation..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Impact Assessment</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Consider your audience and who may have felt hurt by your celebrities' remarks. Did their insult impact
              more than just their rival? Who should be included in their apology? Come up with a sentence or two about
              the larger impact of their words and actions.
            </p>
            <Textarea
              value={formData.impactAssessment}
              onChange={(e) => setFormData((prev) => ({ ...prev, impactAssessment: e.target.value }))}
              placeholder="Analyze who was affected and how to address the broader impact..."
              className="ml-4 min-h-[120px]"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold">Future Commitment</h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              How will they address this behavior in the future? To be most sincere, people want to know they will
              change. Jot down how they'll address their actions and not repeat their behavior.
            </p>
            <Textarea
              value={formData.futureCommitment}
              onChange={(e) => setFormData((prev) => ({ ...prev, futureCommitment: e.target.value }))}
              placeholder="Describe specific steps and commitments for future behavior change..."
              className="ml-4 min-h-[100px]"
            />
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Authentic Voice
              </h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              Consider your celebrity's unique voice - what words would they use to give a convincing apology that
              doesn't sound generic or insincere? Include a few key words that match their voice.
            </p>
            <Textarea
              value={formData.voiceKeywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, voiceKeywords: e.target.value }))}
              placeholder="List key words and phrases that match your celebrity's authentic speaking style..."
              className="ml-4 min-h-[80px]"
            />
          </div>

          {/* Step 5 */}
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                5
              </div>
              <h3 className="text-lg font-semibold flex items-center">
                <Newspaper className="mr-2 h-5 w-5" />
                Draft Press Release (Optional)
              </h3>
            </div>
            <p className="text-gray-600 ml-11 mb-2">
              You don't have to complete this step, but in the real world, you might put this into ChatGPT or another AI
              tool to help you draft a press release putting everything together! Try writing your own 2-paragraph
              statement.
            </p>
            <Textarea
              value={formData.pressRelease}
              onChange={(e) => setFormData((prev) => ({ ...prev, pressRelease: e.target.value }))}
              placeholder="Write a heartfelt 2-paragraph press release incorporating all the elements above..."
              className="ml-4 min-h-[150px]"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Crisis Management Complete!</h3>
          </div>
          <p className="text-green-700">
            You've successfully navigated a PR crisis by developing a thoughtful, strategic response that addresses the
            situation while maintaining your celebrity's authentic voice and values.
          </p>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            Complete Crisis Management
          </Button>
        </div>
      </CardContent>
        </Card>
      </div>
    </div>
  )
}
