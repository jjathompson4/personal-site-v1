# CLAUDE.md

## Project Overview

Personal portfolio and content stream site for Jeff Thompson. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Supabase (PostgreSQL). Deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 with App Router (`app/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables, OKLCH colors, and custom design tokens in `app/globals.css`
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives in `components/ui/`
- **Backend/DB**: Supabase (PostgreSQL + Storage + Auth)
- **State Management**: Zustand (see `components/providers/`)
- **Rich Text**: TipTap editor for admin content editing
- **Icons**: Lucide React
- **Fonts**: Space Grotesk (sans) + JetBrains Mono (mono) via `next/font/google`
- **Analytics**: Vercel Analytics + custom analytics via `/api/analytics/track`

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint (flat config, next/core-web-vitals + next/typescript)
npm run test       # Run tests once (vitest run)
npm run test:watch # Run tests in watch mode (vitest)
```

## Project Structure

```
app/                      # Next.js App Router pages and layouts
  layout.tsx              # Root layout (providers, fonts, analytics)
  page.tsx                # Homepage
  globals.css             # Tailwind config, CSS variables, design tokens
  admin/                  # Admin dashboard (protected routes)
    modules/              # Module management
    posts/                # Post CRUD
    articles/             # Article CRUD
    projects/             # Project CRUD
    media/                # Media upload/management
    resume/               # Resume entries
    moods/                # Atmosphere/mood presets
    about/                # About page editor
    analytics/            # Analytics dashboard
    drafts/               # Draft management
  api/                    # API route handlers (REST-style)
    auth/                 # Auth endpoints (login, logout, me)
    modules/              # Module CRUD
    posts/                # Post CRUD + reorder
    articles/             # Article CRUD + reorder
    projects/             # Project CRUD + reorder
    galleries/            # Gallery + gallery media
    media/                # Media upload, batch, link, reorder
    resume/               # Resume CRUD + reorder
    analytics/            # Analytics tracking + realtime
    site-content/         # Site content settings
    tags/                 # Tag management
  (auth)/                 # Auth route group
  posts/                  # Public posts pages
  articles/[slug]/        # Public article detail
  photography/[slug]/     # Public photography detail
  projects/[slug]/        # Public project detail
  resume/                 # Public resume page
  atmosphere-demo/        # Atmosphere system demo

components/               # React components
  admin/                  # Admin-specific components
    analytics/            # Analytics charts and tables
    sortable/             # Drag-and-drop sortable components (@dnd-kit)
  atmosphere/             # Atmosphere/mood background system
  layout/                 # Layout components (FloatingNav, etc.)
  modules/                # Module display components
  posts/                  # Post display components
  providers/              # Context providers (Theme, Admin, Atmosphere)
  resume/                 # Resume display components
  shared/                 # Shared/reusable components
  ui/                     # shadcn/ui base components

lib/                      # Utilities and business logic
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server-side Supabase client
    middleware.ts          # Supabase auth session refresh
    queries/              # Data access layer (modules, posts, articles, etc.)
  auth/                   # Auth utilities and helpers
  analytics/              # Analytics query helpers
  utils.ts                # cn() helper, slugify()
  stream.ts               # Content stream grouping logic
  markdown.ts             # Markdown processing
  markdown-components.tsx # Custom markdown renderers
  constants.ts            # App constants
  getMoodPresets.ts       # Mood/atmosphere preset loading
  getMoodForTime.ts       # Time-based mood selection
  video.ts                # Video embed utilities

types/                    # TypeScript type definitions
  module.ts, post.ts, article.ts, project.ts, gallery.ts,
  media.ts, resume.ts, tag.ts

supabase/
  migrations/             # SQL migration files (chronological)

middleware.ts             # Next.js middleware (Supabase session refresh)
```

## Key Patterns and Conventions

### Path Aliases
All imports use `@/` prefix mapped to project root (e.g., `@/components/ui/button`, `@/lib/utils`).

### Component Organization
- **`components/ui/`**: shadcn/ui primitives only. Do not put custom components here.
- **`components/admin/`**: Components used exclusively in admin pages.
- **`components/[feature]/`**: Feature-specific components grouped by domain.
- **`components/shared/`**: Reusable components used across multiple features.
- **`components/providers/`**: React context providers wrapping the app.

### Styling
- Use Tailwind utility classes. Custom design tokens are defined as CSS variables in `app/globals.css`.
- Use `cn()` from `@/lib/utils` for conditional class merging (clsx + tailwind-merge).
- The site uses OKLCH color space for gradient and theme colors.
- Glassmorphism effects and "Solar Gradient" background are central design elements.

### Data Access
- **Server components**: Use query functions from `lib/supabase/queries/` with the server client from `lib/supabase/server.ts`.
- **Client components / API routes**: Use the browser client from `lib/supabase/client.ts`.
- API routes follow REST conventions at `app/api/[resource]/route.ts` with `[id]/route.ts` for individual resources.
- Many resources support reordering via `app/api/[resource]/reorder/route.ts`.

### Authentication
- Supabase Auth with middleware-based session refresh (`middleware.ts` + `lib/supabase/middleware.ts`).
- Admin routes are protected. Auth callback at `app/auth/callback/route.ts`.
- Auth helpers in `lib/auth/`.

### Provider Hierarchy (root layout)
`ThemeProvider` > `AdminProvider` > `AtmosphereProvider` > page content + `FloatingNav`

### Content Types
The site manages several content types, each with its own admin CRUD, API routes, types, and queries:
- **Modules**: Site sections/navigation items
- **Posts**: Blog-style posts with markdown
- **Articles**: Long-form articles
- **Projects**: Portfolio projects
- **Photography/Galleries**: Photo galleries with media
- **Resume entries**: Resume/CV content

### Testing
- Vitest with jsdom environment and React Testing Library.
- Tests live alongside source files as `*.test.ts` / `*.test.tsx`.
- Path alias `@/` is configured in `vitest.config.mts`.
- Existing tests: `lib/stream.test.ts`, `lib/auth/redirect.test.ts`, `lib/auth/shared.test.ts`.

### Linting
- ESLint flat config (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

## Environment Variables

Required (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

## Deployment

- Hosted on **Vercel**. Pushes to `main` trigger builds.
- GitHub repo: `jjathompson4/personal-site-v1`
- Security headers configured in `next.config.ts` (CSP, X-Frame-Options, etc.).
- Supabase storage images are allowed via `remotePatterns` in Next.js image config.

## Database

- Supabase PostgreSQL with Row Level Security (RLS).
- Migrations in `supabase/migrations/` (YYYYMMDD prefix format).
- Key tables: modules, media, posts, articles, projects, galleries, resume_entries, tags, site_content, analytics.
- Storage bucket for media assets.
