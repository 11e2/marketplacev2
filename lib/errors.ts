import { NextResponse } from "next/server"
import { ZodError } from "zod"

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "NOT_IMPLEMENTED"

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  NOT_IMPLEMENTED: 501,
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export function errorResponse(code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status: STATUS[code] })
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.code, err.message, err.details)
  }
  if (err instanceof ZodError) {
    return errorResponse("BAD_REQUEST", "Validation failed", err.flatten())
  }
  console.error("[api] unexpected error:", err)
  return errorResponse("INTERNAL", "An unexpected error occurred")
}

export function notImplemented(feature: string) {
  return errorResponse("NOT_IMPLEMENTED", `${feature} is not implemented yet`)
}
