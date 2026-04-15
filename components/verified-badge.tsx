import { BadgeCheck } from "lucide-react"

export type VerificationInput = {
  is_verified?: boolean | null
  linked_accounts?: { is_verified?: boolean | null }[] | null
}

export function isVerified(input: VerificationInput | null | undefined): boolean {
  if (!input) return false
  if (input.is_verified) return true
  const accounts = input.linked_accounts ?? []
  return accounts.some((a) => a?.is_verified)
}

export function VerifiedBadge({
  verified,
  size = 12,
  label = "Verified",
  className = "",
}: {
  verified: boolean | null | undefined
  size?: number
  label?: string
  className?: string
}) {
  if (!verified) return null
  return (
    <span
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1 text-[#6C5CE7] ${className}`}
    >
      <BadgeCheck size={size} strokeWidth={2.25} />
    </span>
  )
}
