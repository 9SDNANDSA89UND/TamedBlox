"use client"

import { X } from "lucide-react"

interface ProductDetailModalProps {
  product: {
    id: number
    name: string
    game: string
    price: number
    originalPrice: number
    rating: number
    reviews: number
    image: string
    badge?: string | null
  } | null
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose, onCheckout }: ProductDetailModalProps) {
  if (!isOpen || !product) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6">
            <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary rounded-lg overflow-hidden h-64 md:h-80">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">{product.game}</p>
                  <p className="text-3xl font-bold text-primary mt-2">${product.price}</p>
                  <p className="text-lg text-muted-foreground line-through">${product.originalPrice}</p>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? "text-primary" : "text-muted-foreground"}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                <p className="text-foreground leading-relaxed">
                  This exclusive game item is ready for instant delivery. Fast, safe, and verified by thousands of happy
                  players. Own this item now and start your gaming journey!
                </p>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary font-semibold">Within 5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="text-primary font-semibold">Brand New</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller Rating</span>
                    <span className="text-primary font-semibold">4.9/5.0</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Customer Reviews</h3>
              <div className="space-y-3">
                {[
                  { author: "FastDelivery", stars: 5, text: "Great item, received in 2 min" },
                  { author: "HappyPlayer", stars: 4, text: "Exactly as described, very satisfied" },
                  { author: "GameMaster", stars: 5, text: "Best seller on the platform!" },
                ].map((review, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-foreground">{review.author}</p>
                      <span className="text-primary">{"★".repeat(review.stars)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
