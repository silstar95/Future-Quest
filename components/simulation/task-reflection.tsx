"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"

interface TaskReflectionProps {
  taskTitle: string
  onComplete: (reflectionData: any) => void
}

export function TaskReflection({ taskTitle, onComplete }: TaskReflectionProps) {
  const [enjoymentRating, setEnjoymentRating] = useState<number | null>(null)
  const [liked, setLiked] = useState("")
  const [disliked, setDisliked] = useState("")

  const canComplete = () => {
    return enjoymentRating !== null && liked.trim() !== "" && disliked.trim() !== ""
  }

  const handleComplete = () => {
    if (canComplete()) {
      onComplete({
        enjoymentRating,
        liked,
        disliked,
        completedAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-[#2d407e] via-[#765889] to-[#a65f1c] text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Star className="mr-3 h-6 w-6" />
            Task Reflection
          </CardTitle>
          <p className="text-[#f0ad70]">Let's reflect on your experience with: {taskTitle}</p>
        </CardHeader>
      </Card>

      <Card className="border-2 border-gray-200 shadow-lg">
        <CardContent className="p-8 space-y-8">
          {/* Enjoyment Rating */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              On a scale of 1-10, how much did you enjoy this task?
            </h3>
            <div className="flex gap-2 justify-center flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <Button
                  key={rating}
                  variant={enjoymentRating === rating ? "default" : "outline"}
                  className={`w-12 h-12 text-lg font-bold ${
                    enjoymentRating === rating ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"
                  }`}
                  onClick={() => setEnjoymentRating(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
            {enjoymentRating && (
              <p className="text-center text-sm text-gray-600">
                You rated this task: <strong>{enjoymentRating}/10</strong>
              </p>
            )}
          </div>

          {/* What they liked */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
              What did you like about this task?
            </h3>
            <Textarea
              value={liked}
              onChange={(e) => setLiked(e.target.value)}
              placeholder="Share what you enjoyed, found interesting, or learned from this task..."
              className="min-h-[100px]"
            />
          </div>

          {/* What they didn't like */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <ThumbsDown className="mr-2 h-5 w-5 text-red-500" />
              What didn't you like about this task?
            </h3>
            <Textarea
              value={disliked}
              onChange={(e) => setDisliked(e.target.value)}
              placeholder="Share what was challenging, confusing, or could be improved about this task..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleComplete}
              disabled={!canComplete()}
              size="lg"
              className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#1e2b4f] hover:to-[#5a4a6b]"
            >
              Complete Reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
