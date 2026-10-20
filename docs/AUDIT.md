# CALSIO — AUDIT.md (Phase 0)

> Audited: 2026-10-20 · Verdict: **greenfield repo** — there is no existing app to revamp/rebrand.
> The master prompt assumed "an existing app repo"; in reality the repo contains only docs, agent tooling, and one large APK. Every app surface (Home → returns) is marked ~REBUILD~ and will be built new.

## 1 · Repository inventory

| Area | Item | Verdict | Reason |
|---|---|---|---|
| Git | `main` — 1 commit "new commit for apk file" | KEEP | Only history that exists; harmless |
| Git | **15.5 MB APK tracked inside a commit** | DELETE (from tracking) | Binary repo bloat; every clone/pack carries it. File stays on disk untracked |
| App code | Next.js / RN / API / components / routes | — (nothing exists) | REBUILD — greenfield build per master prompt v2 |
| App data | DB schema, migrations, `.env`, user/order data | — (nothing exists) | No old model to migrate; §9 data model is designed fresh |
| Docs | `README.md` | REBRAND | Single broken-English paragraph; replace with proper project README in Phase 6 |
| Docs | `calsio-master-prompt.md` (Native Edition v2) | KEEP | Sspec source of truth for the build |
| Docs | `PONYTAIL-AUDIT.md` | DELETE | Artifact of a previous agent session, unrelated to product |
| Tooling | `package.json` (only dep: `opencode-ponytail`) | REBUILD | Replace with real workspace root manifest |
| Tooling | `package-lock.json`, `node_modules/` (plugin only) | KEEP | Agent tooling; excluded from app tree via .gitignore |
| Tooling | `.agents/`, `skills-lock.json`, `opencode.json`, `skill.txt` | KEEP | OpenCode agent config + installed skills (dev tooling, not product) |
| Research | `uptodown-com.ril.ajio.apk` | KEEP (on disk, untracked) | Not AJIO — verified by REA: package `com.uptodown` v7.41, **0 classes matching `ajio`/`com.ril`** in 13,961 classes. Uptodown store installer only. Held for reference; real teardown blocked until a genuine `com.ril.ajio` APK is provided |

## 2 · Old data model → new data model mapping

No legacy schema exists (no `.prisma`, no SQL, no Orm anywhere in repo).

| Old | New (§9 of master prompt) | Action |
|---|---|---|
| — | Customer, Address, SizeProfile, Device, Product, Variant, Image, Review, Cart, CartItem, Order, OrderItem, Payment, Return, AiInteraction | CREATE in Phase 1/2 |
Customer-migration rule "migrate, never drop user or order data" is trivially satisfied (there is none).

## 3 · Environment variables

No `.env` exists. Keys for a clean start are inventoried in `env.template` (committed, no values):

| Group | Vars |
|---|---|
| Database | `DATABASE_URL` |
| Auth | `OTP_SECRET`, `OTP_TTL_SECONDS`, `WHATSAPP_TOKEN` (optional — falls back to console OTP in dev) |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| AI | `AI_PROVIDER` (openai/gemini/claude), `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` |
| App | `ADMIN_TOKEN`, `SESSION_SECRET` |

## 4 · Competitive teardown status

`Blocked` — the only APK present is the Uptodown installer (see §1). Path to unblock: as described in the master prompt (§2-B): pull genuine APK from your device using `adb shell pm path com.ril.ajio` + `adb pull`.

## 5 · Verdict summary

- **KEEP**: 4 items (git history, spec doc, agent tooling, APK as research stub)
- **REBUILD**: everything the product needs — mobile app, API, DB, payments, AI, MCP servers, tests
- **DELETE**: 2 items — APK from git tracking (file kept on disk), PONYTAIL-AUDIT.md
- **REBRAND**: README.md (Phase 6)
