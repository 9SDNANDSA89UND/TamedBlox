"use client"

import { TrendingUp } from "lucide-react"
import ProductCard from "@/components/product-card"
import FilterSidebar, { type FilterState } from "@/components/filter-sidebar"
import { useState } from "react"

const products = [
  {
    id: 1,
    name: "Legendary Sword",
    game: "Sword Hero Simulator",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.8,
    reviews: 324,
    image: "/legendary-gold-sword-glowing.jpg",
    badge: "Hot Deal",
  },
  {
    id: 2,
    name: "Diamond Pickaxe",
    game: "Mining Empire",
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.9,
    reviews: 512,
    image: "/diamond-pickaxe-minecraft-blue.jpg",
    badge: "Best Seller",
  },
  {
    id: 3,
    name: "Dragon Wings",
    game: "Sky Warriors",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.7,
    reviews: 189,
    image: "/purple-dragon-wings-fantasy.jpg",
    badge: "Limited",
  },
  {
    id: 4,
    name: "Golden Crown",
    game: "Kingdom Tycoon",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.6,
    reviews: 276,
    image: "/golden-crown-jeweled-luxury.jpg",
    badge: null,
  },
  {
    id: 5,
    name: "Void Orb",
    game: "Mystical Realms",
    price: 44.99,
    originalPrice: 59.99,
    rating: 4.9,
    reviews: 418,
    image: "/purple-void-orb-magical-glowing.jpg",
    badge: "Hot Deal",
  },
  {
    id: 6,
    name: "Speed Boots",
    game: "Parkour Paradise",
    price: 14.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviews: 645,
    image: "/purple-speed-boots-shoes-gaming.jpg",
    badge: "Best Seller",
  },
  {
    id: 7,
    name: "Phoenix Fire Pet",
    game: "Pet Collector",
    price: 39.99,
    originalPrice: 54.99,
    rating: 4.8,
    reviews: 234,
    image: "/phoenix-fire-pet-wings-red-orange.jpg",
    badge: null,
  },
  {
    id: 8,
    name: "Infinity Gauntlet",
    game: "Power Quest",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.9,
    reviews: 892,
    image: "/infinity-gauntlet-glove-purple-gold.jpg",
    badge: "Limited",
  },
]

interface MarketplaceProps {
  onAddToCart?: (product: any) => void
  onViewDetails?: (product: any) => void
}

export default function Marketplace({ onAddToCart, onViewDetails }: MarketplaceProps) {
  const [filters, setFilters] = useState<FilterState>({ priceRange: [0, 363], mutations: [] })

  const filteredProducts = products.filter((product) => {
    const price = product.price
    return price >= filters.priceRange[0] && price <= filters.priceRange[1]
  })

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Trending Now
            </h2>
            <p className="text-muted-foreground">Top items from our community this week</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition font-medium">
            View All
            <span className="text-lg">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block">
            <FilterSidebar onFilterChange={setFilters} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
