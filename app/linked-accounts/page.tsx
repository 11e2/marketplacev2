"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { CheckCircle, ExternalLink, Plus, TrendingUp, Users, Eye, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const linkedAccounts = [
  {
    platform: "Twitter/X",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    accentColor: "#000000",
    connected: true,
    handle: "@alexk_gaming",
    stats: [
      { label: "Followers", value: "67.2K", icon: Users },
      { label: "Avg Views/Post", value: "12.4K", icon: Eye },
      { label: "Engagement", value: "3.2%", icon: TrendingUp },
    ],
  },
  {
    platform: "Instagram",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    accentColor: "#E91E8C",
    connected: true,
    handle: "@alexk_",
    stats: [
      { label: "Followers", value: "95.1K", icon: Users },
      { label: "Avg Views/Post", value: "28.3K", icon: Eye },
      { label: "Engagement", value: "6.8%", icon: TrendingUp },
    ],
  },
  {
    platform: "YouTube",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    accentColor: "#FF0000",
    connected: true,
    handle: "@AlexKowalski",
    stats: [
      { label: "Subscribers", value: "142K", icon: Users },
      { label: "Avg Views/Video", value: "45.2K", icon: Eye },
      { label: "Engagement", value: "5.1%", icon: TrendingUp },
    ],
  },
  {
    platform: "Discord Server",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
      </svg>
    ),
    accentColor: "#5865F2",
    connected: true,
    handle: "discord.gg/alexkgaming",
    stats: [
      { label: "Members", value: "28.4K", icon: Users },
      { label: "Daily Active", value: "42%", icon: MessageCircle },
      { label: "Engagement", value: "18.2%", icon: TrendingUp },
    ],
  },
  {
    platform: "TikTok",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    accentColor: "#000000",
    connected: true,
    handle: "@alexk_gaming",
    stats: [
      { label: "Followers", value: "385K", icon: Users },
      { label: "Avg Views/Video", value: "124K", icon: Eye },
      { label: "Engagement", value: "8.4%", icon: TrendingUp },
    ],
  },
]

const unconnectedPlatforms = [
  { platform: "Twitch", icon: "🟣" },
  { platform: "Snapchat", icon: "👻" },
  { platform: "LinkedIn", icon: "💼" },
]

export default function LinkedAccountsPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Linked Accounts</h1>
          <p className="text-[#8892A8] mt-1 text-sm">
            Connect your social accounts to participate in clipping campaigns and track performance
          </p>
        </div>

        {/* Connected Accounts */}
        <div className="grid gap-4 mb-8">
          {linkedAccounts.map((account) => (
            <div
              key={account.platform}
              className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#6C5CE7]/40 transition-all"
            >
              <div className="h-1" style={{ backgroundColor: account.accentColor }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: account.accentColor }}
                    >
                      {account.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#E2E8F0]">{account.platform}</h3>
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#00B89420] text-[#00B894]">
                          <CheckCircle size={10} />
                          Connected
                        </span>
                      </div>
                      <p className="text-sm text-[#8892A8] mt-0.5">{account.handle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#8892A8] hover:text-[#E2E8F0]"
                    onClick={() => toast.info("Account settings coming soon")}
                  >
                    <ExternalLink size={14} className="mr-1.5" />
                    View Profile
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {account.stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-[#0B0F1A] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={12} className="text-[#8892A8]" />
                          <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">
                            {stat.label}
                          </p>
                        </div>
                        <p className="text-lg font-bold font-mono text-[#E2E8F0]">{stat.value}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connect More Accounts */}
        <h2 className="text-base font-bold text-[#E2E8F0] mb-4">Connect More Accounts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {unconnectedPlatforms.map((platform) => (
            <button
              key={platform.platform}
              onClick={() => toast.info(`${platform.platform} integration coming soon`)}
              className="bg-[#131825] border border-dashed border-[#2A3050] rounded-xl p-6 text-center hover:border-[#6C5CE7]/50 hover:bg-[#6C5CE710] transition-all group"
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <p className="font-medium text-[#E2E8F0] mb-1">{platform.platform}</p>
              <p className="text-xs text-[#8892A8] flex items-center justify-center gap-1 group-hover:text-[#6C5CE7]">
                <Plus size={12} />
                Connect Account
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
