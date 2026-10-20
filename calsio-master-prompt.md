# CALSIO — MASTER APP REBUILD PROMPT (NATIVE EDITION v2)

> Paste this ENTIRE prompt into Cursor (Agent/Composer mode), Claude Code, or OpenCode, opened at the root of the calsio repo.

---

## 0 · ROLE & MISSION

You are a senior product studio working as one team: mobile architect, brand designer, full-stack engineer, and QA lead.

Client: **CALSIO** — an Indian footwear brand born in Agra (India's footwear capital), stepping into direct-to-consumer shoe sales with one goal: a breakthrough, AI-first shoe-shopping **native app** that stands alone in the Indian market.

Your mission, in order:
1. **Audit** the repo (Phase 0) before changing anything. Include the **APK competitive teardown** if a real competitor APK is present (§2-B).
2. **Build the CALSIO native app** for **Android and iOS from one codebase** (React Native + Expo), with the backend/AI layer it depends on.
3. **Build the MCP integration layer** that powers all AI features.
4. **Design and implement the full test system** (unit + integration + E2E + AI evals + UAT) that proves the app is market-ready.

Hard rules:
- Never perform destructive operations (dropping tables, deleting data, removing `.env`) without asking first.
- Keep the app buildable and runnable at the end of every phase.
- The APK analysis is for **competitive intelligence only**. Never copy AJIO's (or any competitor's) code, assets, icons, screenshots, copy, or brand elements — CALSIO ships **original designs and copy** only.

---

## 1 · BRAND FACT SHEET (single source of truth)

| Field | Value |
|---|---|
| Brand name | CALSIO (uppercase in wordmarks, "Calsio" in body text) |
| Origin story | Agra, Uttar Pradesh — generations of shoemaking craft (karigari), re-engineered for India's next generation of shoe buyers |
| Category | Everyday + occasion footwear: sneakers, loafers, sandals, formal |
| Market | India. Mobile-first buyers, UPI-first payments, price band ₹999–₹4,999 |
| Voice | Bold, warm, Hinglish-friendly. Tagline: **"Agra se. Aapke kadmon tak."** |
| Positioning | AI-first shoe shopping + true Agra craft story + direct-from-factory honest pricing |
| Competitors to beat | Bata, Campus, Neeman's, Metro, Mochi, AJIO/Tata CLiQ footwear sections, generic marketplaces |

---

## 2 · PHASE 0 — AUDIT + COMPETITIVE INPUT

### A. Repo audit (mandatory first)
1. Scan the full repo. Produce `AUDIT.md`: a table per area, every item marked **KEEP / REBRAND / REBUILD / DELETE** with a one-line reason.
2. Map old data models → new (§9); migrate, never drop user/order data.
3. Preserve existing `.env` keys; list new env vars in `env.template`.
4. Log every judgment call in `DECISIONS.md`. Ask only when a decision is ambiguous **AND** destructive.
5. Present the audit table and **wait for confirmation** before Phase 1.

### B. APK competitive teardown (when a real APK is available)
> Current repo state: `uptodown-com.ril.ajio.apk` is **NOT AJIO** — verified via REA (`inspect_android_package`): package `com.uptodown` v7.41, zero `ajio`/`com.ril` classes. It is the Uptodown installer that downloads the real APK at runtime.

