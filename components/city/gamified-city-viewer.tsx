"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Settings, Eye, Palette, RotateCcw, Zap, Trophy, Lock, Play, Info, Check } from "lucide-react"
import { CityGame } from "@/lib/city-game"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { saveBuildingPositions, getBuildingPositions, saveBuildingPositionSmooth } from "@/lib/firebase-service"
import { useAuth } from "@/components/providers/auth-provider"

interface GameifiedCityViewerProps {
  userProgress: {
    completedSimulations: string[]
    unlockedBuildings: any[]
    cityLevel: number
  }
  onBuildingClick?: (building: any) => void
  onSimulationStart?: (simulationId: string) => void
}

export function GameifiedCityViewer({ userProgress, onBuildingClick, onSimulationStart }: GameifiedCityViewerProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<CityGame | null>(null)
  const gameInitializedRef = useRef(false)
  const lastBuildingPositionsRef = useRef<{ [key: string]: { x: number; y: number } }>({})
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const [tooltip, setTooltip] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [buildingPositions, setBuildingPositions] = useState<{ [key: string]: { x: number; y: number } }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPositions, setIsLoadingPositions] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveStatusRef = useRef<"idle" | "saving" | "saved" | "error">("idle")
  // Flag to prevent position updates when the game is handling its own position changes
  const isGameHandlingPositionRef = useRef(false)
  const { user } = useAuth()

  // Building types and their unlock conditions - Updated to include City Hall
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
    "city-hall": {
      id: "city-hall",
      name: "City Hall",
      emoji: "🏛️",
      unlockRequirement: "government-simulation",
      category: "government",
      description: "Navigate congressional processes and policy making",
      simulationId: "government-simulation",
    },
  }

  const buildings = useMemo(
    () =>
      Object.values(buildingTypes).map((building) => ({
        ...building,
        type: building.category,
        isUnlocked:
          userProgress?.completedSimulations?.includes(building.simulationId) || building.id === "advertising",
      })),
    [userProgress?.completedSimulations],
  )

  const studentStats = useMemo(
    () => ({
      name: "Student",
      level: 1,
      experience: 0,
      maxExperience: 100,
      completedSimulations: userProgress?.completedSimulations || [],
      totalSimulations: 5, // Updated to include City Hall
      badges: [],
      unlockedBuildings: userProgress?.unlockedBuildings || [],
    }),
    [userProgress?.completedSimulations, userProgress?.unlockedBuildings],
  )

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadBuildingPositions = async () => {
    if (!user) {
      setIsLoadingPositions(false)
      return
    }

    try {
      console.log("Loading building positions for user:", user.uid)
      setIsLoadingPositions(true)

      // Check for any pending positions in localStorage first
      const pendingPositions = localStorage.getItem("pendingBuildingPositions")
      if (pendingPositions) {
        try {
          const parsed = JSON.parse(pendingPositions)
          console.log("Found pending positions in localStorage:", parsed)
          // Clear the localStorage
          localStorage.removeItem("pendingBuildingPositions")
        } catch (e) {
          console.error("Error parsing pending positions:", e)
        }
      }

      const result = await getBuildingPositions(user.uid)
      if (result.success && result.data) {
        console.log("Loaded building positions:", result.data)
        // Ensure the data is an object, not a string
        const positions = typeof result.data === "object" && result.data !== null ? result.data : {}
        console.log("Processed building positions:", positions)
        setBuildingPositions(positions)
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

  // Save handlers are stable and don't need memoization

  // Smooth position saving handler with debouncing
  const handleSavePositionSmooth = async (buildingId: string, x: number, y: number) => {
    if (!user) return

    try {
      // Track save status in ref only - NO STATE UPDATES to prevent blinking
      saveStatusRef.current = "saving"
      isGameHandlingPositionRef.current = true

      // Update local state immediately for smooth UX (but don't trigger game re-render)
      // Use a ref to avoid state updates that cause re-renders
      pendingSavesRef.current[buildingId] = { x, y }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Save to database
          await saveBuildingPositionSmooth(user.uid, buildingId, x, y)

          // Success - just update ref, no state changes
          saveStatusRef.current = "saved"
          console.log("Building position saved smoothly:", buildingId, { x, y })

          // DON'T update buildingPositions state to prevent re-renders and blinking
          // The game already has the correct position

          // Reset to idle after a short delay
          setTimeout(() => {
            saveStatusRef.current = "idle"
            isGameHandlingPositionRef.current = false
          }, 1500) // Slightly longer delay to ensure save operation is complete
        } catch (error) {
          console.error("Error saving building position:", error)
          saveStatusRef.current = "error"

          // Only show error in console, no UI updates to prevent blinking
          setTimeout(() => {
            saveStatusRef.current = "idle"
            isGameHandlingPositionRef.current = false
          }, 3000)
        }
      }, 500) // 500ms debounce delay
    } catch (error) {
      console.error("Error in handleSavePositionSmooth:", error)
      saveStatusRef.current = "error"

      // Only log error, no UI updates to prevent blinking
      setTimeout(() => {
        saveStatusRef.current = "idle"
        isGameHandlingPositionRef.current = false
      }, 3000)
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
        // Don't update buildingPositions state during manual save to prevent re-renders
        // The game already has the correct positions
        saveStatusRef.current = "saved"
        setSaveStatus("saved")
        setTimeout(() => {
          saveStatusRef.current = "idle"
          setSaveStatus("idle")
        }, 2000)
      } else {
        console.error("Failed to save building positions:", result.error)
        saveStatusRef.current = "error"
        setSaveStatus("error")
        setTimeout(() => {
          saveStatusRef.current = "idle"
          setSaveStatus("idle")
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving building positions:", error)
      saveStatusRef.current = "error"
      setSaveStatus("error")
      setTimeout(() => {
        saveStatusRef.current = "idle"
        setSaveStatus("idle")
      }, 3000)
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

    // Don't reinitialize if game already exists
    if (phaserGameRef.current && gameInitializedRef.current) {
      // Check if positions have actually changed
      const positionsChanged = JSON.stringify(buildingPositions) !== JSON.stringify(lastBuildingPositionsRef.current)
      if (positionsChanged) {
        console.log("Game already exists, checking if update is needed")
        // Only update positions if they're not from a drag operation AND not from initial load
        // The game handles its own position updates during drag
        if (saveStatusRef.current === "idle" && !isLoadingPositions && !isGameHandlingPositionRef.current) {
          console.log("Updating positions in existing game")
          phaserGameRef.current.updateBuildingPositions(buildingPositions)
        } else {
          console.log("Skipping position update - drag in progress, initial load, or game handling position")
        }
        lastBuildingPositionsRef.current = { ...buildingPositions }
      } else {
        console.log("Positions haven't changed, skipping update")
      }
      return
    }

    const initPhaserGame = async () => {
      try {
        console.log("Initializing Phaser game with positions:", buildingPositions)

        // Use current buildings and studentStats (they might have changed since last render)
        const currentBuildings = Object.values(buildingTypes).map((building) => ({
          ...building,
          type: building.category,
          isUnlocked:
            userProgress?.completedSimulations?.includes(building.simulationId) || building.id === "advertising",
        }))

        const currentStudentStats = {
          name: "Student",
          level: 1,
          experience: 0,
          maxExperience: 100,
          completedSimulations: userProgress?.completedSimulations || [],
          totalSimulations: 5, // Updated to include City Hall
          badges: [],
          unlockedBuildings: userProgress?.unlockedBuildings || [],
        }

        const cityGame = new CityGame(gameRef.current!, currentBuildings, currentStudentStats, buildingPositions)

        cityGame.onBuildingSelect = (buildingId: string, isUnlocked: boolean) => {
          const building = currentBuildings.find((b) => b.id === buildingId)
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
        gameInitializedRef.current = true
        lastBuildingPositionsRef.current = { ...buildingPositions }
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
        gameInitializedRef.current = false
        lastBuildingPositionsRef.current = {}
      }
    }
  }, [isLoadingPositions]) // Only depend on loading state, not on buildings/studentStats that change with userProgress
  // This prevents the game from being reinitialized when Firebase updates userProgress

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

  // Save positions when page becomes hidden (user switches tabs or leaves)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && user && Object.keys(pendingSavesRef.current).length > 0) {
        console.log("Page hidden, saving pending positions:", pendingSavesRef.current)
        // Save all pending positions
        Object.entries(pendingSavesRef.current).forEach(([buildingId, position]) => {
          saveBuildingPositionSmooth(user.uid, buildingId, position.x, position.y).catch(console.error)
        })
        pendingSavesRef.current = {}
      }
    }

    const handleBeforeUnload = () => {
      if (user && Object.keys(pendingSavesRef.current).length > 0) {
        console.log("Page unloading, saving pending positions:", pendingSavesRef.current)
        // Use synchronous storage or send a beacon to save positions
        // For now, we'll just log it since we can't do async operations on beforeunload
        localStorage.setItem("pendingBuildingPositions", JSON.stringify(pendingSavesRef.current))
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])

  // Force save pending positions when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Save any pending positions before unmounting
      if (user && Object.keys(pendingSavesRef.current).length > 0) {
        console.log("Saving pending positions on unmount:", pendingSavesRef.current)
        // Force save all pending positions
        Object.entries(pendingSavesRef.current).forEach(([buildingId, position]) => {
          saveBuildingPositionSmooth(user.uid, buildingId, position.x, position.y).catch(console.error)
        })
        pendingSavesRef.current = {}
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
      gameInitializedRef.current = false
      lastBuildingPositionsRef.current = {}

      // Reinitialize with empty positions
      setTimeout(() => {
        if (gameRef.current) {
          // Use current buildings and studentStats
          const currentBuildings = Object.values(buildingTypes).map((building) => ({
            ...building,
            type: building.category,
            isUnlocked:
              userProgress?.completedSimulations?.includes(building.simulationId) || building.id === "advertising",
          }))

          const currentStudentStats = {
            name: "Student",
            level: 1,
            experience: 0,
            maxExperience: 100,
            completedSimulations: userProgress?.completedSimulations || [],
            totalSimulations: 5, // Updated to include City Hall
            badges: [],
            unlockedBuildings: userProgress?.unlockedBuildings || [],
          }

          const cityGame = new CityGame(gameRef.current, currentBuildings, currentStudentStats, emptyPositions)

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

      // Also save any pending smooth saves
      if (Object.keys(pendingSavesRef.current).length > 0) {
        console.log("Saving pending positions:", pendingSavesRef.current)
        for (const [buildingId, position] of Object.entries(pendingSavesRef.current)) {
          await saveBuildingPositionSmooth(user.uid, buildingId, position.x, position.y)
        }
        pendingSavesRef.current = {}
      }
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard/student")
  }

  // Don't render until we're on the client
  if (!isClient) {
    return (
      <div className="w-full space-y-6">
        <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading city builder...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* City Controls */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
              <div className="flex space-x-2 items-center">
                {/* Save Status Indicator - Only show for manual saves */}
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
                  onClick={handleSaveCity}
                  disabled={isSaving}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save City
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCity}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-black/90 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-200"
            style={{
              left: `${Math.min(tooltip.x + 20, window.innerWidth - 100)}px`,
              top: `${Math.max(tooltip.y - 10, 10)}px`,
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
