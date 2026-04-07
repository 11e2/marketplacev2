"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  Shield,
  BarChart2,
  Globe,
  Layers,
  CheckCircle,
  Video,
  Handshake,
  Building2,
  UserCircle,
  Code2,
  Palette,
  Megaphone,
  HeadphonesIcon,
  PieChart,
  Briefcase,
} from "lucide-react"

const slides = [
  { id: 1, title: "Cover", section: "intro" },
  { id: 2, title: "Problem", section: "problem" },
  { id: 3, title: "Solution", section: "solution" },
  { id: 4, title: "Market Opportunity", section: "market" },
  { id: 5, title: "Product", section: "product" },
  { id: 6, title: "Business Model", section: "business" },
  { id: 7, title: "Traction", section: "traction" },
  { id: 8, title: "Go-to-Market", section: "gtm" },
  { id: 9, title: "Competition", section: "competition" },
  { id: 10, title: "Team", section: "team" },
  { id: 11, title: "Financials", section: "financials" },
  { id: 12, title: "The Ask", section: "ask" },
]

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[#2A3050] bg-[#0B0F1A]/95 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-[#8892A8] hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
          <span className="font-bold text-sm tracking-wide">INVESTOR DECK</span>
        </div>
        <div className="text-sm text-[#8892A8]">
          {currentSlide + 1} / {slides.length}
        </div>
      </header>

      {/* Slide Navigation */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1 p-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide ? "bg-[#6C5CE7] w-6" : "bg-[#2A3050] hover:bg-[#4A5070]"
            }`}
            title={slide.title}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {/* Slide 1: Cover */}
        {currentSlide === 0 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-[#131825] border border-[#2A3050] rounded-full px-4 py-1.5 text-xs text-[#8892A8] mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00B894]" />
                Series A Investment Opportunity
              </div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="bg-[#6C5CE7] text-white text-2xl font-bold px-4 py-2 rounded-lg">MP</span>
                <span className="text-4xl font-bold tracking-wide">MARKETINGPLACE</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                The Universal<br />
                <span className="text-[#6C5CE7]">Creator Economy</span><br />
                Marketplace
              </h1>
              <p className="text-xl text-[#8892A8] max-w-2xl mx-auto mb-12">
                Connecting brands with creators across every digital channel. 
                One platform for TikTok, YouTube, Discord, podcasts, newsletters, and beyond.
              </p>
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div>
                  <p className="text-3xl font-bold text-[#6C5CE7]">$18.4M</p>
                  <p className="text-sm text-[#8892A8]">GMV Processed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#00B894]">42K+</p>
                  <p className="text-sm text-[#8892A8]">Active Creators</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#FF6B35]">3.8K+</p>
                  <p className="text-sm text-[#8892A8]">Brand Campaigns</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: Problem */}
        {currentSlide === 1 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">The Problem</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">The creator economy is fragmented and inefficient</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6 text-[#FF6B6B]">For Brands</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                      </span>
                      <div>
                        <p className="font-semibold">10+ platforms to manage</p>
                        <p className="text-sm text-[#8892A8]">Different tools for TikTok, YouTube, Discord, podcasts, newsletters</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                      </span>
                      <div>
                        <p className="font-semibold">No unified analytics</p>
                        <p className="text-sm text-[#8892A8]">Impossible to compare ROI across channels</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                      </span>
                      <div>
                        <p className="font-semibold">High agency fees</p>
                        <p className="text-sm text-[#8892A8]">20-40% margins taken by traditional influencer agencies</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6 text-[#FF9F43]">For Creators</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF9F43]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
                      </span>
                      <div>
                        <p className="font-semibold">Discovery problem</p>
                        <p className="text-sm text-[#8892A8]">Hard to find brands that match their niche and audience</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF9F43]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
                      </span>
                      <div>
                        <p className="font-semibold">Payment delays</p>
                        <p className="text-sm text-[#8892A8]">Net-60 or Net-90 payment terms are industry standard</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FF9F43]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
                      </span>
                      <div>
                        <p className="font-semibold">Limited monetization</p>
                        <p className="text-sm text-[#8892A8]">Most creators only monetize 1-2 channels</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 bg-[#1A2035] border border-[#2A3050] rounded-xl p-6 text-center">
                <p className="text-2xl font-bold text-[#FF6B6B]">$250B+</p>
                <p className="text-[#8892A8]">lost annually due to inefficiencies in creator-brand matching</p>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Solution */}
        {currentSlide === 2 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Our Solution</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">One marketplace for the entire creator economy</h2>
              <p className="text-xl text-[#8892A8] mb-12 max-w-2xl">
                Marketingplace unifies brand-creator partnerships across every digital channel with built-in payments, analytics, and workflow tools.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#6C5CE7]/20 flex items-center justify-center mb-4">
                    <Globe size={24} className="text-[#6C5CE7]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Universal Marketplace</h3>
                  <p className="text-sm text-[#8892A8]">
                    One platform for TikTok, YouTube, Discord, Twitter/X, podcasts, newsletters, Twitch, and more.
                  </p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center mb-4">
                    <Video size={24} className="text-[#FF6B35]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Clipping Engine</h3>
                  <p className="text-sm text-[#8892A8]">
                    Automated brand overlay compositing for short-form video. Creators earn CPM-based revenue per view.
                  </p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#00B894]/20 flex items-center justify-center mb-4">
                    <Shield size={24} className="text-[#00B894]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Escrow Payments</h3>
                  <p className="text-sm text-[#8892A8]">
                    Funds held in escrow and released on delivery. Same-day payouts available for creators.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#6C5CE7]/20 to-[#FF6B35]/20 border border-[#2A3050] rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">The Marketingplace Advantage</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#6C5CE7]">10x</p>
                    <p className="text-sm text-[#8892A8]">Faster campaign setup</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#00B894]">5%</p>
                    <p className="text-sm text-[#8892A8]">Platform fee (vs 20-40%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#FF6B35]">24hr</p>
                    <p className="text-sm text-[#8892A8]">Average payout time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#4ECDC4]">12+</p>
                    <p className="text-sm text-[#8892A8]">Supported channels</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 4: Market Opportunity */}
        {currentSlide === 3 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Market Opportunity</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">A massive and rapidly growing market</h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-[#8892A8] mb-2">Total Addressable Market (TAM)</h3>
                  <p className="text-5xl font-bold text-[#6C5CE7] mb-2">$480B</p>
                  <p className="text-sm text-[#8892A8]">Global digital advertising spend (2026)</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-[#8892A8] mb-2">Serviceable Addressable Market (SAM)</h3>
                  <p className="text-5xl font-bold text-[#FF6B35] mb-2">$85B</p>
                  <p className="text-sm text-[#8892A8]">Creator/influencer marketing spend (2026)</p>
                </div>
              </div>

              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-semibold text-[#8892A8] mb-2">Serviceable Obtainable Market (SOM)</h3>
                <p className="text-5xl font-bold text-[#00B894] mb-2">$4.2B</p>
                <p className="text-sm text-[#8892A8] mb-6">Multi-channel creator marketplace segment (5% of SAM)</p>
                
                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#2A3050]">
                  <div>
                    <p className="text-lg font-bold">32%</p>
                    <p className="text-xs text-[#8892A8]">YoY market growth</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">50M+</p>
                    <p className="text-xs text-[#8892A8]">Active creators globally</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">78%</p>
                    <p className="text-xs text-[#8892A8]">Brands using influencers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">5.2x</p>
                    <p className="text-xs text-[#8892A8]">Average influencer ROI</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl p-6">
                <h4 className="font-semibold mb-4">Key Market Trends</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-[#00B894]" size={20} />
                    <span className="text-sm">Short-form video dominance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-[#00B894]" size={20} />
                    <span className="text-sm">Rise of micro-influencers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-[#00B894]" size={20} />
                    <span className="text-sm">Performance-based pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 5: Product */}
        {currentSlide === 4 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Product Overview</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Two-sided marketplace with powerful tools</h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden">
                  <div className="h-2 bg-[#6C5CE7]" />
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-6">For Creators</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Campaign Marketplace</p>
                          <p className="text-sm text-[#8892A8]">Browse and apply to campaigns across all channels</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Video Studio</p>
                          <p className="text-sm text-[#8892A8]">Apply brand overlays to short-form content in-browser</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Earnings Dashboard</p>
                          <p className="text-sm text-[#8892A8]">Track revenue across all deals and channels</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Linked Accounts</p>
                          <p className="text-sm text-[#8892A8]">Connect social accounts for verified metrics</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden">
                  <div className="h-2 bg-[#FF6B35]" />
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-6">For Brands</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Campaign Builder</p>
                          <p className="text-sm text-[#8892A8]">Create campaigns with CPM, budgets, and targeting</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Creator Discovery</p>
                          <p className="text-sm text-[#8892A8]">Find creators by niche, audience, and performance</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Analytics Dashboard</p>
                          <p className="text-sm text-[#8892A8]">Unified metrics across all campaigns and channels</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Asset Management</p>
                          <p className="text-sm text-[#8892A8]">Upload brand assets for clipping campaigns</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#6C5CE7]/10 to-[#FF6B35]/10 border border-[#2A3050] rounded-xl p-6">
                <h4 className="font-semibold mb-4">Supported Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {["TikTok", "Instagram Reels", "YouTube Shorts", "YouTube", "Discord", "Twitter/X", "Podcast", "Newsletter", "Twitch", "Reddit", "Telegram", "Blog"].map((ch) => (
                    <span key={ch} className="bg-[#1A2035] border border-[#2A3050] rounded-full px-3 py-1 text-sm">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 6: Business Model */}
        {currentSlide === 5 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Business Model</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Multiple revenue streams with high margins</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Transaction Fees</h3>
                    <span className="text-2xl font-bold text-[#6C5CE7]">60%</span>
                  </div>
                  <p className="text-sm text-[#8892A8] mb-4">5% fee on all transactions processed through the platform</p>
                  <div className="bg-[#1A2035] rounded-lg p-3">
                    <p className="text-xs text-[#8892A8]">Example: $10,000 campaign = $500 revenue</p>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Clipping Revenue Share</h3>
                    <span className="text-2xl font-bold text-[#FF6B35]">25%</span>
                  </div>
                  <p className="text-sm text-[#8892A8] mb-4">10% of CPM revenue from clipping campaigns</p>
                  <div className="bg-[#1A2035] rounded-lg p-3">
                    <p className="text-xs text-[#8892A8]">Example: Creator earns $100 CPM = $10 revenue</p>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Brand Subscriptions</h3>
                    <span className="text-2xl font-bold text-[#00B894]">10%</span>
                  </div>
                  <p className="text-sm text-[#8892A8] mb-4">Premium features for brands: analytics, priority matching, API access</p>
                  <div className="bg-[#1A2035] rounded-lg p-3">
                    <p className="text-xs text-[#8892A8]">$299-999/month depending on tier</p>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Creator Pro</h3>
                    <span className="text-2xl font-bold text-[#4ECDC4]">5%</span>
                  </div>
                  <p className="text-sm text-[#8892A8] mb-4">Premium creator tools: instant payouts, priority visibility, analytics</p>
                  <div className="bg-[#1A2035] rounded-lg p-3">
                    <p className="text-xs text-[#8892A8]">$19.99/month subscription</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#00B894]/20 to-[#00B894]/5 border border-[#2A3050] rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Unit Economics</h3>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-3xl font-bold text-[#00B894]">$127</p>
                    <p className="text-sm text-[#8892A8]">Avg. Revenue Per User</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#6C5CE7]">$18</p>
                    <p className="text-sm text-[#8892A8]">Customer Acquisition Cost</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#FF6B35]">7.1x</p>
                    <p className="text-sm text-[#8892A8]">LTV:CAC Ratio</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#4ECDC4]">78%</p>
                    <p className="text-sm text-[#8892A8]">Gross Margin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 7: Traction */}
        {currentSlide === 6 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Traction</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Strong growth and product-market fit</h2>

              <div className="grid grid-cols-4 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#6C5CE7]">$18.4M</p>
                  <p className="text-sm text-[#8892A8]">GMV Processed</p>
                  <p className="text-xs text-[#00B894] mt-2">+340% YoY</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#FF6B35]">42,000</p>
                  <p className="text-sm text-[#8892A8]">Creator Accounts</p>
                  <p className="text-xs text-[#00B894] mt-2">+180% YoY</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#00B894]">3,800</p>
                  <p className="text-sm text-[#8892A8]">Brand Campaigns</p>
                  <p className="text-xs text-[#00B894] mt-2">+210% YoY</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#4ECDC4]">$920K</p>
                  <p className="text-sm text-[#8892A8]">ARR</p>
                  <p className="text-xs text-[#00B894] mt-2">+420% YoY</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-lg font-bold mb-6">Key Milestones</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-[#8892A8]">Q1 2025</div>
                      <div className="flex-1">
                        <p className="font-semibold">Platform Launch</p>
                        <p className="text-sm text-[#8892A8]">MVP with 3 channels</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-[#8892A8]">Q3 2025</div>
                      <div className="flex-1">
                        <p className="font-semibold">$1M GMV</p>
                        <p className="text-sm text-[#8892A8]">5,000 creators</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-[#8892A8]">Q1 2026</div>
                      <div className="flex-1">
                        <p className="font-semibold">Clipping Engine Launch</p>
                        <p className="text-sm text-[#8892A8]">Short-form video automation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-[#6C5CE7] font-bold">NOW</div>
                      <div className="flex-1">
                        <p className="font-semibold">$18.4M GMV, 42K creators</p>
                        <p className="text-sm text-[#8892A8]">12 channels supported</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                  <h3 className="text-lg font-bold mb-6">Notable Brands</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {["NordVPN", "Stake", "Shopify", "Athletic Greens", "Morning Brew", "Raid Shadow Legends"].map((brand) => (
                      <div key={brand} className="bg-[#1A2035] border border-[#2A3050] rounded-lg p-3 text-center">
                        <p className="text-sm font-semibold">{brand}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 8: Go-to-Market */}
        {currentSlide === 7 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Go-to-Market Strategy</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Land and expand across channels</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/20 flex items-center justify-center mb-4">
                    <Zap size={20} className="text-[#6C5CE7]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Phase 1: Short-Form</h3>
                  <p className="text-sm text-[#8892A8] mb-4">
                    Lead with clipping campaigns on TikTok, Reels, and Shorts. Lowest friction, highest volume.
                  </p>
                  <div className="pt-4 border-t border-[#2A3050]">
                    <p className="text-xs text-[#6C5CE7] font-semibold">CURRENT FOCUS</p>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center mb-4">
                    <Layers size={20} className="text-[#FF6B35]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Phase 2: Community</h3>
                  <p className="text-sm text-[#8892A8] mb-4">
                    Expand to Discord, Telegram, and Twitter/X. Higher engagement, repeat business.
                  </p>
                  <div className="pt-4 border-t border-[#2A3050]">
                    <p className="text-xs text-[#8892A8]">Q3 2026</p>
                  </div>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00B894]/20 flex items-center justify-center mb-4">
                    <BarChart2 size={20} className="text-[#00B894]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Phase 3: Long-Form</h3>
                  <p className="text-sm text-[#8892A8] mb-4">
                    YouTube, podcasts, newsletters. Higher deal values, enterprise brands.
                  </p>
                  <div className="pt-4 border-t border-[#2A3050]">
                    <p className="text-xs text-[#8892A8]">Q1 2027</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8">
                <h3 className="text-lg font-bold mb-6">Acquisition Channels</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-[#6C5CE7]">45%</p>
                    <p className="text-sm font-semibold">Organic / SEO</p>
                    <p className="text-xs text-[#8892A8] mt-1">Creator content, word of mouth</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#FF6B35]">25%</p>
                    <p className="text-sm font-semibold">Creator Referrals</p>
                    <p className="text-xs text-[#8892A8] mt-1">Affiliate program, 5% kickback</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#00B894]">20%</p>
                    <p className="text-sm font-semibold">Paid Acquisition</p>
                    <p className="text-xs text-[#8892A8] mt-1">Meta, TikTok, Google ads</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#4ECDC4]">10%</p>
                    <p className="text-sm font-semibold">Partnerships</p>
                    <p className="text-xs text-[#8892A8] mt-1">MCNs, agencies, platforms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 9: Competition */}
        {currentSlide === 8 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Competitive Landscape</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">The only universal marketplace</h2>

              <div className="overflow-x-auto mb-12">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A3050]">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-[#8892A8]">Feature</th>
                      <th className="text-center py-4 px-4">
                        <span className="text-[#6C5CE7] font-bold">Marketingplace</span>
                      </th>
                      <th className="text-center py-4 px-4 text-sm text-[#8892A8]">Grin</th>
                      <th className="text-center py-4 px-4 text-sm text-[#8892A8]">AspireIQ</th>
                      <th className="text-center py-4 px-4 text-sm text-[#8892A8]">CreatorIQ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-[#2A3050]">
                      <td className="py-3 px-4">Multi-channel support</td>
                      <td className="py-3 px-4 text-center"><CheckCircle className="inline text-[#00B894]" size={18} /></td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Limited</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Limited</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Limited</td>
                    </tr>
                    <tr className="border-b border-[#2A3050]">
                      <td className="py-3 px-4">Clipping/overlay engine</td>
                      <td className="py-3 px-4 text-center"><CheckCircle className="inline text-[#00B894]" size={18} /></td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                    </tr>
                    <tr className="border-b border-[#2A3050]">
                      <td className="py-3 px-4">Built-in payments/escrow</td>
                      <td className="py-3 px-4 text-center"><CheckCircle className="inline text-[#00B894]" size={18} /></td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Partial</td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                    </tr>
                    <tr className="border-b border-[#2A3050]">
                      <td className="py-3 px-4">Self-serve for creators</td>
                      <td className="py-3 px-4 text-center"><CheckCircle className="inline text-[#00B894]" size={18} /></td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                      <td className="py-3 px-4 text-center text-[#FF6B6B]">No</td>
                    </tr>
                    <tr className="border-b border-[#2A3050]">
                      <td className="py-3 px-4">Platform fee</td>
                      <td className="py-3 px-4 text-center text-[#00B894] font-bold">5%</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">$2K+/mo</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">$3K+/mo</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">$5K+/mo</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Target user</td>
                      <td className="py-3 px-4 text-center text-[#6C5CE7] font-semibold">All sizes</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Enterprise</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Mid-market</td>
                      <td className="py-3 px-4 text-center text-[#8892A8]">Enterprise</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-[#6C5CE7]/20 to-[#FF6B35]/20 border border-[#2A3050] rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">Our Competitive Moat</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#6C5CE7]">Network Effects</h4>
                    <p className="text-sm text-[#8892A8] mt-1">More creators attract more brands, and vice versa</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FF6B35]">Proprietary Tech</h4>
                    <p className="text-sm text-[#8892A8] mt-1">Clipping engine with brand asset automation</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#00B894]">Data Advantage</h4>
                    <p className="text-sm text-[#8892A8] mt-1">Cross-channel performance data for better matching</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 10: Team */}
        {currentSlide === 9 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Team</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Experienced operators and builders</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center mx-auto mb-4">
                    <UserCircle size={40} className="text-[#6C5CE7]" />
                  </div>
                  <h3 className="text-lg font-bold">CEO / Co-Founder</h3>
                  <p className="text-sm text-[#8892A8] mt-1">Former Head of Partnerships @ TikTok</p>
                  <p className="text-xs text-[#8892A8] mt-2">10+ years creator economy</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#FF6B35]/20 flex items-center justify-center mx-auto mb-4">
                    <Code2 size={40} className="text-[#FF6B35]" />
                  </div>
                  <h3 className="text-lg font-bold">CTO / Co-Founder</h3>
                  <p className="text-sm text-[#8892A8] mt-1">Former Staff Engineer @ Stripe</p>
                  <p className="text-xs text-[#8892A8] mt-2">Built payments infrastructure</p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#00B894]/20 flex items-center justify-center mx-auto mb-4">
                    <Palette size={40} className="text-[#00B894]" />
                  </div>
                  <h3 className="text-lg font-bold">CPO / Co-Founder</h3>
                  <p className="text-sm text-[#8892A8] mt-1">Former Product Lead @ Instagram</p>
                  <p className="text-xs text-[#8892A8] mt-2">Launched Reels monetization</p>
                </div>
              </div>

              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-bold mb-6">Organizational Structure</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-[#6C5CE7]/20 flex items-center justify-center mx-auto mb-3">
                      <Code2 size={20} className="text-[#6C5CE7]" />
                    </div>
                    <p className="font-semibold">Engineering</p>
                    <p className="text-2xl font-bold text-[#6C5CE7]">8</p>
                    <p className="text-xs text-[#8892A8]">Full-stack, backend, ML</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center mx-auto mb-3">
                      <Megaphone size={20} className="text-[#FF6B35]" />
                    </div>
                    <p className="font-semibold">Growth</p>
                    <p className="text-2xl font-bold text-[#FF6B35]">4</p>
                    <p className="text-xs text-[#8892A8]">Marketing, partnerships</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-[#00B894]/20 flex items-center justify-center mx-auto mb-3">
                      <HeadphonesIcon size={20} className="text-[#00B894]" />
                    </div>
                    <p className="font-semibold">Operations</p>
                    <p className="text-2xl font-bold text-[#00B894]">3</p>
                    <p className="text-xs text-[#8892A8]">Support, trust & safety</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-[#4ECDC4]/20 flex items-center justify-center mx-auto mb-3">
                      <Palette size={20} className="text-[#4ECDC4]" />
                    </div>
                    <p className="font-semibold">Design</p>
                    <p className="text-2xl font-bold text-[#4ECDC4]">2</p>
                    <p className="text-xs text-[#8892A8]">Product, brand</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl p-6">
                <h4 className="font-semibold mb-4">Key Hires with This Round</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[#131825] border border-[#2A3050] rounded-full px-4 py-1.5 text-sm">VP of Sales</span>
                  <span className="bg-[#131825] border border-[#2A3050] rounded-full px-4 py-1.5 text-sm">Head of Creator Success</span>
                  <span className="bg-[#131825] border border-[#2A3050] rounded-full px-4 py-1.5 text-sm">ML Engineer (x2)</span>
                  <span className="bg-[#131825] border border-[#2A3050] rounded-full px-4 py-1.5 text-sm">Senior Full-Stack (x3)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 11: Financials */}
        {currentSlide === 10 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">Financials</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">Path to profitability</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <p className="text-sm text-[#8892A8] mb-2">2025 (Actual)</p>
                  <p className="text-3xl font-bold text-[#8892A8]">$320K</p>
                  <p className="text-sm text-[#8892A8]">Revenue</p>
                  <div className="mt-4 pt-4 border-t border-[#2A3050]">
                    <p className="text-sm">GMV: $6.4M</p>
                    <p className="text-xs text-[#8892A8]">Take rate: 5%</p>
                  </div>
                </div>
                <div className="bg-[#131825] border border-[#6C5CE7] rounded-2xl p-6">
                  <p className="text-sm text-[#6C5CE7] mb-2">2026 (Current)</p>
                  <p className="text-3xl font-bold text-[#6C5CE7]">$920K</p>
                  <p className="text-sm text-[#8892A8]">ARR</p>
                  <div className="mt-4 pt-4 border-t border-[#2A3050]">
                    <p className="text-sm">GMV: $18.4M</p>
                    <p className="text-xs text-[#8892A8]">+188% YoY</p>
                  </div>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
                  <p className="text-sm text-[#00B894] mb-2">2027 (Projected)</p>
                  <p className="text-3xl font-bold text-[#00B894]">$4.2M</p>
                  <p className="text-sm text-[#8892A8]">ARR</p>
                  <div className="mt-4 pt-4 border-t border-[#2A3050]">
                    <p className="text-sm">GMV: $70M</p>
                    <p className="text-xs text-[#00B894]">+357% YoY</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-bold mb-6">Use of Funds</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Engineering & Product</span>
                      <span className="text-sm font-bold">50%</span>
                    </div>
                    <div className="h-2 bg-[#1A2035] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6C5CE7] rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Sales & Marketing</span>
                      <span className="text-sm font-bold">30%</span>
                    </div>
                    <div className="h-2 bg-[#1A2035] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: "30%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Operations & Support</span>
                      <span className="text-sm font-bold">15%</span>
                    </div>
                    <div className="h-2 bg-[#1A2035] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00B894] rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">G&A / Reserve</span>
                      <span className="text-sm font-bold">5%</span>
                    </div>
                    <div className="h-2 bg-[#1A2035] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4ECDC4] rounded-full" style={{ width: "5%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl p-6">
                  <h4 className="font-semibold mb-3">Key Assumptions</h4>
                  <ul className="space-y-2 text-sm text-[#8892A8]">
                    <li>- 5% platform take rate (industry low)</li>
                    <li>- 10% clipping revenue share</li>
                    <li>- 15% MoM creator growth</li>
                    <li>- 25% brand retention rate</li>
                  </ul>
                </div>
                <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl p-6">
                  <h4 className="font-semibold mb-3">Path to Profitability</h4>
                  <ul className="space-y-2 text-sm text-[#8892A8]">
                    <li>- Break-even at $8M ARR</li>
                    <li>- Expected Q4 2027</li>
                    <li>- 24-month runway with this raise</li>
                    <li>- Gross margin target: 80%+</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 12: The Ask */}
        {currentSlide === 11 && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[#6C5CE7] text-sm font-semibold uppercase tracking-widest mb-4">The Ask</p>
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Raising $8M Series A</h2>
              
              <p className="text-xl text-[#8892A8] max-w-2xl mx-auto mb-12">
                To scale the universal creator marketplace and capture the $85B influencer marketing opportunity.
              </p>

              <div className="bg-[#131825] border border-[#6C5CE7] rounded-2xl p-8 mb-12 max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-4xl font-bold text-[#6C5CE7]">$8M</p>
                    <p className="text-sm text-[#8892A8]">Raise Amount</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-[#00B894]">$40M</p>
                    <p className="text-sm text-[#8892A8]">Post-Money Valuation</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 mb-12">
                <h3 className="text-lg font-bold mb-6">What We&apos;ll Achieve</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold">100K+ Creators</p>
                      <p className="text-sm text-[#8892A8]">2.5x current base</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold">$70M GMV</p>
                      <p className="text-sm text-[#8892A8]">4x current volume</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle className="text-[#00B894] flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold">$4.2M ARR</p>
                      <p className="text-sm text-[#8892A8]">Path to profitability</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="bg-[#6C5CE7] text-white text-xl font-bold px-3 py-1.5 rounded-lg">MP</span>
                <span className="text-2xl font-bold tracking-wide">MARKETINGPLACE</span>
              </div>

              <p className="text-[#8892A8] mb-8">Every channel. Every format. One marketplace.</p>

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 bg-[#6C5CE7] text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-[#5a4dd4] transition-colors"
              >
                View Live Product
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="w-12 h-12 rounded-full bg-[#131825] border border-[#2A3050] flex items-center justify-center hover:bg-[#1A2035] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="bg-[#131825] border border-[#2A3050] rounded-full px-4 py-2 text-sm">
          {slides[currentSlide].title}
        </div>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="w-12 h-12 rounded-full bg-[#6C5CE7] flex items-center justify-center hover:bg-[#5a4dd4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
