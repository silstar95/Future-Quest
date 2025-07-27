"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Users } from "lucide-react"

interface SimulationIntroCardProps {
  title: string
  description: string
  icon: React.ReactNode
  roles: string[]
  onStart: () => void
}

export function SimulationIntroCard({ title, description, icon, roles, onStart }: SimulationIntroCardProps) {
  return (
    <Card className="border-2 border-brand-primary/20 shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-6 rounded-xl border border-brand-primary/20">
            <h3 className="font-bold text-brand-primary mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              The 5 E's You'll Experience:
            </h3>
            <ul className="text-sm text-brand-primary/80 space-y-2">
              <li>
                • 🔍 <strong>Explore</strong> - Discover career roles
              </li>
              <li>
                • 🎯 <strong>Experience</strong> - Complete real tasks
              </li>
              <li>
                • 🤝 <strong>Engage</strong> - Connect with professionals
              </li>
              <li>
                • 📊 <strong>Evaluate</strong> - Reflect on your journey
              </li>
              <li>
                • 🚀 <strong>Envision</strong> - Plan your future path
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-brand-accent/10 to-brand-highlight/10 p-6 rounded-xl border border-brand-accent/20">
            <h3 className="font-bold text-brand-accent mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Career Roles You'll Master:
            </h3>
            <ul className="text-sm text-brand-accent/80 space-y-2">
              {roles.map((role, index) => (
                <li key={index}>• {role}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-3 rounded-lg font-semibold hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all shadow-lg"
        >
          🚀 Start Your Journey
        </Button>
      </CardContent>
    </Card>
  )
}
