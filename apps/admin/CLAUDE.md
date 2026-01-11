# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `bun dev` (runs on port 3002)
- **Build**: `bun run build` (includes Prisma generation)
- **Lint**: `bun run lint` (uses Biome)
- **Format**: `bun run format` (uses Biome with write flag)
- **Type checking**: `bun run typecheck`
- **Clean**: `bun run clean` (removes .next, .turbo, node_modules)

## Architecture Overview

This is the admin panel for the Tada application, built as a Next.js 14 app with App Router. It's part of a monorepo workspace structure using workspace dependencies.

### Key Technologies
- **Framework**: Next.js 14 with App Router and TypeScript
- **Authentication**: Better Auth with email/password and social providers (Google, Apple)
- **Database**: PostgreSQL with Prisma ORM
- **Authorization**: Role-based access control with hierarchical permissions
- **UI**: Tailwind CSS with HeroUI components (@heroui/react)
- **Forms**: Zod validation with Next Safe Action for server actions
- **Internationalization**: next-international with English/French support
- **Package Manager**: Bun

### Project Structure

```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── (dashboard)/    # Protected dashboard routes
│   │   └── (public)/       # Public auth routes (login, forgot-password)
│   └── api/                # API routes (auth, exports)
├── actions/                # Server actions with Zod schemas
├── components/             # React components organized by feature
├── lib/                    # Utilities and configuration
├── locales/                # i18n configuration
└── hooks/                  # Custom React hooks
```

### Authentication & Authorization

- Uses Better Auth with PostgreSQL adapter
- Implements role-based permissions with Access Control (AC)
- Roles: superAdmin, operationsAdmin, contentModerator, financialAdmin, externalAuditor, organizationAdmin, userOrganization, contributor
- Organization-based permissions with admin/owner/member roles
- Protected routes via middleware with session validation
- Email templates for verification, password reset, and organization invitations

### Database Integration

- Prisma ORM for database operations
- Must run `prisma generate` before building
- Database migrations handled via Prisma
- Connection pooling with pg library

### Server Actions Pattern

All data mutations use Next Safe Action with:
- Input validation via Zod schemas
- Authenticated action client (`authActionClient`)
- Error handling and logging
- Metadata support for action naming

### Workspace Dependencies

This app depends on internal workspace packages:
- `@tada/ui` - Shared UI components and Tailwind config
- `@tada/supabase` - Database utilities
- `@tada/analytics` - Analytics functionality
- `@tada/email` - Email templates
- `@tada/kv` - Key-value storage

### Key Features

- **Dashboard**: Mission management, analytics, and insights
- **Organizations**: Multi-tenant organization management
- **Contributors**: User management and profile handling
- **Templates**: Survey template creation and management
- **Quality Control**: Automated quality analysis system with AI (LLM-powered)
- **Boards & Charts**: Data visualization with Chart.js and Recharts
- **Survey System**: Survey creation and response management
- **Export Functions**: CSV export capabilities

### Configuration Notes

- TypeScript config extends `@tada/typescript/nextjs.json`
- Tailwind config uses shared preset from `@tada/ui`
- Next.js config transpiles workspace packages
- Build errors and ESLint ignored during builds (needs attention)
- CORS headers configured for all API routes
- Standalone output for containerization

### AI/LLM Integration

- Uses OpenAI SDK for quality control analysis
- Assistant UI integration with @assistant-ui/react-ai-sdk
- Automated survey quality scoring and issue detection
- Batch analysis capabilities for mission responses

### Testing & Quality

- Quality control setup documented in QUALITY_CONTROL_SETUP.md
- Uses Biome for linting and formatting
- TypeScript strict mode enabled
- No test runner currently configured (should be added)