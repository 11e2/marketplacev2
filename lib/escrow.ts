import "server-only"
import { createServiceSupabase } from "./supabase-server"
import { ApiError } from "./errors"

export const PLATFORM_FEE_BRAND = 0.04
export const PLATFORM_FEE_CREATOR = 0.04

async function rpc(fn: string, args: Record<string, unknown>) {
  const svc = createServiceSupabase()
  const { error } = await svc.rpc(fn, args)
  if (error) {
    if (error.message?.includes("insufficient_balance")) {
      throw new ApiError("BAD_REQUEST", "Insufficient balance")
    }
    if (error.message?.includes("invalid_amount")) {
      throw new ApiError("BAD_REQUEST", "Invalid amount")
    }
    if (error.message?.includes("no_escrow")) {
      throw new ApiError("BAD_REQUEST", "No escrow held on deal")
    }
    throw new ApiError("INTERNAL", error.message)
  }
}

export function escrowHold(brandUserId: string, dealId: string, amount: number) {
  return rpc("escrow_hold", { p_brand_user_id: brandUserId, p_deal_id: dealId, p_amount: amount })
}

export function escrowRelease(dealId: string) {
  return rpc("escrow_release", { p_deal_id: dealId })
}

export function escrowRefund(dealId: string) {
  return rpc("escrow_refund", { p_deal_id: dealId })
}

export function ledgerDeposit(userId: string, amount: number, reference?: string) {
  return rpc("ledger_deposit", { p_user_id: userId, p_amount: amount, p_reference: reference ?? null })
}

export function ledgerWithdraw(userId: string, amount: number, reference?: string) {
  return rpc("ledger_withdraw", { p_user_id: userId, p_amount: amount, p_reference: reference ?? null })
}
