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
| D11 | Styling engine: **Expo 58 CSS-modules + theme tokens** instead of NativeWind | create-expo-app@latest shipped the Expo 58 universal-styling template; NativeWind v4 is not validated against RN 0.88/SDK 58 — visual parity kept via tokens.ts, zero compatibility risk |
| D12 | Prisma pinned at **6.19.3** (pre-v7 line) | v7 changes client generation/config surface significantly; v6 is stable and sufficient through Phase 2; revisit if Phase 3 wants Accelerate/pg adapters |
| D13 | Mobile app identity locked: com.calsio.shop / CALSIO / calsio:// scheme; splash+adaptive bg moved to Ivory Kraft #F7F1E8 | Founder confirmation 2026-10-20 |
| D14 | Palette locked as written (Agra Modern five-color set) | Founder confirmation 2026-10-20 |
| D15 | Dev DB = Docker Postgres (compose file shipped) — container start blocked by sudo password | Founder chose Docker; startup action logged in Phase 1 handoff |

## Phase 1 — 2026-10-20

| # | Decision | Reason |
|---|---|---|
| D16 | Monorepo scaffolded: `apps/mobile` (Expo 58) + `apps/api` (Next 16.4.2 + Prisma 6.19.3 + zod 4); root npm workspaces; docker-compose for postgres 16 | Phase 1 scope: design system + app shell, both platforms |
| D17 | Fonts bundled at runtime via useFonts (Space Grotesk ×3, Inter ×4, Noto Sans Devanagari ×2) — font-family keys `SpaceGrotesk_*`, `Inter_*`, `NotoSansDevanagari_*` | §5 typography; runtime load works on all platforms incl. web preview without prebuild |
| D18 | Tab bar = NativeTabs (expo-router), Home/Search(role=search)/Cart/Account with sf+md symbol icons; web falls back to headless tabs | SDK 58 docs-verified API; no image assets needed |
| D19 | Home/Search/Cart/Account/AI routes ship as real CALSIO-copy shells (Hinglish, no lorem ipsum); data connects Phase 2 | App runnable at phase boundary with zero lorem |
| D20 | seed.ts ships 8 flagship products (en+hi copy, craft stories, 7 UK sizes, 3 placeholder images each) + verified reviews | §10 seed; placeholders flagged for replacement |

## Open questions for founder (before Phase 1 commit)

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | DB: OK with `docker compose up -d postgres` (sudo group add), or prefer hosted free-tier (Neon/Supabase) URL? | Docker compose — CONFIRMED 2026-10-20 |
| Q2 | App store identity: `com.calsio.shop` bundle id + "CALSIO" display name? | com.calsio.shop / CALSIO — CONFIRMED 2026-10-20 |
| Q3 | Brand palette locked at Agra Clay #C4552D / Ivory Kraft #F7F1E8 or tweak? | Locked as written — CONFIRMED 2026-10-20 |
| Q4 | Phase 1 handoff: run `sudo docker compose up -d postgres` once, then `sudo usermod -aG docker madhav` so future runs need no password | Point at the first principle: db up + docker group |
