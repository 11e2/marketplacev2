import Link from "next/link"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex flex-col">
      <header className="px-8 py-4 border-b border-[#2A3050]">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
          <span className="font-bold text-sm tracking-wide">MARKETINGPLACE</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
