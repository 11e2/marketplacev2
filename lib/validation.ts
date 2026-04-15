import { z } from "zod"

export const uuid = z.string().uuid()

export const userRole = z.enum(["CREATOR", "BRAND", "ADMIN"])
export const platformEnum = z.enum([
  "TIKTOK",
  "INSTAGRAM",
  "YOUTUBE",
  "TWITTER",
  "DISCORD",
  "TWITCH",
  "PODCAST",
])
export const campaignType = z.enum(["CLIPPING", "STANDARD"])
export const campaignStatus = z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"])
export const rateType = z.enum(["CPM", "FLAT", "DAILY"])
export const dealStatus = z.enum([
  "NEGOTIATING",
  "ACCEPTED",
  "IN_PROGRESS",
  "DELIVERED",
  "APPROVED",
  "DISPUTED",
  "COMPLETED",
  "CANCELLED",
])

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createCampaignSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  type: campaignType,
  channels: z.array(z.string().min(1)).min(1),
  totalBudget: z.number().positive(),
  cpm: z.number().positive().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  minViews: z.number().int().nonnegative().optional(),
  spots: z.number().int().positive().optional(),
  brandAssetUrl: z.string().url().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
})

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: campaignStatus.optional(),
})

export const applyToCampaignSchema = z.object({
  message: z.string().max(1000).optional(),
})

export const proposalSchema = z.object({
  proposedRate: z.number().positive(),
  deliverables: z.array(z.object({ name: z.string(), detail: z.string().optional() })).default([]),
  timeline: z.string().max(500).optional(),
  message: z.string().max(2000).optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  proposalId: uuid.optional(),
})

export const submissionSchema = z.object({
  videoUrl: z.string().url().optional(),
  processedVideoUrl: z.string().url().optional(),
  contentUrl: z.string().url().optional(),
  platformPostUrl: z.string().url().optional(),
})

export const serviceSchema = z.object({
  platform: platformEnum,
  offerings: z.array(z.object({ name: z.string().min(1), price: z.number().nonnegative() })).min(1),
  isActive: z.boolean().default(true),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  niches: z.array(z.string()).optional(),
  companyName: z.string().min(1).max(200).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().max(100).optional(),
})

export const depositSchema = z.object({
  amount: z.number().positive().max(1_000_000),
})

export const withdrawSchema = z.object({
  amount: z.number().positive(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
})
