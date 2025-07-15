"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Plus,
  Upload,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Mail,
  FileText,
  Eye,
  UserPlus,
  Download,
  Clock,
  Send,
  Play,
} from "lucide-react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { toast } from "@/components/ui/use-toast"

export function CounselorDashboard() {
  const { user } = useAuth()
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null)
  const [newClassroomName, setNewClassroomName] = useState("")
  const [newClassroomDescription, setNewClassroomDescription] = useState("")
  const [inviteEmails, setInviteEmails] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Mock data - will be replaced with real data from Firebase
  const mockData = {
    classrooms: [
      {
        id: "1",
        name: "AP Psychology Class",
        description: "Advanced placement psychology course for seniors",
        studentCount: 24,
        activeStudents: 18,
        pendingInvites: 3,
        completedSimulations: 45,
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Career Exploration Group",
        description: "Junior year career guidance and exploration",
        studentCount: 15,
        activeStudents: 12,
        pendingInvites: 1,
        completedSimulations: 28,
        createdAt: "2024-02-01",
      },
    ],
    students: [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.j@school.edu",
        grade: "11",
        classroomId: "1",
        simulationsCompleted: 3,
        lastActive: "2 hours ago",
        status: "active",
        joinedAt: "2024-01-20",
        insights: ["Technology", "Healthcare"],
        completedSimulations: [
          { name: "Brand Manager", completedAt: "2024-01-25", xpEarned: 200 },
          { name: "Healthcare Admin", completedAt: "2024-02-01", xpEarned: 250 },
          { name: "Software Developer", completedAt: "2024-02-10", xpEarned: 300 },
        ],
        totalXP: 750,
        level: 2,
      },
      {
        id: "2",
        name: "Mike Chen",
        email: "mike.c@school.edu",
        grade: "12",
        classroomId: "1",
        simulationsCompleted: 5,
        lastActive: "1 day ago",
        status: "active",
        joinedAt: "2024-01-18",
        insights: ["Engineering", "Finance"],
        completedSimulations: [
          { name: "Financial Analyst", completedAt: "2024-01-22", xpEarned: 350 },
          { name: "Engineering Design", completedAt: "2024-01-28", xpEarned: 300 },
          { name: "Brand Manager", completedAt: "2024-02-05", xpEarned: 200 },
          { name: "Data Scientist", completedAt: "2024-02-12", xpEarned: 400 },
          { name: "Product Manager", completedAt: "2024-02-18", xpEarned: 350 },
        ],
        totalXP: 1600,
        level: 4,
      },
      {
        id: "3",
        name: "Emma Davis",
        email: "emma.d@school.edu",
        grade: "10",
        classroomId: "2",
        simulationsCompleted: 1,
        lastActive: "3 days ago",
        status: "inactive",
        joinedAt: "2024-02-03",
        insights: ["Arts", "Education"],
        completedSimulations: [{ name: "Creative Director", completedAt: "2024-02-08", xpEarned: 250 }],
        totalXP: 250,
        level: 1,
      },
    ],
    pendingInvites: [
      {
        id: "1",
        email: "john.doe@school.edu",
        classroomId: "1",
        invitedAt: "2024-02-15",
        status: "pending",
      },
      {
        id: "2",
        email: "jane.smith@school.edu",
        classroomId: "1",
        invitedAt: "2024-02-14",
        status: "pending",
      },
    ],
  }

  const handleCreateClassroom = () => {
    // Implementation for creating classroom
    console.log("Creating classroom:", { name: newClassroomName, description: newClassroomDescription })
    setNewClassroomName("")
    setNewClassroomDescription("")
  }

  const handleInviteStudents = (classroomId: string) => {
    // Implementation for inviting students
    const emails = inviteEmails.split(",").map((email) => email.trim())
    console.log("Inviting students to classroom:", classroomId, emails)
    setInviteEmails("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Implementation for processing CSV file
      console.log("Processing file:", file.name)
    }
  }

  const handleSuggestSimulation = (studentId: string, simulation: string) => {
    // Implementation for suggesting simulation
    console.log("Suggesting simulation:", simulation, "to student:", studentId)
  }

  const handleAssignSimulation = (classroomId: string, simulation: string) => {
    console.log("Assigning simulation:", simulation, "to classroom:", classroomId)
    toast({
      title: "Simulation Assigned",
      description: `${simulation} has been assigned to all students in the classroom.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title={`Welcome, ${user?.firstName || "Educator"}!`}
        subtitle="Manage your classrooms and track student progress"
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Classroom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Classroom</DialogTitle>
                    <DialogDescription>Set up a new classroom to organize and track your students.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="classroom-name">Classroom Name</Label>
                      <Input
                        id="classroom-name"
                        placeholder="e.g., AP Psychology Class"
                        value={newClassroomName}
                        onChange={(e) => setNewClassroomName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="classroom-description">Description (Optional)</Label>
                      <Textarea
                        id="classroom-description"
                        placeholder="Brief description of the classroom..."
                        value={newClassroomDescription}
                        onChange={(e) => setNewClassroomDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateClassroom} className="w-full">
                      Create Classroom
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Invite Students
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Invite Students</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file with student email addresses to invite multiple students at once.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} />
                      <p className="text-xs text-gray-500 mt-1">
                        CSV should have columns: email, classroom_name (optional)
                      </p>
                    </div>
                    <Button className="w-full">Upload and Invite</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Progress Report
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockData.students.filter((s) => s.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all classrooms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockData.students.filter((s) => s.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Active in last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.pendingInvites.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Simulations Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockData.students.reduce((acc, student) => acc + student.simulationsCompleted, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <CardDescription>Latest simulation completions and student progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            Level {student.level} • {student.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {student.insights.map((insight) => (
                          <Badge key={insight} variant="secondary" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                          <Eye className="mr-1 h-3 w-3" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classrooms" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockData.classrooms.map((classroom) => (
                <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {classroom.name}
                      <Badge variant="outline">{classroom.studentCount} students</Badge>
                    </CardTitle>
                    <CardDescription>{classroom.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Active:</span>
                          <span className="font-medium ml-1">{classroom.activeStudents}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pending:</span>
                          <span className="font-medium ml-1">{classroom.pendingInvites}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Simulations Completed:</span>
                        <span className="font-medium">{classroom.completedSimulations}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex-1">
                              <UserPlus className="mr-2 h-3 w-3" />
                              Invite Students
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invite Students to {classroom.name}</DialogTitle>
                              <DialogDescription>
                                Enter email addresses separated by commas to invite students to this classroom.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="invite-emails">Student Email Addresses</Label>
                                <Textarea
                                  id="invite-emails"
                                  placeholder="student1@school.edu, student2@school.edu, ..."
                                  value={inviteEmails}
                                  onChange={(e) => setInviteEmails(e.target.value)}
                                />
                              </div>
                              <Button onClick={() => handleInviteStudents(classroom.id)} className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Send Invitations
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <Play className="mr-2 h-3 w-3" />
                              Assign Simulation
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Simulation to {classroom.name}</DialogTitle>
                              <DialogDescription>
                                Select a simulation to assign to all students in this classroom.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Available Simulations</Label>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {[
                                    "Brand Manager for Celebrity",
                                    "Healthcare Administrator",
                                    "Software Developer",
                                    "Financial Analyst",
                                    "Superconductor Engineer",
                                  ].map((sim) => (
                                    <Button
                                      key={sim}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAssignSimulation(classroom.id, sim)}
                                      className="justify-start"
                                    >
                                      <Play className="mr-2 h-3 w-3" />
                                      {sim}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <MessageSquare className="mr-2 h-3 w-3" />
                          Message All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage individual student progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-blue-600">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{student.name}</h3>
                            <p className="text-sm text-gray-500">
                              Grade {student.grade} • {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                          <Badge variant="outline">Level {student.level}</Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{student.simulationsCompleted}</div>
                          <div className="text-xs text-gray-500">Simulations</div>
                        </div>
                        {/* Remove all XP references from the educator dashboard
                        Update stats to remove XP-related metrics */}
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{student.lastActive}</div>
                          <div className="text-xs text-gray-500">Last Active</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{student.insights.length}</div>
                          <div className="text-xs text-gray-500">Career Areas</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {student.insights.map((insight) => (
                            <Badge key={insight} variant="secondary" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                            <Eye className="mr-2 h-3 w-3" />
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="mr-2 h-3 w-3" />
                            Message
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <FileText className="mr-2 h-3 w-3" />
                                Suggest Simulation
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suggest Simulation to {student.name}</DialogTitle>
                                <DialogDescription>
                                  Recommend a specific simulation based on their interests and progress.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Available Simulations</Label>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {[
                                      "Brand Manager",
                                      "Healthcare Admin",
                                      "Software Developer",
                                      "Financial Analyst",
                                    ].map((sim) => (
                                      <Button
                                        key={sim}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSuggestSimulation(student.id, sim)}
                                      >
                                        {sim}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Track student invitation status and manage pending invites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-gray-500">
                            Invited to{" "}
                            {mockData.classrooms.find((c) => c.id === invite.classroomId)?.name || "Unknown Classroom"}{" "}
                            • {invite.invitedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pending
                        </Badge>
                        <Button size="sm" variant="outline">
                          Resend Invite
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel the invitation for {invite.email}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Cancel Invitation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Student activity and participation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Daily Active Users</span>
                      <span className="font-semibold">
                        {mockData.students.filter((s) => s.status === "active").length}/{mockData.students.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Weekly Completion Rate</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Session Time</span>
                      <span className="font-semibold">24 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Simulations</CardTitle>
                  <CardDescription>Most completed simulations this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Brand Manager</span>
                      <Badge>15 completions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Healthcare Admin</span>
                      <Badge>12 completions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Engineering Design</span>
                      <Badge>8 completions</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedStudent.name}'s Profile</DialogTitle>
                <DialogDescription>Detailed view of student progress and insights</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Grade:</span>
                        <span>{selectedStudent.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level:</span>
                        <span>{selectedStudent.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Joined:</span>
                        <span>{selectedStudent.joinedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Active:</span>
                        <span>{selectedStudent.lastActive}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Career Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.insights.map((insight: string) => (
                          <Badge key={insight} variant="secondary">
                            {insight}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Completed Simulations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedStudent.completedSimulations.map((sim: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{sim.name}</p>
                              <p className="text-sm text-gray-500">{sim.completedAt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
