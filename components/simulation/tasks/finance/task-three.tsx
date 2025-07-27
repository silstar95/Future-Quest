"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, CheckCircle, Calculator, AlertTriangle, Info } from 'lucide-react'

interface FinanceTaskThreeProps {
  onComplete: (answers: any) => void
  onBack: () => void
  initialData?: any
}

export default function FinanceTaskThree({ onComplete, onBack, initialData }: FinanceTaskThreeProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [answers, setAnswers] = useState({
    salaryIncrease: initialData?.salaryIncrease || "",
    rdIncrease: initialData?.rdIncrease || "",
    marketingIncrease: initialData?.marketingIncrease || "",
    techUpgrade: initialData?.techUpgrade || "",
    logisticsCut: initialData?.logisticsCut || "",
    newBudget: initialData?.newBudget || {
      salaries: "",
      marketing: "",
      rd: "",
      tech: "",
      logistics: "",
      misc: "",
    },
    justifications: initialData?.justifications || {
      salaries: "",
      marketing: "",
      rd: "",
      tech: "",
      logistics: "",
      misc: "",
    },
    biggestIncrease: initialData?.biggestIncrease || "",
    biggestCut: initialData?.biggestCut || "",
  })

  const lastYearBudget = {
    salaries: 50,
    marketing: 30,
    rd: 40,
    tech: 25,
    logistics: 60,
    misc: 10,
    total: 215,
  }

  const steps = [
    { title: "Understand Budget", description: "Review last year's budget and constraints" },
    { title: "Calculate Needs", description: "Determine ideal budget amounts" },
    { title: "Allocate Budget", description: "Create new $225M budget" },
    { title: "Justify Decisions", description: "Explain your choices" },
  ]

  const calculateTotal = () => {
    const budget = answers.newBudget
    return Object.values(budget).reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0)
  }

  const handleBudgetChange = (category: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      newBudget: { ...prev.newBudget, [category]: value },
    }))
  }

  const handleJustificationChange = (category: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      justifications: { ...prev.justifications, [category]: value },
    }))
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
        return true
      case 1:
        return (
          answers.salaryIncrease !== "" &&
          answers.rdIncrease !== "" &&
          answers.marketingIncrease !== "" &&
          answers.techUpgrade !== "" &&
          answers.logisticsCut !== ""
        )
      case 2:
        const total = calculateTotal()
        return total === 225 && Object.values(answers.newBudget).every((val) => val !== "")
      case 3:
        return (
          Object.values(answers.justifications).every((val) => val.trim().length > 0) &&
          answers.biggestIncrease.trim().length > 0 &&
          answers.biggestCut.trim().length > 0
        )
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 
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
                  <CardTitle className="text-lg text-blue-800">Task 3: Corporate Treasurer</CardTitle>
                  <CardDescription className="text-blue-600">Budget Boss: Crafting the Financial Future</CardDescription>
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
                <strong>Description:</strong> As the financial advisor for your company, you are tasked with preparing 
                the budget for the upcoming year. The leadership team is counting on you to allocate funds wisely, 
                balancing necessary expenses with growth opportunities.
              </p>
              <p className="leading-relaxed">
                However, like any business, you will face constraints—you must work within a limited budget while 
                making strategic financial decisions.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">What You'll Learn:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• How to analyze and understand budget constraints</li>
                  <li>• Strategic budget allocation across departments</li>
                  <li>• Making tough financial decisions with limited resources</li>
                  <li>• Justifying budget decisions to stakeholders</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Feel free to use a calculator for this task.
                </p>
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
                <Building className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Corporate Treasurer</CardTitle>
                  <CardDescription className="text-blue-100">
                    Budget Boss: Crafting the Financial Future
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Understand Last Year's Budget</h3>
                <p className="text-gray-600 mb-6">
                  Your company's previous year's budget is as follows. You have $225 million total—an increase of $10M from last year.
                </p>
              </div>

              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Last Year's Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Category</th>
                          <th className="text-right p-3">Last Year's Budget ($ in millions)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">Salaries & Employee Benefits</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.salaries}M</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Marketing & Advertising</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.marketing}M</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Research & Development (R&D)</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.rd}M</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Technology & IT</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.tech}M</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Operations & Logistics</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.logistics}M</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Miscellaneous & Emergencies</td>
                          <td className="text-right p-3 font-medium">${lastYearBudget.misc}M</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="p-3 font-bold">Total Budget</td>
                          <td className="text-right p-3 font-bold">${lastYearBudget.total}M</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Your Challenge</span>
                </div>
                <p className="text-blue-700">
                  You have a total budget of $225 million for next year—an increase of $10M. However, some departments
                  are requesting more funding, and you need to make tough decisions!
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Calculator className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Identify Budget Constraints & Priorities</h3>
                <p className="text-gray-600 mb-6">
                  Consider these factors as you adjust the budget. As you read each of them, calculate the amount that 
                  would ideally be needed in each category if you did not have the limit of $225M:
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Salary Increases: Employee salaries are expected to rise by 5%</h4>
                        <p className="text-sm text-gray-600">Current: $50M</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$</span>
                        <Input
                          value={answers.salaryIncrease}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, salaryIncrease: e.target.value }))}
                          placeholder="52.5"
                          className="w-20"
                        />
                        <span>M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">R&D Demand: The company wants to increase innovation and invest 10% more in AI development</h4>
                        <p className="text-sm text-gray-600">Current: $40M</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$</span>
                        <Input
                          value={answers.rdIncrease}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, rdIncrease: e.target.value }))}
                          placeholder="44"
                          className="w-20"
                        />
                        <span>M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">
                          Marketing Push: To expand into new markets, the marketing team is requesting a 20% increase
                        </h4>
                        <p className="text-sm text-gray-600">Current: $30M</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$</span>
                        <Input
                          value={answers.marketingIncrease}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, marketingIncrease: e.target.value }))}
                          placeholder="36"
                          className="w-20"
                        />
                        <span>M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">
                          Tech Upgrades: The IT team has identified cybersecurity risks and needs an additional $10M for infrastructure improvements
                        </h4>
                        <p className="text-sm text-gray-600">Current: $25M</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$</span>
                        <Input
                          value={answers.techUpgrade}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, techUpgrade: e.target.value }))}
                          placeholder="35"
                          className="w-20"
                        />
                        <span>M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">
                          Cost-Saving Initiative: The company's leadership wants to cut 5% from logistics costs to improve efficiency
                        </h4>
                        <p className="text-sm text-gray-600">Current: $60M</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$</span>
                        <Input
                          value={answers.logisticsCut}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, logisticsCut: e.target.value }))}
                          placeholder="57"
                          className="w-20"
                        />
                        <span>M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Building className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Disappoint some, Please some</h3>
                <p className="text-gray-600 mb-6">
                  Now adjust the budget without exceeding $225M while meeting the company's strategic goals. You will 
                  please some departments and you will disappoint some. This is just part of the role.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { key: "salaries", label: "Salaries & Employee Benefits", last: 50 },
                    { key: "marketing", label: "Marketing & Advertising", last: 30 },
                    { key: "rd", label: "Research & Development (R&D)", last: 40 },
                    { key: "tech", label: "Technology & IT", last: 25 },
                    { key: "logistics", label: "Operations & Logistics", last: 60 },
                    { key: "misc", label: "Miscellaneous & Emergencies", last: 10 },
                  ].map((item) => (
                    <Card key={item.key} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-medium">{item.label}</h4>
                            <p className="text-sm text-gray-500">Last year: ${item.last}M</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>$</span>
                            <Input
                              value={answers.newBudget[item.key as keyof typeof answers.newBudget]}
                              onChange={(e) => handleBudgetChange(item.key, e.target.value)}
                              placeholder={item.last.toString()}
                              className="w-20"
                            />
                            <span>M</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Card
                    className={`border-2 ${calculateTotal() === 225 ? "border-green-500 bg-green-50" : calculateTotal() > 225 ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}`}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg mb-2">Budget Total</h4>
                      <div className="text-3xl font-bold mb-2">${calculateTotal().toFixed(1)}M</div>
                      <div className="text-sm">
                        {calculateTotal() === 225 ? (
                          <span className="text-green-600">✅ Perfect! Budget balanced</span>
                        ) : calculateTotal() > 225 ? (
                          <span className="text-red-600">
                            ❌ Over budget by ${(calculateTotal() - 225).toFixed(1)}M
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            ⚠️ Under budget by ${(225 - calculateTotal()).toFixed(1)}M
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Must = $225M</div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Budget Tips</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• You must hit exactly $225M</li>
                      <li>• Consider which departments are most critical</li>
                      <li>• Think about revenue impact of each area</li>
                      <li>• Some cuts may be necessary</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Justify Your Budget Decisions</h3>
                <p className="text-gray-600 mb-6">
                  For each category, justify your change. For the justification, get creative e.g something can get 
                  automated to save costs, using AI to save costs etc.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { key: "salaries", label: "Salaries & Employee Benefits" },
                  { key: "marketing", label: "Marketing & Advertising" },
                  { key: "rd", label: "Research & Development (R&D)" },
                  { key: "tech", label: "Technology & IT" },
                  { key: "logistics", label: "Operations & Logistics" },
                  { key: "misc", label: "Miscellaneous & Emergencies" },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {item.label} (${answers.newBudget[item.key as keyof typeof answers.newBudget]}M) - Justification for Change:
                    </label>
                    <Textarea
                      value={answers.justifications[item.key as keyof typeof answers.justifications]}
                      onChange={(e) => handleJustificationChange(item.key, e.target.value)}
                      placeholder="Explain your budget decision for this category..."
                      className="min-h-[60px]"
                    />
                  </div>
                ))}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which department received the biggest budget increase? Why?
                    </label>
                    <Textarea
                      value={answers.biggestIncrease}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, biggestIncrease: e.target.value }))}
                      placeholder="Identify the department and explain why..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which department had to take a cut? How will the company manage with fewer resources?
                    </label>
                    <Textarea
                      value={answers.biggestCut}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, biggestCut: e.target.value }))}
                      placeholder="Explain the cuts and mitigation strategies..."
                      className="min-h-[80px]"
                    />
                  </div>
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
