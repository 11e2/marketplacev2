# Welcome to Marketingplace

## How We Use Claude

Based on usage over the last 30 days (7 sessions):

Work Type Breakdown:
  Build Feature     ██████████████░░░░░░  70%
  Debug Fix         ████░░░░░░░░░░░░░░░░  20%
  Improve Quality   ██░░░░░░░░░░░░░░░░░░  10%

Top Skills & Commands:
  /agents      ████████████████████  6x/month
  /web-setup   ███░░░░░░░░░░░░░░░░░  1x/month
  /mcp         ███░░░░░░░░░░░░░░░░░  1x/month
  /config      ███░░░░░░░░░░░░░░░░░  1x/month
  /plugin      ███░░░░░░░░░░░░░░░░░  1x/month

Top MCP Servers:
  claude_ai_Supabase   ████████████████████  14 calls

## Your Setup Checklist

### Codebases
- [ ] v0-marketingplace-application-design — https://github.com/11e2/v0-marketingplace-application-design

### MCP Servers to Activate
- [ ] Supabase MCP — manages the project's Postgres schema, RLS policies, storage buckets, and SQL migrations. Claude drives it directly for every DB change. Install from the Supabase MCP docs and authenticate against the project org so you can reach the same project the team is using.

### Skills to Know About
- `/agents` — spawn a coordinated team of sub-agents for larger multi-step work (the team lead plus specialized members sharing a task list). Used most often here when a roadmap phase spans backend + frontend changes.
- `/mcp` — manage MCP server connections; use it the first time you wire up the Supabase MCP.
- `/config` — tweak Claude Code settings (model, theme, permissions).
- `/plugin` — manage installed plugins.
- `/web-setup` — one-time project bootstrap helper for web apps.

## Team Tips

_TODO_

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
