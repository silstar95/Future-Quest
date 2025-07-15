"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingQuiz } from "./onboarding-quiz"
import {
  Rocket,
  Users,
  Star,
  Brain,
  ArrowRight,
  Sparkles,
  Building2,
  Gamepad2,
  ChevronDown,
} from "lucide-react"
import LoginForm from "../auth/login-form"
import { useSearchParams } from "next/navigation"
import Image from "next/image"

export function LandingPage() {
  const searchParams = useSearchParams()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [authMode, setAuthMode] = useState<"signup" | "login" | null>(null)

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setAuthMode("signup")
      setShowOnboarding(true)
    }
  }, [searchParams])

  if (showOnboarding && authMode === "signup") {
    return <OnboardingQuiz />
  }

  if (authMode === "login") {
    // Pass onBack to LoginForm so it can go back to landing page
    return <LoginForm onBack={() => setAuthMode(null)} />
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Deep Night-to-Dawn Gradient */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          background: `
            linear-gradient(
              to bottom,
              #211c3a 0%,
              #211c3a 60%,
              #6a3c2f 85%,
              #d59f7b 100%
            )
          `
        }}
      >
        {/* Logo in top left */}
        <div className="absolute top-6 left-20 z-20">
          <Image src="/images/logo.png" alt="Future Quest" width={400} height={180} className="h-40 w-auto" />
        </div>

        {/* Optional: Subtle animated grid or particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute inset-0">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-bounce">
            <Sparkles className="w-5 h-5 mr-3 text-[#ecae6c] animate-spin" />
            <span className="text-sm font-medium">🚀 The Future of Career Exploration is Here!</span>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-[#ecae6c] to-white bg-clip-text text-transparent animate-pulse">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#ecae6c] via-white to-[#454783] bg-clip-text text-transparent relative">
                Future Quest
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ecae6c]/20 to-[#454783]/20 blur-xl animate-pulse"></div>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mb-12">
            <p className="text-2xl md:text-3xl mb-6 max-w-5xl mx-auto leading-relaxed text-gray-100">
              🌟 Discover your dream career through{" "}
              <span className="text-[#ecae6c] font-bold animate-pulse">immersive simulations</span>
              <br />
              Build your <span className="text-[#454783] font-bold">futuristic world</span> and{" "}
              <span className="text-white font-bold">unlock your potential</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Building2 className="w-5 h-5 mr-2 text-[#454783]" />
                <span>Build Your World</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Gamepad2 className="w-5 h-5 mr-2 text-[#ecae6c]" />
                <span>Interactive Simulations</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Brain className="w-5 h-5 mr-2 text-white" />
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-8">
            <div className="relative">
              <p className="text-3xl font-bold text-[#ecae6c] mb-2 animate-bounce">
                🎯 Ready to Build Your Future?
              </p>
              <p className="text-xl text-gray-200 mb-8">Join thousands of students already shaping their destiny</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="text-xl px-12 py-8 bg-gradient-to-r from-[#0e345e] via-[#454783] to-[#ecae6c] hover:from-[#0e345e]/90 hover:via-[#454783]/90 hover:to-[#ecae6c]/90 transform hover:scale-110 transition-all duration-300 shadow-2xl border-0 group relative overflow-hidden"
                // Updated: Go to sign in form/page on click
                onClick={() => setAuthMode("login")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Rocket className="mr-4 h-8 w-8 group-hover:animate-bounce" />
                Start Your Quest
                <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                onClick={() => setAuthMode("login")}
              >
                <Users className="mr-4 h-6 w-6" />I Have an Account
              </Button>
            </div>

            <div className="text-sm text-gray-300 flex items-center justify-center space-x-2">
              <Star className="w-4 h-4 text-[#ecae6c]" />
              <span>Free to start • No credit card required • Join in 2 minutes</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center text-white/70">
              <ChevronDown className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
