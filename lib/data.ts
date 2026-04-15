// UI constants only. All user/campaign/transaction data comes from the API.

export const channelColors: Record<string, string> = {
  "TikTok": "#6C5CE7",
  "Reels": "#E91E8C",
  "YouTube": "#FF4444",
  "Discord": "#4ECDC4",
  "Twitter/X": "#94A3B8",
  "Newsletter": "#4A9EFF",
  "Podcast": "#FF9F43",
  "Twitch": "#9146FF",
  "Instagram": "#E91E8C",
  "Shorts": "#FF4444",
  "Reddit": "#FF5700",
  "Telegram": "#26A5E4",
  "Blog": "#64748B",
}

export const channelCategories = [
  {
    name: "Short-Form Video",
    accentColor: "#6C5CE7",
    channels: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    dealVolume: "$2.4M",
  },
  {
    name: "Long-Form Video",
    accentColor: "#FF4444",
    channels: ["YouTube Preroll", "Dedicated Video", "Mid-Roll", "Twitch"],
    dealVolume: "$1.8M",
  },
  {
    name: "Social Posts",
    accentColor: "#94A3B8",
    channels: ["Tweet Thread", "IG Story", "Carousel", "Pinterest"],
    dealVolume: "$890K",
  },
  {
    name: "Community",
    accentColor: "#4ECDC4",
    channels: ["Discord Post", "Discord Server", "Telegram", "Reddit"],
    dealVolume: "$1.1M",
  },
  {
    name: "Written Content",
    accentColor: "#4A9EFF",
    channels: ["Newsletter Placement", "Newsletter Dedicated", "Blog Post"],
    dealVolume: "$650K",
  },
  {
    name: "Audio",
    accentColor: "#FF9F43",
    channels: ["Podcast Pre-Roll", "Mid-Roll", "Post-Roll", "Dedicated Episode"],
    dealVolume: "$780K",
  },
  {
    name: "Custom",
    accentColor: "#FF6B35",
    channels: ["Influencer Event", "Product Seeding", "Co-Creation", "Whitelisting"],
    dealVolume: "$420K",
  },
]
