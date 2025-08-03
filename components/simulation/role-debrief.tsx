"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, GraduationCap, DollarSign, Zap } from "lucide-react"

interface RoleDebriefProps {
  role: string
  onContinue: () => void
}

const roleData = {
  "Brand Strategist": {
    responsibilities:
      "Brand strategists develop and execute comprehensive brand positioning strategies. They conduct market research, analyze consumer behavior, define brand identity, create brand guidelines, and ensure consistent brand messaging across all touchpoints. They work closely with creative teams, marketing departments, and executives to build strong, recognizable brands that resonate with target audiences.",
    skills: [
      "Market Research",
      "Consumer Psychology",
      "Strategic Thinking",
      "Data Analysis",
      "Creative Problem Solving",
      "Communication",
      "Project Management",
      "Brand Positioning",
    ],
    education:
      "Bachelor's degree in Marketing, Business, Communications, or related field. Many positions prefer a Master's degree in Marketing or MBA. Relevant certifications in digital marketing or brand management are valuable.",
    salary: "$65,000 - $120,000",
    icon: "🎯",
  },
  "Partnerships Manager": {
    responsibilities:
      "Partnerships managers identify, develop, and maintain strategic business relationships that drive growth and revenue. They negotiate partnership agreements, manage ongoing relationships with key partners, coordinate cross-functional teams, and measure partnership performance. They work to create mutually beneficial relationships that expand market reach and create new opportunities.",
    skills: [
      "Relationship Building",
      "Negotiation",
      "Strategic Planning",
      "Business Development",
      "Communication",
      "Project Management",
      "Contract Management",
      "Performance Analysis",
    ],
    education:
      "Bachelor's degree in Business, Marketing, Communications, or related field. MBA preferred for senior positions. Experience in sales, business development, or account management is highly valued.",
    salary: "$70,000 - $130,000",
    icon: "🤝",
  },
  "Social Media Strategist": {
    responsibilities:
      "Social media strategists develop and implement comprehensive social media strategies to build brand awareness, engage audiences, and drive business results. They create content calendars, manage social media campaigns, analyze performance metrics, stay current with platform trends, and collaborate with creative teams to produce engaging content across multiple social platforms.",
    skills: [
      "Content Strategy",
      "Social Media Analytics",
      "Creative Writing",
      "Visual Design",
      "Trend Analysis",
      "Community Management",
      "Paid Social Advertising",
      "Influencer Relations",
    ],
    education:
      "Bachelor's degree in Marketing, Communications, Digital Media, or related field. Certifications in social media marketing platforms (Facebook, Google, etc.) are highly valuable. Portfolio of successful campaigns is essential.",
    salary: "$55,000 - $95,000",
    icon: "📱",
  },
  "Public Relations Manager": {
    responsibilities:
      "PR managers develop and execute communication strategies to maintain and enhance an organization's public image. They manage media relations, write press releases, handle crisis communications, coordinate events, and work with stakeholders to ensure consistent messaging. They serve as the primary liaison between the organization and the public, media, and other external audiences.",
    skills: [
      "Media Relations",
      "Crisis Communication",
      "Writing & Editing",
      "Strategic Communication",
      "Event Planning",
      "Stakeholder Management",
      "Public Speaking",
      "Reputation Management",
    ],
    education:
      "Bachelor's degree in Public Relations, Communications, Journalism, or related field. Master's degree preferred for senior positions. APR (Accreditation in Public Relations) certification is valuable for career advancement.",
    salary: "$60,000 - $110,000",
    icon: "📢",
  },
}

export function RoleDebrief({ role, onContinue }: RoleDebriefProps) {
  const data = roleData[role as keyof typeof roleData]

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Role information not available.</p>
            <Button onClick={onContinue} className="mt-4">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <span className="text-4xl mr-3">{data.icon}</span>
            Career Spotlight: {role}
          </CardTitle>
          <p className="text-indigo-100 text-lg">
            Learn more about this exciting career path and what it takes to succeed in this role.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Responsibilities */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Briefcase className="mr-2 h-6 w-6 text-blue-600" />
              Primary Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{data.responsibilities}</p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="mr-2 h-6 w-6 text-yellow-600" />
              Key Skills Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <GraduationCap className="mr-2 h-6 w-6 text-green-600" />
              Typical Education Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{data.education}</p>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="mr-2 h-6 w-6 text-green-600" />
              Average Salary Range (US)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{data.salary}</div>
              <p className="text-sm text-gray-600">
                Annual salary range varies by experience, location, and company size
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2 text-green-800">Ready to Continue Your Journey?</h3>
          <p className="text-green-700 mb-4">
            You've learned about the {role} role! This information can help you understand potential career paths in
            marketing and communications.
          </p>
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Continue to Next Mission
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
