"use client"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, MousePointer, RefreshCw, Eye, Edit, Play } from "lucide-react"
import React from "react"

interface GameOfficeViewerProps {
  currentLocation: string
  onLocationChange: (location: string) => void
  tasks: any[]
  completedTasks: string[]
  taskData?: any
  onTaskSelect?: (taskId: string) => void
  onTaskReview?: (taskId: string) => void
  onShowTaskSelection?: (roomId: string, tasks: any[]) => void
  availableTasksForLocation?: (location: string) => any[]
  savedCatPosition?: { x: number; y: number; room: string } | null
  onCatPositionChange?: (position: { x: number; y: number; room: string }) => void
}

export const GameOfficeViewer = React.forwardRef<any, GameOfficeViewerProps>(
  (
    {
      currentLocation,
      onLocationChange,
      tasks,
      completedTasks,
      taskData,
      onTaskSelect,
      onTaskReview,
      onShowTaskSelection,
      availableTasksForLocation,
      savedCatPosition,
      onCatPositionChange,
    },
    ref,
  ) => {
    const gameRef = useRef<HTMLDivElement>(null)
    const officeGameRef = useRef<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Room information with flexible task mappings
    const roomInfo = {
      lobby: {
        name: "Lobby",
        description: "Welcome area and reception",
        tasks: [],
      },
      whiteboard: {
        name: "Strategy Room",
        description: "Brand strategy and planning workspace",
        tasks: ["task-1"], // Brand Identity Workshop
      },
      research: {
        name: "Research Center",
        description: "Market research and analytics hub",
        tasks: ["task-2", "task-4"], // Partnership Strategy & Competitive Intelligence
      },
      creative: {
        name: "Creative Studio",
        description: "Design and content creation space",
        tasks: ["task-3"], // Viral Content Creation
      },
      media: {
        name: "Media Room",
        description: "PR and media relations center",
        tasks: ["task-5"], // Crisis Management
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
          const game = new OfficeGame(gameRef.current!, tasks, completedTasks)

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

          game.onShowTaskSelection = (roomId: string, tasks: any[]) => {
            if (onShowTaskSelection) {
              onShowTaskSelection(roomId, tasks)
            }
          }

          // Restore cat position if available
          if (savedCatPosition) {
            setTimeout(() => {
              game.setCatPosition(savedCatPosition.x, savedCatPosition.y, savedCatPosition.room)
            }, 500)
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
    }, [tasks, completedTasks, savedCatPosition])

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
      if (availableTasksForLocation) {
        return availableTasksForLocation(currentLocation)
      }

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

    React.useImperativeHandle(ref, () => ({
      getCatPosition: () => {
        if (officeGameRef.current) {
          return officeGameRef.current.getCatPosition()
        }
        return { x: 433, y: 328, room: "lobby" }
      },
      setCatPosition: (x: number, y: number, room: string) => {
        if (officeGameRef.current) {
          officeGameRef.current.setCatPosition(x, y, room)
        }
      },
    }))

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
        {/* Room Navigation */}
        {currentRoom && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#2d407e] mb-1">Current Location: {currentRoom.name}</h3>
                  <p className="text-sm text-gray-600">{currentRoom.description}</p>
                </div>
                {currentRoomTasks.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#2d407e]">
                      {currentRoomTasks.filter((t) => t.isCompleted).length} / {currentRoomTasks.length} Tasks Complete
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentRoomTasks.length > 0 ? "Tasks available in this room" : "No tasks in this room"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d407e] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading office environment...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls and Room Info */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 p-4">
          

          {/* Current Room Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <MousePointer className="mr-2 h-4 w-4" />
                Current Location: {currentRoom?.name || "Unknown"}
              </h4>
              <p className="text-sm text-gray-600 mb-3">{currentRoom?.description}</p>

              {currentRoomTasks.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Available Tasks:</h5>
                  {currentRoomTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div>
                        <div className={task.isCompleted ? "text-green-600 font-medium" : "text-[#2d407e] font-medium"}>
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500">{task.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.isCompleted ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onTaskReview && onTaskReview(task.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onTaskSelect && onTaskSelect(task.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onTaskSelect && onTaskSelect(task.id)}
                            className="h-6 px-2 text-xs bg-[#2d407e] hover:bg-[#0e3968]"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Room Navigation */}
      </div>
    )
  },
)

GameOfficeViewer.displayName = "GameOfficeViewer"
