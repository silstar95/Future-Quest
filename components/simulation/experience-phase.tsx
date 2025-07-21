"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TaskOne } from "./tasks/task-one"
import { TaskTwo } from "./tasks/task-two"
import { TaskThree } from "./tasks/task-three"
import { TaskFour } from "./tasks/task-four"
import { TaskFive } from "./tasks/task-five"
import { GameOfficeViewer } from "./game-office-viewer"
import { Star, Users, TrendingUp, Shield, Megaphone, CheckCircle, Play, Trophy, Building } from "lucide-react"
import { TaskReflection } from "./task-reflection"
import { RoleDebrief } from "./role-debrief"

interface ExperiencePhaseProps {
  onComplete: (data: any) => void
  initialData?: any
}

const TASKS = [
  {
    id: "task-1",
    title: "Celebrity Brand Identity Workshop",
    role: "Brand Strategist",
    icon: Star,
    color: "from-purple-500 to-pink-500",
    location: "whiteboard",
    description: "Design your celebrity's unique brand identity in our creative workshop.",
    difficulty: "Easy",
  },
  {
    id: "task-2",
    title: "Partnership Strategy Lab",
    role: "Partnerships Manager",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    location: "research",
    description: "Develop long-term partnership strategies in our research center.",
    difficulty: "Medium",
  },
  {
    id: "task-3",
    title: "Viral Content Creation Studio",
    role: "Social Media Strategist",
    icon: Megaphone,
    color: "from-green-500 to-emerald-500",
    location: "creative",
    description: "Create viral social media campaigns in our creative studio.",
    difficulty: "Medium",
  },
  {
    id: "task-4",
    title: "Competitive Intelligence Center",
    role: "Brand Strategist",
    icon: Users,
    color: "from-orange-500 to-red-500",
    location: "research",
    description: "Analyze competition and develop winning strategies.",
    difficulty: "Hard",
  },
  {
    id: "task-5",
    title: "Crisis Management Command Center",
    role: "Public Relations Manager",
    icon: Shield,
    color: "from-red-500 to-pink-500",
    location: "media",
    description: "Handle PR crises with professional damage control.",
    difficulty: "Hard",
  },
]

