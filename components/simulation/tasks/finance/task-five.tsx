"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Scale, Info } from 'lucide-react'

interface FinanceTaskFiveProps {
  onComplete: (answers: any) => void
  onBack: () => void
  initialData?: any
}

export default function FinanceTaskFive({ onComplete, onBack, initialData }: FinanceTaskFiveProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [answers, setAnswers] = useState({
    cuttingJobsPros: initialData?.cuttingJobsPros || "",
    cuttingJobsCons: initialData?.cuttingJobsCons || "",
    raisingPricesPros: initialData?.raisingPricesPros || "",
    raisingPricesCons: initialData?.raisingPricesCons || "",
    recommendation: initialData?.recommendation || "",
    financialJustification: initialData?.financialJustification || "",
    ethicalJustification: initialData?.ethicalJustification || "",
  })

  const steps = [
    { title: "Analyze Options", description: "List pros and cons for each choice" },
    { title: "Make Recommendation", description: "Choose the best financial option" },
    { title: "Ethical Analysis", description: "Justify the most ethical choice" },
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

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return (
          answers.cuttingJobsPros.trim().length > 0 &&
          answers.cuttingJobsCons.trim().length > 0 &&
          answers.raisingPricesPros.trim().length > 0 &&
          answers.raisingPricesCons.trim().length > 0
        )
      case 1:
        return answers.recommendation !== "" && answers.financialJustification.trim().length > 0
      case 2:
        return answers.ethicalJustification.trim().length > 0
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
                  <CardTitle className="text-lg text-blue-800">Task 5: Risk Manager</CardTitle>
                  <CardDescription className="text-blue-600">Ethics in Finance: Navigating Moral Dilemmas</CardDescription>
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
                <strong>Description:</strong> Your company is facing financial struggles due to an economic recession. 
                Consumer spending has dropped by 10%, and profits have fallen by 33%. To stay profitable for the next year, 
                the company must make a difficult choice.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">The Dilemma:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Option 1:</strong> Lay off workers to reduce labor cost, which would negatively impact employees</li>
                  <li>• <strong>Option 2:</strong> Raise prices during a shortage, which would negatively impact consumers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Office
              </Button>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Risk Manager</CardTitle>
                  <CardDescription className="text-purple-100">
                    Ethics in Finance: Navigating Moral Dilemmas
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
                <Scale className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Analyze Options</h3>
                <p className="text-gray-600 mb-6">
                  List the pros and cons for each choice. Consider not just the individual impact on those affected, 
                  but also how the choice could influence company reputation and sales.
                </p>
              </div>

              {/* Financial Impact Table */}
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Financial Impact of Both Choices (Hypothetical Data)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Metric</th>
                          <th className="text-center p-2">Before Recession (2023)</th>
                          <th className="text-center p-2">Layoffs Scenario</th>
                          <th className="text-center p-2">Price Increase Scenario</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Revenue</td>
                          <td className="text-center p-2">$250 billion</td>
                          <td className="text-center p-2">$230 billion</td>
                          <td className="text-center p-2">$240 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Net Income</td>
                          <td className="text-center p-2">$6 billion</td>
                          <td className="text-center p-2">$5.5 billion</td>
                          <td className="text-center p-2">$5.8 billion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Employees Laid Off</td>
                          <td className="text-center p-2">0</td>
                          <td className="text-center p-2">10,000</td>
                          <td className="text-center p-2">0</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Price Increase</td>
                          <td className="text-center p-2">0%</td>
                          <td className="text-center p-2">0%</td>
                          <td className="text-center p-2">15% on essentials</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Customer Satisfaction Score</td>
                          <td className="text-center p-2">90%</td>
                          <td className="text-center p-2">85%</td>
                          <td className="text-center p-2">70%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800">Cutting Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pros</label>
                      <Textarea
                        value={answers.cuttingJobsPros}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, cuttingJobsPros: e.target.value }))}
                        placeholder="List the advantages of laying off workers..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cons</label>
                      <Textarea
                        value={answers.cuttingJobsCons}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, cuttingJobsCons: e.target.value }))}
                        placeholder="List the disadvantages of laying off workers..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800">Raising Prices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pros</label>
                      <Textarea
                        value={answers.raisingPricesPros}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, raisingPricesPros: e.target.value }))}
                        placeholder="List the advantages of raising prices..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cons</label>
                      <Textarea
                        value={answers.raisingPricesCons}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, raisingPricesCons: e.target.value }))}
                        placeholder="List the disadvantages of raising prices..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Scale className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Make Your Recommendation</h3>
                <p className="text-gray-600 mb-6">
                  Using the list above, make your recommendation—it can be one choice or a combination of the two. 
                  Justify why it's the most financially sound option.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">What is your recommendation?</h4>
                  <RadioGroup
                    value={answers.recommendation}
                    onValueChange={(value) => setAnswers((prev) => ({ ...prev, recommendation: value }))}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value="layoffs" id="layoffs" className="mt-1" />
                      <Label htmlFor="layoffs" className="flex-1 cursor-pointer">
                        <strong>Lay off workers</strong> - Focus on reducing labor costs
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value="prices" id="prices" className="mt-1" />
                      <Label htmlFor="prices" className="flex-1 cursor-pointer">
                        <strong>Raise prices</strong> - Increase revenue through higher pricing
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value="combination" id="combination" className="mt-1" />
                      <Label htmlFor="combination" className="flex-1 cursor-pointer">
                        <strong>Combination approach</strong> - Mix of both strategies with reduced impact
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {answers.recommendation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justify why this is the most financially sound option:
                    </label>
                    <Textarea
                      value={answers.financialJustification}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, financialJustification: e.target.value }))}
                      placeholder="Explain your financial reasoning, considering revenue impact, cost savings, long-term sustainability, and stakeholder effects..."
                      className="min-h-[120px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Ethical Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Now, explain how your recommendation is the most ethically responsible choice.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
                <h4 className="font-semibold text-purple-800 mb-3">Consider these ethical principles:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-purple-700 text-sm">
                  <ul className="space-y-1">
                    <li>• <strong>Stakeholder Impact:</strong> Who is most affected?</li>
                    <li>• <strong>Fairness:</strong> Is the burden shared equitably?</li>
                    <li>• <strong>Long-term Consequences:</strong> What are the lasting effects?</li>
                    <li>• <strong>Social Responsibility:</strong> Company's duty to society</li>
                  </ul>
                  <ul className="space-y-1">
                    <li>• <strong>Employee Welfare:</strong> Impact on livelihoods</li>
                    <li>• <strong>Consumer Protection:</strong> Access to essential goods</li>
                    <li>• <strong>Transparency:</strong> Honest communication</li>
                    <li>• <strong>Sustainability:</strong> Long-term viability</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explain how your recommendation is the most ethically responsible choice:
                </label>
                <Textarea
                  value={answers.ethicalJustification}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, ethicalJustification: e.target.value }))}
                  placeholder="Discuss the ethical implications of your choice, considering stakeholder welfare, fairness, social responsibility, and long-term consequences..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Reflection Complete</span>
                </div>
                <p className="text-green-700 text-sm">
                  You've successfully navigated a complex ethical dilemma in finance, balancing financial necessity 
                  with moral responsibility.
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
              className="px-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
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
