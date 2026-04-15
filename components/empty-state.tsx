import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center bg-[#131825] border border-dashed border-[#2A3050] rounded-2xl px-6 py-12 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#6C5CE720] flex items-center justify-center mb-3">
        <Icon size={20} className="text-[#6C5CE7]" />
      </div>
      <p className="text-sm font-semibold text-[#E2E8F0] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[#8892A8] max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#131825] border border-[#2A3050] rounded-2xl p-5 animate-pulse ${className}`}
    >
      <div className="h-4 bg-[#2A3050] rounded w-1/3 mb-3" />
      <div className="h-3 bg-[#2A3050] rounded w-2/3 mb-2" />
      <div className="h-3 bg-[#2A3050] rounded w-1/2" />
    </div>
  )
}
