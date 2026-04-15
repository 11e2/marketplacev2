# Clipbid

Two-sided marketplace connecting brands with content creators for influencer marketing.

## Current State
- Phases 0-2 are implemented (foundation, auth, campaign system)
- All data uses Supabase (database, auth, storage)
- Credentials in .env.local
- Supabase MCP server is connected
- All users seeded with $100k test balance

## Key Files
- ROADMAP.md: Complete production roadmap with all phases
- lib/supabase-browser.ts: Supabase client for client components
- lib/supabase-server.ts: Supabase client for server/API routes
- lib/validation.ts: Zod schemas
- lib/errors.ts: Standardized API error responses
- app/globals.css: Design tokens and theme

## Rules
- Never use em dashes (U+2014) anywhere
- Dark theme everywhere: bg-[#0B0F1A], text-[#E2E8F0], border-[#2A3050], cards bg-[#131825], primary #6C5CE7
- Client components use lib/supabase-browser.ts only
- Server components and API routes use lib/supabase-server.ts only
- All API inputs validated with Zod
- Run pnpm build to verify after changes
