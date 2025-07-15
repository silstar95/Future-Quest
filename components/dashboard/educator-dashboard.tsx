"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  School,
  UserCheck,
  Activity,
} from "lucide-react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getEducatorClassrooms, createClassroom } from "@/lib/firebase-service"

interface ClassroomData {
  id: string
  name: string
  description: string
  studentCount: number
  activeAssignments: number
  completionRate: number
  createdAt: string
}

interface EducatorStats {
  totalStudents: number
  totalClassrooms: number
  activeAssignments: number
  avgCompletionRate: number
  recentActivity: any[]
  upcomingDeadlines: any[]
}

export function EducatorDashboard() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([])
  const [educatorStats, setEducatorStats] = useState<EducatorStats | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (!loading && userProfile?.userType !== "educator") {
      router.push("/dashboard/student")
      return
    }

    if (user && userProfile) {
      fetchEducatorData()
    }
  }, [user, userProfile, loading, router])

  const fetchEducatorData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Fetch educator's classrooms
      const classroomsResult = await getEducatorClassrooms(user.uid)

      if (classroomsResult.success) {
        const classroomData = classroomsResult.data.map((classroom: any) => ({
          id: classroom.id,
          name: classroom.name || "Untitled Classroom",
          description: classroom.description || "No description",
          studentCount: classroom.students?.length || 0,
          activeAssignments: classroom.assignments?.length || 0,
          completionRate: classroom.completionRate || 0,
          createdAt: classroom.createdAt?.toDate?.()?.toLocaleDateString() || "Recently",
        }))

        setClassrooms(classroomData)

        // Calculate educator stats
        const totalStudents = classroomData.reduce(
          (sum: number, classroom: ClassroomData) => sum + classroom.studentCount,
          0,
        )
        const totalAssignments = classroomData.reduce(
          (sum: number, classroom: ClassroomData) => sum + classroom.activeAssignments,
          0,
        )
        const avgCompletion =
          classroomData.length > 0
            ? classroomData.reduce((sum: number, classroom: ClassroomData) => sum + classroom.completionRate, 0) /
              classroomData.length
            : 0

        setEducatorStats({
          totalStudents,
          totalClassrooms: classroomData.length,
          activeAssignments: totalAssignments,
          avgCompletionRate: Math.round(avgCompletion),
          recentActivity: [], // This would come from a separate API call
          upcomingDeadlines: [], // This would come from a separate API call
        })
      } else {
        // Set empty state
        setClassrooms([])
        setEducatorStats({
          totalStudents: 0,
          totalClassrooms: 0,
          activeAssignments: 0,
          avgCompletionRate: 0,
          recentActivity: [],
          upcomingDeadlines: [],
        })
      }
    } catch (error) {
      console.error("Error fetching educator data:", error)
      setClassrooms([])
      setEducatorStats({
        totalStudents: 0,
        totalClassrooms: 0,
        activeAssignments: 0,
        avgCompletionRate: 0,
        recentActivity: [],
        upcomingDeadlines: [],
      })
    } finally {
      setDataLoading(false)
    }
  }

  const handleCreateClassroom = async () => {
    if (!user) return

    try {
      const classroomData = {
        name: `${userProfile?.firstName || "Educator"}'s Classroom`,
        description: "New classroom for career exploration",
        students: [],
        assignments: [],
        createdAt: new Date().toISOString(),
      }

      const result = await createClassroom(user.uid, classroomData)

      if (result.success) {
        // Refresh data
        fetchEducatorData()
      }
    } catch (error) {
      console.error("Error creating classroom:", error)
    }
  }

  const handleViewClassroom = (classroomId: string) => {
    router.push(`/dashboard/educator/classroom/${classroomId}`)
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <DashboardHeader
        title={`Welcome, ${userProfile?.firstName || "Educator"}!`}
        subtitle="Manage your classrooms and track student progress"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-700">
                <Users className="mr-2 h-5 w-5" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{educatorStats?.totalStudents || 0}</div>
              <p className="text-sm text-blue-600">Total Enrolled</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-700">
                <School className="mr-2 h-5 w-5" />
                Classrooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{educatorStats?.totalClassrooms || 0}</div>
              <p className="text-sm text-green-600">Active Classes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-700">
                <Target className="mr-2 h-5 w-5" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">{educatorStats?.activeAssignments || 0}</div>
              <p className="text-sm text-purple-600">Currently Active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-yellow-700">
                <TrendingUp className="mr-2 h-5 w-5" />
                Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800">{educatorStats?.avgCompletionRate || 0}%</div>
              <p className="text-sm text-yellow-600">Average Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Classroom Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-2xl">
                    <School className="mr-3 h-6 w-6" />
                    Your Classrooms
                  </CardTitle>
                  <Button onClick={handleCreateClassroom}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Classroom
                  </Button>
                </div>
                <CardDescription>Manage your classes and track student progress</CardDescription>
              </CardHeader>
              <CardContent>
                {classrooms.length > 0 ? (
                  <div className="space-y-4">
                    {classrooms.map((classroom) => (
                      <div
                        key={classroom.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewClassroom(classroom.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{classroom.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{classroom.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Users className="mr-1 h-4 w-4" />
                                {classroom.studentCount} students
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="mr-1 h-4 w-4" />
                                {classroom.activeAssignments} assignments
                              </span>
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                Created {classroom.createdAt}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{classroom.completionRate}%</div>
                              <div className="text-xs text-gray-500">Completion</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms yet</h3>
                    <p className="text-gray-500 mb-6">Create your first classroom to start managing students</p>
                    <Button onClick={handleCreateClassroom}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Classroom
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {educatorStats?.recentActivity && educatorStats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {educatorStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Activity will appear here as students engage with assignments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleCreateClassroom}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Classroom
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/educator/assignments")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Assignments
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/educator/analytics")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/profile")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Student Engagement</span>
                    <span className="text-sm text-gray-500">{educatorStats?.avgCompletionRate || 0}%</span>
                  </div>
                  <Progress value={educatorStats?.avgCompletionRate || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">This Week</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{educatorStats?.totalStudents || 0}</div>
                      <div className="text-xs text-gray-500">Active Students</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{educatorStats?.activeAssignments || 0}</div>
                      <div className="text-xs text-gray-500">Assignments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
