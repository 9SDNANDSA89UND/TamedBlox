"use client"

import { X, ShoppingBag, Trash2, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemove?: (id: number) => void
}

export default function CartDrawer({ isOpen, onClose, items, onRemove }: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleProceedToCheckout = () => {
    router.push("/checkout")
  }

  const handleTestPurchase = () => {
    router.push("/checkout")
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-foreground font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add items to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-secondary rounded-lg border border-border/50 hover:border-primary/30 transition group"
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-primary font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => onRemove?.(item.id)} className="p-2 hover:bg-destructive/20 rounded transition">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleTestPurchase}
              className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition text-sm"
            >
              TEST: Quick Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
