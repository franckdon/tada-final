# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun dev          # Start dev server on port 3000

# Build
bun build        # Runs `prisma generate` then `next build`

# Lint & Format (Biome)
bun lint         # biome lint
bun format       # biome format --write .

# Type checking
bun typecheck    # tsc --noEmit

# From monorepo root
bun dev:app      # turbo dev --filter=@tada/app
```

No test suite is configured for this app.

## Architecture Overview

This is a **Next.js 15 App Router** application within a Turborepo monorepo (`apps/app`). It is the primary SaaS dashboard for "Tada", a market research platform.

### Monorepo Structure

- `apps/app` – Main SaaS dashboard (this repo)
- `apps/web` – Marketing site
- `apps/admin` – Admin panel
- `apps/contributors` – Contributor-facing app
- `packages/ui` – Shared Shadcn/HeroUI component library (`@tada/ui`)
- `packages/email` – React Email templates (`@tada/email`)
- `packages/supabase` – Supabase client helpers (`@tada/supabase`)
- `packages/kv` – KV store helpers (`@tada/kv`)
- `packages/analytics` – Analytics helpers (`@tada/analytics`)

### Routing (`src/app/`)

All user-facing routes live under `[locale]/` with two route groups:

- `(public)/` – Unauthenticated pages: login, signup, accept-invitation, forgot-password, etc.
- `(dashboard)/` – Authenticated app pages: missions, workspaces, billing, settings, analysis, invoices, market-beats, etc.
- `(setup)/` – Post-signup organization setup flow.
- `api/` – API routes (auth, webhooks/stripe, payments, uploads, AI endpoints, etc.)

### Authentication

Uses **better-auth** (not NextAuth). Configuration in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client).

- Plugins enabled: `organization`, `admin`, `emailOTP`
- Social providers: Google, Apple (sign-in only, no self-signup)
- Session is checked in `src/middleware.ts` via `/api/auth/get-session`
- `NEXT_PUBLIC_BYPASS_AUTH=1` skips auth in dev/localhost
- Helper: `getCurrentUser()` / `requireCurrentUser()` in `src/lib/current-user.ts`

### Roles & Permissions

Defined in `src/lib/permissions.ts` using better-auth access control:

- Platform roles: `superAdmin`, `operationsAdmin`, `organizationAdmin`, `userOrganization`, `contentModerator`, `financialAdmin`, `externalAuditor`, `contributor`
- Organization-level roles (via better-auth organization plugin): `admin`, `owner`, `member`

### Database

- **Prisma** with PostgreSQL (`prisma/schema.prisma`)
- `src/lib/prisma.ts` exports a singleton `prisma` client (globally cached in dev for HMR)
- Migration scripts live in `scripts/`

### Storage

- **Supabase Storage** for file uploads (bucket: `tada`)
- Categories: `workspaceLogo`, `userAvatar`, `organizationLogo`, `surveyImage`
- Server-only admin client: `getSupabaseAdmin()` in `src/lib/supabase-server.ts`
- Upload utilities: `src/lib/uploads.ts` (`uploadFileToSupabase`, `getPublicUrlForPath`, `deleteFromSupabase`)

### Server Actions

All mutations use **next-safe-action** via clients in `src/actions/safe-action.ts`:

- `actionClient` – unauthenticated
- `authActionClient` – requires session (injects `ctx.user` and `ctx.auth`); use this for all protected mutations

### Internationalization

- **next-international** with locales `en` / `fr` (default: `en`)
- Translation files: `src/locales/en.ts` and `src/locales/fr.ts`
- Client hook: `useI18n()` from `@/locales/client`
- Server helper: `getScopedI18n()` from `@/locales/server`
- Zod schemas that need i18n error messages accept `t` (the `useI18n` return) as a parameter — see `src/lib/schemas/auth.ts`

### Payments

Two providers are integrated:

- **Stripe** (`src/lib/stripe.ts`) – subscription billing (webhook at `api/webhooks/stripe`)
- **Paystack** (`src/lib/payments/paystack/`) – workspace credit purchases in XOF currency; Paystack amounts are in subunits (×100)

### Plans & Credits

- Plan tiers: `starter`, `growth`, `business`, `entreprise` — limits defined in `src/lib/plans/plan-limits.ts`
- Workspace credits system: purchase flow in `src/lib/credits/`, invoices in `src/lib/billing/`

### AI

- Uses **Vercel AI SDK** (`ai` package) with `@ai-sdk/openai`
- AI actions for mission/survey generation in `src/actions/missions/`
- AI analysis endpoints at `api/ai/` (datasets, analyses)
- Chat endpoint at `api/chat/`
- UI built with `@assistant-ui/react`

### Key Conventions

- Path alias `@/` maps to `src/`
- Server-only files import `"server-only"` at the top
- All `prisma` queries go through `src/lib/prisma.ts`
- Linting/formatting via **Biome** (not ESLint/Prettier) — config at repo root `biome.json`
- TypeScript strict mode; build ignores TS errors (`typescript.ignoreBuildErrors: true`) so always run `bun typecheck` separately
- Tailwind uses CSS variables for theming; dark mode via class strategy
- Toast notifications via **sonner**
- State management via **zustand** stores in `src/stores/`
