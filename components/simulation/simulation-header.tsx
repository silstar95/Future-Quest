"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface SimulationHeaderProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  duration: string
  category: string
  currentPhase: string
  progress: number
  onBackToDashboard: () => void
  isSaving?: boolean
  saveError?: string | null
  lastSaved?: Date | null
  onManualSave?: () => void
  showSaveButton?: boolean
}

export function SimulationHeader({
  title,
  subtitle,
  icon,
  duration,
  category,
  currentPhase,
  progress,
  onBackToDashboard,
  isSaving = false,
  saveError = null,
  lastSaved = null,
  onManualSave,
  showSaveButton = false,
}: SimulationHeaderProps) {
  const formatLastSaved = () => {
    if (!lastSaved) return ""
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
    if (diff < 60) return "Saved just now"
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
    return `Saved ${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                {icon}
              </div>
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
            <Badge className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">{category}</Badge>

            {/* Save Status */}
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-2 text-brand-primary">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-primary"></div>
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

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{currentPhase}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  )
}
