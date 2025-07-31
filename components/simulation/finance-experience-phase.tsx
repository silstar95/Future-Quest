"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Play, RotateCcw } from "lucide-react"
import { FinanceGameOfficeViewer } from "./finance-game-office-viewer"

// Import finance task components
import FinanceTaskOne from "./tasks/finance/task-one"
import FinanceTaskTwo from "./tasks/finance/task-two"
import FinanceTaskThree from "./tasks/finance/task-three"
import FinanceTaskFour from "./tasks/finance/task-four"
import FinanceTaskFive from "./tasks/finance/task-five"

interface FinanceExperiencePhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

export default function FinanceExperiencePhase({ onComplete, initialData }: FinanceExperiencePhaseProps) {
  const [currentTask, setCurrentTask] = useState<number | null>(null)
  const [completedTasks, setCompletedTasks] = useState<number[]>(initialData?.completedTasks || [])
  const [taskData, setTaskData] = useState<Record<number, any>>(initialData?.taskData || {})

  const tasks = [
    {
      id: 1,
      title: "Financial Health Check-Up",
      role: "Financial Health Specialist",
      description: "Analyze company financial statements and identify key health indicators",
      estimatedTime: "45 minutes",
      isCompleted: completedTasks.includes(1),
    },
    {
      id: 2,
      title: "Investment Advisory Session",
      role: "Investment Advisor",
      description: "Provide investment recommendations based on client risk profile",
      estimatedTime: "40 minutes",
      isCompleted: completedTasks.includes(2),
    },
    {
      id: 3,
      title: "Corporate Treasury Management",
      role: "Corporate Treasurer",
      description: "Manage company cash flow and budget allocation decisions",
      estimatedTime: "50 minutes",
      isCompleted: completedTasks.includes(3),
    },
    {
      id: 4,
      title: "Financial Analysis & Forecasting",
      role: "Financial Analyst",
      description: "Create financial models and forecasts for business planning",
      estimatedTime: "55 minutes",
      isCompleted: completedTasks.includes(4),
    },
    {
      id: 5,
      title: "Risk Assessment & Crisis Management",
      role: "Risk Manager",
      description: "Evaluate financial risks and develop mitigation strategies",
      estimatedTime: "45 minutes",
      isCompleted: completedTasks.includes(5),
    },
  ]

  const handleTaskSelect = (taskId: number) => {
    console.log("Task selected:", taskId)
    setCurrentTask(taskId)
  }

  const handleTaskComplete = (taskId: number, data: any) => {
    console.log("Task completed:", taskId, data)

    const newCompletedTasks = [...completedTasks, taskId]
    const newTaskData = { ...taskData, [taskId]: data }

    setCompletedTasks(newCompletedTasks)
    setTaskData(newTaskData)
    setCurrentTask(null)

    // Check if all tasks are completed
    if (newCompletedTasks.length === tasks.length) {
      onComplete({
        completedTasks: newCompletedTasks,
        taskData: newTaskData,
        allTasksCompleted: true,
      })
    }
  }

  const handleBackToOffice = () => {
    setCurrentTask(null)
  }

  const handleRetryTask = (taskId: number) => {
    setCurrentTask(taskId)
  }

  const renderTaskComponent = (taskId: number) => {
    const commonProps = {
      onComplete: (data: any) => handleTaskComplete(taskId, data),
      onBack: handleBackToOffice,
      initialData: taskData[taskId],
    }

    switch (taskId) {
      case 1:
        return <FinanceTaskOne {...commonProps} />
      case 2:
        return <FinanceTaskTwo {...commonProps} />
      case 3:
        return <FinanceTaskThree {...commonProps} />
      case 4:
        return <FinanceTaskFour {...commonProps} />
      case 5:
        return <FinanceTaskFive {...commonProps} />
      default:
        return null
    }
  }

  const completionPercentage = Math.round((completedTasks.length / tasks.length) * 100)

  // If a task is selected, show the task component
  if (currentTask) {
    return renderTaskComponent(currentTask)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-brand-primary">🏢 Experience Finance Roles</CardTitle>
              <p className="text-gray-600 mt-2">
                Navigate the finance office and complete real-world tasks in different finance roles
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Office Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            🎮 Interactive Finance Office
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              {completedTasks.length}/{tasks.length} Tasks Complete
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Use WASD or arrow keys to move around the office. Walk close to rooms or click them to start tasks.
          </p>
        </CardHeader>
        <CardContent>
          <FinanceGameOfficeViewer tasks={tasks} onTaskSelect={handleTaskSelect} title="Finance Department" />
        </CardContent>
      </Card>

      {/* Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={`border-2 ${task.isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{task.title}</h4>
                    {task.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Play className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{task.role}</p>
                  <p className="text-xs text-gray-500 mb-3">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.estimatedTime}
                    </div>
                    {task.isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryTask(task.id)}
                        className="text-xs h-6"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {completedTasks.length === tasks.length && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-800">🎉 All Tasks Completed!</h3>
              <p className="text-green-700">Excellent work! You've successfully experienced all finance roles.</p>
            </div>
            <Button
              onClick={() =>
                onComplete({
                  completedTasks,
                  taskData,
                  allTasksCompleted: true,
                })
              }
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Continue to Reflection →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
