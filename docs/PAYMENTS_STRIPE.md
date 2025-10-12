# Stripe Payment Integration Guide

> **Status**: 🔮 **Future Implementation** - Complete Design Specification

> ⚠️ **Not Yet Implemented** - This is a complete design document for future Stripe integration.

Complete guide for integrating Stripe payments for subscriptions and credit purchases in the Entropy platform.

---

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Architecture](#architecture)
4. [Implementation](#implementation)
5. [Subscription Plans](#subscription-plans)
6. [Credit Purchases](#credit-purchases)
7. [Webhooks](#webhooks)
8. [Testing](#testing)

---

## Overview

### Features
- **Subscription Plans**: FREE, PRO, PREMIUM tiers
- **Credit Purchases**: One-time credit packs
- **Payment Methods**: Credit cards, digital wallets
- **Billing**: Automatic monthly/yearly billing
- **Webhooks**: Real-time payment status updates

### Tech Stack
- **Frontend**: Stripe Elements (React)
- **Backend**: Stripe API + Webhooks
- **Database**: PostgreSQL (existing schema)

---

## Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys from Dashboard

### 2. Environment Variables

\`\`\`env
# Add to .env
STRIPE_SECRET_KEY=sk_test_... # sk_live_... in production
STRIPE_PUBLISHABLE_KEY=pk_test_... # pk_live_... in production
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
\`\`\`

---

## Architecture

\`\`\`
┌──────────────────────────────────────────────┐
│          User (Browser)                      │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Stripe Elements                       │ │
│  │  (Secure payment form)                 │ │
│  └────────────────────────────────────────┘ │
└───────────────────┬──────────────────────────┘
                    │ Submit Payment
                    ▼
┌──────────────────────────────────────────────┐
│     Next.js API Routes                       │
│                                              │
│  /api/stripe/create-checkout-session        │
│  /api/stripe/create-payment-intent          │
│  /api/stripe/webhook                        │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│           Stripe API                         │
│                                              │
│  • Process payment                          │
│  • Create subscription                      │
│  • Send webhooks                            │
└────────────────┬─────────────────────────────┘
                 │ Webhook Events
                 ▼
┌──────────────────────────────────────────────┐
│       Webhook Handler                        │
│                                              │
│  • Update user subscription                 │
│  • Add credits to account                   │
│  • Send confirmation email                  │
└──────────────────────────────────────────────┘
\`\`\`

---

## Implementation

### 1. Initialize Stripe

**lib/stripe.ts**
\`\`\`typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)
\`\`\`

### 2. Stripe Client Component

**components/stripe-provider.tsx**
\`\`\`typescript
'use client'

import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
\`\`\`

### 3. Checkout Session (Subscriptions)

**app/api/stripe/create-checkout-session/route.ts**
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await req.json()

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

### 4. Payment Intent (One-time Credits)

**app/api/stripe/create-payment-intent/route.ts**
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'

const CREDIT_PACKS = {
  small: { credits: 100, price: 999 }, // $9.99
  medium: { credits: 500, price: 3999 }, // $39.99
  large: { credits: 1000, price: 6999 }, // $69.99
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packSize } = await req.json()
    const pack = CREDIT_PACKS[packSize as keyof typeof CREDIT_PACKS]

    if (!pack) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pack.price,
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        credits: pack.credits,
        packSize,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
\`\`\`

### 5. Subscription Page

**app/subscription/page.tsx**
\`\`\`typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const PLANS = [
  {
    name: 'FREE',
    price: 0,
    priceId: null,
    features: [
      '100 credits/month',
      'Ask unlimited questions',
      'Basic AI assistance',
      'Community support',
    ],
  },
  {
    name: 'PRO',
    price: 9.99,
    priceId: 'price_pro_monthly', // Create in Stripe Dashboard
    features: [
      '500 credits/month',
      'Priority AI responses',
      'Advanced analytics',
      'No ads',
      'Email support',
    ],
  },
  {
    name: 'PREMIUM',
    price: 19.99,
    priceId: 'price_premium_monthly',
    features: [
      'Unlimited credits',
      'Instant AI responses',
      'Private mentorship',
      'API access',
      'Priority support',
      'Custom badges',
    ],
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const { sessionId } = await res.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Choose Your Plan
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card key={plan.name} className="p-6">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-4xl font-bold mb-6">
              ${plan.price}
              <span className="text-sm text-muted-foreground">/month</span>
            </p>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              disabled={!plan.priceId || loading === plan.name}
              onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.name)}
            >
              {loading === plan.name ? 'Processing...' : 
               plan.priceId ? 'Subscribe' : 'Current Plan'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
\`\`\`

---

## Subscription Plans

### Create Products in Stripe Dashboard

1. Go to Stripe Dashboard → Products
2. Create products:

**PRO Plan**
- Name: Entropy Pro
- Description: Professional plan with 500 credits/month
- Price: $9.99/month (recurring)
- Price ID: `price_pro_monthly`

**PREMIUM Plan**
- Name: Entropy Premium
- Description: Premium unlimited plan
- Price: $19.99/month (recurring)
- Price ID: `price_premium_monthly`

---

## Credit Purchases

**components/buy-credits.tsx**
\`\`\`typescript
'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'

function CreditCheckout({ pack }: { pack: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/credits/success`,
      },
    })

    if (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="mt-4 w-full">
        {loading ? 'Processing...' : 'Buy Credits'}
      </Button>
    </form>
  )
}

export function BuyCreditsPacks() {
  const [clientSecret, setClientSecret] = useState('')
  const [selectedPack, setSelectedPack] = useState('')

  const handleSelectPack = async (packSize: string) => {
    setSelectedPack(packSize)
    
    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packSize }),
    })

    const { clientSecret } = await res.json()
    setClientSecret(clientSecret)
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CreditCheckout pack={selectedPack} />
      </Elements>
    )
  }

  return (
    <div className="grid gap-4">
      <CreditPackCard 
        credits={100} 
        price={9.99} 
        onClick={() => handleSelectPack('small')} 
      />
      <CreditPackCard 
        credits={500} 
        price={39.99} 
        onClick={() => handleSelectPack('medium')} 
      />
      <CreditPackCard 
        credits={1000} 
        price={69.99} 
        onClick={() => handleSelectPack('large')} 
      />
    </div>
  )
}
\`\`\`

---

## Webhooks

### Setup Webhook Endpoint

**app/api/stripe/webhook/route.ts**
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update user subscription
      await prisma.user.update({
        where: { id: session.metadata?.userId },
        data: {
          subscriptionTier: session.mode === 'subscription' ? 'PRO' : 'FREE',
        },
      })
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Add credits to user account
      const userId = paymentIntent.metadata.userId
      const credits = parseInt(paymentIntent.metadata.credits)
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Downgrade user to FREE
      // Find user by customer ID (store in DB)
      await prisma.user.update({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          subscriptionTier: 'FREE',
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      // Handle failed payment
      // Send email notification
      break
    }
  }

  return NextResponse.json({ received: true })
}

// Important: Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}
\`\`\`

### Configure Webhook in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Testing

### Test Mode

\`\`\`bash
# Use test API keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

### Test Cards

\`\`\`
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
\`\`\`

### Test Webhooks Locally

\`\`\`bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
\`\`\`

---

## Security Best Practices

1. **Never expose secret keys** in client code
2. **Validate webhook signatures** before processing
3. **Use HTTPS** in production
4. **Implement idempotency** for webhook handlers
5. **Log all transactions** for audit trail
6. **Handle errors gracefully** with user-friendly messages

---

## Database Updates

Add to User model in `prisma/schema.prisma`:

\`\`\`prisma
model User {
  // ... existing fields
  
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  subscriptionStatus   String?  // active, canceled, past_due
  subscriptionTier     String   @default("FREE")
  credits              Int      @default(100)
  
  @@map("users")
}
\`\`\`

Run migration:
\`\`\`bash
npx prisma migrate dev --name add_stripe_fields
\`\`\`

---

## Next Steps

1. ✅ Set up Stripe account and get API keys
2. ✅ Configure environment variables
3. ✅ Create products and prices in Stripe Dashboard
4. ✅ Implement checkout session endpoint
5. ✅ Build subscription page UI
6. ✅ Set up webhook handler
7. ✅ Test with Stripe test cards
8. ✅ Configure webhook in production
9. ✅ Add credit purchase feature
10. ✅ Implement subscription management (cancel, upgrade)

---

## Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Next.js Example](https://github.com/stripe-samples/checkout-one-time-payments)
- [Stripe Testing](https://stripe.com/docs/testing)
