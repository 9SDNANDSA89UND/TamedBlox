"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  priceRange: [number, number]
  mutations: string[]
  type?: string[]
}

const mutations = [
  { id: "original", label: "Original", count: 66 },
  { id: "gold", label: "Gold", count: 61 },
  { id: "diamond", label: "Diamond", count: 56 },
  { id: "rainbow", label: "Rainbow", count: 22 },
  { id: "bloodrot", label: "Bloodrot", count: 8 },
  { id: "candy", label: "Candy", count: 17 },
  { id: "lava", label: "Lava", count: 17 },
  { id: "galaxy", label: "Galaxy", count: 26 },
]

const itemTypes = [
  { id: "brainrot-god", label: "Brainrot God", count: 124 },
  { id: "secret", label: "Secret", count: 89 },
  { id: "og", label: "OG", count: 156 },
]

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 363])
  const [selectedMutations, setSelectedMutations] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    mutation: true,
    type: true,
  })

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...priceRange]
    newRange[index] = value
    if (newRange[0] <= newRange[1]) {
      setPriceRange(newRange)
      onFilterChange?.({ priceRange: newRange, mutations: selectedMutations, type: selectedTypes })
    }
  }

  const handleMutationToggle = (mutationId: string) => {
    const updated = selectedMutations.includes(mutationId)
      ? selectedMutations.filter((id) => id !== mutationId)
      : [...selectedMutations, mutationId]
    setSelectedMutations(updated)
    onFilterChange?.({ priceRange, mutations: updated, type: selectedTypes })
  }

  const handleTypeToggle = (typeId: string) => {
    const updated = selectedTypes.includes(typeId)
      ? selectedTypes.filter((id) => id !== typeId)
      : [...selectedTypes, typeId]
    setSelectedTypes(updated)
    onFilterChange?.({ priceRange, mutations: selectedMutations, type: updated })
  }

  const handleReset = () => {
    setPriceRange([0, 363])
    setSelectedMutations([])
    setSelectedTypes([])
    onFilterChange?.({ priceRange: [0, 363], mutations: [], type: [] })
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Filter Items</h3>
        <button onClick={handleReset} className="text-sm text-primary hover:text-primary/80 transition font-medium">
          Reset
        </button>
      </div>

      {/* Price Filter */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-foreground font-semibold hover:text-primary transition"
        >
          <span>Price</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.price ? "rotate-180" : ""}`} />
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, Number.parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, Number.parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(0, Number.parseInt(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-secondary border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>
              <div className="flex items-center text-muted-foreground">−</div>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(1, Number.parseInt(e.target.value) || 1000)}
                    className="w-full pl-7 pr-3 py-2 bg-secondary border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <button
          onClick={() => toggleSection("type")}
          className="w-full flex items-center justify-between text-foreground font-semibold hover:text-primary transition"
        >
          <span>Item Type</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.type ? "rotate-180" : ""}`} />
        </button>

        {expandedSections.type && (
          <div className="space-y-2">
            {itemTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="w-5 h-5 rounded border-border bg-secondary checked:bg-primary checked:border-primary cursor-pointer accent-primary"
                />
                <span className="flex-1 text-foreground group-hover:text-primary transition">{type.label}</span>
                <span className="text-sm text-muted-foreground">{type.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Mutation Filter */}
      <div className="space-y-4 pt-4 border-t border-border">
        <button
          onClick={() => toggleSection("mutation")}
          className="w-full flex items-center justify-between text-foreground font-semibold hover:text-primary transition"
        >
          <span>Mutation</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.mutation ? "rotate-180" : ""}`} />
        </button>

        {expandedSections.mutation && (
          <div className="space-y-2">
            {mutations.map((mutation) => (
              <label
                key={mutation.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedMutations.includes(mutation.id)}
                  onChange={() => handleMutationToggle(mutation.id)}
                  className="w-5 h-5 rounded border-border bg-secondary checked:bg-primary checked:border-primary cursor-pointer accent-primary"
                />
                <span className="flex-1 text-foreground group-hover:text-primary transition">{mutation.label}</span>
                <span className="text-sm text-muted-foreground">{mutation.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
