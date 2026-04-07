import type { Campaign } from "./types"

export const campaigns: Campaign[] = [
  {
    id: 1,
    brand: "NordVPN",
    brandInitial: "N",
    brandColor: "#6C5CE7",
    verified: true,
    rate: "$150/post",
    rateType: "flat",
    title: "TikTok Product Demo: Summer Campaign",
    description: "Looking for gaming & tech creators to demo NordVPN in a 30-60s product showcase. Natural integration preferred.",
    channels: ["TikTok", "Reels"],
    budget: "$12,000",
    spots: 48,
    accentColor: "#6C5CE7",
  },
  {
    id: 2,
    brand: "Raid Shadow Legends",
    brandInitial: "R",
    brandColor: "#FF6B35",
    verified: true,
    rate: "CPM $18",
    rateType: "cpm",
    title: "YouTube Preroll: Q2 Expansion Push",
    description: "Seeking YouTube creators (50K+ subs) for 60-90s mid-roll integrations. Gaming, tech, finance niches preferred.",
    channels: ["YouTube"],
    budget: "$28,000",
    spots: 22,
    accentColor: "#FF4444",
  },
  {
    id: 3,
    brand: "DeFi Protocol X",
    brandInitial: "D",
    brandColor: "#4ECDC4",
    verified: false,
    rate: "$75/day",
    rateType: "daily",
    title: "Discord Server Sponsorship: Crypto Niche",
    description: "Sponsoring Discord servers with 10K+ crypto/NFT members. Weekly pinned posts + bot integration.",
    channels: ["Discord"],
    budget: "$4,500",
    spots: 12,
    accentColor: "#4ECDC4",
  },
  {
    id: 4,
    brand: "Shopify",
    brandInitial: "S",
    brandColor: "#00B894",
    verified: true,
    rate: "$300/post",
    rateType: "flat",
    title: "Twitter/X Thread Series: E-commerce Tips",
    description: "Partner with Shopify for a 5-7 tweet thread about e-commerce growth. Must have 20K+ engaged followers.",
    channels: ["Twitter/X"],
    budget: "$9,000",
    spots: 30,
    accentColor: "#00B894",
  },
  {
    id: 5,
    brand: "Athletic Greens",
    brandInitial: "A",
    brandColor: "#FF9F43",
    verified: true,
    rate: "$400/read",
    rateType: "flat",
    title: "Podcast Ad Read: Health & Wellness",
    description: "Pre-roll and mid-roll ad reads for health, fitness, and lifestyle podcasts. Natural integration preferred.",
    channels: ["Podcast"],
    budget: "$15,000",
    spots: 8,
    accentColor: "#FF9F43",
  },
  {
    id: 6,
    brand: "Morning Brew",
    brandInitial: "M",
    brandColor: "#4ECDC4",
    verified: true,
    rate: "$500/issue",
    rateType: "flat",
    title: "Newsletter Sponsored Section: Finance Niche",
    description: "Seeking newsletters with 5K+ subscribers in finance, investing, or business. Full sponsored section placement.",
    channels: ["Newsletter"],
    budget: "$6,000",
    spots: 12,
    accentColor: "#4ECDC4",
  },
]

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

export const trendingChannels = [
  { name: "Discord Sponsorships", growth: "+340%", color: "#4ECDC4" },
  { name: "Twitter/X Threads", growth: "+180%", color: "#94A3B8" },
  { name: "Podcast Mid-Rolls", growth: "+95%", color: "#FF9F43" },
]

export const matchScores = [
  { score: 94, campaign: "NordVPN TikTok Campaign", color: "#00B894" },
  { score: 87, campaign: "Morning Brew Newsletter", color: "#6C5CE7" },
  { score: 72, campaign: "Athletic Greens Podcast", color: "#FF9F43" },
]

export const tickerItems = [
  { text: "Creator earned $200 for a Discord sponsorship" },
  { text: "Brand launched a 12-creator TikTok campaign" },
  { text: "Creator earned $500 for a YouTube preroll" },
  { text: "New clipping deal closed: $1,200/month" },
  { text: "Creator earned $350 for a Twitter/X thread series" },
  { text: "Brand reached 2.4M impressions via newsletter" },
  { text: "Podcast mid-roll deal: $500 flat rate" },
  { text: "Discord server sponsor earned $900 this week" },
]

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

