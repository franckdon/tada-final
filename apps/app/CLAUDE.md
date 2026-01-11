# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build application (includes Prisma generation)
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run typecheck` - Run TypeScript type checking
- `npm run clean` - Clean generated files (.next, .turbo, node_modules)

## Architecture Overview

This is a **Next.js 14** application with **App Router** using TypeScript. The app is a survey and market research platform called "Tada" with multi-tenant organization support.

### Core Technologies
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth with email/password and OAuth (Google, Apple)
- **UI**: HeroUI (React components) + Tailwind CSS
- **Forms**: react-hook-form with Zod validation
- **Charts**: Chart.js, Recharts, and Vega-Lite
- **Email**: React Email with Nodemailer
- **Internationalization**: next-international (English/French)
- **File Structure**: Monorepo with workspace packages

### Project Structure

The application follows Next.js 14 App Router conventions with additional organization:

#### Key Directories:
- `src/app/[locale]/` - Localized routes (en/fr)
  - `(dashboard)/` - Protected dashboard routes
  - `(public)/` - Public authentication routes
  - `(setup)/` - Organization setup flow
- `src/actions/` - Server Actions organized by feature
- `src/components/` - React components organized by feature
- `src/lib/` - Utility functions and configurations
- `prisma/` - Database schema and migrations
- `better-auth_migrations/` - Auth-specific SQL migrations

#### Workspace Dependencies:
- `@tada/analytics` - Analytics utilities
- `@tada/email` - Email templates
- `@tada/kv` - Key-value storage
- `@tada/supabase` - Supabase integration
- `@tada/ui` - Shared UI components

### Database Schema

The application uses a complex multi-tenant schema with these core entities:
- **User**: Basic user information with role-based permissions
- **Organization**: Multi-tenant organizations with subscription management
- **Mission**: Core business entity representing survey projects
- **Survey/SurveyResponse**: Survey management and response collection
- **Subscription/Payment**: Stripe-based billing system
- **MissionPermission**: Fine-grained access control for missions

### Authentication & Authorization

- **Authentication**: better-auth with multiple strategies:
  - Email/password with OTP verification
  - OAuth (Google, Apple)
  - Organization invitations
- **Authorization**: Role-based access control with these roles:
  - `superAdmin` - Full system access
  - `organizationAdmin` - Organization management
  - `userOrganization` - Standard organization member
  - `contributor` - Limited mission access
  - Additional specialized roles for operations, finance, and content moderation

### Permission System

The app uses a sophisticated permission system:
- **Organization-level**: Users belong to organizations with specific roles
- **Mission-level**: Fine-grained permissions for individual missions
- **Access Control**: Custom `better-auth` plugin with granular permissions for actions like `create`, `read`, `update`, `delete`, `validate`

### Server Actions Pattern

All data mutations use Next.js Server Actions with:
- `actionClient` - Basic server action wrapper
- `authActionClient` - Authenticated actions with user context
- Zod schemas for input validation in `src/actions/*/schema.ts`
- Error handling and logging

### Key Features

1. **Survey Management**: Create, distribute, and analyze surveys
2. **Dashboard Builder**: Dynamic chart creation with multiple visualization types
3. **Multi-tenant Organizations**: Complete organization management with billing
4. **Subscription System**: Stripe integration with usage-based billing
5. **Internationalization**: French/English support
6. **Real-time Collaboration**: Velt integration for collaborative features
7. **Export Capabilities**: CSV and PowerPoint export functionality

### Development Notes

- **Database**: Run `prisma generate` before building
- **Environment**: Requires DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, STRIPE keys
- **Build Configuration**: 
  - Standalone output mode
  - Transpiles workspace packages
  - Ignores TypeScript/ESLint errors during builds (set in next.config.mjs)
- **CORS**: Configured for API routes with full access headers

### Common Patterns

1. **Server Actions**: Follow the pattern in `src/actions/` with proper authentication and validation
2. **Components**: Organize by feature, use TypeScript interfaces in `type.ts` files
3. **Database Queries**: Use Prisma client through `src/lib/prisma.ts`
4. **Authentication**: Check user session with `auth.api.getSession()` in Server Actions
5. **Permissions**: Use the role-based system defined in `src/lib/permissions.ts`

### Testing & Quality

- Uses Biome for linting and formatting
- TypeScript strict mode enabled
- Server-side validation with Zod schemas
- Error boundaries for React components