"use client"

import { Shield, Zap, MessageCircle, Lock } from "lucide-react"

const trustFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "97% of items delivered in under 4 minutes. Get your items instantly and start playing.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Fully Protected",
    description: "Every transaction is secured with buyer protection. Trade with confidence and peace of mind.",
    color: "text-primary",
  },
  {
    icon: Lock,
    title: "Safe & Verified",
    description: "All sellers are verified and reviews are authentic. Browse thousands of trusted sellers.",
    color: "text-primary",
  },
  {
    icon: MessageCircle,
    title: "24/7 Live Support",
    description: "Our team is always here to help. Get instant support whenever you need it.",
    color: "text-primary",
  },
]

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Players Trust TamedBlox</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fast delivery, secure transactions, and unmatched customer support make us the most trusted marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 space-y-4 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition">
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
