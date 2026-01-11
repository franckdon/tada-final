# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **web** app of the Tada monorepo - a marketing website built with Next.js 14. The web app is part of a larger SaaS platform for real-time market research and data collection. It serves as the public-facing website with marketing content, solutions pages, pricing, and lead generation forms.

## Commands

**Development:**
- `bun dev` - Start development server on port 3001
- `bun build` - Build the production application  
- `bun start` - Start production server
- `bun clean` - Clean build artifacts and dependencies

**Code Quality:**
- `bun lint` - Run Biome linter
- `bun format` - Format code with Biome
- `bun typecheck` - Run TypeScript type checking

**From Monorepo Root:**
- `bun dev:web` - Start only the web app
- `bun build` - Build all apps using Turbo
- `bun lint` - Lint all apps
- `bun typecheck` - Type check all apps

## Architecture & Key Concepts

### Internationalization (i18n)
- Uses `next-international` for multilingual support (English/French)
- Locale-based routing: `app/[locale]/` structure
- Translation files: `src/locales/en.ts` and `src/locales/fr.ts`
- Middleware handles locale detection and URL rewriting

### File-Based Routing Structure
```
app/[locale]/
├── page.tsx                    # Homepage
├── solutions/
│   ├── page.tsx               # Solutions listing
│   └── [id]/page.tsx          # Individual solution pages
├── pricing/page.tsx           # Pricing page
├── about-us/page.tsx          # Company page
├── schedule-a-demo/page.tsx   # Demo booking
└── how-work-it/page.tsx       # How it works
```

### Component Architecture
- **UI Components**: Reusable components in `src/components/ui/` (shadcn/ui based)
- **Business Components**: Feature-specific components in `src/components/`
- **Solution System**: Dynamic solution pages using `src/components/solutions/data.ts`
- **Layout Components**: Header, Footer, providers for consistent layout

### Solutions System
- Solutions defined in `src/components/solutions/data.ts` with structured data
- Dynamic routing via `solutions/[id]/page.tsx`
- Each solution has hero, features, use cases, and CTA sections
- Components: `dynamic-hero.tsx`, `dynamic-features.tsx`, `dynamic-use-cases.tsx`, `dynamic-cta.tsx`

### Styling & Design System
- **TailwindCSS** with shared config from `@tada/ui` package
- **Custom CSS**: Global styles in `src/app/[locale]/globals.css`
- **Font**: Uses Geist font family via `geist` package
- **Theme Support**: `next-themes` integration for theme switching

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + Shadcn/ui components  
- **Forms**: React Hook Form + Zod validation via `next-safe-action`
- **Internationalization**: next-international
- **Package Manager**: Bun (workspace: `@tada/web`)
- **Monorepo**: Turborepo with shared packages (`@tada/ui`, `@tada/analytics`)

### Environment & Configuration
- **Development Port**: 3001 (to avoid conflicts with other apps)
- **Build Tool**: Next.js build system with Turbo caching
- **Linting**: Biome (replaces ESLint/Prettier)
- **TypeScript**: Strict mode enabled, shared config from `@tada/typescript`

### Shared Dependencies
- `@tada/ui`: Shared UI component library
- `@tada/analytics`: Analytics integration
- Uses workspace protocol for internal packages

## Development Notes

- **Monorepo Context**: This app is part of a larger Turborepo monorepo with shared tooling
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **Image Optimization**: Next.js Image component with remote patterns for external domains
- **Error Monitoring**: Sentry integration configured
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Style**: Biome handles both linting and formatting consistently across the monorepo