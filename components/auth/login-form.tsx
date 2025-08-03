"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile } from "@/lib/firebase-service"
import { Mail, Sparkles, GraduationCap, Users, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function LoginForm({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"student" | "educator">("student")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push("/")
    }
  }

  const handleSubmit = async (e: React.FormEvent, userType: "student" | "educator") => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await signIn(formData.email, formData.password)

      // Get user profile to determine userType
      const profile = await getUserProfile(user.uid)
      const userType = profile.success ? profile.data?.userType : "student"

      toast({
        title: "🎉 Welcome back!",
        description: "Successfully signed in to your account.",
      })

      router.push(userType === "student" ? "/dashboard/student" : "/dashboard/educator")
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const user = await signInWithGoogle()

      // Get user profile to determine userType
      const profile = await getUserProfile(user.uid)
      const userType = profile.success ? profile.data?.userType : "student"

      toast({
        title: "🎉 Welcome back!",
        description: "Successfully signed in with Google.",
      })

      router.push(userType === "student" ? "/dashboard/student" : "/dashboard/educator")
    } catch (error: any) {
      console.error("Google sign in error:", error)

      if (error.message.includes("No account found")) {
        toast({
          title: "Account not found",
          description: "Please sign up first to create your profile.",
          variant: "destructive",
        })
        // Redirect to signup page after a short delay
        setTimeout(() => {
          router.push("/auth/signup")
        }, 2000)
      } else if (error.code === "auth/popup-closed-by-user") {
        toast({
          title: "Sign-in cancelled",
          description: "Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        })
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen brand-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/images/logo-white2.png"
          alt="Future Quest"
          width={200}
          height={80}
          className="h-12 w-auto cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>

      {/* Back button */}
      <div className="absolute top-6 right-6 z-20">
        <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Soft animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-24 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-80 right-28 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-32 w-28 h-28 bg-white/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm ring-1 ring-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Sign in to continue your Future Quest journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Sign In */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 text-base border-2 hover:bg-gray-50 transition-all duration-200 bg-white/90 backdrop-blur-sm"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "student" | "educator")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </TabsTrigger>
              <TabsTrigger value="educator" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Educator</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, "student")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="border-2 focus:border-brand-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="border-2 focus:border-brand-primary transition-colors"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => router.push("/auth/reset-password")}
                      className="text-sm text-brand-primary hover:text-brand-secondary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign In as Student
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="educator" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, "educator")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="educator-email">Email Address</Label>
                  <Input
                    id="educator-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="border-2 focus:border-brand-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educator-password">Password</Label>
                  <Input
                    id="educator-password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="border-2 focus:border-brand-primary transition-colors"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => router.push("/auth/reset-password")}
                      className="text-sm text-brand-primary hover:text-brand-secondary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-gradient-to-r from-brand-accent to-brand-highlight hover:from-brand-accent/90 hover:to-brand-highlight/90 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Sign In as Educator
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-brand-primary hover:text-brand-secondary font-medium hover:underline cursor-pointer"
            >
              Create one here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
