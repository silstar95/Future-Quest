"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FinancePreReflection } from "@/components/simulation/finance/finance-pre-reflection"
import { FinanceExploration } from "@/components/simulation/finance/finance-exploration"
import { FinanceOfficeViewer } from "@/components/simulation/finance/finance-office-viewer"
import { FinancialHealthTask } from "@/components/simulation/finance/tasks/financial-health-task"
import { InvestmentAdvisorTask } from "@/components/simulation/finance/tasks/investment-advisor-task"
import { SimulationComplete } from "@/components/simulation/simulation-complete"
import { useAuth } from "@/hooks/use-auth"
import { saveSimulationProgress, getSimulationProgress } from "@/lib/firebase-service"
import { ArrowLeft, DollarSign, TrendingUp, BarChart3, Calculator, Shield } from "lucide-react"

type SimulationPhase =
  | "pre-reflection"
  | "exploration"
  | "experience"
  | "task-1"
  | "task-2"
  | "task-3"
  | "task-4"
  | "task-5"
  | "complete"

interface FinanceSimulationData {
  preReflection?: any
  exploration?: any
  taskData?: {
    [key: string]: any
  }
  completedTasks?: string[]
  currentLocation?: string
}

const tasks = [
  {
    id: "task-1",
    title: "Financial Health Check-Up",
    role: "Financial Analyst",
    location: "analysis",
    description: "Analyze a company's financial health using key financial statements",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "bg-green-500",
  },
  {
    id: "task-2",
    title: "Investment Advisor",
    role: "Investment Advisor",
    location: "investment",
    description: "Make strategic investment decisions and pitch to stakeholders",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-blue-500",
  },
  {
    id: "task-3",
    title: "Corporate Treasurer",
    role: "Corporate Treasurer",
    location: "treasury",
    description: "Create and manage company budgets with strategic allocation",
    icon: <DollarSign className="w-5 h-5" />,
    color: "bg-purple-500",
  },
  {
    id: "task-4",
    title: "Financial Analyst",
    role: "Financial Analyst",
    location: "research",
    description: "Develop crisis management plans during economic recession",
    icon: <Calculator className="w-5 h-5" />,
    color: "bg-orange-500",
  },
  {
    id: "task-5",
    title: "Risk Manager",
    role: "Risk Manager",
    location: "risk",
    description: "Assess financial risks and make ethical business decisions",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-red-500",
  },
]

