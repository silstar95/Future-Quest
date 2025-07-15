"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building,
  Settings,
  Eye,
  Palette,
  RotateCcw,
  Save,
  Share,
  Zap,
  Trophy,
  Lock,
  Play,
  Info,
  ArrowLeft,
  Check,
} from "lucide-react"
import { CityGame } from "@/lib/city-game"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  saveBuildingPositions,
  getBuildingPositions,
  saveBuildingPositionSmooth,
  forceSavePendingPositions,
} from "@/lib/firebase-service"
import { useAuth } from "@/hooks/use-auth"

interface GameifiedCityViewerProps {
  userProgress: {
    completedSimulations: string[]
    unlockedBuildings: any[]
    cityLevel: number
    totalXP: number
  }
  onBuildingClick?: (building: any) => void
  onSimulationStart?: (simulationId: string) => void
}

export function GameifiedCityViewer({ userProgress, onBuildingClick, onSimulationStart }: GameifiedCityViewerProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<CityGame | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [tooltip, setTooltip] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [buildingPositions, setBuildingPositions] = useState<{ [key: string]: { x: number; y: number } }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPositions, setIsLoadingPositions] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const { user } = useAuth()

  // Building types and their unlock conditions
  const buildingTypes = {
    advertising: {
      id: "advertising",
      name: "Advertising Agency",
      emoji: "📢",
      unlockRequirement: "brand-marketing",
      category: "marketing",
      description: "Master branding and marketing strategies",
      simulationId: "brand-marketing",
    },
    "research-lab": {
      id: "research-lab",
      name: "Research Laboratory",
      emoji: "🔬",
      unlockRequirement: "material-science",
      category: "science",
      description: "Explore material science and innovation",
      simulationId: "material-science",
    },
    bank: {
      id: "bank",
      name: "Financial Center",
      emoji: "🏦",
      unlockRequirement: "finance-simulation",
      category: "finance",
      description: "Learn finance and investment strategies",
      simulationId: "finance-simulation",
    },
    hospital: {
      id: "hospital",
      name: "Medical Center",
      emoji: "🏥",
      unlockRequirement: "healthcare-simulation",
      category: "healthcare",
      description: "Experience healthcare management",
      simulationId: "healthcare-simulation",
    },
  }

  const buildings = Object.values(buildingTypes).map((building) => ({
    ...building,
    type: building.category,
    isUnlocked: userProgress?.completedSimulations?.includes(building.simulationId) || building.id === "advertising",
  }))

  const studentStats = {
    name: "Student",
    level: userProgress?.cityLevel || 1,
    experience: userProgress?.totalXP || 0,
    maxExperience: 1000,
    completedSimulations: userProgress?.completedSimulations || [],
    totalSimulations: 4,
    badges: [],
    unlockedBuildings: userProgress?.unlockedBuildings || [],
  }

  const loadBuildingPositions = async () => {
    if (!user) {
      setIsLoadingPositions(false)
      return
    }

    try {
      console.log("Loading building positions for user:", user.uid)
      setIsLoadingPositions(true)

      const result = await getBuildingPositions(user.uid)
      if (result.success && result.data) {
        console.log("Loaded building positions:", result.data)
        setBuildingPositions(result.data)
      } else {
        console.log("No saved building positions found, using defaults")
        setBuildingPositions({})
      }
    } catch (error) {
      console.error("Error loading building positions:", error)
      setBuildingPositions({})
    } finally {
      setIsLoadingPositions(false)
    }
  }

  // Debounced save mechanism
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSavesRef = useRef<{ [buildingId: string]: { x: number; y: number } }>({})

  // Smooth position saving handler with debouncing
  const handleSavePositionSmooth = async (buildingId: string, x: number, y: number) => {
    if (!user) return

    try {
      setSaveStatus("saving")

      // Update local state immediately for smooth UX (but don't trigger game re-render)
      setBuildingPositions((prev) => ({
        ...prev,
        [buildingId]: { x, y },
      }))

      // Add to pending saves
      pendingSavesRef.current[buildingId] = { x, y }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Save all pending positions
          const positionsToSave = { ...pendingSavesRef.current }
          pendingSavesRef.current = {}

          // Save to database
          await saveBuildingPositionSmooth(user.uid, buildingId, x, y)

          // Show saved status briefly
          setSaveStatus("saved")
          setTimeout(() => setSaveStatus("idle"), 2000)
        } catch (error) {
          console.error("Error saving building position:", error)
          setSaveStatus("error")
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      }, 500) // 500ms debounce delay

    } catch (error) {
      console.error("Error in handleSavePositionSmooth:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Batch save handler (for manual saves)
  const handleSavePositions = async (positions: { [key: string]: { x: number; y: number } }) => {
    if (!user) return

    try {
      setIsSaving(true)
      console.log("Batch saving building positions:", positions)

      const result = await saveBuildingPositions(user.uid, positions)
      if (result.success) {
        console.log("Building positions saved successfully")
        setBuildingPositions(positions)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        console.error("Failed to save building positions:", result.error)
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    } catch (error) {
      console.error("Error saving building positions:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Load building positions first, then initialize game
  useEffect(() => {
    if (user) {
      loadBuildingPositions()
    } else {
      setIsLoadingPositions(false)
    }
  }, [user])

  // Initialize game after positions are loaded
  useEffect(() => {
    if (!gameRef.current || isLoadingPositions) return

    const initPhaserGame = async () => {
      try {
        console.log("Initializing Phaser game with positions:", buildingPositions)

        const cityGame = new CityGame(gameRef.current!, buildings, studentStats, buildingPositions)

        cityGame.onBuildingSelect = (buildingId: string, isUnlocked: boolean) => {
          const building = buildings.find((b) => b.id === buildingId)
          if (building && isUnlocked) {
            setSelectedBuilding(building)
            onBuildingClick?.(building)
          }
        }

        cityGame.onUnlockAnimation = (buildingId: string) => {
          console.log(`Building ${buildingId} unlocked with animation!`)
        }

        cityGame.onShowTooltip = (tooltipData: any) => {
          setTooltip(tooltipData)
        }

        cityGame.onShowModal = (modalData: any) => {
          setModal(modalData)
        }

        // Use smooth saving for individual building moves
        cityGame.onSavePositionSmooth = async (buildingId: string, x: number, y: number) => {
          await handleSavePositionSmooth(buildingId, x, y)
        }

        // Keep batch save for manual saves
        cityGame.onSavePositions = async (positions: { [key: string]: { x: number; y: number } }) => {
          await handleSavePositions(positions)
        }

        phaserGameRef.current = cityGame
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing Phaser game:", error)
        setIsLoading(false)
      }
    }

    initPhaserGame()

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy()
        phaserGameRef.current = null
      }
    }
  }, [userProgress, isLoadingPositions]) // Removed buildingPositions from dependencies

  // Auto-unlock animation when returning from completed simulation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const justCompleted = urlParams.get("completed")

    if (justCompleted && phaserGameRef.current) {
      // Find the building that should be unlocked
      const buildingToUnlock = Object.values(buildingTypes).find((building) => building.simulationId === justCompleted)

      if (buildingToUnlock) {
        // Delay to ensure game is fully loaded
        setTimeout(() => {
          phaserGameRef.current?.unlockBuilding(buildingToUnlock.id)
        }, 1000)
      }

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [phaserGameRef.current])

  // Force save pending positions when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      if (user) {
        forceSavePendingPositions(user.uid)
      }
    }
  }, [user])

  const handleResetCity = async () => {
    if (phaserGameRef.current && user) {
      // Reset positions to empty (will use defaults)
      const emptyPositions = {}
      await handleSavePositions(emptyPositions)

      // Destroy and recreate game
      phaserGameRef.current.destroy()
      phaserGameRef.current = null

      // Reinitialize with empty positions
      setTimeout(() => {
        if (gameRef.current) {
          const cityGame = new CityGame(gameRef.current, buildings, studentStats, emptyPositions)

          cityGame.onSavePositionSmooth = async (buildingId: string, x: number, y: number) => {
            await handleSavePositionSmooth(buildingId, x, y)
          }

          cityGame.onSavePositions = async (positions: { [key: string]: { x: number; y: number } }) => {
            await handleSavePositions(positions)
          }

          phaserGameRef.current = cityGame
        }
      }, 100)
    }
  }

  const handleSaveCity = async () => {
    if (phaserGameRef.current && user) {
      const currentPositions = phaserGameRef.current.getBuildingPositions()
      await handleSavePositions(currentPositions)

      // Also force save any pending smooth saves
      await forceSavePendingPositions(user.uid)
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard/student")
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* City Controls */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center">
                  <Building className="mr-3 h-6 w-6" />
                  <div>
                    <CardTitle className="text-2xl">Your Future City Builder</CardTitle>
                    <CardDescription className="text-blue-100">
                      Drag and drop buildings to create your personalized career city
                    </CardDescription>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userProgress?.cityLevel || 1}</div>
                  <div className="text-xs opacity-90">City Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{buildings.filter((b) => b.isUnlocked).length}</div>
                  <div className="text-xs opacity-90">Buildings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userProgress?.totalXP || 0}</div>
                  <div className="text-xs opacity-90">Total XP</div>
                </div>
              </div>

              <div className="flex space-x-2 items-center">
                {/* Save Status Indicator */}
                {saveStatus !== "idle" && (
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10">
                    {saveStatus === "saving" && (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        <span className="text-xs">Saving...</span>
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <Check className="h-3 w-3 text-green-300" />
                        <span className="text-xs text-green-300">Saved</span>
                      </>
                    )}
                    {saveStatus === "error" && (
                      <>
                        <span className="text-xs text-red-300">Error saving</span>
                      </>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCity}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCity}
                  disabled={isSaving}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
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
                      Auto-Save
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(isLoading || isLoadingPositions) && (
                  <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        {isLoadingPositions ? "Loading your saved city layout..." : "Loading your city..."}
                      </p>
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
                {buildings.map((building) => (
                  <div
                    key={building.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      building.isUnlocked
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
                      {building.isUnlocked ? (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    {!building.isUnlocked && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">{building.description}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs bg-transparent"
                          onClick={() => onSimulationStart?.(building.simulationId)}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start Simulation
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
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
                  💾 <strong>Auto-Save:</strong> Your building positions are automatically saved as you move them
                </p>
                <p>
                  ⚡ <strong>Smooth Experience:</strong> No more blinking or interruptions while building
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-black/90 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
            style={{
              left: `${Math.min(tooltip.x + 20, window.innerWidth - 200)}px`,
              top: `${Math.max(tooltip.y - 60, 10)}px`,
            }}
          >
            <div className="font-semibold text-sm">{tooltip.name}</div>
            <div className="text-xs text-gray-300 mt-1">{tooltip.description}</div>
            <div className="flex items-center mt-2 text-xs">
              {tooltip.isUnlocked ? (
                <span className="text-green-400">✓ Unlocked</span>
              ) : (
                <span className="text-red-400">🔒 Locked</span>
              )}
            </div>
          </div>
        )}

        {/* Building Modal */}
        <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
          <DialogContent className="sm:max-w-md">
            {modal && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {buildings.find((b) => b.id === modal.buildingId)?.emoji}
                    {modal.name}
                  </DialogTitle>
                  <DialogDescription>{modal.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Status:</span>
                    {modal.isUnlocked ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Trophy className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {modal.isUnlocked ? (
                    <Button
                      onClick={() => {
                        onSimulationStart?.(modal.simulationId)
                        setModal(null)
                      }}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Simulation
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        onSimulationStart?.(modal.simulationId)
                        setModal(null)
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Previous Simulation to Unlock
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
