"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingDown, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface FinanceTaskFourProps {
  onComplete: (answers: any) => void
  onBack: () => void
  initialData?: any
}

export default function FinanceTaskFour({ onComplete, onBack, initialData }: FinanceTaskFourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [answers, setAnswers] = useState({
    impactPrediction: initialData?.impactPrediction || "",
    immediateActions: initialData?.immediateActions || ["", "", ""],
    recoveryStrategies: initialData?.recoveryStrategies || ["", ""],
    preventionMeasures: initialData?.preventionMeasures || ["", "", ""],
    crisisPlan: initialData?.crisisPlan || {
      immediate: "",
      recovery: "",
      prevention: "",
    },
  })

  const steps = [
    { title: "Predict Impact", description: "Analyze where recession affects the company" },
    { title: "Immediate Actions", description: "Identify urgent measures" },
    { title: "Recovery Strategy", description: "Plan short-term recovery tactics" },
    { title: "Prevention Plan", description: "Develop long-term resilience measures" },
    { title: "Crisis Response", description: "Create comprehensive 3-step plan" },
  ]

  const recessionData = {
    before: {
      revenue: 250,
      netIncome: 6,
      totalAssets: 70,
      totalLiabilities: 46,
      shareholdersEquity: 24,
      debtToEquityRatio: 1.92,
    },
    during: {
      revenue: 225,
      netIncome: 4,
      totalAssets: 68,
      totalLiabilities: 50,
      shareholdersEquity: 18,
      debtToEquityRatio: 2.78,
    },
  }

  const handleArrayChange = (arrayName: string, index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName as keyof typeof prev].map((item: string, i: number) => (i === index ? value : item)),
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
        return answers.impactPrediction.trim().length > 0
      case 1:
        return answers.immediateActions.every((action) => action.trim().length > 0)
      case 2:
        return answers.recoveryStrategies.every((strategy) => strategy.trim().length > 0)
      case 3:
        return answers.preventionMeasures.every((measure) => measure.trim().length > 0)
      case 4:
        return Object.values(answers.crisisPlan).every((plan) => plan.trim().length > 0)
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
                  <CardTitle className="text-lg text-blue-800">Task 4: Financial Analyst</CardTitle>
                  <CardDescription className="text-blue-600">Economic Recession Crisis Management</CardDescription>
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
                <strong>Description:</strong> The economy has entered a recession, leading to higher unemployment and 
                lower consumer spending. Many households are cutting back on expenses. Make predictions and develop a 
                three-step crisis plan to keep your company safe during this time.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">Key Economic Changes:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Unemployment Rate:</strong> Increases from 4% to 8% → Fewer people have disposable income</li>
                  <li>• <strong>Inflation:</strong> Remains High at 5% → The cost of goods rises, but wages stay the same</li>
                  <li>• <strong>Consumer Spending:</strong> Drops by 10% → Families prioritize essentials and are buying less goods and services overall</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Office
              </Button>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Financial Analyst</CardTitle>
                  <CardDescription className="text-red-100">Economic Recession Crisis Management</CardDescription>
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
                <AlertTriangle className="w-16 h-16 mx-auto text-red-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Predict Impact</h3>
                <p className="text-gray-600 mb-6">
                  Predict where financial impact is happening in the company. Consider across areas operated by the 
                  company such as merchandise, services, media, marketing, consumer goods, and more.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800">Financial Impact (Before vs. During Recession)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span>
                          ${recessionData.before.revenue}B → ${recessionData.during.revenue}B (↓10%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Income:</span>
                        <span>
                          ${recessionData.before.netIncome}B → ${recessionData.during.netIncome}B (↓33%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Assets:</span>
                        <span>
                          ${recessionData.before.totalAssets}B → ${recessionData.during.totalAssets}B (↓3%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Liabilities:</span>
                        <span>
                          ${recessionData.before.totalLiabilities}B → ${recessionData.during.totalLiabilities}B (↑9%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shareholders' Equity:</span>
                        <span>
                          ${recessionData.before.shareholdersEquity}B → ${recessionData.during.shareholdersEquity}B (↓25%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt-to-Equity:</span>
                        <span>
                          {recessionData.before.debtToEquityRatio} → {recessionData.during.debtToEquityRatio} (↑Higher Risk)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">Economic Context</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-orange-700 text-sm">
                      <li>• Unemployment: 4% → 8%</li>
                      <li>• Inflation: Remains at 5%</li>
                      <li>• Consumer Spending: ↓10%</li>
                      <li>• Families prioritizing essentials</li>
                      <li>• Reduced discretionary spending</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Predict where financial impact is happening in the company:
                </label>
                <Textarea
                  value={answers.impactPrediction}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, impactPrediction: e.target.value }))}
                  placeholder="Analyze where the recession is impacting different areas of your company's operations..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 mx-auto text-red-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Immediate Actions</h3>
                <p className="text-gray-600 mb-6">
                  Think about the immediate action you can take to keep your company financially strong, such as cutting 
                  non-essential expenses or securing emergency funding. Write down 3 ideas here specific to your company.
                </p>
              </div>

              <div className="space-y-4">
                {answers.immediateActions.map((action, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Immediate Action #{index + 1}
                    </label>
                    <Textarea
                      value={action}
                      onChange={(e) => handleArrayChange("immediateActions", index, e.target.value)}
                      placeholder={`Describe immediate action ${index + 1} specific to your company...`}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">💡 Immediate Action Ideas</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Freeze hiring and reduce workforce if necessary</li>
                  <li>• Cut non-essential expenses (travel, events, subscriptions)</li>
                  <li>• Renegotiate contracts with suppliers for better terms</li>
                  <li>• Secure emergency credit lines or funding</li>
                  <li>• Delay capital expenditures and major investments</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <TrendingDown className="w-16 h-16 mx-auto text-orange-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Recovery Strategy</h3>
                <p className="text-gray-600 mb-6">
                  Consider short-term recovery strategies you can take, such as adjusting prices or renegotiating debts. 
                  Write down 2 ideas specific to your company here.
                </p>
              </div>

              <div className="space-y-4">
                {answers.recoveryStrategies.map((strategy, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recovery Strategy #{index + 1}
                    </label>
                    <Textarea
                      value={strategy}
                      onChange={(e) => handleArrayChange("recoveryStrategies", index, e.target.value)}
                      placeholder={`Describe recovery strategy ${index + 1}...`}
                      className="min-h-[100px]"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">💡 Recovery Strategy Ideas</h4>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Focus on core profitable products/services</li>
                  <li>• Pivot to recession-resistant market segments</li>
                  <li>• Improve operational efficiency and automation</li>
                  <li>• Strengthen customer relationships and retention</li>
                  <li>• Explore new revenue streams or partnerships</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Prevention Measures</h3>
                <p className="text-gray-600 mb-6">
                  Now, take a look at the big picture and the long-term prevention measures you could consider to bring 
                  in more revenue for the company down the line. Write down 3 ideas specific to your company here.
                </p>
              </div>

              <div className="space-y-4">
                {answers.preventionMeasures.map((measure, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prevention Measure #{index + 1}
                    </label>
                    <Textarea
                      value={measure}
                      onChange={(e) => handleArrayChange("preventionMeasures", index, e.target.value)}
                      placeholder={`Describe prevention measure ${index + 1}...`}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">💡 Prevention Ideas</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Build larger cash reserves and emergency funds</li>
                  <li>• Diversify revenue streams and customer base</li>
                  <li>• Create flexible cost structures and scalable operations</li>
                  <li>• Develop recession-proof product lines</li>
                  <li>• Establish stronger supplier and partner relationships</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Bonus Step: Crisis Response Plan</h3>
                <p className="text-gray-600 mb-6">
                  Compare what you wrote in Step 1 to your ideas in Steps 2-4. Pick your top idea from each step to 
                  create your three-step crisis response plan and write it below.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800">Immediate Action</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={answers.crisisPlan.immediate}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          crisisPlan: { ...prev.crisisPlan, immediate: e.target.value },
                        }))
                      }
                      placeholder="Pick your top immediate action from Step 2..."
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">Short-term Recovery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={answers.crisisPlan.recovery}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          crisisPlan: { ...prev.crisisPlan, recovery: e.target.value },
                        }))
                      }
                      placeholder="Pick your top recovery strategy from Step 3..."
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Long-term Prevention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={answers.crisisPlan.prevention}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          crisisPlan: { ...prev.crisisPlan, prevention: e.target.value },
                        }))
                      }
                      placeholder="Pick your top prevention measure from Step 4..."
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
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
              className="px-6 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
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