When a genuine `com.ril.ajio` APK (or other competitor APK you're authorized to analyze) lands in the repo:
1. Run REA: `inspect_android_package` → manifest, activities, permissions, SDK census.
2. `search_android_classes` → locate the commerce domains: auth/OTP, catalog, PLP/PDP, cart, checkout, payment, returns, loyalty, push.
3. `inspect_android_method` + `trace_android_references` → decompile the interesting flows (UPi intent handling, pincode ETA, size guidance, recommendations).
4. Write findings to `docs/competitor-insights.md`: features, flow patterns, payments stack, notification strategy — **patterns only, no proprietary code/assets reused**.
5. Fold the insight into a "CALSIO must-beat list" in `DECISIONS.md` (what to match, what to do better, what to skip).

Drop the real APK into the repo and say "run the teardown" to trigger this.

---

## 3 · TARGET STACK — NATIVE, BOTH PLATFORMS, ONE CODEBASE

### Mobile app (the product)
- **React Native + Expo SDK 54+**, TypeScript (strict), **expo-router** for navigation (file-based routes, typed links)
- **NativeWind** (Tailwind for RN) for styling so the design system §5 is portable
- **Backend:** Node (Hono or Next.js API routes) + **Prisma + PostgreSQL** — the app is a client; all AI/LLM calls happen server-side (§8)
- **OTA + builds:** EAS Build (iOS + Android profiles), EAS Update for JS-only hotfixes
- **State/data:** TanStack Query (with MMKV/SQLite persistence) + Zustand for session state; offline-first caches for Home/PLP/PDP
- **Images:** `expo-image` + backend-generated AVIF/WebP CDN variants; blurhash placeholders
- **Native niceties:** expo-notifications (order + drop alerts), expo-haptics on add-to-cart, Keychain/Keystore for tokens, expo-camera/ImagePicker for Snap & Match, expo-local-authentication (fingerprint/FaceID login)

### App store deliverables (both stores)
- `app.json`/`app.config.ts`: bundle IDs (`com.calsio.shop`), icons 1024px, splash, deep-link scheme `calsio://` + Universal Links / App Links (`https://calsio.in/...`)
- EAS submit metadata: screenshots (6.7" + Play phone), store listings in en-IN + hi, privacy policy URL
- Android: AAB for Play. iOS: IPA/TestFlight. Both from the **same commit**.

### Payments (native rules, Indian market)
- **Razorpay React Native SDK** — UPI intent (Android deep-links to GPay/PhonePe/Paytm/BHIM + fallback web), cards/netbanking on both platforms
- **iOS note:** physical goods do NOT require Apple IAP; Razorpay checkout on iOS is compliant — document this in `DECISIONS.md`
- COD toggle per product, same as before
- Server-side order creation + signature verification only; keys never ship in the app bundle

### Smart TV / low-end Android ("₹10k phone reality")
- Performance budget: cold start < 2.5s on a Redmi A2-class device; interaction latency < 100ms; hermes enabled; images lazy + resized per breakpoint

---

## 4 · APP STRUCTURE

```
apps/mobile/                     # React Native + Expo (the native app)
  app/  (tabs)/home  (tabs)/search  (tabs)/cart  (tabs)/account
  product/[slug]/                # PDP (stack)
  collections/[slug]/            # PLP
  checkout/  order/[id]/  returns/[id]/
  ai/snap-match/  ai/size-oracle/  ai/coach/
  onboarding/  otp/
  src/  components  features  hooks  store  theme  lib
apps/api/                        # Backend: REST/tRPC gateway
  routes/  products  checkout  otp  ai  webhooks/razorpay  admin
mcp-servers/                     # §8 — one package per MCP server
lib/  prisma  ai  mcp-client  utils
evals/                           # AI eval datasets + runners (§12-D)
docs/  AUDIT.md DECISIONS.md mcp.md uat.md competitor-insights.md
```

---

## 5 · CALSIO DESIGN SYSTEM — "AGRA MODERN" (native port)

- **Palette:** Agra Clay `#C4552D` (primary CTA) · Ivory Kraft `#F7F1E8` (background) · Charcoal Last `#1C1B1A` (text) · Jodhpur Blue `#274B6D` (secondary/links) · Success Green `#1F7A4D` (in-stock, paid)
- **Typography:** Space Grotesk (display) + Inter (UI/body) + Noto Sans Devanagari (Hindi) — loaded via `expo-font`, all three bundled
- **Form:** 14px card radius, pill buttons, soft warm shadows (elevation-safe on both platforms), product photography on clay/ivory tones, generous whitespace, "handcrafted meets futuristic" mood
- **Motion:** 150–250 ms ease-out via Reanimated; skeleton loaders on every async surface; no bouncy animations; press states on every touchable (opacity + subtle scale)
- **Commerce details:** ₹ with Indian digit grouping (₹2,499); COD + UPI badges on PDP; "Crafted in Agra" stamp component on every product card; 44px minimum touch targets
- Dark mode: support via system preference — Charcoal Last becomes background, Agra Clay stays CTA
- **New brand asset pipeline:** generate fresh CALSIO icons/logos/splash (clay + ivory system). No AI-scraped or competitor-derived imagery; product photos are brand-original or licensed placeholders clearly marked to be replaced before launch.

---

## 6 · CORE SHOP (flawless before AI work starts)

1. **Home (tab):** hero with latest drop, "Snap & Match" AI entry card, category rail (Sneakers / Loafers / Sandals / Formal), Agra craft story strip, review wall
2. **Search tab:** search bar with recent + trending chips; category PLPs with filters (gender, category, size, price, color), sorting, infinite scroll with sane pagination
3. **PDP:** swipeable image gallery, size selector with "AI size check ✓" badge, live stock by size, ₹ price, UPI/COD badges, pincode delivery-ETA checker, verified-purchase reviews only, 7-day return promise
4. **Cart + Checkout:** guest until payment; OTP at payment step; address form with pincode validation; UPI intent deep-link + fallback; free shipping above ₹1,499; order summary
5. **Account (tab):** order list, tracking timeline, return initiation, saved addresses, Size Profile (§7-B)
6. **Admin (minimal):** simple web admin (apps/api admin routes + basic web UI): product CRUD, image upload, stock by size, order status updates

---

## 7 · AI-FIRST BREAKTHROUGH FEATURES (build all four)

**A. Snap & Match** — upload/camera shot of any shoe or outfit → vision model finds top-5 closest CALSIO products with match %. App → `/api/ai/snap-match` → vision-capable LLM (provider env-configurable: OpenAI / Gemini / Claude) → embedding similarity vs catalog. Show confidence and "similar, not identical" honesty. Camera flow accepts gallery picks too.

**B. AI Size Oracle** — 6-question quiz (foot length slider cm, width feel, usual brand+size, fit preference) → predicts exact UK/IN size per product last with confidence %. Learns from return reasons. Displays "93% users kept this size" when data exists. Result is saved to the user's Size Profile and reused at PDP ("AI size check ✓").

**C. Hinglish Style Coach** — chat drawer; users type naturally ("bhai shaadi ke liye 3k ke andar loafers chahiye") → streaming replies with tappable product cards. LLM + MCP tools (§8). Never hallucinate products — render only tool-returned catalog items.

**D. Catalog Copilot (admin)** — auto-tags products (color, occasion, material, gender), generates PDP copy en-IN + hi, bulk alt-text.

**Rules for every AI feature:** server-side only; API keys in env only; streaming responses (SSE); graceful fallback UI when model unavailable; per-user rate limits; cost logging per call into `AiInteraction`; visible "AI suggestion" disclaimers; human-readable dev logs.

---

## 8 · MCP INTEGRATION LAYER (Model Context Protocol)

Do NOT hardcode AI prompts to the database. All AI features are tool-driven clients over custom MCP servers, running server-side in `apps/api`/`mcp-servers`.

**Create 5 MCP servers** (TypeScript, `@modelcontextprotocol/sdk`; stdio local, SSE/HTTP deployed):

1. `calsio-catalog-mcp` — `search_products(query, filters)` · `get_product(id_or_slug)` · `check_stock(sku, size)` · `price_range(category)`
2. `calsio-orders-mcp` — `create_order(draft)` · `get_order_status(order_id)` · `start_return(order_id, reason)`
3. `calsio-vision-mcp` — `match_shoe(image_b64)` → top-k matches via embeddings
4. `calsio-payments-mcp` — `create_upi_link(order)` · `verify_payment(payload)` (signature-verified; secrets never exposed to the model)
5. `calsio-content-mcp` — `write_copy(product, locale)` · `translate(text, locale)` (en-IN / hi)

Per tool: JSON in/out schemas, service-token auth, error codes, p95 latency budget ~500 ms for DB-backed tools. Style Coach / Snap & Match call tools via shared `lib/mcp-client` with tool-call tracing in dev logs. Dev-time MCPs (Postgres MCP, Maestro/Playwright MCP) allowed for testing. Document in `docs/mcp.md`.

---

## 9 · DATA MODEL (Prisma — migrate, don't drop)

`Customer`, `Address`, `SizeProfile`, `Device (push tokens, platform)`, `Product`, `Variant(sku, size, color, stock)`, `Image`, `Review(verifiedPurchase)`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Return`, `AiInteraction(type, input, output, latencyMs, cost)`.
Explicit old→new mapping lives in `AUDIT.md` migration notes.

## 10 · SEED DATA — REAL-WORLD FEEL, REAL-WORLD NUMBERS

Seed **8 flagship products** that read like real catalog rows: "Calsio StepOne Court Sneaker (Ivory)", "Calsio Regal Loafer (Tan)", "Calsio Agrabad Sandal (Raag Brown)", "Calsio Metro Formal Oxford (Onyx)"… priced ₹1,499–₹4,499, sizes UK 6–12, real material specs (full-grain leather, TPR sole, memory-foam insole), Agra-craft descriptions in en-IN + hi, 3–5 images each (royalty-free placeholders, clearly flagged for replacement), plus demo orders/reviews/carts so every surface looks alive on first run. Reality bar: someone should be able to show the seeded app to a shop owner in Agra's Hupkai Gali and get a useful reaction.

---

## 11 · NON-NEGOTIABLE QUALITY BAR

- Cold start < 2.5 s (Android mid-range), app size < 40 MB initial download, Hermes enabled
- SEO/web N/A for the native app — but the **backend API** must serve clean, documented endpoints; if a landing web app exists it keeps Next.js + schema.org Product JSON-LD + sitemap
- WCAG-equivalent accessibility: TalkBack/VoiceOver labels on every control, 44px targets, AA contrast in both themes
- Security: OTP rate-limiting, Razorpay webhook signature verification, admin RBAC, zod validation on every API route, zero secrets in app bundle, certificate-pinning config documented
- i18n-ready copy layer: en-IN default, hi scaffold across all key surfaces

## 12 · NEW TEST DESIGN — FULL QA SYSTEM (write and implement ALL of it)

Frameworks: **Jest** (unit) + **Supertest** (API integration) + **Maestro or Detox** (E2E on Android emulator + iOS simulator) + AI eval runners + flipper/error tracking in CI.

**A. Unit tests (Jest)** — cart totals & discount math, ₹ formatting, UK↔US↔EU size conversion, delivery-ETA logic, Size Oracle predictor, OTP throttle logic, MCP client tool-call tracing. ≥ 80% coverage in `lib/`.
**B. API integration** — `/api/checkout`: happy path, out-of-stock race, COD-disabled; Razorpay webhook valid/invalid signature; OTP correct/expired/lockout; **MCP contract tests**: every tool of all 5 servers vs its JSON schema (positive + negative).
**C. E2E — 8 golden journeys (Maestro/Detox, Android emulator + iOS simulator, plus a real ₹10k Android device in UAT):**
1. Discover → PDP → cart → Razorpay test payment → confirmation
2. Guest checkout end-to-end
3. Snap & Match: upload → results → PDP
4. Size Oracle: quiz → locked size on PDP
5. Style Coach: Hinglish prompt → product card → add to cart
6. OTP login → order history visible
7. Return request → status timeline
8. Admin: add product → appears on Home/PLP feed
**D. AI evals (`evals/`)** — 50-image golden set: Snap & Match top-5 accuracy ≥ 85%; Size Oracle within ±0.5 UK size on 100 synthetic foot profiles; Style Coach: 30 Hinglish prompts scored on rubric (relevant product in top-3, Hinglish tone preserved, first token < 3 s). Report as `evals/REPORT.md`.
**E. UAT (`docs/uat.md`)** — 20 manual checks a non-technical founder runs on a real ₹10k Android phone + one iPhone: install, pay via UPI test, request return, read Hindi copy, Snap & Match a real shoe, push notifications, offline Home.
**F. Commands:** `pnpm test` · `pnpm test:api` · `pnpm e2e:android` · `pnpm e2e:ios` · `pnpm test:ai` — all green before handover; GitHub Actions workflow builds both platforms on main.

## 13 · EXECUTION ORDER & WORKING RULES

Phase 0 audit (+ APK teardown if available) → Phase 1 design system + app shell (both platforms building) → Phase 2 core shop (§6) → Phase 3 AI features + MCP layer (§7–8) → Phase 4 full QA suite (§12) → Phase 5 performance/accessibility pass → Phase 6 handover (README: setup, env vars, EAS Build walkthrough, Play + App Store submission checklist, Razorpay test-key guide).

Rules: TypeScript compiles cleanly after every phase · real CALSIO brand copy everywhere, lorem ipsum forbidden · small commits with clear messages · unclear product decisions → pick the best market-first option and record in `DECISIONS.md` · never commit secrets · app builds and runs on both platforms at every phase boundary.

## 14 · DEFINITION OF DONE

- `AUDIT.md`, `DECISIONS.md`, `docs/mcp.md`, `docs/uat.md`, `docs/competitor-insights.md` (if APK provided), `evals/REPORT.md` complete
- All 6 shop surfaces + 4 AI features live in the native app, running on Android emulator and iOS simulator
- EAS builds produce installable AAB + IPA from the same commit
- Entire test suite green: unit + API integration + E2E + AI eval thresholds met
- Cold start < 2.5 s · zero traces of any competitor branding · seed data demonstrates a full order journey

**Begin Phase 0 now. Present the audit table (and teardown status) to me before starting Phase 1.**
