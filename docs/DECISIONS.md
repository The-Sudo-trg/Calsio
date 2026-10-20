# CALSIO — DECISIONS.md

Append-only log of product/engineering decisions. One line each. Newest at bottom of each section. Reason records the constraint that forced the call.

## Phase 0 — 2026-10-20

| # | Decision | Reason |
|---|---|---|
| D01 | Repo confirmed **greenfield**: no existing app to rebrand; build CALSIO native app fresh per master prompt v2 | Audit found zero app code, schema, or .env — README's one paragraph and an APK were the only content |
| D02 | APK `uptodown-com.ril.ajio.apk` untracked from git (file kept on disk + .gitignore entry) | 15.5 MB binary in every future clone; REA already proved it contains no AJIO code (package com.uptodown v7.41) |
| D03 | `PONYTAIL-AUDIT.md` deleted | Previous agent session artifact, no product value |
| D04 | Monorepo via **npm workspaces** (not pnpm) | pnpm not installed; npm 12 is; zero-friction for the founder |
| D05 | Backend = **apps/api: Next.js** (App Router, API routes + minimal web admin in one package) | Admin (§6-6) is broken-English-free web UI; one package deploys to Vercel; matches original prompt §3 conventions |
| D06 | Dev DB = **PostgreSQL via docker-compose** (`docker compose up -d postgres`); user adds docker group if needed (sudo required) | Spec mandates Postgres; docker binary present; compose file shipped in Phase 1 |
| D07 | OTP delivery: WhatsApp-first provider abstracted behind `lib/otp`; **console-log OTP in dev** until real keys exist | Runnable without paid account from day one |
| D08 | Payments: Razorpay test keys placeholder; server-side order creation + signature verify only; iOS note logged (physical goods → no Apple IAP required) | Native payment rules; no secrets in app bundle |
| D09 | AI provider is env-switchable (openai/gemini/claude), default **openai** | Master prompt §7-A requirement |
| D10 | Brand asset pipeline: fresh CALSIO icon/splash generated in-house (Agra Modern palette); placeholder product images clearly flagged for replace | No competitor/IP-derived assets; §5 boundary |

## Open questions for founder (before Phase 1 commit)

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | DB: OK with `docker compose up -d postgres` (sudo group add), or prefer hosted free-tier (Neon/Supabase) URL? | Docker compose |
| Q2 | App store identity: `com.calsio.shop` bundle id + "CALSIO" display name? | com.calsio.shop / CALSIO |
| Q3 | Brand palette locked at Agra Clay #C4552D / Ivory Kraft #F7F1E8 or tweak? | Locked as written |
