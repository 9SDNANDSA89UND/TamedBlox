"use client"

import { Star, ShoppingCart, Zap } from "lucide-react"
import { useState, useRef } from "react"

interface ProductCardProps {
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
  }
  onAddToCart?: (product: any) => void
  onViewDetails?: (product: any) => void
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = () => {
    // Create fly-in animation
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const cartElement = document.querySelector("[data-cart-icon]")
      if (cartElement) {
        const cartRect = cartElement.getBoundingClientRect()
        const flyingItem = document.createElement("div")
        flyingItem.className = "fixed pointer-events-none"
        flyingItem.style.left = rect.left + "px"
        flyingItem.style.top = rect.top + "px"
        flyingItem.style.width = "60px"
        flyingItem.style.height = "60px"
        flyingItem.style.backgroundColor = "#10b981"
        flyingItem.style.borderRadius = "8px"
        flyingItem.style.display = "flex"
        flyingItem.style.alignItems = "center"
        flyingItem.style.justifyContent = "center"
        flyingItem.style.zIndex = "9999"
        flyingItem.style.animation = `flyToCart 0.6s ease-in forwards`
        flyingItem.innerHTML = "🛒"
        document.body.appendChild(flyingItem)

        // Add animation keyframes if not already present
        if (!document.getElementById("fly-animation")) {
          const style = document.createElement("style")
          style.id = "fly-animation"
          style.innerHTML = `
            @keyframes flyToCart {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.3);
                opacity: 0;
              }
            }
          `
          document.head.appendChild(style)
        }

        setTimeout(() => flyingItem.remove(), 600)
      }
    }

    setIsAdded(true)
    onAddToCart?.(product)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div
      ref={cardRef}
      className="group bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-primary/10 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-secondary overflow-hidden">
        <img
          src={product.image || "/placeholder.svg?height=200&width=300&query=game item"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {product.badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-grow flex flex-col">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{product.game}</p>
          <h3 className="text-foreground font-semibold line-clamp-2 group-hover:text-primary transition">
            {product.name}
          </h3>
        </div>

        {/* Rating and Reviews */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="text-xs text-primary hover:text-primary/80 transition"
          >
            {showReviews ? "Hide reviews" : "View reviews"}
          </button>
        </div>

        {/* Reviews Section */}
        {showReviews && (
          <div className="bg-secondary/50 -mx-4 -mb-4 px-4 py-3 space-y-2 border-t border-border">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground">Fast delivery!</span>
                <span className="text-primary">★★★★★</span>
              </div>
              <div className="text-muted-foreground">Great item, received in 2 min</div>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground">Exactly as described</span>
                <span className="text-primary">★★★★☆</span>
              </div>
              <div className="text-muted-foreground">Very happy with purchase</div>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-primary">${product.price}</span>
          <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onViewDetails?.(product)}
            className="flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </button>
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 group/btn ${
              isAdded
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80 text-foreground border border-primary/30"
            }`}
          >
            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="hidden sm:inline">{isAdded ? "Added!" : "Cart"}</span>
            <span className="sm:hidden">{isAdded ? "✓" : "+"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
