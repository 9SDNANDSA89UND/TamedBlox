"use client"

interface CategorySidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: "all", label: "All Items", icon: "📦" },
  { id: "swords", label: "Weapons", icon: "⚔️" },
  { id: "pets", label: "Pets & Companions", icon: "🐾" },
  { id: "cosmetics", label: "Cosmetics", icon: "✨" },
  { id: "tools", label: "Tools & Equipment", icon: "🔧" },
  { id: "mounts", label: "Mounts & Vehicles", icon: "🐴" },
  { id: "rare", label: "Rare & Limited", icon: "💎" },
  { id: "bundles", label: "Bundle Deals", icon: "🎁" },
]

export default function CategorySidebar({ selectedCategory, onCategoryChange }: CategorySidebarProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Categories</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary"
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
