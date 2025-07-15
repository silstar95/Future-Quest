"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Settings, LogOut, User, HelpCircle, Sparkles, Globe } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  showBackButton = false,
  backUrl = "/dashboard",
  actions,
}: DashboardHeaderProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleBackClick = () => {
    router.push(backUrl)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`
    }
    if (userProfile?.firstName) {
      return userProfile.firstName
    }
    if (user?.displayName) {
      return user.displayName
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "Explorer"
  }

  const getUserTypeDisplay = () => {
    if (userProfile?.userType === "student") return "Student"
    if (userProfile?.userType === "educator") return "Educator"
    if (userProfile?.userType === "counselor") return "Counselor"
    return "User"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={handleBackClick} className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-indigo-600" />
                <span className="font-bold text-lg text-indigo-600">Future Quest</span>
              </div>

              <div className="hidden md:block h-6 w-px bg-gray-300" />

              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Center Section - Mobile Title */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">{title}</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Actions */}
            {actions && <div className="hidden md:flex items-center space-x-2">{actions}</div>}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || ""} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                      {getInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getUserTypeDisplay()}
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    {userProfile?.userType === "student" && (
                      <div className="flex items-center space-x-1 text-xs text-indigo-600">
                        <Sparkles className="h-3 w-3" />
                        <span>Level {userProfile?.level || 1} Explorer</span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