export function ExperiencePhase({ onComplete, initialData }: ExperiencePhaseProps) {
  const [currentTask, setCurrentTask] = useState(initialData?.currentTask || 0)
  const [completedTasks, setCompletedTasks] = useState<string[]>(initialData?.completedTasks || [])
  const [taskData, setTaskData] = useState(initialData?.taskData || {})
  const [currentLocation, setCurrentLocation] = useState(initialData?.currentLocation || "lobby")
  const [showTask, setShowTask] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [showDebrief, setShowDebrief] = useState(false)
  const [currentTaskReflection, setCurrentTaskReflection] = useState<any>(null)
  const [reviewingTask, setReviewingTask] = useState<string | null>(null)

  const progress = (completedTasks.length / TASKS.length) * 100
  const currentTaskData = TASKS[currentTask]

  const handleTaskComplete = (taskId: string, data: any) => {
    const task = TASKS.find((t) => t.id === taskId)
    setCurrentTaskReflection({ taskId, taskTitle: task?.title, role: task?.role })
    setTaskData((prev: any) => ({ ...prev, [taskId]: data }))
    setShowTask(false)
    setShowReflection(true)
  }

  const handleReflectionComplete = (reflectionData: any) => {
    setTaskData((prev: any) => ({
      ...prev,
      [`${currentTaskReflection.taskId}_reflection`]: reflectionData,
    }))
    setShowReflection(false)
    setShowDebrief(true)
  }

  const handleDebriefComplete = () => {
    const newCompletedTasks = [...completedTasks, currentTaskReflection.taskId]
    setCompletedTasks(newCompletedTasks)
    setShowDebrief(false)
    setCurrentTaskReflection(null)

    if (newCompletedTasks.length === TASKS.length) {
      // All tasks completed
      onComplete({
        completedTasks: newCompletedTasks,
        taskData,
        completedAt: new Date().toISOString(),
      })
    } else {
      // Move to next task
      setCurrentTask(currentTask + 1)
    }
  }

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location)

    // Check if this location has the current task
    if (currentTaskData && location === currentTaskData.location && !completedTasks.includes(currentTaskData.id)) {
      setShowTask(true)
    } else {
      setShowTask(false)
    }
  }

  const handleTaskSelect = (taskId: string) => {
    const task = TASKS.find((t) => t.id === taskId)
    if (task && !completedTasks.includes(taskId)) {
      setShowTask(true)
    }
  }

  const handleTaskReview = (taskId: string) => {
    setReviewingTask(taskId)
    setShowTask(true)
  }

  const renderCurrentTask = () => {
    const taskId = reviewingTask || currentTaskData?.id
    const isReviewing = reviewingTask !== null
    const existingData = isReviewing ? taskData[taskId] : undefined

    const taskProps = {
      onComplete: isReviewing
        ? (data: any) => {
            setTaskData((prev: any) => ({ ...prev, [taskId]: data }))
            setReviewingTask(null)
            setShowTask(false)
          }
        : (data: any) => handleTaskComplete(taskId, data),
      initialData: existingData,
    }

    switch (taskId) {
      case "task-1":
        return <TaskOne {...taskProps} />
      case "task-2":
        return <TaskTwo {...taskProps} celebrityData={taskData["task-1"]} />
      case "task-3":
        return <TaskThree {...taskProps} celebrityData={taskData["task-1"]} />
      case "task-4":
        return <TaskFour {...taskProps} celebrityData={taskData["task-1"]} />
      case "task-5":
        return <TaskFive {...taskProps} celebrityData={taskData["task-1"]} />
      default:
        return null
    }
  }

  if (showReflection && currentTaskReflection) {
    return <TaskReflection taskTitle={currentTaskReflection.taskTitle} onComplete={handleReflectionComplete} />
  }

  if (showDebrief && currentTaskReflection) {
    return <RoleDebrief role={currentTaskReflection.role} onContinue={handleDebriefComplete} />
  }

  if (showTask && (currentTaskData || reviewingTask)) {
    const displayTask = reviewingTask ? TASKS.find((t) => t.id === reviewingTask) : currentTaskData
    const isReviewing = reviewingTask !== null

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Task Header */}
        <Card className={`bg-gradient-to-r ${displayTask?.color} text-white border-0 shadow-2xl`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-2xl mb-2">
                  {displayTask?.icon && <displayTask.icon className="mr-3 h-8 w-8" />}
                  {displayTask?.title}
                  {isReviewing && <Badge className="ml-3 bg-white/20 text-white border-white/30">Review Mode</Badge>}
                </CardTitle>
                <div className="flex items-center gap-4 text-white/90">
                  <Badge className="bg-white/20 text-white border-white/30">{displayTask?.role}</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#{TASKS.findIndex((t) => t.id === displayTask?.id) + 1}</div>
                <div className="text-sm opacity-75">of {TASKS.length}</div>
              </div>
            </div>
            <p className="text-white/80 text-lg">{displayTask?.description}</p>
          </CardHeader>
        </Card>

        {/* Task Content */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100">{renderCurrentTask()}</div>

        {/* Back to Office Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setShowTask(false)
              setReviewingTask(null)
            }}
            className="bg-white/80 backdrop-blur-sm"
          >
            ← Back to Office
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Experience Header */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <Play className="mr-3 h-8 w-8" />
            Marketing Agency Experience
          </CardTitle>
          <p className="text-blue-100 text-lg leading-relaxed">
            Welcome to Future Marketing Agency! Navigate through our high-tech office, complete career tasks, and help
            make your celebrity the biggest star in their industry.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-300 flex items-center justify-center">
                <CheckCircle className="mr-2 h-6 w-6" />
                {completedTasks.length}
              </div>
              <div className="text-sm opacity-90">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300 flex items-center justify-center">
                <Trophy className="mr-2 h-6 w-6" />
                {TASKS.length - completedTasks.length}
              </div>
              <div className="text-sm opacity-90">Tasks Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm opacity-90">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Task Overview */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-500" />
            Career Role Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TASKS.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id)
              const isCurrent = index === currentTask && !isCompleted
              const isLocked = index > completedTasks.length
              const IconComponent = task.icon

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                      : isCurrent
                        ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-200"
                        : isLocked
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-gradient-to-r ${task.color} shadow-lg`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <IconComponent className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{task.role}</h4>
                    <p className="text-xs text-gray-600 mb-2">{task.title}</p>
                    <div className="flex justify-center gap-1">
                      <Badge
                        variant={
                          task.difficulty === "Easy"
                            ? "default"
                            : task.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {task.difficulty}
                      </Badge>
                    </div>
                    {isCurrent && (
                      <div className="mt-2 text-xs font-medium text-blue-600 animate-pulse">
                        → Go to {task.location}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Office */}
      <Card className="border-2 border-gray-200 shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-6 w-6 text-blue-600" />
            Future Marketing Agency Office
          </CardTitle>
          <p className="text-gray-600">
            Navigate through our high-tech office to complete your missions. Use keyboard controls to move around!
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <GameOfficeViewer
            currentLocation={currentLocation}
            onLocationChange={handleLocationChange}
            tasks={TASKS}
            completedTasks={completedTasks}
            currentTask={currentTaskData}
            taskData={taskData}
            onTaskSelect={handleTaskSelect}
            onTaskReview={handleTaskReview}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-blue-800">Ready for Your Next Mission?</h3>
            <p className="text-blue-700 mb-4">
              {currentTaskData ? (
                <>
                  Navigate to the <strong>{currentTaskData.location}</strong> to start "{currentTaskData.title}"
                </>
              ) : (
                "All missions completed! Great work!"
              )}
            </p>
            {completedTasks.length === TASKS.length && (
              <Button
                onClick={() =>
                  onComplete({
                    completedTasks,
                    taskData,
                    completedAt: new Date().toISOString(),
                  })
                }
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Complete All Missions
            </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
