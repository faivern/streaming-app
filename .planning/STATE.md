---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: AI-Powered Discovery
status: Ready to execute
stopped_at: Completed 12-01-PLAN.md
last_updated: "2026-03-28T17:44:37.470Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 8
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** Users can effortlessly discover movies and TV shows — whether browsing, searching, or describing what they're in the mood for in natural language.
**Current focus:** Phase 12 — rag-query-service-and-api

## Current Position

Phase: 12 (rag-query-service-and-api) — EXECUTING
Plan: 2 of 3

## Performance Metrics

**Velocity (prior milestone v1.1):**

- Total plans completed: 27
- Average duration: ~200 sec

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 1 (Insights) | 4 | 539s | 135s |
| Phase 2 (Foundation) | 2 | ~520s | ~260s |
| Phase 3 (Carousels) | 3 | ~313s | ~104s |
| Phase 4 (Navigation) | 2 | ~1194s | ~597s |
| Phase 5 (Modals/Filters) | 3 | ~174s | ~58s |
| Phase 6 (Media Detail) | 3 | ~142s | ~47s |
| Phase 7 (Lists Page) | 2 | ~122s | ~61s |
| Phase 8 (Secondary Pages) | 4 | ~214s | ~54s |
| Phase 9 (Global Polish) | 4 | ~372s | ~93s |

**Recent Trend:**

- Last 4 plans: 159s, 155s, 95s, 130s, 245s, ~65s (03-03), ~188s (03-01)
- Trend: Stable

