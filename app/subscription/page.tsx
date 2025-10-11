"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Crown, Zap } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  description: string
  icon: typeof Sparkles
  features: string[]
  popular?: boolean
  color: string
}

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      features: [
        "Access to basic Q&A",
        "5 Spark conversations per day",
        "Community discussions",
        "Basic doubt resolution",
        "Mobile app access",
      ],
    },
    {
      id: "student",
      name: "Student Pro",
      price: 99,
      description: "Everything you need to excel",
      icon: Zap,
      popular: true,
      color: "from-blue-500 to-purple-600",
      features: [
        "Everything in Free",
        "Unlimited Spark conversations",
        "All study tools (mindmap, flowchart, quiz)",
        "Priority support",
        "Offline mode",
        "Advanced analytics",
        "Custom study plans",
        "Collaboration features",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 199,
      description: "For serious learners",
      icon: Crown,
      color: "from-purple-500 to-pink-600",
      features: [
        "Everything in Student Pro",
        "1-on-1 expert mentorship",
        "Personalized AI tutor",
        "Multi-modal support (images, voice)",
        "Advanced research tools",
        "API access",
        "White-label options",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Unlock the full potential of Entropy with our subscription plans
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
          <Button
            variant={billingCycle === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          const displayPrice = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              } transition-all hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className={`h-12 w-12 bg-gradient-to-br ${plan.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${displayPrice}</span>
                    <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  {billingCycle === "yearly" && plan.price > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed annually (${displayPrice * 12}/year)
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.price === 0 ? "Get Started" : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing
                cycle.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and PayPal. Student discounts are available with valid
                ID.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The Free plan is available forever with no credit card required. Paid plans offer a 7-day money-back
                guarantee.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Absolutely! Cancel your subscription anytime from your account settings. No questions asked, no hidden
                fees.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enterprise Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-none">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Need something more?</h3>
            <p className="text-muted-foreground mb-6">
              Contact us for enterprise solutions, custom integrations, and volume discounts
            </p>
            <Button size="lg" variant="default">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
