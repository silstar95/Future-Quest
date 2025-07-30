"use client"

import { useState, useRef } from "react"
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
import {
  Star,
  Users,
  TrendingUp,
  Shield,
  Megaphone,
  CheckCircle,
  Play,
  Trophy,
  Building,
  Eye,
  Edit,
  MapPin,
  ArrowRight,
} from "lucide-react"
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
    prerequisite: null, // Must be completed first
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
    prerequisite: "task-1", // Requires celebrity identity
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
    prerequisite: "task-1", // Requires celebrity identity
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
    prerequisite: "task-1", // Requires celebrity identity
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
    prerequisite: "task-1", // Requires celebrity identity
  },
]

const ROOM_NAMES = {
  lobby: "Lobby",
  whiteboard: "Strategy Room",
  research: "Research Room",
  creative: "Creative Studio",
  media: "Media Room",
}

export function ExperiencePhase({ onComplete, initialData }: ExperiencePhaseProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>(initialData?.completedTasks || [])
  const [taskData, setTaskData] = useState(initialData?.taskData || {})
  const [currentLocation, setCurrentLocation] = useState(initialData?.currentLocation || "lobby")
  const [showTask, setShowTask] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [showDebrief, setShowDebrief] = useState(false)
  const [currentTaskReflection, setCurrentTaskReflection] = useState<any>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [isReviewMode, setIsReviewMode] = useState(false)

  const gameOfficeViewerRef = useRef<any>(null)

  const progress = (completedTasks.length / TASKS.length) * 100

  const isTaskAvailable = (taskId: string) => {
    const task = TASKS.find((t) => t.id === taskId)
    if (!task) return false

    // Task 1 is always available
    if (task.id === "task-1") return true

    // Other tasks require task-1 to be completed
    if (task.prerequisite && !completedTasks.includes(task.prerequisite)) {
      return false
    }

    return true
  }

  const getNextTask = () => {
    // Find the next incomplete task that's available
    for (const task of TASKS) {
      if (!completedTasks.includes(task.id) && isTaskAvailable(task.id)) {
        return task
      }
    }
    return null
  }

  const getRecommendedRoom = () => {
    const nextTask = getNextTask()
    if (nextTask) {
      return {
        room: nextTask.location,
        roomName: ROOM_NAMES[nextTask.location as keyof typeof ROOM_NAMES],
        task: nextTask,
      }
    }
    return null
  }

  const getAvailableTasksForLocation = (location: string) => {
    return TASKS.filter((task) => task.location === location && isTaskAvailable(task.id))
  }

  const handleTaskComplete = (taskId: string, data: any) => {
    const task = TASKS.find((t) => t.id === taskId)

    // Store current cat position before showing reflection
    if (gameOfficeViewerRef.current) {
      const position = gameOfficeViewerRef.current.getCatPosition()
    }

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
    setActiveTaskId(null)
    setIsReviewMode(false)

    if (newCompletedTasks.length === TASKS.length) {
      // All tasks completed
      onComplete({
        completedTasks: newCompletedTasks,
        taskData,
        completedAt: new Date().toISOString(),
      })
    }
  }

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location)
  }

  const handleTaskSelect = (taskId: string) => {
    const task = TASKS.find((t) => t.id === taskId)
    if (task && isTaskAvailable(taskId) && !completedTasks.includes(taskId)) {
      setActiveTaskId(taskId)
      setIsReviewMode(false)
      setShowTask(true)
    }
  }

  const handleTaskReview = (taskId: string) => {
    if (completedTasks.includes(taskId) && taskData[taskId]) {
      setActiveTaskId(taskId)
      setIsReviewMode(true)
      setShowTask(true)
    }
  }

  const handleTaskEdit = (taskId: string) => {
    if (completedTasks.includes(taskId) && taskData[taskId]) {
      setActiveTaskId(taskId)
      setIsReviewMode(false)
      setShowTask(true)
    }
  }

  const renderCurrentTask = () => {
    if (!activeTaskId) return null

    const isCompleted = completedTasks.includes(activeTaskId)
    const existingData = taskData[activeTaskId]

    const taskProps = {
      onComplete: isReviewMode
        ? (data: any) => {
            // In review mode, just close the task
            setShowTask(false)
            setActiveTaskId(null)
            setIsReviewMode(false)
          }
        : (data: any) => {
            if (isCompleted) {
              // Editing existing task
              setTaskData((prev: any) => ({ ...prev, [activeTaskId]: data }))
              setShowTask(false)
              setActiveTaskId(null)
            } else {
              // Completing new task
              handleTaskComplete(activeTaskId, data)
            }
          },
      initialData: existingData,
      isReviewMode: isReviewMode,
      isEditMode: isCompleted && !isReviewMode,
    }

    switch (activeTaskId) {
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

  if (showTask && activeTaskId) {
    const displayTask = TASKS.find((t) => t.id === activeTaskId)
    const isCompleted = completedTasks.includes(activeTaskId)

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
                  {isReviewMode && <Badge className="ml-3 bg-white/20 text-white border-white/30">Review Mode</Badge>}
                  {isCompleted && !isReviewMode && (
                    <Badge className="ml-3 bg-white/20 text-white border-white/30">Edit Mode</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 text-white/90">
                  <Badge className="bg-white/20 text-white border-white/30">{displayTask?.role}</Badge>
                  {isCompleted && <Badge className="bg-green-500/80 text-white border-white/30">✓ Completed</Badge>}
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
              setActiveTaskId(null)
              setIsReviewMode(false)
            }}
            className="bg-white/80 backdrop-blur-sm"
          >
            ← Back to Office
          </Button>
        </div>
      </div>
    )
  }

  const recommendedRoom = getRecommendedRoom()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Experience Header */}
      <Card className="bg-gradient-to-r from-[#2d407e] via-[#765889] to-[#a65f1c] text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <Play className="mr-3 h-8 w-8" />
            Marketing Agency Experience
          </CardTitle>
          <p className="text-[#f0ad70] text-lg leading-relaxed">
            Welcome to Future Marketing Agency! Navigate through our high-tech office, complete career tasks, and help
            make your celebrity the biggest star in their industry.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#f0ad70] flex items-center justify-center">
                <CheckCircle className="mr-2 h-6 w-6" />
                {completedTasks.length}
              </div>
              <div className="text-sm opacity-90">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white flex items-center justify-center">
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

      {/* Room Navigation Guidance */}
      {recommendedRoom && (
        <Card className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#db9b6c]/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2d407e] to-[#765889] flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2d407e] mb-1">
                  🎯 Next Task: Go to the {recommendedRoom.roomName}
                </h3>
                <p className="text-[#4e3113] mb-2">
                  Complete "{recommendedRoom.task.title}" as a {recommendedRoom.task.role}
                </p>
                <p className="text-sm text-[#4e3113]/80">
                  Navigate to the {recommendedRoom.roomName} in the office below to start your next mission!
                </p>
              </div>
              <Button
                onClick={() => handleTaskSelect(recommendedRoom.task.id)}
                className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349]"
              >
                Start Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Overview */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-6 w-6 text-[#f0ad70]" />
            Career Role Missions
          </CardTitle>
          <p className="text-gray-600">
            Complete the Brand Identity Workshop first, then tackle the other missions in any order you prefer!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TASKS.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id)
              const isAvailable = isTaskAvailable(task.id)
              const isLocked = !isAvailable
              const isNext = recommendedRoom?.task.id === task.id
              const IconComponent = task.icon

              return (
                <div
                  key={task.id}
                  className={`relative h-[280px] p-4 rounded-xl border-2 transition-all flex flex-col overflow-hidden ${
                    isNext
                      ? "border-[#2d407e] bg-gradient-to-br from-[#f0ad70]/20 to-[#db9b6c]/20 ring-2 ring-[#2d407e]/50"
                      : isCompleted
                        ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                        : isAvailable
                          ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300 cursor-pointer"
                          : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                  onClick={() => {
                    if (isAvailable && !isCompleted) {
                      handleTaskSelect(task.id)
                    }
                  }}
                >
                  {/* Status Badges - Top Right */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                    {isNext && <Badge className="text-xs bg-[#2d407e] text-white border-0 px-2 py-1">Next</Badge>}
                    {isCompleted && (
                      <Badge className="text-xs bg-green-600 text-white border-0 px-2 py-1">✓ Done</Badge>
                    )}
                  </div>

                  {/* Main Content - Fixed height container */}
                  <div className="flex-1 flex flex-col items-center text-center min-h-0">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center bg-gradient-to-r ${task.color} shadow-lg flex-shrink-0`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <IconComponent className="w-8 h-8 text-white" />
                      )}
                    </div>

                    {/* Title and Role - Fixed height with overflow handling */}
                    <div className="mb-2 flex-1 flex flex-col justify-center min-h-0 w-full">
                      <h4 className="font-bold text-sm mb-1 text-gray-800 leading-tight line-clamp-1">{task.role}</h4>
                      <p className="text-xs text-gray-600 leading-tight line-clamp-2">{task.title}</p>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-2 flex-shrink-0">
                      <Badge
                        variant={
                          task.difficulty === "Easy"
                            ? "default"
                            : task.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs px-3 py-1"
                      >
                        {task.difficulty}
                      </Badge>
                    </div>

                    {/* Location Info */}
                    <div className="mb-3 flex-shrink-0">
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">
                        📍 {ROOM_NAMES[task.location as keyof typeof ROOM_NAMES]}
                      </p>
                    </div>
                  </div>

                  {/* Action Area - Bottom - Fixed height */}
                  <div className="mt-auto flex-shrink-0 h-12">
                    {/* Completed Task Actions */}
                    {isCompleted && (
                      <div className="flex gap-1 justify-center h-full">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskReview(task.id)
                          }}
                          className="text-xs px-3 py-1 h-7 flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskEdit(task.id)
                          }}
                          className="text-xs px-3 py-1 h-7 flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}

                    {/* Locked Task Message */}
                    {isLocked && (
                      <div className="text-center h-full flex items-center justify-center">
                        <p className="text-xs text-gray-500 leading-tight line-clamp-2">Complete Brand Identity first</p>
                      </div>
                    )}

                    {/* Available Task Action */}
                    {isAvailable && !isCompleted && (
                      <div className="text-center h-full flex items-center justify-center">
                        <Button
                          size="sm"
                          className={`text-xs px-4 py-2 h-8 w-full ${
                            isNext
                              ? "bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349] text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTaskSelect(task.id)
                          }}
                        >
                          {isNext ? "🎯 Start Now" : "Start Task"}
                        </Button>
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
            <Building className="mr-2 h-6 w-6 text-[#2d407e]" />
            Future Marketing Agency Office
          </CardTitle>
          <p className="text-gray-600">
            Navigate through our high-tech office to complete your missions. Click on rooms or use keyboard controls to
            move around!
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <GameOfficeViewer
            ref={gameOfficeViewerRef}
            currentLocation={currentLocation}
            onLocationChange={handleLocationChange}
            tasks={TASKS}
            completedTasks={completedTasks}
            taskData={taskData}
            onTaskSelect={handleTaskSelect}
            onTaskReview={handleTaskReview}
            availableTasksForLocation={getAvailableTasksForLocation}
          />
        </CardContent>
      </Card>

      {/* Room-based Task Selection */}
      {currentLocation !== "lobby" && (
        <Card className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#db9b6c]/30">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-[#2d407e]">
                {currentLocation === "whiteboard" && "Strategy Room"}
                {currentLocation === "research" && "Research Room"}
                {currentLocation === "creative" && "Creative Studio"}
                {currentLocation === "media" && "Media Room"}
              </h3>

              {/* Available Tasks for Current Location */}
              {(() => {
                const availableTasks = getAvailableTasksForLocation(currentLocation)
                const incompleteTasks = availableTasks.filter((task) => !completedTasks.includes(task.id))
                const completedTasksInRoom = availableTasks.filter((task) => completedTasks.includes(task.id))

                return (
                  <div className="space-y-4">
                    {/* Incomplete Tasks */}
                    {incompleteTasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#2d407e] mb-3">Available Tasks:</h4>
                        <div className="grid gap-3">
                          {incompleteTasks.map((task) => (
                            <Button
                              key={task.id}
                              onClick={() => handleTaskSelect(task.id)}
                              className="bg-gradient-to-r from-[#2d407e] to-[#765889] hover:from-[#0e3968] hover:to-[#231349] text-white p-4 h-auto"
                            >
                              <div className="flex items-center">
                                <task.icon className="w-5 h-5 mr-3" />
                                <div className="text-left">
                                  <div className="font-semibold">{task.title}</div>
                                  <div className="text-sm opacity-90">{task.role}</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasksInRoom.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#713c09] mb-3">Completed Tasks:</h4>
                        <div className="grid gap-2">
                          {completedTasksInRoom.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between bg-[#f0ad70]/20 p-3 rounded-lg border border-[#db9b6c]/30"
                            >
                              <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 mr-3 text-[#713c09]" />
                                <div>
                                  <div className="font-semibold text-[#2d407e]">{task.title}</div>
                                  <div className="text-sm text-[#4e3113]">{task.role}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTaskReview(task.id)}
                                  className="text-[#713c09] border-[#db9b6c] hover:bg-[#f0ad70]/20"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTaskEdit(task.id)}
                                  className="text-[#2d407e] border-[#db9b6c] hover:bg-[#f0ad70]/20"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availableTasks.length === 0 && (
                      <p className="text-[#4e3113]">No tasks available in this room yet.</p>
                    )}
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Check */}
      {completedTasks.length === TASKS.length && (
        <Card className="bg-gradient-to-r from-[#f0ad70]/20 to-[#db9b6c]/20 border-2 border-[#713c09]/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2 text-[#2d407e]">🎉 All Missions Completed!</h3>
            <p className="text-[#4e3113] mb-4">
              Congratulations! You've successfully completed all career role missions.
            </p>
            <Button
              onClick={() =>
                onComplete({
                  completedTasks,
                  taskData,
                  completedAt: new Date().toISOString(),
                })
              }
              size="lg"
              className="bg-gradient-to-r from-[#713c09] to-[#4e3113] hover:from-[#4e3113] hover:to-[#231349]"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Continue to Next Phase
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