*Updated after each plan completion*
| Phase 06-media-detail-page P03 | 60 | 1 tasks | 0 files |
| Phase 07-lists-page P01 | 120 | 2 tasks | 4 files |
| Phase 08-secondary-pages-and-insights P01 | 38 | 1 tasks | 1 files |
| Phase 08-secondary-pages-and-insights P02 | 66 | 2 tasks | 3 files |
| Phase 08-secondary-pages-and-insights P03 | 109 | 2 tasks | 8 files |
| Phase 08-secondary-pages-and-insights P04 | 1 | 1 tasks | 0 files |
| Phase 09-global-polish P01 | 141 | 3 tasks | 15 files |
| Phase 09-global-polish P02 | checkpoint | 1 tasks | 0 files |
| Phase 09-global-polish P03 | 55 | 1 tasks | 5 files |
| Phase 09-global-polish P04 | 88 | 2 tasks | 9 files |
| Phase 10-db-and-infrastructure-foundation P01 | 268 | 2 tasks | 7 files |
| Phase 10-db-and-infrastructure-foundation P02 | 240 | 2 tasks | 4 files |
| Phase 11 P03 | 136 | 2 tasks | 4 files |
| Phase 11 P01 | 277 | 2 tasks | 5 files |
| Phase 12-rag-query-service-and-api P01 | 240 | 2 tasks | 9 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phone-first breakpoints — phone must be perfect; tablet and desktop treated together
- [Roadmap]: Bottom navigation on mobile — native-feeling UX goal (not hamburger drawer)
- [Roadmap]: Use Embla Carousel for all 6 carousels — already installed, no new dependencies
- [02-01]: @theme breakpoints use rem not px — Tailwind 4 sorts breakpoints numerically; mixing units causes wrong sort order
- [02-01]: Z-index tokens in :root not @theme — @theme has no --z-* namespace; use z-(--z-*) syntax in TSX class attributes
- [Phase 02-02]: pb-safe uses env(safe-area-inset-bottom) directly; pb-safe-or-4 uses max(1rem,env()) for minimum floor
- [Phase 02-02]: mt-navbar-offset is canonical page top offset — all pages must use this, never hardcoded mt-20/24/28/32
- [Phase 02-02]: Fixed-bottom elements use pb-safe or pb-safe-or-4 to clear iOS home indicator
- [03-01]: Slide containers use flex-[0_0_calc(50%-12px)] with gap-6 — 2-up at 375px mobile for CollectionCarousel, Top10Carousel, GenreCardList
- [03-01]: Card components (CollectionCard, GenreCard) updated to w-full — slide container is layout authority, not the card
- [03-01]: Arrow buttons render conditionally (not disabled) so no grayed-out state at slide boundaries
- [03-02]: TrendingCarousel uses loop: true — Embla wraps around seamlessly, no custom modulo arithmetic needed
- [03-02]: WatchProviderCarousel uses dragFree: true — logo rows scan better without snap points; arrows still work with scrollNext/scrollPrev
- [03-02]: dvh replaces vh in TrendingCarousel hero heights — fixes iOS Safari clipping when browser toolbar is visible
- [03-02]: TrendingCarousel autoplay uses window.setInterval + emblaApi.scrollNext inline — no embla-carousel-autoplay plugin required
- [03-03]: hidden lg:block is canonical pattern for desktop-only floating UI — CSS guard is sufficient; no pointer event suppression needed
- [03-03]: No Embla migration for MediaCastCarousel — native overflow-x-auto confirmed adequate for iOS/Android touch scroll
- [03-03]: scrollbar-none lg:scrollbar removes mobile scrollbar while retaining desktop scrollbar using tailwind-scrollbar plugin
- [04-01]: BottomNav uses z-(--z-sticky) not z-(--z-dialog) — persistent chrome shares header stacking layer, not temporary overlay layer
- [04-01]: end prop required on NavLink to="/" — without it Home tab highlights active on every route
- [04-01]: pb-bottom-nav on <main> in App.tsx is single catch-all content clearance — no per-page adjustments needed for standard pages
- [04-01]: MyListsPage FAB removes pb-safe — bottom nav pb-safe-or-4 already clears iOS home indicator; FAB only needs to clear nav height
- [04-02]: Headless UI Dialog uses position:fixed for scroll lock — correct iOS Safari strategy vs document.body.style.overflow which is silently ignored
- [04-02]: Dialog v1 API enforced (Transition.Root, Transition.Child, Dialog.Panel) — matches all 11 existing Dialog usages; mixing v1/v2 APIs causes TypeScript errors
- [04-02]: Dialog handles Escape key and backdrop click via onClose — no manual event listeners needed in components
- [05-01]: dvh is canonical unit for modal max-h — vh uses max viewport (toolbar hidden), dvh tracks dynamic visual viewport; fixes iOS Safari clipping
- [05-01]: overscroll-contain on every overflow-y-auto scroll container in modals prevents iOS momentum scroll bleed to background page
- [05-01]: overflow-hidden on Dialog.Panel conflicts with overflow-y-auto — remove overflow-hidden when enabling panel scroll; rounded corners preserved by border-radius classes
- [05-01]: sm: breakpoint dvh variants retained where they existed — both mobile and sm sizes corrected from vh to dvh
- [05-02]: overscroll-contain on inner scroll div only (not Dialog.Panel shell) — shell is already correct per research
- [05-02]: Listbox.Button trigger rows left at py-2 (full-width, already ≥44px); only Listbox.Option rows need py-3
- [05-02]: GenreCheckboxList checkbox updated to h-5 w-5 alongside py-2.5 label padding for proportional row sizing
- [05-03]: touchstart { passive: true } added in same useEffect as mousedown on a MouseEvent | TouchEvent union handler — no second useEffect
- [05-03]: 300ms delay on scrollIntoView matches iOS virtual keyboard animation duration; React 19 synthetic events do not need e.persist()
- [05-03]: Drag handle uses w-10 (not MobileFilterDrawer's w-12) for more subtle appearance on compact list modals; sm:hidden hides it on desktop
- [06-01]: MediaDetailHeader root changed from <main> to <section> — fixes nested <main> HTML validity error
- [06-01]: sm:line-clamp-none overrides line-clamp-3 on desktop — no JS window.innerWidth check needed for responsive truncation
- [06-01]: Mobile collapse pattern: sm:hidden toggle button + sm:block wrapper div — drives content visibility on mobile only, desktop always visible
- [06-01]: h-[40dvh] for page-level backdrop hero — dvh is canonical unit consistent with Phase 3 (TrendingCarousel) and Phase 5 (modal max-h)
- [06-01]: MediaDetailVideo repositioned to labeled "Watch Trailer" section below WatchProviders — trailer below fold, not at page top
- [06-02]: grid grid-cols-3 replaces space-y-3 + inner grid-cols-2 — all three action buttons in one equal-width horizontal row at 375px
- [06-02]: flex-col icon-above-label with py-3 minimum on all three buttons ensures >=44px touch target height in compact cells
- [06-02]: No overflow-hidden on relative wrapper in MediaCastCarousel — would clip scroll container (Phase 5 lesson reapplied)
- [06-02]: lg:hidden on fade div — desktop already has scrollbar via lg:scrollbar; fade affordance only needed on mobile
- [Phase 06-media-detail-page]: All three Phase 6 requirements (DETAIL-01, DETAIL-02, DETAIL-03) visually approved at 375px by human reviewer
- [07-01]: ListsDrawer was using z-50 (integer=50) instead of z-(--z-drawer) token (=100) — corrected to align with Phase 2 z-index token table
- [07-01]: overscroll-contain applied to flex-1 overflow-y-auto in ListsDrawer — consistent with Phase 5 pattern for all Dialog scroll containers
- [07-01]: ViewToggle p-2->p-3 (icon buttons); Listbox.Option py-2->py-3 (dropdown rows); ListsSidebar create button p-1.5->p-2.5 — all touch targets enlarged
- [Phase 07-lists-page]: All three Phase 7 requirements (LIST-01, LIST-02, LIST-03) visually approved at 375px by human reviewer
- [08-01]: gap-2 (not gap-4) on 3-column MediaCard grid in IdentityIntroCard — each poster gets ~4px more horizontal room at 375px
- [08-01]: BentoGrid grid-cols-1, Recharts ResponsiveContainer width="100%", typography text-sm/text-xs already correct — no changes needed for INS-01/02/03
- [08-02]: mt-navbar-offset on inner content container (not outer min-h-dvh shell) in creditsPage.tsx — outer shell fills full viewport background including navbar area
- [08-02]: All four wrapper divs in creditsDetailPage.tsx get mt-navbar-offset — invalid id, loading, error, and main render states all clear the navbar
- [08-02]: break-words alongside whitespace-pre-line on biography paragraph — overflow-wrap prevents horizontal scroll; whitespace-pre-line preserves paragraph breaks
- [08-03]: HeroCollection overlay changed from absolute left-4 max-w-xl to absolute left-0 right-0 — panel bounded to section, not floating with fixed max-width that overflows 375px
- [08-03]: WatchProviderCard uses w-full aspect-square instead of fixed w-28 h-28 — grid column width drives card dimensions; fixed pixel sizes break responsive grids
- [08-03]: ProvidersPage base column count reduced from grid-cols-3 to grid-cols-2 — 3 columns at 375px gives ~103px per card, too narrow; 2 columns gives ~163px
- [Phase 08-secondary-pages-and-insights]: All 9 Phase 8 requirements (INS-01/02/03 and SEC-01–SEC-06) visually approved at 375px by human reviewer on 2026-02-22
- [Phase 09-01]: px-page utility registered in @layer utilities with responsive override via media query block outside the layer — Tailwind 4 @layer utilities cannot contain @media directives
- [Phase 09-01]: aspect-video and aspect-[3/1] are additive on img class strings — call-site height classes override aspect-ratio when height is also specified; CLS prevented without breaking existing usages
- [Phase 09-01]: DiscoverModal uses z-(--z-modal) (140) not z-(--z-dialog) (150) — modal backdrop/wrapper sits below the dialog panel layer; MobileFilterDrawer uses z-(--z-overlay) (60)
- [Phase 09-02]: Human approval at all four breakpoints (375px, 768px, 1440px, 2560px) confirms Phase 9 implementation correct — no gap-closure tasks required; v1.1 Full Responsiveness milestone ship-ready
- [Phase 09-03]: px-page token is the sole source of horizontal page inset — no component should hardcode the old px-6 sm:px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-36 stepped scale
- [Phase 09-04]: All Headless UI Dialog root elements use z-(--z-modal) (140) — canonical modal stacking token above sticky navbar (--z-sticky: 50)
- [Phase 09-04]: MediaCard floating hover panel uses z-(--z-dropdown) (20) — above base cards, below sticky navbar; correct for floating-ui anchored tooltip
- [Phase 09-04]: TrendingCarousel overlay text div uses z-(--z-overlay) (60) — canonical token for absolutely-positioned content over background images
- [v2.0 Roadmap]: Personalization (PERS-01, PERS-02) folded into Phase 12 — application-code filtering post-vector-retrieval preserves HNSW index; never filter in SQL
- [v2.0 Roadmap]: Guardrails (GUARD-01, GUARD-02, GUARD-03) assigned to Phase 12 — input validation and system prompt constraints are intrinsic to the query pipeline, not a separate layer
- [v2.0 Roadmap]: ENTRY requirements assigned to Phase 13 — floating CTA and auth gate are frontend concerns that require the API to be stable before implementation
- [Phase 10-01]: pgvector/pgvector:pg16 Docker image replaces postgres:16-alpine — drop-in replacement that adds pgvector extension pre-installed
- [Phase 10-01]: HNSW index with m=16, ef_construction=64 and vector_cosine_ops — EF Core Npgsql fluent API emits correct WITH parameters natively (no raw SQL needed)
- [Phase 10-01]: Single atomic migration AddAiDiscoverySchema creates both tables plus indexes in one operation
- [Phase 10-02]: ApiKeyCredential is in System.ClientModel namespace (not Azure) for Azure.AI.OpenAI v2.x — must use using System.ClientModel in ServiceRegistration.cs
- [Phase 11]: InMemory EF Core provider works for MovieEmbedding count queries — Embedding vector column is Ignored in non-Npgsql providers per existing DbContext configuration
- [Phase 11]: Phase thresholds for /health/seed: movies < 10K → 'movies'; tv < 5K → 'tv'; both met → 'complete' with 15K total target
- [Phase 11]: TmdbMovieDetails/TmdbTvDetails are sealed class (not record) — tests use manual object construction rather than with expressions
- [Phase 11]: TV keywords use Results property (not Keywords) due to TMDB API response inconsistency
- [Phase 11]: Distinct cache key prefixes movie_seed_ and tv_seed_ avoid collision with regular detail cache
- [Phase 12-01]: IDesignTimeDbContextFactory added to bypass Azure OpenAI startup validation during EF migrations
- [Phase 12-01]: AiServiceUnavailableException is shared contract for Plans 02/03 — D-11 overrides RAG-04, both embedding and LLM failures return 503
- [Phase 12-01]: System prompt grounding: ONLY recommend from CANDIDATES list per D-03; off-topic queries redirected via JSON response

### Pending Todos

5 pending todos in `.planning/todos/pending/`

### Blockers/Concerns

- [Phase 10]: Confirm actual Azure OpenAI deployment names before writing DI registration — deployment names may differ from model names (text-embedding-3-small, gpt-4o-mini)
- [Phase 10]: Confirm whether TV show embeddings are in scope for v2.0 or movies-only — affects seed pipeline page count and total seed time
- [Phase 11]: Confirm Azure OpenAI TPM quota before first seed run — reduce batch size from 100 to 50 if quota is below 250K TPM
- [Phase 12]: If hallucinated TMDB ID rate exceeds 10% in early testing, run a focused spike on system prompt constraint patterns before finalizing the prompt

## Session Continuity

Last session: 2026-03-28T17:44:37.467Z
Stopped at: Completed 12-01-PLAN.md
Resume file: None
