export interface Campaign {
  id: number
  brand: string
  brandInitial: string
  brandColor: string
  verified: boolean
  rate: string
  rateType: string
  title: string
  description: string
  channels: string[]
  budget: string
  spots: number
  accentColor: string
}

export interface TrendingChannel {
  name: string
  growth: string
  color: string
}

export interface MatchScore {
  score: number
  campaign: string
  color: string
}

export interface TickerItem {
  text: string
}

export interface ChannelCategory {
  name: string
  accentColor: string
  channels: string[]
  dealVolume: string
}

export interface BrandStats {
  totalSpend: string
  activeCampaigns: number
  totalReach: string
  costPerEngagement: string
  activeCreators: number
  pendingReview: number
}

export interface SpendByChannel {
  channel: string
  spend: number
}

export interface ActiveCampaign {
  name: string
  channels: string[]
  creators?: number
  pending?: number
  status: string
}

export interface Submission {
  creator: string
  followers: string
  campaign: string
  channel: string
  status: string
  reach: string
}

export interface EarningsDataPoint {
  date: string
  deals: number
  clipping: number
}

export interface ChannelBreakdownItem {
  name: string
  value: number
  color: string
}

export interface Transaction {
  date: string
  description: string
  channel: string
  type: string
  amount: string
  status: string
}
