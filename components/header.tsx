"use client"

import { Search, ShoppingCart, User, Menu, LogOut } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface HeaderProps {
  onCartClick?: () => void
  cartCount?: number
  isAdmin?: boolean
}

export default function Header({ onCartClick, cartCount = 0, isAdmin = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block">TamedBlox</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-4 py-2 pl-10 bg-secondary text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition relative"
              data-cart-icon
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/parents-guide"
                className="px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition text-sm"
              >
                Parents Guide
              </Link>
              <Link href="/faq" className="px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition text-sm">
                FAQ
              </Link>
            </div>

            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="p-2 hover:bg-secondary rounded-lg transition text-foreground text-xs font-semibold hidden sm:flex"
                  title="Admin Panel"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/creators"
                  className="p-2 hover:bg-secondary rounded-lg transition text-foreground text-xs font-semibold hidden sm:flex"
                  title="Creator Dashboard"
                >
                  Creators
                </Link>
              </>
            )}
            <Link href="/profile" className="p-2 hover:bg-secondary rounded-lg transition text-foreground">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("userEmail")
                localStorage.removeItem("userPassword")
                localStorage.removeItem("robloxUsername")
                window.location.href = "/"
              }}
              className="p-2 hover:bg-secondary rounded-lg transition text-foreground"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        <div className="md:hidden pb-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-4 py-2 pl-10 bg-secondary text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
          </div>
          {mobileMenuOpen && (
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              <Link href="/parents-guide" className="block px-3 py-2 text-foreground hover:bg-background rounded">
                Parents Guide
              </Link>
              <Link href="/faq" className="block px-3 py-2 text-foreground hover:bg-background rounded">
                FAQ
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
