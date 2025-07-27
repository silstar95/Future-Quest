"use client"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, MousePointer, RefreshCw } from "lucide-react"

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
        location: getTaskLocation(task.id),
        isCompleted: task.isCompleted || false,
        data: task.data,
      }))

      const completedTaskIds = formattedTasks.filter((task) => task.isCompleted).map((task) => task.id)

      console.log("Initializing FinanceOfficeGame with tasks:", formattedTasks)

      const game = new FinanceOfficeGame(gameRef.current, formattedTasks, completedTaskIds)

      // Set up event handlers
      game.onLocationChange = (location: string) => {
        console.log("Location changed to:", location)
        setCurrentLocation(location)
      }

      game.onTaskSelect = (taskId: string) => {
        console.log("Task selected:", taskId)
        const numericTaskId = Number.parseInt(taskId)
        if (onTaskSelect) {
          onTaskSelect(numericTaskId)
        }
      }

      game.onTaskReview = (taskId: string) => {
        console.log("Task review:", taskId)
        const numericTaskId = Number.parseInt(taskId)
        if (onTaskSelect) {
          onTaskSelect(numericTaskId)
        }
      }

      financeOfficeGameRef.current = game
      setIsLoading(false)
      console.log("FinanceOfficeGame initialized successfully")
    } catch (err) {
      console.error("Error initializing finance office game:", err)
      setError("Failed to load finance office viewer. Please refresh the page.")
      setIsLoading(false)
    } finally {
      initializationRef.current = false
    }
  }

  // Initialize game only once when component mounts
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const timer = setTimeout(initializeGame, 100)
      return () => clearTimeout(timer)
    }
  }, []) // Empty dependency array - only run once

  // Update task completion status when tasks change
  useEffect(() => {
    if (financeOfficeGameRef.current && !isLoading && tasks) {
      try {
        const completedTaskIds = tasks.filter((task) => task.isCompleted).map((task) => task.id.toString())
        console.log("Updating task completion:", completedTaskIds)
        if (financeOfficeGameRef.current.updateTaskCompletion) {
          financeOfficeGameRef.current.updateTaskCompletion(completedTaskIds)
        }
      } catch (e) {
        console.warn("Error updating task completion:", e)
      }
    }
  }, [tasks, isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (financeOfficeGameRef.current) {
        try {
          financeOfficeGameRef.current.destroy()
        } catch (e) {
          console.warn("Error destroying game on unmount:", e)
        }
        financeOfficeGameRef.current = null
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <Keyboard className="mr-2 h-4 w-4" />
              Controls
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Move Character:</span>
                <Badge variant="outline">WASD or Arrow Keys</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Enter Room:</span>
                <Badge variant="outline">Walk Close or Click</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Start Task:</span>
                <Badge variant="outline">Enter Room with Task</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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

      {/* Quick Room Navigation */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Quick Room Navigation</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {Object.entries(roomInfo).map(([roomId, room]) => {
              const roomTasks = room.tasks.map((taskId) => tasks.find((t) => t.id === taskId)).filter(Boolean)
              const hasCompletedTasks = roomTasks.some((task) => task.isCompleted)
              const hasActiveTasks = roomTasks.some((task) => !task.isCompleted)

              return (
                <Button
                  key={roomId}
                  variant={currentLocation === roomId ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoomNavigation(roomId)}
                  className="flex flex-col items-center p-3 h-auto"
                  disabled={isLoading}
                >
                  <div className="text-lg mb-1">
                    {roomId === "lobby" && "🏢"}
                    {roomId === "analysis" && "📊"}
                    {roomId === "investment" && "💰"}
                    {roomId === "treasury" && "🏦"}
                    {roomId === "research" && "📈"}
                    {roomId === "risk" && "⚖️"}
                  </div>
                  <div className="text-xs font-medium">{room.name}</div>
                  <div className="flex gap-1 mt-1">
                    {hasCompletedTasks && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    {hasActiveTasks && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
