"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Search,
  Briefcase,
  MessageSquare,
  ClipboardCheck,
  Eye,
  Trophy,
  BookOpen,
} from "lucide-react"

interface SimulationNavigationProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  duration: string
  category: string
  categoryColor: string
  currentPhase: string // This should be the actual phase ID, not the title
  progress: number
  onBackToDashboard: () => void
  onPreviousStep?: () => void
  canGoBack?: boolean
  isSaving?: boolean
  saveError?: string | null
  lastSaved?: Date | null
  onManualSave?: () => void
  showSaveButton?: boolean
}

type PhaseType =
  | "intro"
  | "pre-reflection"
  | "framework"
  | "exploration"
  | "experience"
  | "engage"
  | "post-reflection"
  | "envision"
  | "complete"

const getPhaseIcon = (phase: string) => {
  switch (phase) {
    case "intro":
    case "introduction":
      return <FileText className="w-4 h-4" />
    case "pre-reflection":
      return <Users className="w-4 h-4" />
    case "framework":
      return <BookOpen className="w-4 h-4" />
    case "exploration":
    case "explore":
      return <Search className="w-4 h-4" />
    case "experience":
      return <Briefcase className="w-4 h-4" />
    case "engage":
      return <MessageSquare className="w-4 h-4" />
    case "post-reflection":
    case "evaluate":
      return <ClipboardCheck className="w-4 h-4" />
    case "envision":
      return <Eye className="w-4 h-4" />
    case "complete":
      return <Trophy className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

const getPhaseLabel = (phase: string) => {
  switch (phase) {
    case "intro":
      return "Introduction"
    case "pre-reflection":
      return "Pre-reflection"
    case "framework":
      return "Framework"
    case "exploration":
      return "Explore"
    case "experience":
      return "Experience"
    case "engage":
      return "Engage"
    case "post-reflection":
      return "Evaluate"
    case "envision":
      return "Envision"
    case "complete":
      return "Complete"
    default:
      return phase.charAt(0).toUpperCase() + phase.slice(1)
  }
}

export function SimulationNavigation({
  title,
  subtitle,
  icon,
  duration,
  category,
  categoryColor,
  currentPhase, // This should be the phase ID like "pre-reflection", not the title
  progress,
  onBackToDashboard,
  onPreviousStep,
  canGoBack = false,
  isSaving = false,
  saveError = null,
  lastSaved = null,
  onManualSave,
  showSaveButton = false,
}: SimulationNavigationProps) {
  const formatLastSaved = () => {
    if (!lastSaved) return ""
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
    if (diff < 60) return "Saved just now"
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
    return `Saved ${Math.floor(diff / 3600)}h ago`
  }

  // Define the phases for each simulation type
  const getPhases = (): PhaseType[] => {
    if (category === "Government") {
      return [
        "intro",
        "pre-reflection",
        "exploration",
        "experience",
        "engage",
        "post-reflection",
        "envision",
        "complete",
      ]
    }
    // For other simulations (brand-marketing, finance, material-science)
    return [
      "intro",
      "pre-reflection",
      "framework",
      "exploration",
      "experience",
      "engage",
      "post-reflection",
      "envision",
      "complete",
    ]
  }

  const phases = getPhases()
  const currentPhaseIndex = phases.indexOf(currentPhase as PhaseType)

  const getPhaseStatus = (phase: PhaseType, index: number) => {
    if (index < currentPhaseIndex) return "completed"
    if (index === currentPhaseIndex) return "current"
    return "upcoming"
  }

  const getNavigationTitle = () => {
    if (category === "Government") return "Navigate Congressional Processes"
    if (category === "Finance") return "Navigate Finance Career Path"
    if (category === "Branding & Marketing") return "Navigate Marketing Journey"
    if (category === "Science") return "Navigate Material Science Path"
    return "Navigate Career Simulation"
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${categoryColor} flex items-center justify-center`}>{icon}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration}
            </div>
            <Badge className={`${categoryColor} text-white`}>{category}</Badge>

            {/* Save Status */}
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span className="text-xs">Saving...</span>
                </div>
              ) : saveError ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">Save Error</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs">{formatLastSaved()}</span>
                </div>
              ) : null}

              {/* Manual Save Button */}
              {showSaveButton && onManualSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManualSave}
                  disabled={isSaving}
                  className="h-7 px-2 bg-transparent"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{getNavigationTitle()}</span>
            {canGoBack && onPreviousStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousStep}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </Button>
            )}
          </div>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mb-4" />

        {/* Phase Navigation */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 overflow-x-auto max-w-6xl">
              {phases.map((phase, index) => {
                const status = getPhaseStatus(phase, index)
                const isCompleted = status === "completed"
                const isCurrent = status === "current"

                return (
                  <div
                    key={phase}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      isCurrent
                        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200"
                        : isCompleted
                          ? "bg-green-100 text-green-800"
                          : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-full ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-3 h-3" /> : getPhaseIcon(phase)}
                    </div>
                    <span
                      className={`font-medium ${
                        isCurrent ? "text-blue-800" : isCompleted ? "text-green-800" : "text-gray-500"
                      }`}
                    >
                      {getPhaseLabel(phase)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
