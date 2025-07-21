"use client"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, MousePointer, RefreshCw } from "lucide-react"

interface GameOfficeViewerProps {
  currentLocation: string
  onLocationChange: (location: string) => void
  tasks: any[]
  completedTasks: string[]
  currentTask?: any
  taskData?: any
  onTaskSelect?: (taskId: string) => void
  onTaskReview?: (taskId: string) => void
}

export function GameOfficeViewer({
  currentLocation,
  onLocationChange,
  tasks,
  completedTasks,
  currentTask,
  taskData,
  onTaskSelect,
  onTaskReview,
}: GameOfficeViewerProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const officeGameRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Room information with task mappings
  const roomInfo = {
    lobby: {
      name: "Lobby",
      description: "Welcome area and reception",
      tasks: [],
    },
    whiteboard: {
      name: "Strategy Room",
      description: "Brand strategy and planning workspace",
      tasks: ["task-1"],
    },
    research: {
      name: "Research Center",
      description: "Market research and analytics hub",
      tasks: ["task-2", "task-4"], // Both Partnership Strategy and Competitive Intelligence
    },
    creative: {
      name: "Creative Studio",
      description: "Design and content creation space",
      tasks: ["task-3"],
    },
    media: {
      name: "Media Room",
      description: "PR and media relations center",
      tasks: ["task-5"],
    },
  }

  useEffect(() => {
    if (!gameRef.current) return

    const initializeGame = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Clean up existing game
        if (officeGameRef.current) {
          officeGameRef.current.destroy()
          officeGameRef.current = null
        }

        // Clear the container
        gameRef.current!.innerHTML = ""

        // Dynamically import OfficeGame to avoid SSR issues
        const { OfficeGame } = await import("@/lib/office-game")
        const game = new OfficeGame(gameRef.current!, tasks, completedTasks, currentTask)

        // Set up event handlers
        game.onLocationChange = (location: string) => {
          onLocationChange(location)
        }

        game.onTaskSelect = (taskId: string) => {
          if (onTaskSelect) {
            onTaskSelect(taskId)
          }
        }

        game.onTaskReview = (taskId: string) => {
          if (onTaskReview) {
            onTaskReview(taskId)
          }
        }

        officeGameRef.current = game
        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing office game:", err)
        setError("Failed to load office viewer. Please refresh the page.")
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeGame, 100)

    return () => {
      clearTimeout(timer)
      if (officeGameRef.current) {
        officeGameRef.current.destroy()
        officeGameRef.current = null
      }
    }
  }, [tasks, completedTasks, currentTask])

  const handleRoomNavigation = (roomId: string) => {
    if (officeGameRef.current) {
      officeGameRef.current.moveCatToRoom(roomId)
    }
  }

  const handleRefresh = () => {
    if (gameRef.current) {
      // Force re-initialization
      const event = new Event("refresh")
      gameRef.current.dispatchEvent(event)
      window.location.reload()
    }
  }

  const getCurrentRoomTasks = () => {
    const room = roomInfo[currentLocation as keyof typeof roomInfo]
    if (!room) return []

    return room.tasks
      .map((taskId) => tasks.find((t) => t.id === taskId))
      .filter(Boolean)
      .map((task) => ({
        ...task,
        isCompleted: completedTasks.includes(task.id),
        hasData: taskData && taskData[task.id],
      }))
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
          className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-gray-200 overflow-hidden"
          style={{ minHeight: "600px" }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading office environment...</p>
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
                <span>Move Cat:</span>
                <Badge variant="outline">WASD or Arrow Keys</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Enter Room:</span>
                <Badge variant="outline">Click or Walk Close</Badge>
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
                      {task.hasData && <Badge variant="secondary">Has Data</Badge>}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(roomInfo).map(([roomId, room]) => {
              const roomTasks = room.tasks.map((taskId) => tasks.find((t) => t.id === taskId)).filter(Boolean)
              const hasCompletedTasks = roomTasks.some((task) => completedTasks.includes(task.id))
              const hasActiveTasks = roomTasks.some((task) => !completedTasks.includes(task.id))

              return (
                <Button
                  key={roomId}
                  variant={currentLocation === roomId ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoomNavigation(roomId)}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <div className="text-lg mb-1">
                    {roomId === "lobby" && "🏢"}
                    {roomId === "whiteboard" && "📋"}
                    {roomId === "research" && "📊"}
                    {roomId === "creative" && "🎨"}
                    {roomId === "media" && "📺"}
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
