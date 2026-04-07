"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, Check, CheckCheck, Clock, ChevronDown } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip, StatusPill } from "@/components/channel-chip"

const conversations = [
  {
    id: 1,
    name: "NordVPN",
    initial: "N",
    color: "#6C5CE7",
    preview: "Thanks for the counter-offer! We can meet at $200.",
    time: "2m ago",
    unread: 2,
    type: "Negotiation",
  },
  {
    id: 2,
    name: "Shopify",
    initial: "S",
    color: "#00B894",
    preview: "The thread looks great. Approved for publishing.",
    time: "1h ago",
    unread: 0,
    type: "Campaign",
  },
  {
    id: 3,
    name: "Athletic Greens",
    initial: "A",
    color: "#FF9F43",
    preview: "Can you include a 10% discount code?",
    time: "3h ago",
    unread: 1,
    type: "Negotiation",
  },
  {
    id: 4,
    name: "Morning Brew",
    initial: "M",
    color: "#4ECDC4",
    preview: "Newsletter slot confirmed for next Tuesday.",
    time: "Yesterday",
    unread: 0,
    type: "Campaign",
  },
]

const messages = [
  {
    id: 1,
    from: "brand",
    text: "Hi Alex! We love your content. We'd like to offer you a TikTok product demo for our Summer Campaign.",
    time: "2:14 PM",
    read: true,
  },
  {
    id: 2,
    from: "me",
    text: "Thanks for reaching out! I'd be happy to do a product demo. Could you share more details about the creative brief?",
    time: "2:31 PM",
    read: true,
  },
  {
    id: 3,
    from: "brand",
    text: "Of course! We're looking for a 30-60s natural integration. We're offering $150 for the post.",
    time: "2:35 PM",
    read: true,
  },
  {
    id: 4,
    from: "me",
    text: "That sounds great. Given my 8.4% engagement rate and 385K followers, I typically charge $200 for a 30-60s product demo. Would that work for your budget?",
    time: "2:48 PM",
    read: true,
  },
  {
    id: 5,
    from: "brand",
    isProposal: true,
    time: "3:02 PM",
    read: false,
  },
]

const negotiationHistory = [
  { label: "Initial Offer", amount: "$150", by: "NordVPN", time: "2:35 PM", color: "#8892A8" },
  { label: "Counter Offer", amount: "$200", by: "You", time: "2:48 PM", color: "#FF9F43" },
  { label: "Accepted", amount: "$200", by: "NordVPN", time: "3:02 PM", color: "#00B894" },
]

