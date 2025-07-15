"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BuildingIcon,
  Hospital,
  Briefcase,
  Cpu,
  Palette,
  DollarSign,
  Wrench,
  GraduationCap,
  Play,
  Lock,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Sparkles,
} from "lucide-react"

interface Simulation {
  id: string
  title: string
  category: string
  description: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status: "locked" | "unlocked" | "in-progress" | "completed"
  progress?: number
  position: { x: number; y: number }
  icon: any
  color: string
  unlockRequirement?: string
}

interface CityBuilding {
  id: string
  name: string
  type: string
  position: { x: number; y: number }
  icon: any
  color: string
  unlocked: boolean
  relatedSimulation: string
}

export function GameWorldViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Mock data for simulations positioned across the world
  const simulations: Simulation[] = [
    {
      id: "brand-manager",
      title: "Brand Manager for Celebrity",
      category: "Marketing",
      description: "Create marketing campaigns and manage brand partnerships for a celebrity client",
      duration: "45 min",
      difficulty: "Beginner",
      status: "in-progress",
      progress: 65,
      position: { x: 150, y: 200 },
      icon: Palette,
      color: "#ec4899",
    },
    {
      id: "superconductor-engineer",
      title: "Superconductor Engineer",
      category: "Engineering",
      description: "Design materials for next-generation transportation systems",
      duration: "60 min",
      difficulty: "Advanced",
      status: "unlocked",
      position: { x: 400, y: 150 },
      icon: Wrench,
      color: "#3b82f6",
    },
    {
      id: "healthcare-admin",
      title: "Healthcare Administrator",
      category: "Healthcare",
      description: "Manage hospital operations and patient care systems",
      duration: "50 min",
      difficulty: "Intermediate",
      status: "completed",
      position: { x: 300, y: 300 },
      icon: Hospital,
      color: "#ef4444",
    },
    {
      id: "software-developer",
      title: "Software Developer",
      category: "Technology",
      description: "Build applications and solve complex programming challenges",
      duration: "55 min",
      difficulty: "Intermediate",
      status: "unlocked",
      position: { x: 500, y: 250 },
      icon: Cpu,
      color: "#8b5cf6",
    },
    {
      id: "financial-analyst",
      title: "Financial Analyst",
      category: "Finance",
      description: "Analyze market trends and make investment recommendations",
      duration: "40 min",
      difficulty: "Beginner",
      status: "locked",
      position: { x: 250, y: 400 },
      icon: DollarSign,
      color: "#f59e0b",
      unlockRequirement: "Complete Healthcare Administrator",
    },
    {
      id: "business-consultant",
      title: "Business Consultant",
      category: "Business",
      description: "Help companies solve strategic challenges and improve operations",
      duration: "50 min",
      difficulty: "Advanced",
      status: "locked",
      position: { x: 450, y: 350 },
      icon: Briefcase,
      color: "#6366f1",
      unlockRequirement: "Complete 3 simulations",
    },
    {
      id: "education-director",
      title: "Education Director",
      category: "Education",
      description: "Lead educational programs and curriculum development",
      duration: "45 min",
      difficulty: "Intermediate",
      status: "locked",
      position: { x: 350, y: 100 },
      icon: GraduationCap,
      color: "#10b981",
      unlockRequirement: "Complete Brand Manager",
    },
  ]

  // Buildings that unlock based on completed simulations
  const buildings: CityBuilding[] = [
    {
      id: "hospital",
      name: "City Hospital",
      type: "Healthcare",
      position: { x: 280, y: 280 },
      icon: Hospital,
      color: "#ef4444",
      unlocked: true, // Healthcare Admin completed
      relatedSimulation: "healthcare-admin",
    },
    {
      id: "tech-tower",
      name: "Tech Tower",
      type: "Technology",
      position: { x: 480, y: 230 },
      icon: BuildingIcon,
      color: "#3b82f6",
      unlocked: false,
      relatedSimulation: "software-developer",
    },
    {
      id: "creative-studio",
      name: "Creative Studio",
      type: "Arts",
      position: { x: 130, y: 180 },
      icon: Palette,
      color: "#ec4899",
      unlocked: false,
      relatedSimulation: "brand-manager",
    },
    {
      id: "bank",
      name: "Financial Center",
      type: "Finance",
      position: { x: 230, y: 380 },
      icon: DollarSign,
      color: "#f59e0b",
      unlocked: false,
      relatedSimulation: "financial-analyst",
    },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 500

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#0e345e")
    gradient.addColorStop(0.25, "#454783")
    gradient.addColorStop(0.75, "#d59f7b")
    gradient.addColorStop(1, "#ecae6c")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add some texture/pattern
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Draw paths between simulations
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // Connect completed/unlocked simulations
    const unlockedSims = simulations.filter((s) => s.status !== "locked")
    for (let i = 0; i < unlockedSims.length - 1; i++) {
      const sim1 = unlockedSims[i]
      const sim2 = unlockedSims[i + 1]
      ctx.beginPath()
      ctx.moveTo(sim1.position.x, sim1.position.y)
      ctx.lineTo(sim2.position.x, sim2.position.y)
      ctx.stroke()
    }

    ctx.setLineDash([])

    // Draw buildings first (background layer)
    buildings.forEach((building) => {
      const { x, y } = building.position

      if (building.unlocked) {
        // Draw building shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        ctx.fillRect(x - 12, y - 8, 24, 16)

        // Draw building
        ctx.fillStyle = building.color
        ctx.fillRect(x - 10, y - 10, 20, 20)

        // Add building details
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fillRect(x - 8, y - 8, 4, 4)
        ctx.fillRect(x - 2, y - 8, 4, 4)
        ctx.fillRect(x + 4, y - 8, 4, 4)
        ctx.fillRect(x - 8, y - 2, 4, 4)
        ctx.fillRect(x - 2, y - 2, 4, 4)
        ctx.fillRect(x + 4, y - 2, 4, 4)
      }
    })

    // Draw simulation nodes
    simulations.forEach((simulation) => {
      const { x, y } = simulation.position
      const radius = 30

      // Draw node shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw node background
      let nodeColor = "#9ca3af" // locked color
      if (simulation.status === "completed") {
        nodeColor = "#ffd700" // gold
      } else if (simulation.status === "in-progress") {
        nodeColor = "#3b82f6" // blue
      } else if (simulation.status === "unlocked") {
        nodeColor = simulation.color
      }

      ctx.fillStyle = nodeColor
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Add node border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 3
      ctx.stroke()

      // Add progress ring for in-progress simulations
      if (simulation.status === "in-progress" && simulation.progress) {
        ctx.strokeStyle = "#ffd700"
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(x, y, radius + 5, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * simulation.progress) / 100)
        ctx.stroke()
      }

      // Add status indicator
      if (simulation.status === "completed") {
        ctx.fillStyle = "#065f46"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("✓", x, y + 7)
      } else if (simulation.status === "locked") {
        ctx.fillStyle = "#374151"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText("🔒", x, y + 5)
      } else {
        // Draw category icon representation
        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        let iconText = "●"
        if (simulation.category === "Marketing") iconText = "🎨"
        else if (simulation.category === "Engineering") iconText = "⚙️"
        else if (simulation.category === "Healthcare") iconText = "🏥"
        else if (simulation.category === "Technology") iconText = "💻"
        else if (simulation.category === "Finance") iconText = "💰"
        else if (simulation.category === "Business") iconText = "💼"
        else if (simulation.category === "Education") iconText = "🎓"

        ctx.fillText(iconText, x, y + 5)
      }

      // Add hover effect
      if (hoveredItem === simulation.id) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
        ctx.lineWidth = 2
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    })

    // Add world title
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Your Career World", canvas.width / 2, 40)

    ctx.font = "16px Arial"
    ctx.fillText("Explore simulations and unlock new areas", canvas.width / 2, 65)
  }, [hoveredItem])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is on a simulation node
    simulations.forEach((simulation) => {
      const distance = Math.sqrt(Math.pow(x - simulation.position.x, 2) + Math.pow(y - simulation.position.y, 2))
      if (distance <= 30) {
        setSelectedSimulation(simulation)
      }
    })
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let hoveredId: string | null = null

    // Check if mouse is over a simulation node
    simulations.forEach((simulation) => {
      const distance = Math.sqrt(Math.pow(x - simulation.position.x, 2) + Math.pow(y - simulation.position.y, 2))
      if (distance <= 30) {
        hoveredId = simulation.id
        canvas.style.cursor = simulation.status !== "locked" ? "pointer" : "not-allowed"
      }
    })

    if (!hoveredId) {
      canvas.style.cursor = "default"
    }

    setHoveredItem(hoveredId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "unlocked":
        return <Play className="h-4 w-4 text-brand-primary" />
      default:
        return <Lock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "unlocked":
        return "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* World Canvas */}
      <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
          <CardTitle className="flex items-center text-2xl">
            <Sparkles className="mr-3 h-6 w-6" />
            Your Career World
          </CardTitle>
          <CardDescription className="text-white/90 text-lg">
            Click on simulations to explore different career paths and unlock new areas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              className="w-full h-auto border-0 game-world-container"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <h4 className="font-bold text-sm mb-3 flex items-center">
                <Trophy className="mr-2 h-4 w-4 text-yellow-600" />
                Legend
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-brand-primary rounded-full border-2 border-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BuildingIcon className="mr-3 h-5 w-5 text-brand-primary" />
            All Simulations
          </CardTitle>
          <CardDescription>Your complete career exploration journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((simulation) => (
              <div
                key={simulation.id}
                className={`border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  simulation.status !== "locked" ? "hover:shadow-md hover:scale-105" : "opacity-60 cursor-not-allowed"
                } ${getStatusColor(simulation.status)}`}
                onClick={() => simulation.status !== "locked" && setSelectedSimulation(simulation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(simulation.status)}
                    <Badge variant="outline" className="text-xs">
                      {simulation.category}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {simulation.difficulty}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm mb-2">{simulation.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{simulation.description}</p>

                {simulation.status === "in-progress" && simulation.progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{simulation.progress}%</span>
                    </div>
                    <Progress value={simulation.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {simulation.duration}
                  </span>
                  {simulation.status === "locked" && simulation.unlockRequirement && (
                    <span className="text-xs text-gray-500">🔒 {simulation.unlockRequirement}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Detail Modal */}
      {selectedSimulation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedSimulation.title}</CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    {selectedSimulation.category} • {selectedSimulation.difficulty}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSimulation(null)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <p className="text-gray-700 text-lg">{selectedSimulation.description}</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto text-brand-primary mb-2" />
                    <div className="font-semibold">{selectedSimulation.duration}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Star className="h-6 w-6 mx-auto text-brand-secondary mb-2" />
                    <div className="font-semibold">{selectedSimulation.difficulty}</div>
                    <div className="text-sm text-gray-500">Difficulty</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto text-brand-accent mb-2" />
                    <div className="font-semibold">{selectedSimulation.category}</div>
                    <div className="text-sm text-gray-500">Category</div>
                  </div>
                </div>

                {selectedSimulation.status === "in-progress" && selectedSimulation.progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Your Progress</span>
                      <span>{selectedSimulation.progress}%</span>
                    </div>
                    <Progress value={selectedSimulation.progress} className="h-3" />
                  </div>
                )}

                <div className="flex space-x-3">
                  {selectedSimulation.status === "unlocked" && (
                    <Button className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90">
                      <Play className="mr-2 h-4 w-4" />
                      Start Simulation
                    </Button>
                  )}
                  {selectedSimulation.status === "in-progress" && (
                    <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90">
                      <Play className="mr-2 h-4 w-4" />
                      Continue Simulation
                    </Button>
                  )}
                  {selectedSimulation.status === "completed" && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                  )}
                  {selectedSimulation.status === "locked" && (
                    <Button disabled className="flex-1">
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </Button>
                  )}
                </div>

                {selectedSimulation.unlockRequirement && selectedSimulation.status === "locked" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">Unlock Requirement:</span>
                    </div>
                    <p className="text-yellow-700 mt-1">{selectedSimulation.unlockRequirement}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
