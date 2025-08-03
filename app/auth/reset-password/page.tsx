"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setEmailSent(true)
      toast({
        title: "Password reset email sent!",
        description: "Check your email for instructions to reset your password.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      let errorMessage = "Failed to send password reset email. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen brand-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/images/logo.png"
          alt="Future Quest"
          width={200}
          height={80}
          className="h-12 w-auto cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>

      {/* Back button */}
      <div className="absolute top-6 right-6 z-20">
        <Button variant="ghost" onClick={() => router.push("/auth/login")} className="text-white hover:bg-white/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
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
            {emailSent ? <CheckCircle className="h-8 w-8 text-white" /> : <Mail className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {emailSent ? "Check Your Email" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {emailSent
              ? "We've sent password reset instructions to your email address."
              : "Enter your email address and we'll send you instructions to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Email Sent Successfully!</h3>
                <p className="text-green-700 text-sm">
                  Check your inbox and follow the instructions to reset your password. The email may take a few minutes
                  to arrive.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full py-6 text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90"
                >
                  Back to Login
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                  className="w-full py-6 text-base"
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 focus:border-brand-primary transition-colors py-6 text-base"
                  placeholder="Enter your email address"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Email
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-brand-primary hover:text-brand-secondary font-medium hover:underline cursor-pointer"
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
