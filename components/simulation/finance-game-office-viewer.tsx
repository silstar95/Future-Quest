"use client"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, MousePointer, RefreshCw, MapPin, ArrowRight } from "lucide-react"

interface FinanceGameOfficeViewerProps {
  tasks: any[]
  onTaskSelect?: (taskId: number) => void
  backgroundImage?: string
  title?: string
}

export function FinanceGameOfficeViewer({
  tasks,
  onTaskSelect,
  backgroundImage = "/images/office-background.png",
  title = "Finance Office",
}: FinanceGameOfficeViewerProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const financeOfficeGameRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState("lobby")
  const initializationRef = useRef(false)

  // Room information with task mappings for finance office
  const roomInfo = {
    lobby: {
      name: "Finance Hub",
      description: "Welcome to the finance department",
      tasks: [],
    },
    analysis: {
      name: "Analysis Center",
      description: "Financial health check and analysis workspace",
      tasks: [1], // Task 1: Financial Health Check-Up
    },
    investment: {
      name: "Investment Office",
      description: "Strategic investment planning and advisory",
      tasks: [2], // Task 2: Investment Advisor
    },
    treasury: {
      name: "Treasury Department",
      description: "Budget planning and treasury management",
      tasks: [3], // Task 3: Corporate Treasurer
    },
    research: {
      name: "Research Lab",
      description: "Financial analysis and forecasting research",
      tasks: [4], // Task 4: Financial Analyst
    },
    risk: {
      name: "Risk Management",
      description: "Risk assessment and crisis management",
      tasks: [5], // Task 5: Risk Manager
    },
  }

  const getTaskLocation = (taskId: number): string => {
    const locationMap = {
      1: "analysis",
      2: "investment",
      3: "treasury",
      4: "research",
      5: "risk",
    }
    return locationMap[taskId as keyof typeof locationMap] || "lobby"
  }

  // Helper function to get the next recommended task
  const getNextTask = () => {
    // Find the next incomplete task
    for (const task of tasks) {
      if (!task.isCompleted) {
        return task
      }
    }
    return null
  }

  // Helper function to get the recommended room
  const getRecommendedRoom = () => {
    const nextTask = getNextTask()
    if (nextTask) {
      const roomId = getTaskLocation(nextTask.id)
      const room = roomInfo[roomId as keyof typeof roomInfo]
      return {
        room: roomId,
        roomName: room?.name || "Unknown Room",
        task: nextTask,
      }
    }
    return null
  }

  const recommendedRoom = getRecommendedRoom()

  const initializeGame = async () => {
    if (!gameRef.current || initializationRef.current) return

    try {
      initializationRef.current = true
      setIsLoading(true)
      setError(null)

      // Clean up existing game
      if (financeOfficeGameRef.current) {
        try {
          financeOfficeGameRef.current.destroy()
        } catch (e) {
          console.warn("Error destroying previous game:", e)
        }
        financeOfficeGameRef.current = null
      }

      // Clear the container
      gameRef.current.innerHTML = ""

      // Dynamically import FinanceOfficeGame
      const { FinanceOfficeGame } = await import("@/lib/finance-office-game")

      // Convert tasks to the format expected by FinanceOfficeGame
      const formattedTasks = tasks.map((task) => ({
        id: task.id.toString(),
        title: task.title,
        role: task.role,
        isCompleted: task.isCompleted,
        location: getTaskLocation(task.id),
      }))

      // Initialize the game
      financeOfficeGameRef.current = new FinanceOfficeGame(
        gameRef.current,
        formattedTasks,
        formattedTasks.filter(task => task.isCompleted).map(task => task.id)
      )

      // Set up event handlers
      financeOfficeGameRef.current.onLocationChange = (location: string) => {
        setCurrentLocation(location)
      }

      financeOfficeGameRef.current.onTaskSelect = (taskId: string) => {
        if (onTaskSelect) {
          onTaskSelect(parseInt(taskId))
        }
      }

      financeOfficeGameRef.current.onTaskReview = (taskId: string) => {
        if (onTaskSelect) {
          onTaskSelect(parseInt(taskId))
        }
      }

      setIsLoading(false)
    } catch (err: any) {
      console.error("❌ Error initializing finance office game:", err)
      setError(err.message || "Failed to load finance office environment")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (gameRef.current && !initializationRef.current) {
      initializeGame()
    }

    return () => {
      if (financeOfficeGameRef.current) {
        try {
          financeOfficeGameRef.current.destroy()
        } catch (e) {
          console.warn("Error destroying game on unmount:", e)
        }
      }
    }
  }, [])

  const handleRoomNavigation = (roomId: string) => {
    if (financeOfficeGameRef.current && financeOfficeGameRef.current.moveCatToRoom) {
      try {
        financeOfficeGameRef.current.moveCatToRoom(roomId)
      } catch (e) {
        console.warn("Error moving to room:", e)
      }
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const getCurrentRoomTasks = () => {
    const room = roomInfo[currentLocation as keyof typeof roomInfo]
    if (!room) return []

    return room.tasks.map((taskId) => tasks.find((t) => t.id === taskId)).filter(Boolean)
  }

  const currentRoomTasks = getCurrentRoomTasks()
  const currentRoom = roomInfo[currentLocation as keyof typeof roomInfo]

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recommended Room Card */}
      {recommendedRoom && (
        <Card className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#db9b6c]/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2d407e] to-[#765889] flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2d407e] mb-1">
                  🎯 Next Task: Go to the {recommendedRoom.roomName}
                </h3>
                <p className="text-[#4e3113] mb-2">
                  Complete "{recommendedRoom.task.title}" as a {recommendedRoom.task.role}
                </p>
                <p className="text-sm text-[#4e3113]/80">
                  Navigate to the {recommendedRoom.roomName} in the office below to start your next mission!
                </p>
              </div>
              <Button
                onClick={() => onTaskSelect && onTaskSelect(recommendedRoom.task.id)}
                className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
              >
                Start Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Container */}
      <div className="relative">
        <div
          ref={gameRef}
          className="w-full h-[600px] bg-gradient-to-br from-green-50 to-blue-100 rounded-lg border-2 border-gray-200 overflow-hidden"
          style={{ minHeight: "600px" }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading finance office environment...</p>
              <p className="text-gray-500 text-sm mt-2">Initializing game engine...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls and Room Info */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Current Room Info */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <MousePointer className="mr-2 h-4 w-4" />
              Current Location: {currentRoom?.name || "Unknown"}
            </h4>
            <p className="text-sm text-gray-600 mb-3">{currentRoom?.description}</p>

            {currentRoomTasks.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Available Tasks:</h5>
                {currentRoomTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className={task.isCompleted ? "text-green-600" : "text-blue-600"}>{task.title}</span>
                    <div className="flex items-center gap-2">
                      {task.isCompleted && <Badge variant="outline">✓ Completed</Badge>}
                      {!task.isCompleted && <Badge variant="outline">Available</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

