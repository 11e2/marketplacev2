import { channelColors } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ChannelChipProps {
  channel: string
  size?: "sm" | "md"
  className?: string
}

export function ChannelChip({ channel, size = "sm", className }: ChannelChipProps) {
  const color = channelColors[channel] ?? "#64748B"

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      style={{
        color: color,
        borderColor: `${color}40`,
        backgroundColor: `${color}18`,
      }}
    >
      {channel}
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    "Pending":   { color: "#6C5CE7", bg: "#6C5CE718" },
    "In Review": { color: "#FF9F43", bg: "#FF9F4318" },
    "Approved":  { color: "#00B894", bg: "#00B89418" },
    "Published": { color: "#00B894", bg: "#00B89418" },
    "Rejected":  { color: "#FF6B6B", bg: "#FF6B6B18" },
    "Draft":     { color: "#64748B", bg: "#64748B18" },
    "Paid":      { color: "#00B894", bg: "#00B89418" },
    "Sent":      { color: "#4ECDC4", bg: "#4ECDC418" },
  }
  const style = map[status] ?? { color: "#64748B", bg: "#64748B18" }
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {status}
    </span>
  )
}
