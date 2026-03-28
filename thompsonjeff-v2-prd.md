# thompsonjeff.com v2 — Product Requirements Document

## Project Overview

A personal website rebuild for Jeff Thompson — lighting designer, software dabbler, visual thinker, and writer. The site serves as a central hub for professional and creative work: writing, code projects, photography, AEC (Architecture, Engineering, Construction) industry thoughts, and personal ideas.

**v1 exists at [thompsonjeff.com](https://www.thompsonjeff.com)** — deployed on Vercel, built with Next.js + Supabase. v2 is an evolution, not a rewrite from scratch. Salvage what works, redesign what doesn't.

---

## Design Philosophy

### The Workshop Metaphor

The site should feel like a dreamscape version of an ideal workshop. Big old windows, large leafy trees outside filtering natural light through wavy aged glass. The space has different characteristics depending on the time of day — warm and golden in the afternoon, cool and focused in the morning, deep and contemplative at dusk. Subtle shadow play drifts across surfaces as light shifts. Honest materiality and textures throughout — wood, metal, paper, things that have been used.

The work is real, the tools are visible, the process isn't hidden — but everything has its place. It's been tidied up for visitors, not sanitized. You can smell sawdust and coffee. Show the work, not the ego.

**Design translation:** Natural light filtering through layered elements (the atmospheric gradients). Time-of-day awareness in color temperature. Subtle, slow-moving shadow/light dynamics. Textures that feel organic rather than digitally perfect (grain, slight warmth). An overall sense of inhabitation — this space exists even when no one's looking.

### Core Aesthetic Values

- **Substance over personality** — let the work speak; no influencer energy, no vague clickbait titles, no talking-head videos
- **Clean and minimal** — but not sterile; warm, inhabited, alive
- **Media-first content** — almost every post will include screenshots, photos, GIFs, or short video; text supports visuals, visuals don't decorate text
- **Quiet confidence** — competent and curious, not performative
- **Restraint as taste** — the site should feel like someone who could have done more but chose not to

### Anti-Patterns (Things to Explicitly Avoid)

- Self-promotional / influencer tone (ref: Dan Mall's site as anti-example)
- Vague or clickbaity post titles
- Flashy hero sections that don't earn their space
- Animations that feel gimmicky or attention-seeking
- Anything that prioritizes spectacle over substance

---

## The Atmospheric System

The defining feature of the site. A living, breathing ambient background that gives the site a sense of *place* rather than just *page*.

### Design Intent

> "I want to share the incommunicable feelings that my cobweb memories and dreams emit."

The atmosphere should be **subliminal, not spectacular**. Visitors should notice it after a few seconds, not on load. Like walking into a room and slowly realizing the light is unusually beautiful — you don't know why you feel calm, but you do.

**The test:** If someone asks "does the background move?" and they're not sure, you've nailed it.

### Atmosphere Behaviors

- **Per-module mood shifts** — each content section carries its own ambient light quality, like rooms in the same building at different times of day
- **Crossfade transitions** — moving between posts/sections feels like your eyes adjusting when walking from a bright room into a dim one; transitions are the most considered moments, not seams to rush through. **Suggested direction:** a solar shift or sunbeam crossing effect between sections on the homepage — like a cloud passing or light moving behind a tree branch. A brief, luminous moment that marks the boundary. This is a starting point, not a hard requirement; the implementer has creative latitude to explore other transition approaches that serve the same feeling of light shifting naturally between spaces.
- **Mouse-driven interaction** — subtle enough that it might be your imagination; parallax shifts in gradient layers
- **Organic particles** — dust-in-sunbeam effect; barely there, slow-moving, gives a sense of inhabited space
- **Subtle grain/texture** — slight film grain overlay for organic warmth

### Per-Post Mood Selection

Rather than mapping fixed moods to categories, the atmosphere mood is **chosen during post creation**. Each post gets its own ambient feel, selected by the author to match the content's emotional tone.

**Implementation:** The content editor includes a mood picker — a set of predefined atmosphere presets (golden hour, cool morning, sodium vapor dusk, overcast neutral, dreamlike, etc.) that the author selects per post. The atmospheric system crossfades to that mood when the post is viewed.

**Why per-post, not per-module:** Not all writing feels like golden hour. Not all code projects feel cool and clinical. The mood should serve the specific content, not a category label.

**Preset moods (starting palette, expandable):**

| Preset Name | Light Quality | Feel |
|-------------|--------------|------|
| Golden Hour | Late afternoon warm | Contemplative, nostalgic |
| Morning Clarity | Cool blue-shift | Focused, crisp |
| Sodium Vapor Dusk | Late sunset + warm artificial | Dreamlike, the original v1 vibe |
| Overcast | Diffused neutral | Grounded, professional |
| Twilight | Deep blue-purple transition | Liminal, in-between |

These are starting points. More can be added over time, and the author can fine-tune if needed.

### Atmosphere Constraints (Non-Negotiable)

1. **Performance first** — must run smoothly; sluggish ≠ dreamy
2. **Legibility always wins** — atmosphere recedes when reading content; background never competes with text or images
3. **Accessibility** — must respect `prefers-reduced-motion`; site must be beautiful as a static composition with all motion disabled
4. **Mobile graceful degradation** — simplified atmosphere on mobile; still moody, just less computationally intensive
5. **Content-responsive** — when a post is image-heavy, the background should almost disappear

### Implementation Approach

Build the atmospheric system as a **standalone prototype first**. Nail the gradients, transitions, particles, and mouse interaction before layering any content. Get the "room" right, then furnish it.

**Technical options to evaluate:**
- CSS-only (most performant, least dynamic)
- Canvas 2D (good middle ground)
- WebGL / Three.js (most headroom for effects, highest complexity)
- Hybrid: CSS gradients + canvas particles

v1 has an existing gradient implementation with mouse parallax — review and evolve rather than discard.

---

## Content Architecture

### Content Priority (Ranked)

1. **Writing / Blog posts** — primary content type; Jeff wants to do more of this
2. **Code projects** — showcases and write-ups
3. **Photography** — galleries and inline visual storytelling
4. **Professional AEC work** — present but not leading

### Media-First Content Model

Nearly every post will contain screenshots, photos, GIFs, or short videos. This is not a text blog with occasional images — it's a visual essay platform with strong writing.

**Implications:**
- Content editor must be media-first (drag-and-drop images as starting point, text flows around them)
- Image optimization, lazy loading, and CDN strategy are core infrastructure
- Layout must handle image sequences, before/afters, annotated screenshots, mixed media
- Video strategy needed: self-hosted short clips vs. embedded YouTube/Vimeo

### Browsing Experience (Index / Grid Level)

**Reference: Tobias van Schneider's content grid**

- Strong grid-based browsing that invites exploration
- Content cards with visual previews
- Clean categorization without feeling corporate
- The atmospheric background breathes subtly behind the grid

### Reading Experience (Post Level)

**Reference: Paul Stamatiou's inline media posts**

- Rich visual storytelling with media and text woven together
- Generous whitespace
- Images feel like part of the argument, not decoration
- Atmosphere recedes to let content breathe, then gently returns when you surface back to the grid

### Interactive Elements (Selective)

**Reference: Josh Comeau's interactive blog posts**

- Used selectively for code project showcases and technical explanations
- Playful UI components where they serve the content
- Not the default — earned through relevance

---

## Site Structure

### Unified Post Model

Every post is fundamentally the same thing: a combination of text and images/media. There are no separate "modules" with different page types. Instead, posts are differentiated by:

1. **Scope:** Personal vs. Professional (the primary division)
2. **Tags:** Flexible categorization (photography, code, AEC, ideas, etc.) used for filtering, not for creating separate sections

This means the site is essentially a media-rich blog with strong filtering, not a portfolio with distinct module pages.

### Public Pages

- **Homepage** — structured about section + scrolling preview of recent posts (atmospheric crossfades between post moods as you scroll)
- **Posts feed** — filterable by scope (personal/professional) and tags
- **Individual post** — the Stamatiou-style rich media reading experience
- **Resume** — structured professional history (standalone page)

### Navigation

- Minimal top nav: Home, Personal, Professional, Resume
- Tag filtering within feed views
- Mobile: hamburger or slide-out menu

### URL Structure

```
/                       → Homepage (about + recent posts with atmospheric crossfades)
/posts                  → All posts feed
/personal               → Personal posts feed
/professional           → Professional posts feed
/posts/[slug]           → Individual post
/resume                 → Resume
/admin                  → Admin panel (owner only)
```

### Tagging System

Global tags applied during post creation. Tags include but aren't limited to: photography, code, AEC, lighting, ideas, work-in-progress. Tags are freeform — create new ones as needed, no predefined taxonomy.

---

## Three-Tier Privacy System

| Level | Behavior |
|-------|----------|
| **Public** | Visible to everyone, listed in feeds, search-indexable |
| **Password / Link Protected** | Not listed in feeds; requires password or share token to access |
| **Owner Only** | Requires authentication; direct URL returns 404 if not logged in |

Per-content visibility toggle in the admin editor.

---

## Tech Stack (Carried from v1)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Rich Text Editor | Tiptap or Novel |
| Hosting | Vercel |
| Domain & DNS | Cloudflare |
| Email Routing | Cloudflare Email Routing |

---

## Database Schema (From v1 Spec — Review for v2)

### Core Tables

- **modules** — id, name, slug, icon, accent_color, description, enabled, sort_order, config (JSONB)
- **content** — id, module_id, title, slug, content (rich text), visibility, password_hash, share_token, published_at, created_at, updated_at, metadata (JSONB)
- **media** — id, file_url, file_type, filename, content_id
- **tags** — global tagging system across all modules

### v2 Schema Considerations

- Media table may need richer metadata (dimensions, EXIF, blurhash for lazy loading)
- Content table may need a `hero_media_id` or `cover_image` field since nearly all posts are media-led
- Consider a `media_order` or `content_media` junction table for sequencing media within posts
- Atmosphere config per module (gradient colors, particle settings) — stored in modules.config JSONB?

---

## Admin Panel

### Content Editor (Media-First)

- Drag-and-drop media upload as primary action
- Rich text editing (Tiptap/Novel) with inline media placement
- Image captioning, alt text, and ordering
- Visibility toggle (public / password / owner-only)
- Tag management
- Preview before publishing
- Save as draft

### Site Settings

- Module management (enable/disable, reorder)
- Per-module accent colors and icons (easy to change, no code required)
- Per-module atmosphere settings (if we make these configurable)
- Homepage about section editing
- Social links management
- Media library browser

---

## Design System

### Typography

- **Primary:** Inter or system sans-serif stack
- **Monospace (code):** Fira Code or JetBrains Mono
- Clean type scale, generous line height for readability

### Color

- **Light mode:** Clean whites/grays with module accent colors
- **Dark mode:** Deep blues/blacks (not pure black) with adjusted accents
- **Per-module accents:** Customizable via admin
- Global light/dark toggle, persistent preference

### Layout

- Max content width ~64rem, centered
- Generous whitespace throughout
- Responsive: mobile-first
- Photography: masonry or justified grid
- Writing: single-column, optimized for reading
- Projects: 2-column grid (1 on mobile)

---

## Design References

| Site | What to Borrow |
|------|---------------|
| **Brittany Chiang** (brittanychiang.com) | Structural simplicity, single-page flow |
| **Tobias van Schneider** (vanschneider.com) | Content grid layout, browsing experience (ignore the hero section) |
| **Paul Stamatiou** (paulstamatiou.com) | Rich inline media, visual essay format, post typography |
| **Josh Comeau** (joshwcomeau.com) | Interactive code explanations, playful UI (use selectively) |
| **Rauno Freiberg** (rauno.me) | Micro-interaction craft, attention to detail |

---

## Build Phases (v2)

### Phase 0: Audit & Salvage
- Review v1 codebase on GitHub
- Identify components, pages, and logic worth keeping
- Document what needs rebuilding vs. refactoring
- Extract and document the existing gradient/atmosphere implementation

### Phase 1: Atmospheric Prototype (Spike)
- Build standalone prototypes using each approach: CSS-only, Canvas 2D, WebGL, and hybrid
- Benchmark performance across browsers and devices (especially mobile)
- Evaluate visual quality vs. performance tradeoffs
- **Commit to an approach**, then build the full system:
  - Mood presets with crossfade transitions between them
  - Particle system (dust-in-sunbeam)
  - Mouse interaction layer (subtle parallax)
  - `prefers-reduced-motion` fallback (must be beautiful static)
  - Mobile graceful degradation

### Phase 2: Foundation & Layout
- Next.js app structure (keep/refactor from v1)
- Tailwind + shadcn/ui setup
- Global layout with navigation (Home, Personal, Professional, Resume)
- Light/dark mode toggle
- Integrate atmospheric system into layout
- Responsive framework

### Phase 3: Content Management
- Supabase schema (migrate/evolve from v1)
- Media-first content editor with mood picker
- Media upload, optimization, and CDN pipeline
- Scope selection (personal / professional)
- Freeform tag creation and assignment
- Draft/publish workflow
- Visibility controls (public / password / owner-only)

### Phase 4: Post Feed & Detail Pages
- Post feed with Van Schneider-style content grid
- Filtering by scope (personal/professional) and tags
- Individual post page (Stamatiou-style rich media layout)
- Atmospheric mood loads per-post on detail view
- Homepage with about section + scrolling recent posts with atmospheric crossfades

### Phase 5: Resume Page
- Structured professional history
- Standalone page, separate from post system

### Phase 6: Polish & Infrastructure
- Performance audit and optimization
- Image lazy loading and blur placeholders
- RSS feed
- Analytics integration (Plausible or Umami)
- SEO setup
- Accessibility audit
- Cross-browser testing
- Mobile atmosphere optimization
- Interactive Comeau-style elements for select code posts (if applicable)

### Phase 7: Deployment
- Vercel deployment (likely already set up from v1)
- Cloudflare DNS configuration
- Email routing setup
- Final testing on production

---

## Resolved Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Atmosphere implementation | **Prototype all approaches** (CSS-only, Canvas 2D, WebGL, hybrid) during Phase 1 spike to evaluate performance/quality tradeoffs before committing |
| 2 | Video hosting | **YouTube / Vimeo embeds** — offload hosting and encoding complexity |
| 3 | Content migration | **Partial** — a few things worth keeping from v1; not a full migration |
| 4 | Photography features | **Simple image grid** — no EXIF, no album structure for MVP; can add later |
| 5 | Viewer interaction | **Skip for MVP** — purely one-way publishing; may revisit post-launch |
| 6 | Site-wide search | **Skip for MVP** — Supabase full-text search can be added later when content volume warrants it |
| 7 | RSS feed | **Yes** — include for launch; low effort, signals publishing intent |
| 8 | Analytics | **Yes** — Plausible or Umami; privacy-friendly, understand what resonates |
| 9 | Navigation model | **Hybrid** — homepage scrolls through module sections with atmospheric crossfades; each module also has its own dedicated page for direct access |
| 10 | Ambient sound | **No** — cut from scope entirely |
