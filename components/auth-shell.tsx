import type { ReactNode } from "react"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      {subtitle && <p className="text-sm text-[#8892A8] mb-6">{subtitle}</p>}
      {children}
      {footer && <div className="mt-6 pt-6 border-t border-[#2A3050] text-sm text-[#8892A8]">{footer}</div>}
    </div>
  )
}

export const authInput =
  "w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"

export const authButton =
  "w-full bg-[#6C5CE7] text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-[#5a4dd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

export const authLabel = "block text-xs font-semibold text-[#E2E8F0] mb-1.5 uppercase tracking-wide"