export default function MessagingPage() {
  const [activeConvo, setActiveConvo] = useState(1)
  const [activeTab, setActiveTab] = useState("All")
  const [message, setMessage] = useState("")

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex overflow-hidden" style={{ height: "100vh" }}>
      <SidebarNav mode="creator" />

      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Conversations list */}
        <div className="w-72 shrink-0 border-r border-[#2A3050] bg-[#131825] flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-[#2A3050]">
            <h1 className="text-base font-bold text-[#E2E8F0] mb-3">Messages</h1>
            <div className="flex gap-1">
              {["All", "Campaigns", "Negotiations", "General"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={
                    activeTab === tab
                      ? { backgroundColor: "#6C5CE7", color: "#fff" }
                      : { color: "#8892A8" }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                className="w-full px-4 py-3 flex items-start gap-3 border-b border-[#2A3050] text-left transition-colors"
                style={
                  activeConvo === c.id
                    ? { backgroundColor: "rgba(108,92,231,0.10)" }
                    : { backgroundColor: "transparent" }
                }
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-[#E2E8F0]">{c.name}</span>
                    <span className="text-[10px] text-[#8892A8]">{c.time}</span>
                  </div>
                  <p className="text-xs text-[#8892A8] truncate">{c.preview}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#6C5CE7] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {c.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#0B0F1A]">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2A3050] bg-[#131825]">
            <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">
              N
            </div>
            <div>
              <p className="text-sm font-bold text-[#E2E8F0]">NordVPN</p>
              <p className="text-[10px] text-[#00B894]">Online now</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ChannelChip channel="TikTok" />
              <span className="text-xs text-[#8892A8]">Summer Campaign</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((msg) => {
              if (msg.isProposal) {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-sm w-full">
                      <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden shadow-lg">
                        <div className="px-4 py-3 border-b border-[#2A3050] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                          <span className="text-xs font-bold text-[#E2E8F0]">Negotiation Proposal</span>
                        </div>
                        <div className="p-4 space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8892A8]">Proposed Rate</span>
                            <span className="font-bold font-mono text-[#00B894]">$200</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8892A8]">Deliverables</span>
                            <span className="font-medium text-[#E2E8F0] text-right ml-4">1 TikTok product demo, 30-60s</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8892A8]">Timeline</span>
                            <span className="font-medium text-[#E2E8F0]">Deliver within 5 days</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8892A8]">Escrow</span>
                            <span className="font-bold font-mono text-[#00B894]">$200 held</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 py-2 rounded-lg bg-[#00B894] text-white text-xs font-bold hover:bg-[#009b7e] transition-colors">
                              Accept
                            </button>
                            <button className="flex-1 py-2 rounded-lg border border-[#FF9F43] text-[#FF9F43] text-xs font-bold hover:bg-[#FF9F4315] transition-colors">
                              Counter
                            </button>
                            <button className="flex-1 py-2 rounded-lg border border-[#FF6B6B] text-[#FF6B6B] text-xs font-bold hover:bg-[#FF6B6B15] transition-colors">
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <span className="text-[10px] text-[#8892A8]">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                )
              }

              const isMe = msg.from === "me"
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs">
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={
                        isMe
                          ? { backgroundColor: "#6C5CE7", color: "#fff" }
                          : { backgroundColor: "#131825", color: "#E2E8F0", border: "1px solid #2A3050" }
                      }
                    >
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-[#8892A8]">{msg.time}</span>
                      {isMe && (
                        msg.read
                          ? <CheckCheck size={12} className="text-[#6C5CE7]" />
                          : <Check size={12} className="text-[#8892A8]" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-[#2A3050] bg-[#131825]">
            <div className="flex items-center gap-3">
              <button className="text-[#8892A8] hover:text-[#E2E8F0] transition-colors">
                <Paperclip size={18} />
              </button>
              <button className="text-[#8892A8] hover:text-[#E2E8F0] transition-colors">
                <Smile size={18} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message NordVPN... (type /templates for quick replies)"
                  className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
                />
              </div>
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: message ? "#6C5CE7" : "#1A2035" }}
              >
                <Send size={16} style={{ color: message ? "#fff" : "#8892A8" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Context panel */}
        <div className="hidden xl:flex w-72 shrink-0 flex-col border-l border-[#2A3050] bg-[#131825] overflow-y-auto">
          <div className="px-4 py-4 border-b border-[#2A3050]">
            <h2 className="text-xs font-bold text-[#8892A8] uppercase tracking-widest mb-3">Deal Context</h2>

            {/* Campaign info */}
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-xl p-3 mb-3">
              <p className="text-xs font-bold text-[#E2E8F0] mb-1">TikTok Product Demo</p>
              <p className="text-[11px] text-[#8892A8]">NordVPN · Summer Campaign</p>
              <div className="flex items-center gap-2 mt-2">
                <ChannelChip channel="TikTok" />
                <StatusPill status="Pending" />
              </div>
            </div>

            {/* Creator mini-card */}
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">
                  AK
                </div>
                <div>
                  <p className="text-xs font-bold text-[#E2E8F0]">Alex Kowalski</p>
                  <p className="text-[10px] text-[#8892A8]">385K TikTok · 8.4% eng.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Negotiation history */}
          <div className="px-4 py-4 border-b border-[#2A3050]">
            <h2 className="text-xs font-bold text-[#8892A8] uppercase tracking-widest mb-3">Negotiation History</h2>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#2A3050]" />
              <div className="space-y-4">
                {negotiationHistory.map((h, i) => (
                  <div key={i} className="relative">
                    <div
                      className="absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2"
                      style={{ borderColor: h.color, backgroundColor: "#131825" }}
                    />
                    <p className="text-[11px] font-semibold text-[#E2E8F0]">{h.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-[#8892A8]">{h.by} · {h.time}</p>
                      <span className="text-[11px] font-bold font-mono" style={{ color: h.color }}>{h.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Escrow */}
          <div className="px-4 py-4">
            <h2 className="text-xs font-bold text-[#8892A8] uppercase tracking-widest mb-3">Escrow</h2>
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8892A8]">Amount Held</span>
                <span className="text-sm font-bold font-mono text-[#00B894]">$200.00</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#00B894]">
                <Clock size={10} />
                Releases upon delivery approval
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
