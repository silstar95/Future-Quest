"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import {
  FlaskConical,
  Thermometer,
  Clock,
  Snowflake,
  Beaker,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Microscope,
  Atom,
  HelpCircle,
  FileText,
  BarChart2,
  Trash2,
  Download,
  ScrollText,
  Lightbulb,
  BadgeInfo,
  Flame,
  Medal,
  Train,
  Globe,
  Rocket,
  Zap,
  Wind,
  Sparkles,
  TestTubes,
  ChevronDown,
} from "lucide-react"
import { MaterialSciencePeriodicTable } from "./material-science-periodic-table"

interface MaterialScienceExperiencePhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

interface ExperimentVariables {
  precursors: string
  heatingTemperature: number
  heatingTime: number
  coolingMethod: string
  additive: string
}

interface ExperimentResult {
  id: number
  timestamp: Date
  variables: ExperimentVariables
  purity: number
  levitationHeight: number
  comments: string
}

export function MaterialScienceExperiencePhase({ onComplete, initialData }: MaterialScienceExperiencePhaseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFloating, setIsFloating] = useState(false)
  const [experimentVars, setExperimentVars] = useState<ExperimentVariables>({
    precursors: "Y₂O₃ + BaCO₃ + CuO",
    heatingTemperature: 890,
    heatingTime: 6,
    coolingMethod: "Quench",
    additive: "Zinc Oxide",
  })

  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationStage, setSimulationStage] = useState(0)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [currentResults, setCurrentResults] = useState<{ purity: number; levitationHeight: number } | null>(null)
  const [labNotebook, setLabNotebook] = useState<ExperimentResult[]>(initialData?.labNotebook || [])
  const [commentInput, setCommentInput] = useState("")
  const [showLevitation, setShowLevitation] = useState(false)
  const [labExpanded, setLabExpanded] = useState(true)
  const [userHypothesis, setUserHypothesis] = useState<string | null>(null)
  const [hypothesisInput, setHypothesisInput] = useState("")

  // Animation states
  const [containerRocking, setContainerRocking] = useState(false)
  const [showFlames, setShowFlames] = useState(false)
  const [showCoolEffect, setShowCoolEffect] = useState(false)

  // Hint dialog state
  const [openHintDialog, setOpenHintDialog] = useState(false)
  const [currentHint, setCurrentHint] = useState({
    title: "",
    description: "",
  })

  const steps = [
    {
      title: "Introduction to Challenge",
      description: "Learn about your mission to create YBCO superconductors for MagLev trains",
    },
    {
      title: "Materials Overview",
      description: "Understand what it takes to build a superconductor",
    },
    {
      title: "Understanding YBCO",
      description: "Explore the periodic table elements in YBCO",
    },
    {
      title: "Hypothesis Formulation",
      description: "Form your hypothesis about optimal synthesis conditions",
    },
    {
      title: "YBCO Synthesis Lab",
      description: "Conduct virtual experiments to create superconductors",
    },
  ]

  // Toggle floating train effect
  const toggleFloat = () => {
    setIsFloating(!isFloating)
  }

  // Load hypothesis from localStorage on component mount
  useEffect(() => {
    const savedHypothesis = localStorage.getItem("userHypothesis")
    if (savedHypothesis) {
      setUserHypothesis(savedHypothesis)
    }
  }, [])

  // Clear lab notebook on component mount
  useEffect(() => {
    if (!initialData?.labNotebook) {
      localStorage.removeItem("ybcoLabNotebook")
      setLabNotebook([])
    }
  }, [])

  const updateExperimentVar = (key: keyof ExperimentVariables, value: string | number) => {
    setExperimentVars((prev) => ({ ...prev, [key]: value }))
  }

  const computeExperimentResults = (): { purity: number; levitationHeight: number } => {
    let purity = 50
    let levitationHeight = 2

    // Precursors Bonus
    if (experimentVars.precursors === "YBa₂Cu₃O₇ powder") {
      purity += 30
      levitationHeight += 4
    } else if (experimentVars.precursors === "Y(NO₃)₃ + Ba(NO₃)₂ + Cu(NO₃)₂") {
      if (experimentVars.heatingTemperature >= 930 && experimentVars.heatingTemperature <= 950) {
        purity += 20
        levitationHeight += 3
      } else {
        purity += 5
        levitationHeight += 1
      }
    } else if (experimentVars.precursors === "Y₂O₃ + BaCO₃ + CuO") {
      if (experimentVars.heatingTemperature >= 930 && experimentVars.heatingTemperature <= 950) {
        purity += 10
        levitationHeight += 2
      } else {
        purity -= 10
        levitationHeight += 1
      }
    }

    // Temperature Bonus
    if (experimentVars.heatingTemperature >= 930 && experimentVars.heatingTemperature <= 950) {
      purity += 25
    } else if (
      (experimentVars.heatingTemperature >= 900 && experimentVars.heatingTemperature < 930) ||
      (experimentVars.heatingTemperature > 950 && experimentVars.heatingTemperature <= 970)
    ) {
      purity += 10
    } else {
      purity -= 20
    }

    // Time Bonus
    if (experimentVars.heatingTime >= 12 && experimentVars.heatingTime <= 24) {
      purity += 20
    } else if (experimentVars.heatingTime >= 8 && experimentVars.heatingTime < 12) {
      purity += 10
    } else {
      purity -= 25
    }

    // Cooling Method Bonus
    if (experimentVars.coolingMethod === "Slow Cooling (5°C/min)") {
      purity += 15
      levitationHeight += 3
    } else if (experimentVars.coolingMethod === "Quench") {
      purity -= 10
      levitationHeight -= 2
    }

    // Additive Effects
    if (experimentVars.additive === "Silver Oxide") {
      purity += 5
      levitationHeight += 2
    } else if (experimentVars.additive === "Calcium Oxide") {
      purity += 3
      levitationHeight += 1
    } else if (experimentVars.additive === "Zinc Oxide") {
      purity -= 5
      levitationHeight -= 1
    }

    levitationHeight += (purity - 50) / 25

    const randomVariationPurity = Math.random() * 10 - 5
    const randomVariationLevitation = Math.random() * 1 - 0.5

    purity += randomVariationPurity
    levitationHeight += randomVariationLevitation

    purity = Math.max(20, Math.min(99, purity))
    levitationHeight = Math.max(0.5, Math.min(8, levitationHeight))

    return {
      purity: Number.parseFloat(purity.toFixed(1)),
      levitationHeight: Number.parseFloat(levitationHeight.toFixed(1)),
    }
  }

  const runSimulation = () => {
    if (simulationRunning) return

    setSimulationRunning(true)
    setSimulationStage(1)
    setSimulationProgress(0)
    setContainerRocking(true)
    setCurrentResults(null)
    setShowLevitation(false)

    const totalDuration = 14000

    // Stage 1: Mixing precursors (0-20%)
    setTimeout(() => {
      setContainerRocking(false)
      setSimulationStage(2)
      setShowFlames(true)
      setSimulationProgress(20)
    }, totalDuration * 0.2)

    // Stage 2: Heating (20-65%)
    const heatingInterval = setInterval(
      () => {
        setSimulationProgress((prev) => {
          const newProgress = prev + 0.5
          if (newProgress >= 65) {
            clearInterval(heatingInterval)
            setShowFlames(false)
            setShowCoolEffect(true)
            setSimulationStage(3)
          }
          return newProgress
        })
      },
      (totalDuration * 0.45) / 90,
    )

    // Stage 3: Cooling (65-90%)
    setTimeout(() => {
      setSimulationProgress(90)
    }, totalDuration * 0.65)

    // Final stage - show results
    setTimeout(() => {
      setShowCoolEffect(false)
      setSimulationStage(4)

      const results = computeExperimentResults()
      setCurrentResults(results)

      if (results.purity > 70) {
        setShowLevitation(true)
      }

      setSimulationRunning(false)
      setSimulationProgress(100)
    }, totalDuration * 0.9)
  }

  const resetSimulation = () => {
    setSimulationRunning(false)
    setSimulationStage(0)
    setSimulationProgress(0)
    setContainerRocking(false)
    setShowFlames(false)
    setShowCoolEffect(false)
    setShowLevitation(false)
    setCurrentResults(null)
  }

  const addToLabNotebook = () => {
    if (!currentResults) return

    const newEntry: ExperimentResult = {
      id: Date.now(),
      timestamp: new Date(),
      variables: { ...experimentVars },
      purity: currentResults.purity,
      levitationHeight: currentResults.levitationHeight,
      comments: commentInput,
    }

    const updatedNotebook = [...labNotebook, newEntry]
    setLabNotebook(updatedNotebook)
    localStorage.setItem("ybcoLabNotebook", JSON.stringify(updatedNotebook))
    setCommentInput("")
  }

  const deleteLabEntry = (id: number) => {
    const updatedNotebook = labNotebook.filter((entry) => entry.id !== id)
    setLabNotebook(updatedNotebook)
    localStorage.setItem("ybcoLabNotebook", JSON.stringify(updatedNotebook))
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const downloadLabNotebook = () => {
    let csv =
      "Timestamp,Precursors,Heating Temperature (°C),Heating Time (hours),Cooling Method,Additive,Purity (%),Levitation Height (mm),Comments\n"

    labNotebook.forEach((entry) => {
      csv += `${entry.timestamp.toISOString()},`
      csv += `${entry.variables.precursors},`
      csv += `${entry.variables.heatingTemperature},`
      csv += `${entry.variables.heatingTime},`
      csv += `${entry.variables.coolingMethod},`
      csv += `${entry.variables.additive},`
      csv += `${entry.purity},`
      csv += `${entry.levitationHeight},`
      csv += `"${entry.comments.replace(/"/g, '""')}"\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "ybco_lab_notebook.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const showHint = (title: string, description: string) => {
    setCurrentHint({ title, description })
    setTimeout(() => {
      setOpenHintDialog(true)
    }, 10)
  }

  const handleStepComplete = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        labNotebook,
        experimentsCompleted: labNotebook.length,
        completedAt: new Date().toISOString(),
      })
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const hintButtonStyle =
    "flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors"

  const toggleCardExpansion = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null)
    } else {
      setExpandedCard(cardId)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-slate-50">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 max-w-6xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FlaskConical className="mr-3 h-6 w-6 text-blue-600" />
            Experience: MagLev Makers - Engineering a Superconductor
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            Complete real-world tasks as a Materials Scientist. You'll identify and create superconductive materials for
            Magnetic Levitation Trains through hands-on experimentation.
          </p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full relative z-10"
          >
            {/* Floating title - appears before the card */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-6"
            >
              <Badge
                variant="outline"
                className="mb-2 px-4 py-1 text-md bg-white/80 backdrop-blur-sm border-2 border-primary/20"
              >
                🧪 PROJECT VELOCITY 🧪
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Project VELOCITY
                </span>
              </h1>
              <p className="text-slate-600 text-lg">
                Build the future of transportation with superconductor technology
              </p>
            </motion.div>

            <Card className="shadow-2xl overflow-hidden rounded-3xl border-0 bg-white/90 backdrop-blur-sm">
              {/* Header with animated icon */}
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-6 border-b border-primary/10 space-y-2">
                <div className="flex items-center space-x-3 mb-1">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.7 }}
                  >
                    <Rocket size={24} />
                  </motion.div>
                  <div>
                    <h4 className="text-primary text-sm font-semibold tracking-wide uppercase">Top Secret</h4>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Mission Brief</h2>
                  </div>
                </div>
                <div className="h-[4px] w-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              </CardHeader>

              {/* Main content area */}
              <CardContent className="p-6 md:p-8 space-y-8">
                {/* Intro section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 rounded-xl mt-1 shadow-sm">
                    <Globe className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-sans text-2xl font-bold text-slate-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      Welcome to the Future of American Transportation
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-lg">
                      America is on the brink of a historic transformation.
                    </p>
                  </div>
                </motion.div>

                {/* Challenge description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="pl-14 md:pl-16 space-y-6"
                >
                  <p className="text-slate-700 leading-relaxed text-lg">
                    In the wake of a climate crisis and the push for cleaner infrastructure, the U.S. government has
                    launched
                    <span className="relative inline-block mx-2 font-bold text-xl">
                      Project VELOCITY
                      <span className="absolute inset-x-0 bottom-0 h-[40%] bg-blue-400/30 -z-10 transform skew-x-[-12deg]"></span>
                    </span>
                    —a bold initiative to build a national high-speed MagLev train network that will span the country,
                    connecting cities like Los Angeles, Chicago, and New York with ultra-fast, frictionless travel.
                  </p>

                  {/* Interactive Maglev train visual explanation */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-200 shadow-md">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-full md:w-2/5 flex justify-center">
                        <div
                          className="relative h-40 w-full max-w-xs flex items-center justify-center cursor-pointer"
                          onClick={toggleFloat}
                        >
                          {/* Train illustration with interactive animation */}
                          <motion.div
                            className="absolute w-56 h-16 flex flex-col items-center justify-center"
                            animate={{
                              y: isFloating ? [-20, -15, -20] : [0, 0, 0],
                              rotateZ: isFloating ? [-1, 1, -1] : 0,
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 3,
                              ease: "easeInOut",
                            }}
                          >
                            {/* Train body */}
                            <div className="relative w-full h-full flex">
                              {/* Engine car */}
                              <motion.div
                                className="h-full w-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-l-xl shadow-lg relative"
                                animate={{
                                  boxShadow: isFloating
                                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {/* Front window */}
                                <div className="absolute w-8 h-5 bg-blue-200 rounded-sm top-2 left-2 border-2 border-blue-300"></div>
                                {/* Train cab */}
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-indigo-700 rounded-bl-xl"></div>
                                {/* Train headlight */}
                                <motion.div
                                  className="absolute w-3 h-3 rounded-full bg-yellow-300 top-4 right-2"
                                  animate={{
                                    opacity: isFloating ? [0.7, 1, 0.7] : 0.7,
                                  }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                />
                                {/* Text */}
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                                  {isFloating ? "HOVER" : "CLICK"}
                                </div>
                              </motion.div>

                              {/* Passenger car */}
                              <motion.div
                                className="h-full w-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-xl shadow-lg relative flex items-center justify-center"
                                animate={{
                                  boxShadow: isFloating
                                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {/* Windows */}
                                <div className="flex space-x-2 items-center">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-5 bg-blue-200 rounded-sm border border-blue-300"
                                    ></div>
                                  ))}
                                </div>
                                {/* Yellow stripe */}
                                <div className="absolute h-2 w-full bg-yellow-400 bottom-0"></div>
                                {/* Zap icon */}
                                <Zap
                                  className={`absolute -top-3 right-3 ${
                                    isFloating ? "text-yellow-300" : "text-yellow-400 opacity-70"
                                  }`}
                                  size={22}
                                />
                              </motion.div>
                            </div>
                          </motion.div>

                          {/* Magnetic field lines - animated when floating */}
                          <motion.div className="absolute w-56 h-10" animate={{ opacity: isFloating ? 1 : 0.2 }}>
                            {/* Multiple field lines */}
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-full h-[2px] border-t-2 border-dashed border-blue-400"
                                style={{ top: 10 + i * 8 }}
                                animate={{
                                  opacity: isFloating ? [0.3, 1, 0.3] : 0.3,
                                  scaleX: isFloating ? [0.9, 1.1, 0.9] : 1,
                                }}
                                transition={{
                                  repeat: Number.POSITIVE_INFINITY,
                                  duration: 2,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </motion.div>

                          {/* Enhanced Track with railroad ties */}
                          <div className="absolute w-56 bottom-1 flex flex-col items-center">
                            {/* Main rail */}
                            <div className="w-full h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-sm relative">
                              {/* Railroad ties */}
                              {[...Array(8)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute h-1.5 w-8 bg-amber-800 rounded-sm"
                                  style={{
                                    left: `${i * 14.5}%`,
                                    top: "0px",
                                    transform: "translateY(-4px)",
                                  }}
                                />
                              ))}
                              {/* Rail lines */}
                              <div className="absolute w-full flex justify-between px-1">
                                <div className="h-3 w-1 bg-slate-600 rounded-full"></div>
                                <div className="h-3 w-1 bg-slate-600 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-3/5">
                        <h3 className="font-sans text-xl font-bold text-slate-800 mb-3 flex items-center">
                          <Train className="text-blue-600 mr-2 h-6 w-6" />
                          Revolutionary Levitation Technology
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          These MagLev trains won't run on wheels. They'll
                          <span className="relative inline-block mx-2 font-bold">
                            levitate
                            <motion.span
                              className="absolute inset-x-0 bottom-0 h-[40%] bg-blue-400/30 -z-10 transform skew-x-[-12deg]"
                              animate={{ scaleX: [1, 1.2, 1] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                            ></motion.span>
                          </span>
                          —gliding at over
                          <motion.span
                            className="font-mono font-bold mx-1 text-blue-700"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                          >
                            300 mph
                          </motion.span>
                          using
                          <span className="font-bold"> superconductors </span>
                          that repel magnetic fields.
                        </p>
                        <p className="text-blue-600 font-medium mt-2 text-sm">
                          {isFloating
                            ? "✨ Now in hover mode! The power of superconductors!"
                            : "Click the train to see levitation in action"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* YBCO Superconductor information with animation */}
                  <div className="space-y-4">
                    <h3 className="font-sans text-xl font-bold text-slate-800 flex items-center -ml-10">
                      <Atom className="text-blue-600 mr-2 h-6 w-6" />
                      The Key Material: YBCO
                    </h3>

                    <p className="text-slate-700 leading-relaxed">
                      For this project to be successful the most important goal is to create the best superconductor
                      possible. The key material for superconductors is
                      <motion.span
                        className="relative inline-block mx-2 px-3 py-1 font-mono font-bold bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        YBCO
                      </motion.span>
                      :<span className="font-bold"> Yttrium Barium Copper Oxide</span>.
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
                      <h4 className="font-sans text-lg font-semibold text-slate-800 mb-2 flex items-center">
                        <Thermometer className="text-blue-600 mr-2 h-5 w-5" />
                        The Synthesis Challenge
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        <motion.span
                          className="inline-block mx-1 px-2 py-0.5 font-mono bg-blue-600/10 rounded-md font-bold"
                          animate={{
                            backgroundColor: [
                              "rgba(37, 99, 235, 0.1)",
                              "rgba(37, 99, 235, 0.2)",
                              "rgba(37, 99, 235, 0.1)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          YBCO
                        </motion.span>
                        becomes superconducting when cooled to 77K with liquid nitrogen. But creating pure, stable
                        <span className="font-mono font-bold text-blue-800 mx-1">YBCO</span>
                        is hard. Tiny missteps in synthesis—wrong temperature, insufficient oxygen, rushed cooling—can
                        introduce impurities that ruin its performance.
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {/* Key factors visualization */}
                        {[
                          { icon: <Thermometer size={18} />, text: "Temperature" },
                          { icon: <Wind size={18} />, text: "Oxygen Flow" },
                          { icon: <Atom size={18} />, text: "Cooling Rate" },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            className="bg-white/60 p-2 rounded-lg text-center flex flex-col items-center"
                            whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                          >
                            <div className="text-blue-600 mb-1">{item.icon}</div>
                            <div className="text-xs font-medium text-slate-700">{item.text}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>

              {/* Call to action */}
              <CardFooter className="flex justify-center pt-4 border-t border-neutral-200 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleStepComplete}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center text-lg font-medium">
                      That's where you come in
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ y: "100%" }}
                      whileHover={{ y: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full relative z-10"
          >
            {/* Header with animated badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-8 z-10"
            >
              <Badge
                variant="outline"
                className="mb-3 px-4 py-1 text-md font-medium bg-white/80 backdrop-blur-sm border-2 border-primary/20"
              >
                🧪 PROJECT VELOCITY 🧪
              </Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Your Superconductor Mission
                </span>
              </h1>
            </motion.div>

            {/* Main info card */}
            <Card className="shadow-xl rounded-3xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-primary/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Medal className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Task Force Selection</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2"></div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8">
                <motion.p
                  className="text-xl text-slate-700 leading-relaxed mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="font-bold text-blue-600">Congratulations!</span> You've been selected as part of a
                  national youth science task force. Your challenge?
                  <span className="relative inline-block mx-2 px-1">
                    Synthesize the best-performing YBCO superconductor
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-[30%] bg-blue-400/30 -z-10"
                      animate={{ width: ["0%", "100%", "100%"] }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                    ></motion.span>
                  </span>
                  so that the design of MagLev is successful.
                </motion.p>

                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center">
                    <Microscope className="text-blue-600 mr-2 h-5 w-5" />
                    The Challenge
                  </h3>
                  <p className="text-slate-700">
                    You will simulate building the best YBCO superconductor by experimenting with different synthesis
                    parameters and analyzing their effects on superconductivity performance.
                  </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Simulation Overview Card */}
            <Card className="shadow-xl rounded-3xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Simulation Overview</h3>
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8">
                <p className="text-lg text-slate-700 mb-8">
                  There are four key variables that influence YBCO synthesis. You'll explore and optimize them. Click
                  each variable to learn more about it:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Precursors Variable */}
                  <motion.div
                    className={`bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all cursor-pointer ${
                      expandedCard === "precursors" ? "md:col-span-2" : ""
                    }`}
                    whileHover={{ y: -5, backgroundColor: "#f8faff" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    onClick={() => toggleCardExpansion("precursors")}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-amber-500/10">
                            <Beaker className="h-5 w-5 text-amber-600" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800">Precursors</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedCard === "precursors" ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-slate-400"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-slate-600">
                            Starting ingredients that form YBCO through chemical reactions. The quality and ratio of
                            these materials directly impact superconductor performance.
                          </p>
                          <div className="mt-4 md:hidden">
                            <div className="relative h-20 flex items-center justify-center">
                              <motion.div
                                className="w-6 h-6 rounded-full bg-amber-500 absolute"
                                animate={{ x: [10, -10, 10], y: [5, -5, 5] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
                              />
                              <motion.div
                                className="w-4 h-4 rounded-full bg-green-500 absolute left-6"
                                animate={{ x: [-15, 5, -15], y: [-8, 8, -8] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut" }}
                              />
                              <motion.div
                                className="w-5 h-5 rounded-full bg-blue-500 absolute top-2 right-6"
                                animate={{ x: [0, 10, 0], y: [10, 0, 10] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.2, ease: "easeInOut" }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block w-24 h-20">
                          <div className="relative h-20 flex items-center justify-center">
                            <motion.div
                              className="w-6 h-6 rounded-full bg-amber-500 absolute"
                              animate={{ x: [10, -10, 10], y: [5, -5, 5] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
                            />
                            <motion.div
                              className="w-4 h-4 rounded-full bg-green-500 absolute left-6"
                              animate={{ x: [-15, 5, -15], y: [-8, 8, -8] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut" }}
                            />
                            <motion.div
                              className="w-5 h-5 rounded-full bg-blue-500 absolute top-2 right-6"
                              animate={{ x: [0, 10, 0], y: [10, 0, 10] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.2, ease: "easeInOut" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedCard === "precursors" && (
                          <motion.div
                            className="mt-4 p-4 bg-gradient-to-br from-amber-500/5 to-amber-700/10 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <HelpCircle size={16} className="text-amber-600" />
                                  What it is
                                </h5>
                                <p className="text-slate-700 mb-4">
                                  Chemical compounds containing yttrium, barium, and copper that will combine to form
                                  the YBCO crystal structure.
                                </p>

                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <AlertCircle size={16} className="text-amber-600" />
                                  Why it matters
                                </h5>
                                <p className="text-slate-700">
                                  The purity and stoichiometric ratio of precursors determine if you'll get perfect YBCO
                                  or contaminated byproducts.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <Atom size={16} className="text-amber-600" />
                                  Examples
                                </h5>
                                <ul className="list-disc list-inside mb-4 text-slate-700">
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-1"
                                  >
                                    Y₂O₃ (Yttrium oxide)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-1"
                                  >
                                    BaCO₃ (Barium carbonate)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-1"
                                  >
                                    CuO (Copper oxide)
                                  </motion.li>
                                </ul>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
                                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Fun Fact
                                  </h5>
                                  <p className="text-slate-700 text-sm">
                                    Some of the precursors for YBCO were originally considered worthless byproducts in
                                    mining operations!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Heating Profile Variable */}
                  <motion.div
                    className={`bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all cursor-pointer ${
                      expandedCard === "heating" ? "md:col-span-2" : ""
                    }`}
                    whileHover={{ y: -5, backgroundColor: "#f8faff" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    onClick={() => toggleCardExpansion("heating")}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-red-500/10">
                            <Flame className="h-5 w-5 text-red-600" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800">Heating Profile</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedCard === "heating" ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-slate-400"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-slate-600">
                            How hot you heat your mixture, and for how long. It's one of the most critical parameters as
                            it controls the chemical reaction rate and crystal formation.
                          </p>
                          <div className="mt-4 md:hidden">
                            <div className="relative h-20 flex items-center justify-center">
                              <motion.div
                                className="absolute right-3 h-16 w-5 rounded-full border-2 border-red-600 overflow-hidden bg-white"
                                animate={{ borderColor: ["#dc2626", "#f97316", "#dc2626"] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                              >
                                <motion.div
                                  className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-t-md"
                                  animate={{ height: ["30%", "70%", "30%"] }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
                                />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block w-24 h-20">
                          <div className="relative h-20 flex items-center justify-center">
                            <motion.div
                              className="absolute right-3 h-16 w-5 rounded-full border-2 border-red-600 overflow-hidden bg-white"
                              animate={{ borderColor: ["#dc2626", "#f97316", "#dc2626"] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                            >
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-t-md"
                                animate={{ height: ["30%", "70%", "30%"] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
                              />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedCard === "heating" && (
                          <motion.div
                            className="mt-4 p-4 bg-gradient-to-br from-red-500/5 to-orange-500/10 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <HelpCircle size={16} className="text-red-600" />
                                  What it is
                                </h5>
                                <p className="text-slate-700 mb-4">
                                  The precise temperature path (ramp rate, max temperature, and duration) used to
                                  convert precursors into YBCO.
                                </p>

                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <AlertCircle size={16} className="text-red-600" />
                                  Why it matters
                                </h5>
                                <p className="text-slate-700">
                                  Too little heat means incomplete reactions, while too much heat could damage the
                                  crystal structure or cause unwanted side reactions.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <Atom size={16} className="text-red-600" />
                                  Examples
                                </h5>
                                <ul className="list-disc list-inside mb-4 text-slate-700">
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-1"
                                  >
                                    Slow ramp (5°C/min) to 900°C
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-1"
                                  >
                                    Hold at 900°C for 24 hours
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-1"
                                  >
                                    Flash heating to 1000°C for 1 hour
                                  </motion.li>
                                </ul>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
                                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Fun Fact
                                  </h5>
                                  <p className="text-slate-700 text-sm">
                                    YBCO synthesis requires temperatures approaching 1000°C—that's hot enough to make
                                    certain metals glow bright orange!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Cooling Method Variable */}
                  <motion.div
                    className={`bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all cursor-pointer ${
                      expandedCard === "cooling" ? "md:col-span-2" : ""
                    }`}
                    whileHover={{ y: -5, backgroundColor: "#f8faff" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    onClick={() => toggleCardExpansion("cooling")}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-blue-500/10">
                            <Snowflake className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800">Cooling Method</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedCard === "cooling" ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-slate-400"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-slate-600">
                            How you cool the material down is just as important as heating. YBCO's crystal structure can
                            form or break apart depending on the cooling rate.
                          </p>
                          <div className="mt-4 md:hidden">
                            <div className="relative h-20 flex items-center justify-center">
                              <div className="relative w-16 h-16">
                                <motion.div
                                  className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-sm"
                                  animate={{
                                    scale: [0.9, 1.1, 0.9],
                                    rotate: [0, 10, 0],
                                    opacity: [0.7, 1, 0.7],
                                  }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                                />
                                <motion.div
                                  className="absolute top-8 left-6 w-4 h-4 bg-blue-500 rounded-sm"
                                  animate={{
                                    scale: [1, 0.9, 1],
                                    rotate: [10, 0, 10],
                                    opacity: [0.8, 1, 0.8],
                                  }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, delay: 0.2 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block w-24 h-20">
                          <div className="relative h-20 flex items-center justify-center">
                            <div className="relative w-16 h-16">
                              <motion.div
                                className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-sm"
                                animate={{
                                  scale: [0.9, 1.1, 0.9],
                                  rotate: [0, 10, 0],
                                  opacity: [0.7, 1, 0.7],
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                              />
                              <motion.div
                                className="absolute top-8 left-6 w-4 h-4 bg-blue-500 rounded-sm"
                                animate={{
                                  scale: [1, 0.9, 1],
                                  rotate: [10, 0, 10],
                                  opacity: [0.8, 1, 0.8],
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedCard === "cooling" && (
                          <motion.div
                            className="mt-4 p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <HelpCircle size={16} className="text-blue-600" />
                                  What it is
                                </h5>
                                <p className="text-slate-700 mb-4">
                                  The controlled cooling strategy after high-temperature synthesis that impacts crystal
                                  formation and oxygen content.
                                </p>

                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <AlertCircle size={16} className="text-blue-600" />
                                  Why it matters
                                </h5>
                                <p className="text-slate-700">
                                  The cooling rate determines crystal structure alignment and oxygen content, which
                                  directly affects superconducting properties.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <Atom size={16} className="text-blue-600" />
                                  Examples
                                </h5>
                                <ul className="list-disc list-inside mb-4 text-slate-700">
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-1"
                                  >
                                    Slow cooling (1°C/min)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-1"
                                  >
                                    Quenching (rapid cooling in liquid)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-1"
                                  >
                                    Step cooling with oxygen annealing
                                  </motion.li>
                                </ul>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
                                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Fun Fact
                                  </h5>
                                  <p className="text-slate-700 text-sm">
                                    Some superconductor researchers use liquid nitrogen at -196°C as part of their
                                    cooling process—that's colder than the coldest place on Earth!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Additives Variable */}
                  <motion.div
                    className={`bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all cursor-pointer ${
                      expandedCard === "additives" ? "md:col-span-2" : ""
                    }`}
                    whileHover={{ y: -5, backgroundColor: "#f8faff" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    onClick={() => toggleCardExpansion("additives")}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-purple-500/10">
                            <FlaskConical className="h-5 w-5 text-purple-600" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800">Additives</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedCard === "additives" ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-slate-400"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-slate-600">
                            Optional 'helper agents' that don't become YBCO, but influence how well it forms. These
                            catalysts can enhance crystallization and properties.
                          </p>
                          <div className="mt-4 md:hidden">
                            <div className="relative h-20 flex items-center justify-center">
                              <div className="w-16 h-16 relative">
                                <motion.div
                                  className="absolute w-10 h-10 rounded-md bg-indigo-400 top-3 left-3 z-10"
                                  animate={{
                                    backgroundColor: ["#818cf8", "#6366f1", "#818cf8"],
                                    rotate: [0, 3, 0, -3, 0],
                                  }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
                                />
                                <motion.div
                                  className="absolute w-2 h-2 rounded-full bg-fuchsia-500 top-1 left-2 z-20 shadow-sm"
                                  animate={{
                                    y: [0, 4, 0],
                                    x: [0, 2, 0],
                                    scale: [1, 1.2, 1],
                                    opacity: [0.8, 1, 0.8],
                                  }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block w-24 h-20">
                          <div className="relative h-20 flex items-center justify-center">
                            <div className="w-16 h-16 relative">
                              <motion.div
                                className="absolute w-10 h-10 rounded-md bg-indigo-400 top-3 left-3 z-10"
                                animate={{
                                  backgroundColor: ["#818cf8", "#6366f1", "#818cf8"],
                                  rotate: [0, 3, 0, -3, 0],
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
                              />
                              <motion.div
                                className="absolute w-2 h-2 rounded-full bg-fuchsia-500 top-1 left-2 z-20 shadow-sm"
                                animate={{
                                  y: [0, 4, 0],
                                  x: [0, 2, 0],
                                  scale: [1, 1.2, 1],
                                  opacity: [0.8, 1, 0.8],
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedCard === "additives" && (
                          <motion.div
                            className="mt-4 p-4 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/10 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <HelpCircle size={16} className="text-purple-600" />
                                  What it is
                                </h5>
                                <p className="text-slate-700 mb-4">
                                  Substances added in small amounts to improve synthesis efficiency or modify the final
                                  properties of YBCO.
                                </p>

                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <AlertCircle size={16} className="text-purple-600" />
                                  Why it matters
                                </h5>
                                <p className="text-slate-700">
                                  Additives can dramatically improve conductivity, current capacity, or magnetic field
                                  strength tolerance.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <Atom size={16} className="text-purple-600" />
                                  Examples
                                </h5>
                                <ul className="list-disc list-inside mb-4 text-slate-700">
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-1"
                                  >
                                    Silver oxide (Ag₂O)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-1"
                                  >
                                    Calcium oxide (CaO)
                                  </motion.li>
                                  <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-1"
                                  >
                                    Platinum particles (Pt)
                                  </motion.li>
                                </ul>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
                                  <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Fun Fact
                                  </h5>
                                  <p className="text-slate-700 text-sm">
                                    Adding just 1% of certain materials can double the current-carrying capacity of a
                                    superconductor!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Your tasks */}
                <motion.div
                  className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl p-6 border border-blue-200/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <TestTubes className="text-blue-600 mr-2 h-5 w-5" />
                    Your Research Tasks
                  </h3>

                  <ul className="space-y-3">
                    {[
                      {
                        icon: <Beaker className="h-4 w-4" />,
                        text: "Conduct 3–5 trial experiments by adjusting the different variables",
                      },
                      {
                        icon: <Microscope className="h-4 w-4" />,
                        text: "Observe magnetic levitation and purity results (simulated PXRD - technique used to analyze the crystal structure)",
                      },
                      { icon: <FileText className="h-4 w-4" />, text: "Record findings in your lab notebook" },
                      { icon: <Sparkles className="h-4 w-4" />, text: "Analyze patterns across experiments" },
                      {
                        icon: <Medal className="h-4 w-4" />,
                        text: "Submit your final YBCO formula - Let's make the best one possible!",
                      },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 + i * 0.15 }}
                      >
                        <div className="mr-3 p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          {item.icon}
                        </div>
                        <span className="text-slate-700">{item.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={handleStepComplete} size="lg" className="bg-gradient-to-r from-blue-500 to-green-600">
                Continue to YBCO Elements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="elements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MaterialSciencePeriodicTable onComplete={() => handleStepComplete()} />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="hypothesis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full relative z-10"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-8 z-10"
            >
              <Badge
                variant="outline"
                className="mb-3 px-4 py-1 text-md font-medium bg-white/80 backdrop-blur-sm border-2 border-primary/20"
              >
                🧪 PROJECT VELOCITY 🧪
              </Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-500">
                  Hypothesis Formulation
                </span>
              </h1>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Before conducting your experiment, formulate a hypothesis about how different variables will affect your
                YBCO superconductor. This follows the scientific method process.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-4 border border-blue-200 max-w-3xl mx-auto text-left">
                <h3 className="font-semibold text-slate-800 mb-2">Ideal Superconductor Properties</h3>
                <p className="text-slate-700">
                  An ideal superconductor should be free of crystalline imperfections, pure of other phases, and able to
                  withstand high temperatures and transmit a strong electric current.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mt-4 border border-slate-200 max-w-3xl mx-auto text-left">
                <h3 className="font-semibold text-slate-800 mb-2">The Scientific Process</h3>
                <p className="text-slate-700 mb-3">
                  As a materials scientist, you will constantly be generating hypotheses, running experiments to test
                  them, and coming up with new hypotheses based on your new information.
                </p>
                <p className="text-slate-700 mb-3">If you've proved yourself wrong, you're doing something right!</p>
                <p className="text-slate-800 font-medium">Ready for your first one?</p>
              </div>
            </motion.div>

            {/* Main content area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-6 mb-8"
            >
              {/* Hypothesis guide card */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                  Scientific Hypothesis Guide
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                    <h3 className="font-bold text-slate-800 mb-2">What makes a good hypothesis?</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      <li>Clear statement about expected outcomes</li>
                      <li>Based on prior knowledge and observations</li>
                      <li>Specifies relationship between variables</li>
                      <li>Testable through experimentation</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-bold text-slate-800 mb-2">Hypothesis Format</h3>
                    <p className="text-slate-700 mb-2">
                      "If I [change this variable], then [this outcome] will happen because [scientific reasoning]."
                    </p>
                    <p className="text-slate-700">
                      Example: "If I increase the heating temperature to 950°C, then the YBCO purity will increase
                      because higher temperatures provide better crystallization conditions."
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                    <BadgeInfo className="h-4 w-4 mr-2 text-blue-600" />
                    Key Variables to Consider
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-start">
                      <Beaker className="h-4 w-4 mr-2 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Precursors</span>
                        <span className="text-slate-600">Starting materials affect quality</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Thermometer className="h-4 w-4 mr-2 text-rose-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Temperature</span>
                        <span className="text-slate-600">Affects crystal formation</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Heating Time</span>
                        <span className="text-slate-600">Impacts reaction completion</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Snowflake className="h-4 w-4 mr-2 text-cyan-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Cooling Method</span>
                        <span className="text-slate-600">Influences crystal structure</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hypothesis input section */}
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                    <FlaskConical className="h-4 w-4 mr-2 text-amber-600" />
                    Your YBCO Superconductor Hypothesis
                  </h3>

                  {!userHypothesis ? (
                    <>
                      <Textarea
                        placeholder="Write your hypothesis here. Consider how the variables (precursors, temperature, heating time, cooling method, additives) will affect the purity and levitation height of the superconductor."
                        className="min-h-32 mb-4"
                        value={hypothesisInput}
                        onChange={(e) => setHypothesisInput(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          if (hypothesisInput.trim()) {
                            setUserHypothesis(hypothesisInput)
                            localStorage.setItem("userHypothesis", hypothesisInput)
                          }
                        }}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        disabled={!hypothesisInput.trim()}
                      >
                        Save Hypothesis
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
                        <p className="text-slate-700 italic">{userHypothesis}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setHypothesisInput(userHypothesis || "")
                          setUserHypothesis(null)
                          localStorage.removeItem("userHypothesis")
                        }}
                        variant="outline"
                        className="border-amber-500 text-amber-600 hover:bg-amber-50"
                      >
                        Edit Hypothesis
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>

            <div className="text-center">
              <Button onClick={handleStepComplete} size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500">
                Start Laboratory Experiments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="lab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header with hypothesis and goals */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200">
                <div className="text-center mb-6">
                  <Badge
                    variant="outline"
                    className="mb-3 px-4 py-1 text-md font-medium bg-white/80 backdrop-blur-sm border-2 border-primary/20"
                  >
                    🧪 PROJECT VELOCITY 🧪
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      YBCO Synthesis Lab
                    </span>
                  </h1>
                  <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                    Create your own YBCO superconductor by optimizing synthesis parameters. Run experiments, observe
                    results, and keep track in your lab notebook.
                  </p>

                  {userHypothesis && (
                    <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 max-w-3xl mx-auto">
                      <h3 className="font-bold text-slate-800 flex items-center mb-2">
                        <Lightbulb className="mr-2 h-5 w-5 text-amber-600" />
                        Your Hypothesis
                      </h3>
                      <p className="text-slate-700 italic">{userHypothesis}</p>
                    </div>
                  )}

                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-200 max-w-3xl mx-auto">
                    <h3 className="font-bold text-slate-800 flex items-center mb-2">
                      <BadgeInfo className="mr-2 h-5 w-5 text-blue-600" />
                      Experiment Goals
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="bg-white p-3 rounded-lg border border-blue-100 flex-1">
                        <div className="flex items-center">
                          <div className="w-3 h-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-sm mr-3"></div>
                          <div>
                            <h4 className="font-semibold text-slate-700">Superconductor Purity</h4>
                            <p className="text-sm text-slate-600">
                              Achieve at least <span className="font-bold text-green-600">85%</span> purity for optimal
                              performance
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100 flex-1">
                        <div className="flex items-center">
                          <div className="w-3 h-8 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-sm mr-3"></div>
                          <div>
                            <h4 className="font-semibold text-slate-700">Levitation Height</h4>
                            <p className="text-sm text-slate-600">
                              Target at least <span className="font-bold text-blue-600">8mm</span> of levitation for the
                              MagLev application
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Variables control */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center mb-2 md:mb-0">
                    <Beaker className="h-5 w-5 mr-2 text-blue-600" />
                    Experiment Variables
                  </h2>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={runSimulation}
                      className="flex-1 md:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={simulationRunning}
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      Run Experiment
                    </Button>
                    <Button
                      onClick={resetSimulation}
                      variant="outline"
                      className="flex-1 md:flex-initial bg-transparent"
                      disabled={simulationRunning || simulationStage === 0}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-2">
                  {/* Precursors */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-amber-100 border-amber-300 text-amber-800">
                          Precursors
                        </Badge>
                      </label>
                      <button
                        type="button"
                        className={hintButtonStyle}
                        onClick={() => {
                          showHint(
                            "Precursor Selection",
                            "Different starting materials will result in varying qualities of superconductor. The choice depends on what's available and what processing conditions you can achieve. Try different combinations to see how they affect your results!",
                          )
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Select
                      defaultValue={experimentVars.precursors}
                      onValueChange={(value) => updateExperimentVar("precursors", value)}
                      disabled={simulationRunning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select precursors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y₂O₃ + BaCO₃ + CuO">Y₂O₃ + BaCO₃ + CuO</SelectItem>
                        <SelectItem value="Y(NO₃)₃ + Ba(NO₃)₂ + Cu(NO₃)₂">Y(NO₃)₃ + Ba(NO₃)₂ + Cu(NO₃)₂</SelectItem>
                        <SelectItem value="YBa₂Cu₃O₇ powder">YBa₂Cu₃O₇ powder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Heating Temperature */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-rose-100 border-rose-300 text-rose-800">
                          <Thermometer className="h-3 w-3 mr-1" />
                          Temperature
                        </Badge>
                        <span className="mx-2">{experimentVars.heatingTemperature}°C</span>
                      </label>
                      <button
                        type="button"
                        className={hintButtonStyle}
                        onClick={() => {
                          showHint(
                            "Heating Temperature",
                            "Temperature is a critical factor in synthesizing superconductors. Too low and the materials won't react properly, too high and unwanted phases may form. This is one of the most crucial parameters to optimize.",
                          )
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Slider
                      min={850}
                      max={1050}
                      step={10}
                      value={[experimentVars.heatingTemperature]}
                      onValueChange={(values) => updateExperimentVar("heatingTemperature", values[0])}
                      disabled={simulationRunning}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>850°C</span>
                      <span>1050°C</span>
                    </div>
                  </div>

                  {/* Heating Time */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-blue-100 border-blue-300 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Time
                        </Badge>
                        <span className="mx-2">{experimentVars.heatingTime} hours</span>
                      </label>
                      <button
                        type="button"
                        className={hintButtonStyle}
                        onClick={() => {
                          showHint(
                            "Heating Duration",
                            "The length of time a sample is heated has significant effects on crystal growth and phase formation. Finding the right balance is important - insufficient time may leave the reaction incomplete, while excessive heating could cause decomposition.",
                          )
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[experimentVars.heatingTime]}
                      onValueChange={(values) => updateExperimentVar("heatingTime", values[0])}
                      disabled={simulationRunning}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>1h</span>
                      <span>30h</span>
                    </div>
                  </div>

                  {/* Cooling Method */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-cyan-100 border-cyan-300 text-cyan-800">
                          <Snowflake className="h-3 w-3 mr-1" />
                          Cooling
                        </Badge>
                      </label>
                      <button
                        type="button"
                        className={hintButtonStyle}
                        onClick={() => {
                          showHint(
                            "Cooling Method",
                            "How quickly a sample is cooled after heating affects its final properties. Cooling rate impacts crystal structure development and can influence the material's performance. Consider how different cooling methods might affect your sample.",
                          )
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Select
                      defaultValue={experimentVars.coolingMethod}
                      onValueChange={(value) => updateExperimentVar("coolingMethod", value)}
                      disabled={simulationRunning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cooling method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quench">Quench</SelectItem>
                        <SelectItem value="Slow Cooling (5°C/min)">Slow Cooling (5°C/min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additive */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Badge variant="outline" className="mr-2 bg-violet-100 border-violet-300 text-violet-800">
                          Additive
                        </Badge>
                      </label>
                      <button
                        type="button"
                        className={hintButtonStyle}
                        onClick={() => {
                          showHint(
                            "Chemical Additives",
                            "Certain additives can modify a superconductor's properties by affecting grain boundaries, crystal structure, or carrier concentration. The right additive might enhance performance, while the wrong one could reduce superconductivity. Think about which additives might help or harm.",
                          )
                        }}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Select
                      defaultValue={experimentVars.additive}
                      onValueChange={(value) => updateExperimentVar("additive", value)}
                      disabled={simulationRunning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select additive" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Silver Oxide">Silver Oxide</SelectItem>
                        <SelectItem value="Calcium Oxide">Calcium Oxide</SelectItem>
                        <SelectItem value="Zinc Oxide">Zinc Oxide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Visualization */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200 relative">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                  Experiment Visualization
                </h2>

                {/* Stage progress indicator */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-slate-700">
                      {simulationStage === 0 && "Set parameters and click 'Run Experiment'"}
                      {simulationStage === 1 && "Stage 1: Mixing precursors..."}
                      {simulationStage === 2 && "Stage 2: Heating mixture..."}
                      {simulationStage === 3 && "Stage 3: Cooling sample..."}
                      {simulationStage === 4 && "Experiment complete! View results below."}
                    </div>
                    {simulationStage > 0 && (
                      <Badge
                        variant="outline"
                        className={`${
                          simulationStage === 4
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        {simulationStage === 4 ? <CheckCircle className="h-3 w-3 mr-1" /> : <></>}
                        {simulationProgress}%
                      </Badge>
                    )}
                  </div>
                  {simulationStage > 0 && (
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${simulationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>

                {/* Visualization area */}
                <div className="bg-gradient-to-b from-indigo-50 to-blue-50 rounded-lg border border-blue-200 p-4 h-80 relative flex items-center justify-center">
                  {simulationStage === 0 && (
                    <div className="text-center text-blue-400 flex flex-col items-center justify-center">
                      <Beaker className="h-16 w-16 mb-4 opacity-40" />
                      <p className="text-slate-600 font-medium">Adjust variables and run the experiment to begin.</p>
                    </div>
                  )}

                  {simulationStage > 0 && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Test tube visualization */}
                      <div className="relative flex items-center justify-center h-full">
                        {/* Stage 1-2: Test tube with precursors/heating */}
                        {(simulationStage === 1 || simulationStage === 2) && (
                          <motion.div className="relative h-60 w-28">
                            {/* Test tube glass */}
                            <motion.div
                              className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-60"
                              style={{
                                background:
                                  "linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3))",
                                borderRadius: "15px 15px 30px 30px",
                                border: "2px solid rgba(255,255,255,0.6)",
                                overflow: "hidden",
                              }}
                              animate={
                                containerRocking
                                  ? {
                                      rotate: [-2, 2, -2],
                                    }
                                  : {}
                              }
                              transition={{
                                repeat: containerRocking ? Number.POSITIVE_INFINITY : 0,
                                duration: 0.5,
                              }}
                            >
                              {/* Test tube contents */}
                              <motion.div
                                className={`absolute bottom-0 left-0 right-0 ${
                                  simulationStage === 1
                                    ? "bg-gradient-to-b from-amber-400 to-amber-600"
                                    : "bg-gradient-to-b from-orange-400 via-orange-500 to-red-600"
                                }`}
                                style={{ borderRadius: "0 0 25px 25px" }}
                                initial={{ height: "60%" }}
                                animate={
                                  containerRocking
                                    ? {
                                        height: ["60%", "62%", "60%", "58%", "60%"],
                                      }
                                    : simulationStage === 2
                                      ? {
                                          height: ["60%", "55%"],
                                        }
                                      : {}
                                }
                                transition={{
                                  repeat: containerRocking ? Number.POSITIVE_INFINITY : 0,
                                  duration: simulationStage === 1 ? 0.5 : 2,
                                }}
                              >
                                {/* Bubbles in heating stage */}
                                {simulationStage === 2 && (
                                  <>
                                    {[...Array(10)].map((_, index) => (
                                      <motion.div
                                        key={index}
                                        className="absolute w-2 h-2 rounded-full bg-yellow-200 opacity-80"
                                        initial={{
                                          bottom: "10%",
                                          left: `${10 + index * 8}%`,
                                          opacity: 0,
                                          scale: 0.5,
                                        }}
                                        animate={{
                                          bottom: ["10%", "80%"],
                                          opacity: [0, 0.8, 0],
                                          scale: [0.5, 1.2, 0.8],
                                        }}
                                        transition={{
                                          duration: 2 + Math.random(),
                                          repeat: Number.POSITIVE_INFINITY,
                                          delay: index * 0.3,
                                          repeatType: "loop",
                                        }}
                                      />
                                    ))}
                                  </>
                                )}
                              </motion.div>
                            </motion.div>

                            {/* Heating flames under test tube */}
                            {showFlames && (
                              <motion.div
                                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-36 flex justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {/* Multiple flame elements */}
                                {[...Array(5)].map((_, index) => (
                                  <motion.div
                                    key={index}
                                    className="w-6 h-12 mx-0.5"
                                    style={{
                                      background: "linear-gradient(to top, #ef4444, #f97316, #eab308)",
                                      clipPath: "polygon(50% 0%, 90% 50%, 70% 100%, 30% 100%, 10% 50%)",
                                    }}
                                    animate={{
                                      height: [12 + index * 1.5, 15 + index * 1.5, 12 + index * 1.5],
                                      opacity: [0.7, 0.9, 0.7],
                                    }}
                                    transition={{
                                      repeat: Number.POSITIVE_INFINITY,
                                      duration: 0.5 + index * 0.1,
                                      repeatType: "reverse",
                                    }}
                                  />
                                ))}
                              </motion.div>
                            )}

                            {/* Temperature indicator */}
                            {simulationStage === 2 && (
                              <motion.div
                                className="absolute top-2 right-0 bg-white/80 rounded-full py-1 px-2 text-xs font-medium text-red-600 flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <Thermometer className="h-3 w-3 mr-1" />
                                {Math.min(
                                  experimentVars.heatingTemperature,
                                  Math.round(experimentVars.heatingTemperature * (simulationProgress / 65)),
                                )}
                                °C
                              </motion.div>
                            )}
                          </motion.div>
                        )}

                        {/* Stage 3: Cooling with crystal formation */}
                        {simulationStage === 3 && (
                          <motion.div
                            className="relative h-60 w-32"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {/* Test tube glass */}
                            <div
                              className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-60"
                              style={{
                                background:
                                  "linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3))",
                                borderRadius: "15px 15px 30px 30px",
                                border: "2px solid rgba(255,255,255,0.6)",
                                overflow: "hidden",
                              }}
                            >
                              {/* Cooling contents with crystals forming */}
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-cyan-300 to-blue-500"
                                style={{ borderRadius: "0 0 25px 25px" }}
                                initial={{ height: "60%" }}
                                animate={{ height: "60%" }}
                              >
                                {/* Crystal formations */}
                                <motion.div className="absolute inset-0 flex items-center justify-center">
                                  <div className="relative w-full h-full">
                                    {[...Array(15)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute"
                                        style={{
                                          width: 4 + Math.random() * 8,
                                          height: 15 + Math.random() * 20,
                                          background: "linear-gradient(to top, #bfdbfe, #3b82f6)",
                                          left: `${5 + i * 6}%`,
                                          bottom: `${5 + Math.random() * 30}%`,
                                          transformOrigin: "bottom",
                                          transform: `rotate(${-10 + Math.random() * 20}deg)`,
                                          borderRadius: "2px",
                                          opacity: 0,
                                        }}
                                        animate={{
                                          opacity: [0, 1],
                                          height: [0, 15 + Math.random() * 20],
                                        }}
                                        transition={{
                                          duration: 1.5,
                                          delay: 0.5 + i * 0.15,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Cooling effect */}
                            {showCoolEffect && (
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {/* Cooling method visualization */}
                                {experimentVars.coolingMethod === "Quench" ? (
                                  // Water droplets for quenching
                                  <div className="absolute inset-0">
                                    {[...Array(15)].map((_, index) => (
                                      <motion.div
                                        key={index}
                                        className="absolute w-1.5 h-3 bg-blue-400 rounded-full"
                                        style={{
                                          left: `${Math.random() * 100}%`,
                                          top: `-5%`,
                                        }}
                                        animate={{
                                          top: ["0%", "110%"],
                                          opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                          duration: 1,
                                          delay: index * 0.1,
                                          repeat: 2,
                                          repeatType: "loop",
                                        }}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  // Cooling waves for slow cooling
                                  <div className="absolute inset-0">
                                    {[...Array(3)].map((_, index) => (
                                      <motion.div
                                        key={index}
                                        className="absolute inset-4 border border-cyan-400 rounded-full opacity-0"
                                        initial={{ scale: 0.6 }}
                                        animate={{
                                          scale: [0.6, 1.2],
                                          opacity: [0.7, 0],
                                        }}
                                        transition={{
                                          duration: 2,
                                          delay: index * 0.7,
                                          repeat: 2,
                                          repeatType: "loop",
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        )}

                        {/* Stage 4: Final superconductor sample */}
                        {simulationStage === 4 && (
                          <motion.div
                            className="relative flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {/* Superconductor puck */}
                            <motion.div
                              className="w-28 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl flex items-center justify-center"
                              initial={{ scale: 0.7 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              <span className="font-bold text-xs text-cyan-300">YBCO</span>

                              {/* Shine effect */}
                              <motion.div
                                className="absolute inset-0 rounded-xl overflow-hidden"
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                }}
                                animate={{
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatDelay: 3,
                                }}
                              />
                            </motion.div>

                            {/* Levitation effect */}
                            {showLevitation && currentResults && (
                              <div className="mt-8 relative">
                                {/* Magnet */}
                                <motion.div
                                  className="w-36 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg flex items-center justify-center"
                                  initial={{ y: 0 }}
                                  animate={{ y: 0 }}
                                >
                                  <span className="text-white text-xs font-bold">MAGNET</span>
                                </motion.div>

                                {/* Floating YBCO sample */}
                                <motion.div
                                  className="absolute w-24 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center shadow-xl"
                                  initial={{ top: 0 }}
                                  animate={{
                                    top: -Math.max(12, Math.min(35, currentResults.levitationHeight * 4)),
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 8,
                                    delay: 0.2,
                                  }}
                                >
                                  <span className="text-cyan-300 text-xs font-bold">YBCO</span>

                                  {/* Levitation glow effect */}
                                  <motion.div
                                    className="absolute -bottom-3 left-0 right-0 h-3 bg-blue-400 blur-md opacity-40"
                                    animate={{
                                      opacity: [0.4, 0.7, 0.4],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Number.POSITIVE_INFINITY,
                                    }}
                                  />
                                </motion.div>

                                {/* Magnetic field lines */}
                                <div className="absolute top-[-40px] bottom-0 left-0 right-0 flex flex-col justify-center">
                                  {[...Array(5)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute border-t border-dashed border-blue-400 w-full"
                                      style={{ top: i * 8 }}
                                      animate={{
                                        opacity: [0.2, 0.6, 0.2],
                                        scale: [0.9, 1, 0.9],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        delay: i * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>

                                {/* Height indicator */}
                                <div className="absolute right-[-25px] top-0 bottom-0 w-1 bg-gray-200">
                                  <motion.div
                                    className="absolute left-0 right-0 text-xs font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                      top: -Math.max(12, Math.min(35, currentResults.levitationHeight * 4)),
                                      transform: "translateY(-50%)",
                                    }}
                                  >
                                    <div className="bg-blue-100 text-blue-800 px-1 rounded-sm whitespace-nowrap">
                                      {currentResults.levitationHeight.toFixed(1)} mm
                                    </div>
                                    <div className="h-px w-3 bg-blue-400 absolute right-full top-1/2" />
                                  </motion.div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Results section */}
                <AnimatePresence>
                  {currentResults && (
                    <motion.div
                      className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2 text-blue-600" />
                        Experiment Results
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Purity */}
                        <div className="bg-white rounded-lg p-3 border border-blue-100 flex flex-col">
                          <div className="text-sm text-slate-500 mb-1">Superconductor Purity</div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-slate-800">
                                {currentResults.purity.toFixed(1)}
                              </span>
                              <span className="text-sm ml-1">%</span>
                            </div>
                            <div
                              className={`text-xs font-medium
                              ${
                                currentResults.purity >= 85
                                  ? "text-green-600"
                                  : currentResults.purity >= 70
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }
                            `}
                            >
                              {currentResults.purity >= 85
                                ? "Excellent"
                                : currentResults.purity >= 70
                                  ? "Good"
                                  : "Poor"}
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                            <motion.div
                              className={`h-2 rounded-full ${
                                currentResults.purity >= 85
                                  ? "bg-green-500"
                                  : currentResults.purity >= 70
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              initial={{ width: "0%" }}
                              animate={{ width: `${currentResults.purity}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>

                        {/* Levitation */}
                        <div className="bg-white rounded-lg p-3 border border-blue-100 flex flex-col">
                          <div className="text-sm text-slate-500 mb-1">Levitation Strength</div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-slate-800">
                                {currentResults.levitationHeight.toFixed(1)}
                              </span>
                              <span className="text-sm ml-1">mm</span>
                            </div>
                            <div
                              className={`text-xs font-medium
                              ${
                                currentResults.levitationHeight >= 8.5
                                  ? "text-green-600"
                                  : currentResults.levitationHeight >= 7
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }
                            `}
                            >
                              {currentResults.levitationHeight >= 8.5
                                ? "Strong"
                                : currentResults.levitationHeight >= 7
                                  ? "Moderate"
                                  : "Weak"}
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                            <motion.div
                              className={`h-2 rounded-full ${
                                currentResults.levitationHeight >= 8.5
                                  ? "bg-green-500"
                                  : currentResults.levitationHeight >= 7
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              initial={{ width: "0%" }}
                              animate={{ width: `${(currentResults.levitationHeight / 10) * 100}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Success/Failure Message */}
                      {currentResults.purity >= 85 && currentResults.levitationHeight >= 8 ? (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-bold text-green-800">
                              Success! You've met the MagLev requirements!
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="font-bold text-yellow-800">
                              Keep experimenting! Try adjusting your parameters to reach the goals.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Add to lab notebook section */}
                      <div className="mt-4 flex flex-col">
                        <div className="mb-2 flex items-center">
                          <label className="text-sm font-medium text-slate-700">Add notes to lab notebook:</label>
                        </div>
                        <div className="flex gap-3">
                          <Textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Enter observations or notes about this experiment..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button onClick={addToLabNotebook} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Log Results
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Lab Notebook */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200 mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <ScrollText className="h-5 w-5 mr-2 text-blue-600" />
                    Lab Notebook
                  </h2>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadLabNotebook}
                      disabled={labNotebook.length === 0}
                      className="text-xs bg-transparent"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {labNotebook.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-blue-100">
                    <FileText className="h-16 w-16 mx-auto mb-3 text-blue-200" />
                    <p>No experiments logged yet. Run experiments and add results to your lab notebook.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labNotebook.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`bg-gradient-to-r ${index % 2 === 0 ? "from-blue-50 to-indigo-50" : "from-slate-50 to-blue-50"} rounded-lg border border-blue-100 p-4 shadow-sm transition-all hover:shadow-md`}
                      >
                        {/* Header with timestamp and delete button */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-sm font-semibold text-blue-600">
                              Entry #{labNotebook.length - index}
                            </span>
                            <span className="ml-3 text-sm text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLabEntry(entry.id)}
                            className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                          </Button>
                        </div>

                        {/* Variables grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                          <div className="bg-white p-2 rounded-md border border-amber-100">
                            <span className="text-xs text-amber-700 font-medium block">Precursors</span>
                            <span className="text-sm text-slate-700 font-medium break-words">
                              {entry.variables.precursors}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-md border border-rose-100">
                            <span className="text-xs text-rose-700 font-medium block">Temperature</span>
                            <span className="text-sm text-slate-700 font-medium">
                              {entry.variables.heatingTemperature}°C
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-md border border-blue-100">
                            <span className="text-xs text-blue-700 font-medium block">Time</span>
                            <span className="text-sm text-slate-700 font-medium">
                              {entry.variables.heatingTime} hours
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-md border border-cyan-100">
                            <span className="text-xs text-cyan-700 font-medium block">Cooling</span>
                            <span className="text-sm text-slate-700 font-medium break-words">
                              {entry.variables.coolingMethod}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-md border border-violet-100">
                            <span className="text-xs text-violet-700 font-medium block">Additive</span>
                            <span className="text-sm text-slate-700 font-medium break-words">
                              {entry.variables.additive}
                            </span>
                          </div>
                        </div>

                        {/* Results section */}
                        <div className="flex flex-col md:flex-row gap-3 mb-3">
                          <div className="bg-white p-3 rounded-md flex-1 border border-green-100">
                            <span className="text-xs text-green-700 font-medium">Purity</span>
                            <div className="flex items-baseline">
                              <span
                                className={`text-xl font-bold ${entry.purity >= 85 ? "text-green-600" : "text-slate-700"}`}
                              >
                                {entry.purity.toFixed(1)}%
                              </span>
                              {entry.purity >= 85 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                  Goal Met!
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                              <div
                                className={`h-1.5 rounded-full ${
                                  entry.purity >= 85
                                    ? "bg-green-500"
                                    : entry.purity >= 70
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${entry.purity}%` }}
                              />
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-md flex-1 border border-blue-100">
                            <span className="text-xs text-blue-700 font-medium">Levitation Height</span>
                            <div className="flex items-baseline">
                              <span
                                className={`text-xl font-bold ${entry.levitationHeight >= 8 ? "text-blue-600" : "text-slate-700"}`}
                              >
                                {entry.levitationHeight.toFixed(1)} mm
                              </span>
                              {entry.levitationHeight >= 8 && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                  Goal Met!
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                              <div
                                className={`h-1.5 rounded-full ${
                                  entry.levitationHeight >= 8
                                    ? "bg-blue-500"
                                    : entry.levitationHeight >= 6
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${(entry.levitationHeight / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Comments section */}
                        {entry.comments && (
                          <div className="bg-white p-3 rounded-md border border-slate-200">
                            <span className="text-xs text-slate-500 font-medium block mb-1">Notes</span>
                            <p className="text-sm text-slate-700">{entry.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Complete Button */}
              <div className="text-center">
                <Button
                  onClick={handleStepComplete}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-green-600"
                  disabled={labNotebook.length === 0}
                >
                  Complete Laboratory Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {labNotebook.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Complete at least one experiment to continue</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Hint Dialog */}
      {openHintDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold text-slate-800">{currentHint.title}</h3>
              <button
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                onClick={() => setOpenHintDialog(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Scientific information to help with your experiment</p>
            <p className="text-slate-700 mb-6">{currentHint.description}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => setOpenHintDialog(false)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