export default function FinanceSimulationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>("pre-reflection")
  const [simulationData, setSimulationData] = useState<FinanceSimulationData>({
    taskData: {},
    completedTasks: [],
    currentLocation: "lobby",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return

      try {
        const progress = await getSimulationProgress(user.uid, "finance")
        if (progress) {
          setSimulationData(
            progress.data || {
              taskData: {},
              completedTasks: [],
              currentLocation: "lobby",
            },
          )
          setCurrentPhase((progress.currentPhase as SimulationPhase) || "pre-reflection")
        }
      } catch (error) {
        console.error("Error loading simulation progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [user])

  // Save progress
  const saveProgress = async (phase: SimulationPhase, data: FinanceSimulationData) => {
    if (!user) return

    setIsSaving(true)
    try {
      await saveSimulationProgress(user.uid, "finance", {
        currentPhase: phase,
        data,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreReflectionComplete = async (data: any) => {
    const newData = { ...simulationData, preReflection: data }
    setSimulationData(newData)
    setCurrentPhase("exploration")
    await saveProgress("exploration", newData)
  }

  const handleExplorationComplete = async (data: any) => {
    const newData = { ...simulationData, exploration: data }
    setSimulationData(newData)
    setCurrentPhase("experience")
    await saveProgress("experience", newData)
  }

  const handleTaskSelect = async (taskId: string) => {
    setCurrentPhase(taskId as SimulationPhase)
    await saveProgress(taskId as SimulationPhase, simulationData)
  }

  const handleTaskComplete = async (taskId: string, data: any) => {
    const newTaskData = { ...simulationData.taskData, [taskId]: data }
    const newCompletedTasks = [...(simulationData.completedTasks || []), taskId]
    const newData = {
      ...simulationData,
      taskData: newTaskData,
      completedTasks: newCompletedTasks,
    }

    setSimulationData(newData)

    // Check if all tasks are completed
    if (newCompletedTasks.length === tasks.length) {
      setCurrentPhase("complete")
      await saveProgress("complete", newData)
    } else {
      setCurrentPhase("experience")
      await saveProgress("experience", newData)
    }
  }

  const handleLocationChange = async (location: string) => {
    const newData = { ...simulationData, currentLocation: location }
    setSimulationData(newData)
    await saveProgress(currentPhase, newData)
  }

  const handleTaskReview = (taskId: string) => {
    setCurrentPhase(taskId as SimulationPhase)
  }

  const getProgress = () => {
    const phases = ["pre-reflection", "exploration", "experience"]
    const completedTasks = simulationData.completedTasks?.length || 0
    const totalTasks = tasks.length

    if (currentPhase === "complete") return 100
    if (currentPhase === "experience") {
      return 60 + (completedTasks / totalTasks) * 40
    }

    const phaseIndex = phases.indexOf(currentPhase)
    return phaseIndex >= 0 ? (phaseIndex / phases.length) * 60 : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Finance Simulation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push("/simulations")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Simulations
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Risk, Reward, and Real World Finance</h1>
                <p className="text-sm text-gray-600">Navigate the risks of managing company finances</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{Math.round(getProgress())}% Complete</div>
                <Progress value={getProgress()} className="w-32 h-2" />
              </div>
              {isSaving && (
                <Badge variant="outline" className="text-blue-600">
                  Saving...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pre-Reflection Phase */}
        {currentPhase === "pre-reflection" && (
          <FinancePreReflection onComplete={handlePreReflectionComplete} initialData={simulationData.preReflection} />
        )}

        {/* Exploration Phase */}
        {currentPhase === "exploration" && (
          <FinanceExploration onComplete={handleExplorationComplete} initialData={simulationData.exploration} />
        )}

        {/* Experience Phase - Office Viewer */}
        {currentPhase === "experience" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                  Finance Department Hub
                </CardTitle>
                <p className="text-gray-600">
                  Navigate through different departments to complete finance tasks. Each room represents a different
                  role in the finance industry.
                </p>
              </CardHeader>
            </Card>

            <FinanceOfficeViewer
              currentLocation={simulationData.currentLocation || "lobby"}
              onLocationChange={handleLocationChange}
              tasks={tasks}
              completedTasks={simulationData.completedTasks || []}
              taskData={simulationData.taskData}
              onTaskSelect={handleTaskSelect}
              onTaskReview={handleTaskReview}
            />

            {/* Task Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {tasks.map((task) => {
                    const isCompleted = simulationData.completedTasks?.includes(task.id)
                    const hasData = simulationData.taskData?.[task.id]

                    return (
                      <Card
                        key={task.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isCompleted ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                        onClick={() => handleTaskSelect(task.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`${task.color} text-white p-3 rounded-lg mx-auto mb-3 w-fit`}>
                            {task.icon}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{task.role}</p>
                          <div className="flex justify-center gap-1">
                            {isCompleted && (
                              <Badge variant="outline" className="text-xs">
                                ✓ Done
                              </Badge>
                            )}
                            {hasData && !isCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Individual Tasks */}
        {currentPhase === "task-1" && (
          <FinancialHealthTask
            onComplete={(data) => handleTaskComplete("task-1", data)}
            initialData={simulationData.taskData?.["task-1"]}
          />
        )}

        {currentPhase === "task-2" && (
          <InvestmentAdvisorTask
            onComplete={(data) => handleTaskComplete("task-2", data)}
            initialData={simulationData.taskData?.["task-2"]}
            companyName={simulationData.taskData?.["task-1"]?.selectedCompany}
          />
        )}

        {/* Completion Phase */}
        {currentPhase === "complete" && (
          <SimulationComplete
            simulationType="finance"
            completedTasks={simulationData.completedTasks || []}
            totalTasks={tasks.length}
            onContinue={() => router.push("/simulations")}
          />
        )}
      </div>
    </div>
  )
}
