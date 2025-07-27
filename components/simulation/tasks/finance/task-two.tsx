"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, CheckCircle, TrendingUp, Info } from 'lucide-react'

interface FinanceTaskTwoProps {
  onComplete: (answers: any) => void
  onBack: () => void
  initialData?: any
}

export default function FinanceTaskTwo({ onComplete, onBack, initialData }: FinanceTaskTwoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [answers, setAnswers] = useState({
    investmentChoice: initialData?.investmentChoice || "",
    investmentReason: initialData?.investmentReason || "",
    fundingChoice: initialData?.fundingChoice || "",
    fundingReason: initialData?.fundingReason || "",
    risks: initialData?.risks || [
      { factor: "", why: "", mitigation: "" },
      { factor: "", why: "", mitigation: "" },
      { factor: "", why: "", mitigation: "" },
    ],
    pitch: initialData?.pitch || "",
  })

  const steps = [
    { title: "Investment Decision", description: "Choose your investment strategy" },
    { title: "Funding Strategy", description: "Decide how to fund the investment" },
    { title: "Risk Analysis", description: "Identify and mitigate risks" },
    { title: "Board Pitch", description: "Present to stakeholders" },
  ]

  const investmentOptions = [
    {
      id: "africa",
      title: "Expanding into the African continent",
      description: "This would increase your user base by 500 million and would cost you close to $1 billion dollars to do so.",
    },
    {
      id: "ai",
      title: "Launch a new AI product",
      description: "With every company investing in AI, you have a chance to launch your own AI product that is related to your selected company.",
    },
    {
      id: "acquisition",
      title: "Acquire a competitor",
      description: "Acquire a competitor who is a third of the size of your company. This acquisition would increase your market share by 3%.",
    },
  ]

  const fundingOptions = [
    {
      id: "debt",
      title: "Debt",
      description: "Borrowing money that must be repaid with interest.",
    },
    {
      id: "equity",
      title: "Equity",
      description: "Selling company shares to the public to raise funds. This means you are giving away some equity.",
    },
    {
      id: "profits",
      title: "Reinvested Profits",
      description: "Using profits earned by the company instead of external funding.",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRiskChange = (index: number, field: string, value: string) => {
    const newRisks = [...answers.risks]
    newRisks[index] = { ...newRisks[index], [field]: value }
    setAnswers((prev) => ({ ...prev, risks: newRisks }))
  }

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return answers.investmentChoice !== "" && answers.investmentReason.trim().length > 0
      case 1:
        return answers.fundingChoice !== "" && answers.fundingReason.trim().length > 0
      case 2:
        return answers.risks.every(
          (risk) => risk.factor.trim().length > 0 && risk.why.trim().length > 0 && risk.mitigation.trim().length > 0,
        )
      case 3:
        return answers.pitch.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Task Description */}
      {showDescription && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg text-blue-800">Task 2: Investment Advisor</CardTitle>
                  <CardDescription className="text-blue-600">Fuel the Future: Strategic Investments</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDescription(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Hide Description
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-4">
              <p className="leading-relaxed">
                <strong>Scenario:</strong> Now that you have selected the company that you are the financial advisor for, 
                you are tasked with a major investment decision to make. You have a chance to invest in one of three options.
              </p>
              <p className="leading-relaxed">
                Select one investment option (there is no right or wrong answer) and follow the steps below to justify 
                your investment decision.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">What You'll Learn:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• How to evaluate strategic investment opportunities</li>
                  <li>• Different funding methods (Debt, Equity, Reinvested Profits)</li>
                  <li>• Risk assessment and mitigation strategies</li>
                  <li>• How to pitch investment decisions to stakeholders</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Office
              </Button>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Investment Advisor</CardTitle>
                  <CardDescription className="text-blue-100">Fuel the Future: Strategic Investments</CardDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              {!showDescription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDescription(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Info className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Investment Decision</h3>
                <p className="text-gray-600 mb-6">
                  You are tasked with a major investment decision. You have a chance to invest in one of three options:
                </p>
              </div>

              <RadioGroup
                value={answers.investmentChoice}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, investmentChoice: value }))}
                className="space-y-4"
              >
                {investmentOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {answers.investmentChoice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which of the three options will you choose? Explain your choice in 2-3 sentences:
                  </label>
                  <Textarea
                    value={answers.investmentReason}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, investmentReason: e.target.value }))}
                    placeholder="Why did you choose this investment option?"
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Funding the Investment</h3>
                <p className="text-gray-600 mb-6">
                  Like in any organization, you do not have unlimited funds to make this investment. Your company has 
                  three options to choose from to fund this investment:
                </p>
              </div>

              <RadioGroup
                value={answers.fundingChoice}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, fundingChoice: value }))}
                className="space-y-4"
              >
                {fundingOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {answers.fundingChoice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose which option you would pick. Which option did you pick and why?
                  </label>
                  <Textarea
                    value={answers.fundingReason}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, fundingReason: e.target.value }))}
                    placeholder="To help you make this decision, think about how much would this investment be (come up with a random number), what is the net profit of the company, at what interest rate can you get debt, and how many shares do you need to sell. Feel free to use the internet to help you answer some of these questions."
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Consider: investment amount, company's net profit, interest rates, and equity dilution.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Analyze the Risk</h3>
                <p className="text-gray-600 mb-6">
                  Every investment has a risk associated with it. Fill out the following table with 3 risks that you 
                  anticipate with this investment. Some things you can think about include market competition, global trends, inflation etc.
                </p>
              </div>

              <div className="space-y-6">
                {answers.risks.map((risk, index) => (
                  <Card key={index} className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Risk #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Risk Factor</label>
                        <Textarea
                          value={risk.factor}
                          onChange={(e) => handleRiskChange(index, "factor", e.target.value)}
                          placeholder="e.g., Market competition"
                          className="min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Why is it a risk?</label>
                        <Textarea
                          value={risk.why}
                          onChange={(e) => handleRiskChange(index, "why", e.target.value)}
                          placeholder="e.g., A competitor may launch a similar product"
                          className="min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How can you mitigate it?</label>
                        <Textarea
                          value={risk.mitigation}
                          onChange={(e) => handleRiskChange(index, "mitigation", e.target.value)}
                          placeholder="e.g., Differentiate by offering better features"
                          className="min-h-[60px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm">
                  💡 Consider risks like market competition, global trends, inflation, regulatory changes, technology
                  disruption, and economic conditions.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Pitch Your Investment</h3>
                <p className="text-gray-600 mb-6">
                  You are presenting this investment decision to the company's Board of Directors. Write a 1-minute pitch 
                  convincing them that your choice is the right one.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Your pitch should:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Start with a strong hook (e.g., "This is the investment that will define our future...")</li>
                  <li>• Clearly explain why this investment is a game-changer for the company</li>
                  <li>• Think in terms of increased revenue gains</li>
                  <li>• Address at least one risk and how you plan to mitigate it</li>
                  <li>• End with a call to action (e.g., "This is the moment to act—let's invest in our future!")</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your 1-Minute Board Pitch</label>
                <Textarea
                  value={answers.pitch}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, pitch: e.target.value }))}
                  placeholder="Write your compelling pitch to the Board of Directors..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Well done! You have learnt how to strategically think through an investment decision and pitch it to stakeholders.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 bg-transparent"
            >
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="px-6 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Complete Task
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Next Step"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
