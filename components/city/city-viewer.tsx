"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Settings, Eye, Palette, RotateCcw, Save, Share, Zap, Trophy, Lock, Play, Info } from "lucide-react"

interface CityViewerProps {
  userProgress: {
    completedSimulations: string[]
    unlockedBuildings: any[]
    cityLevel: number
    totalXP: number
  }
  onBuildingClick?: (building: any) => void
  onSimulationStart?: (simulationId: string) => void
}

export function CityViewer({ userProgress, onBuildingClick, onSimulationStart }: CityViewerProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)
  const [cityData, setCityData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Building types and their unlock conditions
  const buildingTypes = {
    hospital: {
      name: "Medical Center",
      emoji: "🏥",
      unlockCondition: "Healthcare Administrator",
      category: "healthcare",
      description: "Unlock by completing healthcare simulations",
    },
    techHub: {
      name: "Tech Innovation Hub",
      emoji: "💻",
      unlockCondition: "Software Developer",
      category: "technology",
      description: "Unlock by completing technology simulations",
    },
    bank: {
      name: "Financial District",
      emoji: "🏦",
      unlockCondition: "Financial Analyst",
      category: "finance",
      description: "Unlock by completing finance simulations",
    },
    lab: {
      name: "Research Laboratory",
      emoji: "🔬",
      unlockCondition: "Superconductor Engineer",
      category: "engineering",
      description: "Unlock by completing engineering simulations",
    },
    studio: {
      name: "Creative Studio",
      emoji: "🎨",
      unlockCondition: "Creative Director",
      category: "arts",
      description: "Unlock by completing arts simulations",
    },
    school: {
      name: "Education Center",
      emoji: "🎓",
      unlockCondition: "Education Specialist",
      category: "education",
      description: "Unlock by completing education simulations",
    },
    factory: {
      name: "Innovation Factory",
      emoji: "🏭",
      unlockCondition: "Operations Manager",
      category: "business",
      description: "Unlock by completing business simulations",
    },
    courthouse: {
      name: "Justice Center",
      emoji: "⚖️",
      unlockCondition: "Legal Advisor",
      category: "law",
      description: "Unlock by completing law simulations",
    },
  }

  useEffect(() => {
    if (!gameRef.current) return

    // Initialize Phaser game
    const initPhaserGame = async () => {
      // Dynamically import Phaser to avoid SSR issues
      const Phaser = (await import("phaser")).default

      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        backgroundColor: "#87CEEB", // Sky blue
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
      }

      const buildings: any[] = []
      const placedBuildings: any[] = []
      let selectedBuildingSprite: any = null
      let isDragging = false
      const gridSize = 64
      let cityScene: any = null

      function preload(this: any) {
        cityScene = this

        // Create simple colored rectangles for buildings since we can't load external assets
        this.add
          .graphics()
          .fillStyle(0x90ee90) // Light green for grass
          .fillRect(0, 0, 800, 600)

        // Create grid
        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0xcccccc, 0.5)

        for (let x = 0; x < 800; x += gridSize) {
          graphics.moveTo(x, 0)
          graphics.lineTo(x, 600)
        }

        for (let y = 0; y < 600; y += gridSize) {
          graphics.moveTo(0, y)
          graphics.lineTo(800, y)
        }

        graphics.strokePath()

        // Create building sprites
        Object.entries(buildingTypes).forEach(([key, building]) => {
          const isUnlocked = userProgress.completedSimulations.includes(building.unlockCondition)

          // Create building sprite
          const graphics = this.add.graphics()
          const color = isUnlocked ? getColorForCategory(building.category) : 0x888888

          graphics.fillStyle(color)
          graphics.fillRoundedRect(0, 0, gridSize - 4, gridSize - 4, 8)

          if (!isUnlocked) {
            graphics.fillStyle(0x000000, 0.5)
            graphics.fillRoundedRect(0, 0, gridSize - 4, gridSize - 4, 8)
          }

          const texture = graphics.generateTexture(`building_${key}`, gridSize, gridSize)
          graphics.destroy()
        })
      }

      function create(this: any) {
        // Create building inventory on the right side
        let yOffset = 50

        Object.entries(buildingTypes).forEach(([key, building]) => {
          const isUnlocked = userProgress.completedSimulations.includes(building.unlockCondition)

          if (isUnlocked) {
            const buildingSprite = this.add
              .image(750, yOffset, `building_${key}`)
              .setInteractive({ draggable: true })
              .setScale(0.8)

            buildingSprite.buildingData = { key, ...building, isUnlocked }

            // Add building name text
            this.add
              .text(700, yOffset + 35, building.name, {
                fontSize: "10px",
                color: "#333",
                align: "center",
              })
              .setOrigin(0.5)

            buildings.push(buildingSprite)
            yOffset += 80
          }
        })

        // Handle drag events
        this.input.on("dragstart", (pointer: any, gameObject: any) => {
          if (gameObject.buildingData) {
            isDragging = true
            selectedBuildingSprite = gameObject
            gameObject.setTint(0xffff00) // Yellow tint when dragging
          }
        })

        this.input.on("drag", (pointer: any, gameObject: any, dragX: number, dragY: number) => {
          if (gameObject.buildingData && dragX < 650) {
            // Only allow dropping in city area
            gameObject.x = dragX
            gameObject.y = dragY
          }
        })

        this.input.on("dragend", (pointer: any, gameObject: any) => {
          if (gameObject.buildingData && isDragging) {
            const snapX = Math.round(gameObject.x / gridSize) * gridSize + gridSize / 2
            const snapY = Math.round(gameObject.y / gridSize) * gridSize + gridSize / 2

            // Check if position is valid (within city bounds and not occupied)
            if (snapX < 650 && snapY > 0 && snapY < 600) {
              const isOccupied = placedBuildings.some(
                (b) => Math.abs(b.x - snapX) < gridSize / 2 && Math.abs(b.y - snapY) < gridSize / 2,
              )

              if (!isOccupied) {
                // Place building
                gameObject.x = snapX
                gameObject.y = snapY
                gameObject.setScale(1)
                gameObject.clearTint()

                placedBuildings.push(gameObject)

                // Create a new copy in the inventory
                const newBuilding = cityScene.add
                  .image(750, gameObject.buildingData.originalY || 50, `building_${gameObject.buildingData.key}`)
                  .setInteractive({ draggable: true })
                  .setScale(0.8)

                newBuilding.buildingData = gameObject.buildingData
                buildings.push(newBuilding)
              } else {
                // Return to original position
                gameObject.x = 750
                gameObject.y = gameObject.buildingData.originalY || 50
                gameObject.setScale(0.8)
                gameObject.clearTint()
              }
            } else {
              // Return to original position
              gameObject.x = 750
              gameObject.y = gameObject.buildingData.originalY || 50
              gameObject.setScale(0.8)
              gameObject.clearTint()
            }

            isDragging = false
            selectedBuildingSprite = null
          }
        })

        // Handle building clicks
        this.input.on("gameobjectdown", (pointer: any, gameObject: any) => {
          if (gameObject.buildingData && placedBuildings.includes(gameObject)) {
            setSelectedBuilding(gameObject.buildingData)
            onBuildingClick?.(gameObject.buildingData)
          }
        })

        // Add decorative elements
        addDecorations(this)
      }

      function update() {
        // Game loop - can add animations here
      }

      function getColorForCategory(category: string): number {
        const colors: Record<string, number> = {
          healthcare: 0xff6b6b, // Red
          technology: 0x4ecdc4, // Teal
          finance: 0xffd93d, // Yellow
          engineering: 0x6c5ce7, // Purple
          arts: 0xff7675, // Pink
          education: 0x00b894, // Green
          business: 0x0984e3, // Blue
          law: 0x6c5ce7, // Purple
        }
        return colors[category] || 0x888888
      }

      function addDecorations(scene: any) {
        // Add roads
        const roadGraphics = scene.add.graphics()
        roadGraphics.fillStyle(0x555555)

        // Horizontal roads
        roadGraphics.fillRect(0, 200, 650, 20)
        roadGraphics.fillRect(0, 400, 650, 20)

        // Vertical roads
        roadGraphics.fillRect(200, 0, 20, 600)
        roadGraphics.fillRect(400, 0, 20, 600)

        // Add trees
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * 600
          const y = Math.random() * 550

          // Avoid roads
          if ((y > 190 && y < 230) || (y > 390 && y < 430) || (x > 190 && x < 230) || (x > 390 && x < 430)) {
            continue
          }

          const tree = scene.add.graphics()
          tree.fillStyle(0x228b22) // Forest green
          tree.fillCircle(x, y, 8)
          tree.fillStyle(0x8b4513) // Brown
          tree.fillRect(x - 2, y + 8, 4, 12)
        }

        // Add water feature
        const water = scene.add.graphics()
        water.fillStyle(0x1e90ff) // Dodger blue
        water.fillEllipse(100, 500, 80, 40)

        // Add clouds
        for (let i = 0; i < 5; i++) {
          const cloud = scene.add.graphics()
          cloud.fillStyle(0xffffff, 0.8)
          const x = Math.random() * 700
          const y = Math.random() * 100 + 20

          cloud.fillCircle(x, y, 15)
          cloud.fillCircle(x + 20, y, 20)
          cloud.fillCircle(x + 40, y, 15)
        }
      }

      phaserGameRef.current = new Phaser.Game(config)
      setIsLoading(false)
    }

    initPhaserGame()

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [userProgress])

  const handleResetCity = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.restart()
    }
  }

  const handleSaveCity = () => {
    // In a real app, this would save to the backend
    console.log("Saving city layout...")
  }

  return (
    <div className="w-full space-y-6">
      {/* City Controls */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Building className="mr-3 h-6 w-6" />
            Your Future City Builder
          </CardTitle>
          <CardDescription className="text-blue-100">
            Drag and drop buildings to create your personalized career city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{userProgress.cityLevel}</div>
                <div className="text-xs opacity-90">City Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userProgress.unlockedBuildings.length}</div>
                <div className="text-xs opacity-90">Buildings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userProgress.totalXP}</div>
                <div className="text-xs opacity-90">Total XP</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetCity}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveCity}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* City Canvas */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  City View
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Zap className="mr-1 h-3 w-3" />
                    Interactive
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <Building className="mr-1 h-3 w-3" />
                    3D Ready
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading && (
                <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your city...</p>
                  </div>
                </div>
              )}
              <div ref={gameRef} className="w-full" style={{ height: "600px" }} />
            </CardContent>
          </Card>
        </div>

        {/* Building Inventory & Info */}
        <div className="space-y-6">
          {/* Building Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Palette className="mr-2 h-5 w-5" />
                Available Buildings
              </CardTitle>
              <CardDescription>Drag buildings to your city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(buildingTypes).map(([key, building]) => {
                const isUnlocked = userProgress.completedSimulations.includes(building.unlockCondition)

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isUnlocked
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{building.emoji}</span>
                        <div>
                          <h4 className="font-medium text-sm">{building.name}</h4>
                          <p className="text-xs text-gray-500">{building.category}</p>
                        </div>
                      </div>
                      {isUnlocked ? (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    {!isUnlocked && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">{building.description}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs bg-transparent"
                          onClick={() => onSimulationStart?.(building.unlockCondition)}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start Simulation
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Selected Building Info */}
          {selectedBuilding && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="mr-2 h-5 w-5" />
                  Building Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{selectedBuilding.emoji}</div>
                  <h3 className="font-bold">{selectedBuilding.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{selectedBuilding.category}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unlocked by:</span>
                    <span className="font-medium">{selectedBuilding.unlockCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Trophy className="mr-1 h-3 w-3" />
                      Unlocked
                    </Badge>
                  </div>
                </div>

                <Button className="w-full mt-4" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Building
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">How to Build</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-700 space-y-2">
              <p>
                🏗️ <strong>Drag & Drop:</strong> Drag buildings from the inventory to your city
              </p>
              <p>
                🎯 <strong>Snap to Grid:</strong> Buildings automatically align to the grid
              </p>
              <p>
                🔓 <strong>Unlock More:</strong> Complete simulations to unlock new buildings
              </p>
              <p>
                💾 <strong>Save & Share:</strong> Save your city and share with friends
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
