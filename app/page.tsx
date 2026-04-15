"use client"

import Link from "next/link"
import {
  Handshake,
  Video,
  Link2,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart2,
} from "lucide-react"
import { toast } from "sonner"
import { channelCategories } from "@/lib/data"

const features = [
  {
    icon: Handshake,
    title: "Direct Deals",
    description: "Brands and creators negotiate directly. No middleman, no hidden fees. Escrow-protected payments release on delivery.",
    color: "#6C5CE7",
  },
  {
    icon: Video,
    title: "Clipping Engine",
    description: "Brands provide overlay assets that get composited onto creator short-form videos automatically. Earn per-view revenue from every clip.",
    color: "#FF6B35",
  },
  {
    icon: BarChart2,
    title: "Analytics Dashboard",
    description: "Track campaign performance, audience reach, engagement rates, and revenue across every channel in one unified dashboard.",
    color: "#00B894",
  },
]

const trust = [
  { icon: Shield, label: "Escrow-Protected Payments" },
  { icon: Zap, label: "Same-Day Payouts Available" },
  { icon: TrendingUp, label: "$18.4M+ GMV Processed" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#2A3050] bg-[#0B0F1A]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
          <span className="font-bold text-sm tracking-wide">MARKETINGPLACE</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#8892A8]">
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">For Brands</Link>
          <Link href="/earnings" className="hover:text-white transition-colors">For Creators</Link>
          <Link href="/pitch-deck" className="hover:text-white transition-colors">Investors</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="text-sm text-[#8892A8] hover:text-white transition-colors">Log in</Link>
          <Link
            href="/marketplace"
            className="bg-[#6C5CE7] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#5a4dd4] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#131825_0%,_#0B0F1A_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance mb-6">
            Every channel.{" "}
            <br />
            <span className="text-[#6C5CE7]">Every format.</span>
            <br />
            One marketplace.
          </h1>

          <p className="text-lg md:text-xl text-[#8892A8] max-w-2xl mx-auto leading-relaxed mb-10">
            Brands post campaigns. Creators list services. Deals happen across TikTok, YouTube, Discord, podcasts, newsletters, Twitter/X, Twitch, and beyond -- all in one place.
          </p>

          {/* Split CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 bg-[#6C5CE7] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#5a4dd4] transition-all hover:shadow-lg hover:shadow-[#6C5CE7]/25 w-full sm:w-auto justify-center"
            >
              {"I'm a Creator"}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-[#FF6B35] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#e55a25] transition-all hover:shadow-lg hover:shadow-[#FF6B35]/25 w-full sm:w-auto justify-center"
            >
              {"I'm a Brand"}
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-[#8892A8]">
            {trust.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.label} className="flex items-center gap-1.5">
                  <Icon size={14} className="text-[#00B894]" />
                  {t.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Scroll fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0F1A] to-transparent" />
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Everything you need to grow</h2>
            <p className="text-[#8892A8] text-lg max-w-xl mx-auto">
              From first contact to final payment, Marketingplace handles the entire creator economy workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 hover:border-[#2A3050] hover:shadow-xl hover:shadow-black/20 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${f.color}20` }}
                  >
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-[#8892A8] text-sm leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Channel showcase */}
      <section className="py-24 px-6 bg-[#131825]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Every channel, every format</h2>
            <p className="text-[#8892A8] text-lg max-w-xl mx-auto">
              No other platform covers the full spectrum of creator monetization.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {channelCategories.map((cat) => (
              <div
                key={cat.name}
                className="bg-[#0B0F1A] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#2A3050] hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-1" style={{ backgroundColor: cat.accentColor }} />
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2">{cat.name}</h3>
                  <ul className="space-y-1">
                    {cat.channels.map((ch) => (
                      <li key={ch} className="text-xs text-[#8892A8]">{ch}</li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-[#2A3050]">
                    <span className="text-xs font-mono" style={{ color: cat.accentColor }}>{cat.dealVolume} GMV</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GMV counter */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#8892A8] text-sm uppercase tracking-widest font-semibold mb-6">Marketplace Activity</p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "$18.4M+", label: "Total GMV Processed" },
              { value: "42,000+", label: "Creator Accounts" },
              { value: "3,800+", label: "Brand Campaigns" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold font-mono text-[#6C5CE7]">{stat.value}</p>
                <p className="text-[#8892A8] text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#131825] border-t border-[#2A3050]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to start earning?</h2>
          <p className="text-[#8892A8] text-lg mb-8">
            Join 42,000+ creators already monetizing every channel in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="bg-[#6C5CE7] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#5a4dd4] transition-colors w-full sm:w-auto"
            >
              Join as Creator
            </Link>
            <Link
              href="/dashboard"
              className="border border-[#2A3050] text-[#E2E8F0] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#1A2035] transition-colors w-full sm:w-auto"
            >
              Post a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3050] bg-[#0B0F1A] px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
                <span className="font-bold text-sm tracking-wide">MARKETINGPLACE</span>
              </div>
              <p className="text-[#8892A8] text-sm max-w-xs leading-relaxed">
                The universal marketplace for creator-brand partnerships across every digital channel.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-[#E2E8F0] mb-3">Platform</p>
                <ul className="space-y-2 text-[#8892A8]">
                  <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                  <li><Link href="/campaign-builder" className="hover:text-white">Campaigns</Link></li>
                  <li><Link href="/earnings" className="hover:text-white">Earnings</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#E2E8F0] mb-3">Company</p>
                <ul className="space-y-2 text-[#8892A8]">
                  <li><Link href="/coming-soon" className="hover:text-white">About</Link></li>
                  <li><Link href="/coming-soon" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/coming-soon" className="hover:text-white">Careers</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#E2E8F0] mb-3">Legal</p>
                <ul className="space-y-2 text-[#8892A8]">
                  <li><Link href="/coming-soon" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="/coming-soon" className="hover:text-white">Terms</Link></li>
                  <li><Link href="/coming-soon" className="hover:text-white">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2A3050] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#8892A8] text-xs">2026 Marketingplace. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] w-52"
              />
              <button
                onClick={() => toast.info("Coming soon!")}
                className="bg-[#6C5CE7] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#5a4dd4] transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
