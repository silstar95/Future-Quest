"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface GameOfficeViewerProps {
  currentLocation: string
  onLocationChange: (location: string) => void
  tasks: any[]
  completedTasks: string[]
  currentTask: any
}

export function GameOfficeViewer({
  currentLocation,
  onLocationChange,
  tasks,
  completedTasks,
  currentTask,
}: GameOfficeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [characterPos, setCharacterPos] = useState({ x: 400, y: 500 })

  const rooms = {
    lobby: {
      x: 400,
      y: 500,
      width: 120,
      height: 80,
      label: "Lobby",
      color: "#E3F2FD",
      description: "Welcome area and reception",
    },
    whiteboard: {
      x: 150,
      y: 200,
      width: 140,
      height: 100,
      label: "Strategy Room",
      color: "#F3E5F5",
      description: "Brand strategy and planning",
    },
    research: {
      x: 600,
      y: 200,
      width: 140,
      height: 100,
      label: "Research Center",
      color: "#E8F5E8",
      description: "Market research and analytics",
    },
    creative: {
      x: 150,
      y: 350,
      width: 140,
      height: 100,
      label: "Creative Studio",
      color: "#FFF3E0",
      description: "Design and content creation",
    },
    media: {
      x: 600,
      y: 350,
      width: 140,
      height: 100,
      label: "Media Room",
      color: "#FFEBEE",
      description: "PR and media relations",
    },
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw office background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#f8fafc")
    gradient.addColorStop(1, "#e2e8f0")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid pattern
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw rooms
    Object.entries(rooms).forEach(([roomId, room]) => {
      const isCurrentLocation = currentLocation === roomId
      const isHovered = hoveredRoom === roomId
      const hasCurrentTask = currentTask && currentTask.location === roomId
      const hasCompletedTask = tasks.some((task) => task.location === roomId && completedTasks.includes(task.id))

      // Room background
      ctx.fillStyle = room.color
      if (isCurrentLocation) {
        ctx.fillStyle = "#3b82f6"
      } else if (hasCurrentTask) {
        ctx.fillStyle = "#10b981"
      }

      ctx.fillRect(room.x, room.y, room.width, room.height)

      // Room border
      ctx.strokeStyle = isCurrentLocation ? "#1d4ed8" : hasCurrentTask ? "#059669" : "#94a3b8"
      ctx.lineWidth = isHovered ? 4 : 2
      ctx.strokeRect(room.x, room.y, room.width, room.height)

      // Room label
      ctx.fillStyle = isCurrentLocation ? "#ffffff" : "#1f2937"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(room.label, room.x + room.width / 2, room.y + room.height / 2)

      // Task indicators
      if (hasCurrentTask) {
        // Current task indicator
        ctx.beginPath()
        ctx.arc(room.x + room.width - 15, room.y + 15, 8, 0, 2 * Math.PI)
        ctx.fillStyle = "#ef4444"
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px Arial"
        ctx.fillText("!", room.x + room.width - 15, room.y + 19)
      } else if (hasCompletedTask) {
        // Completed task indicator
        ctx.beginPath()
        ctx.arc(room.x + room.width - 15, room.y + 15, 8, 0, 2 * Math.PI)
        ctx.fillStyle = "#22c55e"
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px Arial"
        ctx.fillText("✓", room.x + room.width - 15, room.y + 19)
      }

      // Room icons
      ctx.font = "20px Arial"
      const icons = {
        lobby: "🏢",
        whiteboard: "📋",
        research: "📊",
        creative: "🎨",
        media: "📺",
      }
      ctx.fillText(icons[roomId as keyof typeof icons], room.x + 20, room.y + 30)
    })

    // Draw character
    const currentRoom = rooms[currentLocation as keyof typeof rooms]
    if (currentRoom) {
      const charX = currentRoom.x + currentRoom.width / 2
      const charY = currentRoom.y + currentRoom.height / 2

      // Character shadow
      ctx.beginPath()
      ctx.ellipse(charX, charY + 15, 12, 6, 0, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fill()

      // Character body
      ctx.beginPath()
      ctx.arc(charX, charY, 12, 0, 2 * Math.PI)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
      ctx.strokeStyle = "#1d4ed8"
      ctx.lineWidth = 2
      ctx.stroke()

      // Character face
      ctx.fillStyle = "#ffffff"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("😊", charX, charY + 5)
    }

    // Draw connecting paths
    ctx.strokeStyle = "#cbd5e1"
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])

    // Connect lobby to other rooms
    const lobby = rooms.lobby
    Object.entries(rooms).forEach(([roomId, room]) => {
      if (roomId !== "lobby") {
        ctx.beginPath()
        ctx.moveTo(lobby.x + lobby.width / 2, lobby.y + lobby.height / 2)
        ctx.lineTo(room.x + room.width / 2, room.y + room.height / 2)
        ctx.stroke()
      }
    })

    ctx.setLineDash([])
  }, [currentLocation, hoveredRoom, currentTask, completedTasks])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check which room was clicked
    Object.entries(rooms).forEach(([roomId, room]) => {
      if (x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height) {
        onLocationChange(roomId)
      }
    })
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let hoveredRoomId = null
    Object.entries(rooms).forEach(([roomId, room]) => {
      if (x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height) {
        hoveredRoomId = roomId
      }
    })

    setHoveredRoom(hoveredRoomId)
  }

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="border border-gray-300 rounded-lg cursor-pointer w-full bg-white shadow-inner"
        style={{ maxHeight: "600px" }}
      />

      {/* Room Info */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(rooms).map(([roomId, room]) => {
          const isCurrentLocation = currentLocation === roomId
          const hasCurrentTask = currentTask && currentTask.location === roomId
          const hasCompletedTask = tasks.some((task) => task.location === roomId && completedTasks.includes(task.id))

          return (
            <Card
              key={roomId}
              className={`cursor-pointer transition-all ${
                isCurrentLocation
                  ? "border-blue-500 bg-blue-50"
                  : hasCurrentTask
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onLocationChange(roomId)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-lg mb-1">
                  {roomId === "lobby" && "🏢"}
                  {roomId === "whiteboard" && "📋"}
                  {roomId === "research" && "📊"}
                  {roomId === "creative" && "🎨"}
                  {roomId === "media" && "📺"}
                </div>
                <h4 className="font-medium text-xs mb-1">{room.label}</h4>
                <p className="text-xs text-gray-600 mb-2">{room.description}</p>
                <div className="flex justify-center gap-1">
                  {isCurrentLocation && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {hasCurrentTask && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                  {hasCompletedTask && (
                    <Badge variant="outline" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation Help */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>💡 Navigation:</strong> Click on rooms to move around the office.
          {currentTask && (
            <span className="text-green-600 font-medium">
              {" "}
              Go to the <strong>{currentTask.location}</strong> to start your next mission!
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
