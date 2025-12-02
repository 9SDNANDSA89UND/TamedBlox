"use client"

import { Heart, MessageCircle, ExternalLink } from "lucide-react"

const socialPosts = [
  {
    id: 1,
    platform: "Twitter",
    author: "@TamedBlox",
    handle: "TamedBlox",
    content:
      "🎉 New epic swords just dropped! Limited edition items are flying off the shelves. Get yours before they're gone!",
    image: "/epic-sword-limited-edition-game.jpg",
    likes: 2340,
    comments: 156,
    timestamp: "2h ago",
    url: "#",
  },
  {
    id: 2,
    platform: "Instagram",
    author: "@tamedblox_official",
    handle: "tamedblox_official",
    content:
      "✨ Check out our latest creator spotlight! Big thanks to @GamerJoe for featuring our dragon wings pet. Amazing collection!",
    image: "/dragon-wings-pet-gaming-collection.jpg",
    likes: 5672,
    comments: 389,
    timestamp: "4h ago",
    url: "#",
  },
  {
    id: 3,
    platform: "TikTok",
    author: "@TamedBlox",
    handle: "TamedBlox",
    content:
      "POV: You just discovered the fastest item delivery in Roblox. 97% delivered in under 5 minutes! #RobloxItems #FastDelivery",
    image: "/fast-delivery-roblox-gaming-dashboard.jpg",
    likes: 12400,
    comments: 892,
    timestamp: "6h ago",
    url: "#",
  },
  {
    id: 4,
    platform: "Discord",
    author: "TamedBlox Community",
    handle: "tamedblox_discord",
    content:
      "Community Update: We've hit 2.3M happy players! Thanks for being amazing. New exclusive Discord roles coming next week!",
    image: "/community-celebration-roblox-gaming.jpg",
    likes: 3210,
    comments: 567,
    timestamp: "8h ago",
    url: "#",
  },
]

export default function SocialFeed() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Join Our Community</h2>
          <p className="text-muted-foreground">Follow us for deals, updates, and exclusive content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition group"
            >
              {/* Image */}
              <div className="relative h-40 bg-secondary overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.content}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs font-semibold rounded-full">
                  {post.platform}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">{post.author}</span>
                  <span className="text-muted-foreground">{post.timestamp}</span>
                </div>

                <p className="text-sm text-foreground line-clamp-2">{post.content}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </div>
                </div>

                {/* View Button */}
                <a
                  href={post.url}
                  className="w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                >
                  View on {post.platform}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Follow us on social media for the latest updates and exclusive deals!
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition"
            >
              Follow @TamedBlox
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
