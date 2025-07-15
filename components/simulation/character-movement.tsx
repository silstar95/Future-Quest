"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Presentation, Search, Palette, Tv, MapPin, CheckCircle } from "lucide-react"

interface CharacterMovementProps {
  currentLocation: string
  onLocationChange: (location: string) => void
  requiredLocation: string
  taskTitle: string
}

const LOCATIONS = [
  {
    id: "office",
    name: "Main Office",
    icon: User,
    description: "Your starting point",
    color: "bg-gray-100",
  },
  {
    id: "whiteboard",
    name: "Whiteboard Room",
    icon: Presentation,
    description: "Strategy and planning space",
    color: "bg-blue-100",
  },
  {
    id: "research",
    name: "Research Room",
    icon: Search,
    description: "Data analysis and market research",
    color: "bg-green-100",
  },
  {
    id: "creative",
    name: "Creative Studio",
    icon: Palette,
    description: "Design and creative work",
    color: "bg-purple-100",
  },
  {
    id: "media",
    name: "Media Room",
    icon: Tv,
    description: "PR and media relations",
    color: "bg-red-100",
  },
]

export function CharacterMovement({
  currentLocation,
  onLocationChange,
  requiredLocation,
  taskTitle,
}: CharacterMovementProps) {
  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-blue-600" />
          Office Navigation
        </CardTitle>
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            Current: {LOCATIONS.find((l) => l.id === currentLocation)?.name}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Required: {LOCATIONS.find((l) => l.id === requiredLocation)?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            <strong>Next Task:</strong> {taskTitle}
          </div>

          {LOCATIONS.map((location) => {
            const IconComponent = location.icon
            const isCurrent = currentLocation === location.id
            const isRequired = requiredLocation === location.id

            return (
              <button
                key={location.id}
                onClick={() => onLocationChange(location.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50"
                    : isRequired
                      ? "border-green-500 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${location.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{location.name}</h4>
                      <div className="flex items-center space-x-1">
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {isCurrent && isRequired && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{location.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Click on different rooms to move around the office. You need to be in the correct
            room to start each task!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
