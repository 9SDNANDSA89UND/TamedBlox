"use client"

import { CreditCard, Smartphone, Wallet, DollarSign } from "lucide-react"

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "digital",
    name: "Digital Wallets",
    description: "Apple Pay, Google Pay",
    icon: Smartphone,
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank payment",
    icon: Wallet,
  },
  {
    id: "other",
    name: "More Options",
    description: "iDEAL, Alipay, and more",
    icon: DollarSign,
  },
]

export default function PaymentMethods() {
  return (
    <section className="py-12 bg-secondary/30 rounded-xl border border-border p-6 md:p-8">
      <h3 className="text-lg font-bold text-foreground mb-6">Secure Payment Methods</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <div
              key={method.id}
              className="flex flex-col items-center p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition"
            >
              <Icon className="w-8 h-8 text-primary mb-2" />
              <p className="text-xs font-semibold text-center text-foreground">{method.name}</p>
              <p className="text-xs text-center text-muted-foreground mt-1">{method.description}</p>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4">
        Powered by Stripe. Your payment information is encrypted and secure.
      </p>
    </section>
  )
}
