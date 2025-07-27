"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, TrendingUp, CheckCircle, ExternalLink, Info } from 'lucide-react'

interface FinanceTaskOneProps {
  onComplete: (answers: any) => void
  onBack: () => void
  initialData?: any
}

export default function FinanceTaskOne({ onComplete, onBack, initialData }: FinanceTaskOneProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [answers, setAnswers] = useState({
    selectedCompany: initialData?.selectedCompany || "",
    currentRatio: initialData?.currentRatio || "",
    netProfitMargin: initialData?.netProfitMargin || "",
    debtToEquityRatio: initialData?.debtToEquityRatio || "",
    liquidityAnalysis: initialData?.liquidityAnalysis || "",
    profitabilityAnalysis: initialData?.profitabilityAnalysis || "",
    leverageAnalysis: initialData?.leverageAnalysis || "",
  })

  const companies = {
    apple: {
      name: "Apple",
      currentAssets: 153,
      currentLiabilities: 176,
      totalRevenue: 383,
      totalOperatingCosts: 267,
      netIncome: 94,
      totalDebt: 107,
      totalEquity: 56.9,
    },
    costco: {
      name: "Costco",
      currentAssets: 37,
      currentLiabilities: 35,
      totalRevenue: 249,
      totalOperatingCosts: 222,
      netIncome: 7,
      totalDebt: 46,
      totalEquity: 24,
    },
    disney: {
      name: "Disney",
      currentAssets: 25,
      currentLiabilities: 35,
      totalRevenue: 91,
      totalOperatingCosts: 79,
      netIncome: 5.8,
      totalDebt: 45,
      totalEquity: 101,
    },
  }

  const steps = [
    { title: "Choose Company", description: "Select a company to analyze" },
    { title: "Calculate Ratios", description: "Calculate key financial ratios" },
    { title: "Financial Analysis", description: "Analyze strengths and weaknesses" },
  ]

  const selectedCompanyData = companies[answers.selectedCompany as keyof typeof companies]

  const calculateCurrentRatio = () => {
    if (!selectedCompanyData) return ""
    return (selectedCompanyData.currentAssets / selectedCompanyData.currentLiabilities).toFixed(2)
  }

  const calculateNetProfitMargin = () => {
    if (!selectedCompanyData) return ""
    return ((selectedCompanyData.netIncome / selectedCompanyData.totalRevenue) * 100).toFixed(2)
  }

  const calculateDebtToEquityRatio = () => {
    if (!selectedCompanyData) return ""
    return (selectedCompanyData.totalDebt / selectedCompanyData.totalEquity).toFixed(2)
  }

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

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return answers.selectedCompany !== ""
      case 1:
        return answers.currentRatio !== "" && answers.netProfitMargin !== "" && answers.debtToEquityRatio !== ""
      case 2:
        return (
          answers.liquidityAnalysis.trim().length > 0 &&
          answers.profitabilityAnalysis.trim().length > 0 &&
          answers.leverageAnalysis.trim().length > 0
        )
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
                  <CardTitle className="text-lg text-blue-800">Task 1: Financial Health Check-Up</CardTitle>
                  <CardDescription className="text-blue-600">Understanding Financial Health Analysis</CardDescription>
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
                <strong>Description:</strong> In this task, you will analyze a company's financial health using key financial statements. 
                You will get a chance to select a company of your choice. Financial health is how well a company is doing with its money — 
                like how strong and stable it is financially.
              </p>
              <p className="leading-relaxed">
                If a company has enough money to pay its bills, doesn't owe too much, and is making more money than it's spending, 
                it has good financial health. It's kind of like when a person saves money, doesn't borrow too much, and still has 
                enough to buy what they need.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">What You'll Learn:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• How to calculate key financial ratios (Liquidity, Profitability, Leverage)</li>
                  <li>• How to interpret financial data to assess company health</li>
                  <li>• How to identify financial strengths and weaknesses</li>
                  <li>• Real-world application using major companies (Apple, Costco, Disney)</li>
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
                <TrendingUp className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Financial Health Check-Up</CardTitle>
                  <CardDescription className="text-blue-100">
                    Analyze a company's financial health using key financial statements
                  </CardDescription>
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
                <Calculator className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Choose Your Company</h3>
                <p className="text-gray-600 mb-6">
                  Choose your company from the three options below. Select whichever company you are excited to see the 
                  financials of or any company that you just like.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Select
                  value={answers.selectedCompany}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, selectedCompany: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a company to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">🍎 Apple</SelectItem>
                    <SelectItem value="costco">🏪 Costco</SelectItem>
                    <SelectItem value="disney">🏰 Disney</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {answers.selectedCompany && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
                  <h4 className="font-semibold text-blue-800 mb-2">You selected: {selectedCompanyData?.name}</h4>
                  <p className="text-blue-700 text-sm">Great choice! Let's analyze their financial health.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && selectedCompanyData && (
            <div className="space-y-6">
              <div className="text-center">
                <Calculator className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Calculate Financial Ratios</h3>
                <p className="text-gray-600 mb-6">
                  Calculate their key financial ratios using the "Company Information" reference sheet below. 
                  You can find each ratio and a definition below:
                </p>
              </div>

              {/* Ratio Definitions */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold text-blue-800 mb-2">Liquidity</h4>
                    <p className="text-xs text-blue-700">
                      How easily an asset can be converted into cash without significantly affecting its price.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold text-green-800 mb-2">Profitability</h4>
                    <p className="text-xs text-green-700">
                      A company's ability to generate profit relative to its revenue, expenses, or assets.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold text-orange-800 mb-2">Leverage</h4>
                    <p className="text-xs text-orange-700">
                      The use of borrowed funds to finance investments or operations.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Company Information Reference */}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Company Information Reference Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Company Information</th>
                          <th className="text-center p-2">Apple</th>
                          <th className="text-center p-2">Costco</th>
                          <th className="text-center p-2">Disney</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Current Assets</td>
                          <td className="text-center p-2">$153 billion</td>
                          <td className="text-center p-2">$37 billion</td>
                          <td className="text-center p-2">$25 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Current Liabilities</td>
                          <td className="text-center p-2">$176 billion</td>
                          <td className="text-center p-2">$35 billion</td>
                          <td className="text-center p-2">$35 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Total Revenue</td>
                          <td className="text-center p-2">$383 billion</td>
                          <td className="text-center p-2">$249 billion</td>
                          <td className="text-center p-2">$91 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Total Operating Costs</td>
                          <td className="text-center p-2">$267 billion</td>
                          <td className="text-center p-2">$222 billion</td>
                          <td className="text-center p-2">$79 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Net Income</td>
                          <td className="text-center p-2">$94 billion</td>
                          <td className="text-center p-2">$7 billion</td>
                          <td className="text-center p-2">$5.8 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Total Debt</td>
                          <td className="text-center p-2">$107 billion</td>
                          <td className="text-center p-2">$46 billion</td>
                          <td className="text-center p-2">$45 billion</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Total Equity</td>
                          <td className="text-center p-2">$56.9 billion</td>
                          <td className="text-center p-2">$24 billion</td>
                          <td className="text-center p-2">$101 billion</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Ratio Calculations */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Liquidity</CardTitle>
                    <CardDescription>How easily assets can be converted to cash</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Current Ratio = Current Assets / Current Liabilities
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={answers.currentRatio}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, currentRatio: e.target.value }))}
                            placeholder="Calculate ratio"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAnswers((prev) => ({ ...prev, currentRatio: calculateCurrentRatio() }))}
                          >
                            Auto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Profitability</CardTitle>
                    <CardDescription>Company's ability to generate profit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Net Profit Margin = (Net Income / Revenue) × 100
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={answers.netProfitMargin}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, netProfitMargin: e.target.value }))}
                            placeholder="Calculate %"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, netProfitMargin: calculateNetProfitMargin() }))
                            }
                          >
                            Auto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">Leverage</CardTitle>
                    <CardDescription>Use of borrowed funds for investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Debt-to-Equity Ratio = Total Debt / Total Equity
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={answers.debtToEquityRatio}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, debtToEquityRatio: e.target.value }))}
                            placeholder="Calculate ratio"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, debtToEquityRatio: calculateDebtToEquityRatio() }))
                            }
                          >
                            Auto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Need Help?</span>
                </div>
                <p className="text-blue-700 text-sm">
                  If you need help with these calculations, you can use our <a href="https://chatgpt.com/g/g-6802da6857108191842e556e7d619bb3-risk-reward-and-real-world-finance" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">AI tool</a> that will guide you through the
                  process of finding the ratios. Just select the ratio you require help with and the company you have
                  chosen.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Financial Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Write a short analysis of {selectedCompanyData?.name}'s financial strengths and weaknesses based on
                  these numbers. Consider each ratio as you brainstorm.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liquidity Analysis (Current Ratio: {answers.currentRatio})
                  </label>
                  <Textarea
                    value={answers.liquidityAnalysis}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, liquidityAnalysis: e.target.value }))}
                    placeholder="Analyze the company's liquidity position..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profitability Analysis (Net Profit Margin: {answers.netProfitMargin}%)
                  </label>
                  <Textarea
                    value={answers.profitabilityAnalysis}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, profitabilityAnalysis: e.target.value }))}
                    placeholder="Analyze the company's profitability..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leverage Analysis (Debt-to-Equity Ratio: {answers.debtToEquityRatio})
                  </label>
                  <Textarea
                    value={answers.leverageAnalysis}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, leverageAnalysis: e.target.value }))}
                    placeholder="Analyze the company's leverage and debt position..."
                    className="min-h-[80px]"
                  />
                </div>
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