export const brandStats = {
  totalSpend: "$34.2K",
  activeCampaigns: 12,
  totalReach: "2.4M",
  costPerEngagement: "$0.023",
  activeCreators: 89,
  pendingReview: 23,
}

export const spendByChannel = [
  { channel: "TikTok", spend: 12400 },
  { channel: "YouTube", spend: 8100 },
  { channel: "Twitter/X", spend: 5200 },
  { channel: "Discord", spend: 4000 },
  { channel: "Podcast", spend: 2800 },
  { channel: "Other", spend: 1700 },
]

export const activeCampaigns = [
  {
    name: "Summer Launch: Multi-Channel",
    channels: ["TikTok", "Twitter/X", "Discord"],
    creators: 32,
    status: "active",
  },
  {
    name: "YouTube Preroll: Q2 Push",
    channels: ["YouTube"],
    creators: 18,
    status: "active",
  },
  {
    name: "Newsletter Blitz: Finance Niche",
    channels: ["Newsletter"],
    pending: 7,
    status: "pending",
  },
  {
    name: "Podcast Sponsorship: Health",
    channels: ["Podcast"],
    creators: 5,
    status: "active",
  },
]

export const recentSubmissions = [
  {
    creator: "Sarah Chen",
    followers: "245K",
    campaign: "Summer Launch",
    channel: "TikTok",
    status: "In Review",
    reach: "182K",
  },
  {
    creator: "Mike Torres",
    followers: "18K",
    campaign: "Newsletter Blitz",
    channel: "Newsletter",
    status: "Approved",
    reach: "14.2K",
  },
  {
    creator: "Alex Kowalski",
    followers: "28K",
    campaign: "Summer Launch",
    channel: "Discord",
    status: "Published",
    reach: "22K",
  },
  {
    creator: "Jamie Park",
    followers: "52K",
    campaign: "Podcast Health",
    channel: "Podcast",
    status: "Pending",
    reach: "-",
  },
]

export const earningsData = [
  { date: "Mar 8", deals: 180, clipping: 60 },
  { date: "Mar 10", deals: 220, clipping: 90 },
  { date: "Mar 12", deals: 160, clipping: 55 },
  { date: "Mar 14", deals: 300, clipping: 125 },
  { date: "Mar 16", deals: 250, clipping: 90 },
  { date: "Mar 18", deals: 180, clipping: 65 },
  { date: "Mar 20", deals: 420, clipping: 160 },
  { date: "Mar 22", deals: 380, clipping: 140 },
  { date: "Mar 24", deals: 290, clipping: 110 },
  { date: "Mar 26", deals: 350, clipping: 130 },
  { date: "Mar 28", deals: 460, clipping: 190 },
  { date: "Mar 30", deals: 410, clipping: 155 },
  { date: "Apr 1", deals: 500, clipping: 210 },
  { date: "Apr 3", deals: 380, clipping: 145 },
  { date: "Apr 5", deals: 520, clipping: 230 },
]

export const channelBreakdown = [
  { name: "TikTok", value: 45, color: "#6C5CE7" },
  { name: "Discord", value: 25, color: "#4ECDC4" },
  { name: "YouTube", value: 20, color: "#FF4444" },
  { name: "Other", value: 10, color: "#64748B" },
]

export const transactions = [
  { date: "Apr 5", description: "NordVPN TikTok Campaign", channel: "TikTok", type: "Earning", amount: "+$150.00", status: "Paid" },
  { date: "Apr 4", description: "Clipping Revenue - Athletic Greens", channel: "TikTok", type: "Earning", amount: "+$43.20", status: "Paid" },
  { date: "Apr 2", description: "Discord Server Sponsorship - DeFi X", channel: "Discord", type: "Earning", amount: "+$75.00", status: "Paid" },
  { date: "Apr 1", description: "Biweekly Payout", channel: "-", type: "Payout", amount: "-$1,200.00", status: "Sent" },
  { date: "Mar 30", description: "YouTube Preroll - Raid Shadow", channel: "YouTube", type: "Earning", amount: "+$600.00", status: "Paid" },
  { date: "Mar 28", description: "Newsletter Placement - Morning Brew", channel: "Newsletter", type: "Earning", amount: "+$500.00", status: "Paid" },
]

export function getCampaignById(id: number): Campaign | undefined {
  return campaigns.find((c) => c.id === id)
}

export function getCampaignsByChannel(channel: string): Campaign[] {
  return campaigns.filter((c) => c.channels.some((ch) => ch.toLowerCase().includes(channel.toLowerCase())))
}
