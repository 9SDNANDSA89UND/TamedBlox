"use client"

export default function Hero() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-secondary to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span className="text-sm text-primary font-medium">Instant Delivery</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Find, Buy & Receive Items Within Minutes
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Instantly purchase your favorite game items. TamedBlox guarantees fast delivery and safe trading across
              thousands of verified items.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition">
                Explore Now
              </button>
              <button className="px-8 py-3 bg-secondary text-foreground border border-border rounded-lg font-semibold hover:bg-secondary/80 transition">
                Learn More
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-primary">97%</div>
                <div className="text-muted-foreground">Items Delivered &lt;4 min</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2.3M+</div>
                <div className="text-muted-foreground">Happy Players</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 md:h-full hidden md:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-3xl"></div>
            <div className="relative space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="w-20 h-20 bg-card rounded-lg border border-border/50 flex items-center justify-center text-2xl">
                  🎮
                </div>
                <div className="w-20 h-20 bg-card rounded-lg border border-border/50 flex items-center justify-center text-2xl">
                  💎
                </div>
                <div className="w-20 h-20 bg-card rounded-lg border border-border/50 flex items-center justify-center text-2xl">
                  ⚔️
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-20 h-20 bg-card rounded-lg border border-border/50 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/50 rounded-lg border border-primary/50 flex items-center justify-center text-4xl transform -rotate-12">
                  ✨
                </div>
                <div className="w-20 h-20 bg-card rounded-lg border border-border/50 flex items-center justify-center text-2xl">
                  🎁
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
