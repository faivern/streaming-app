# Mobile Detail Page UX Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure MediaDetailPage mobile layout into a discovery-first flow (trailer > poster+info > details > streaming > cast > similar) without touching any desktop styles.

**Architecture:** Pure CSS/Tailwind changes across 3 files. Mobile styles use base classes; desktop overrides use `md:` prefix. No new components, hooks, or logic changes.

**Tech Stack:** React, Tailwind CSS 4, responsive utility classes

**Design doc:** `docs/plans/2026-03-05-mobile-detail-page-design.md`

---

### Task 1: Compact mobile action buttons in MediaPosterActions

**Files:**
- Modify: `frontend/src/components/media/detail/MediaPosterActions.tsx:36-70`

**Step 1: Update button container and button classes for mobile compactness**

Change line 36 from:
```tsx
<div className="mt-6 grid grid-cols-3 md:grid-cols-2 gap-3">
```
to:
```tsx
<div className="mt-3 md:mt-6 grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
```

Change the Watch button (lines 41-46) classes from:
```tsx
className="bg-gradient-to-b from-accent-primary to-accent-secondary
           hover:from-accent-primary hover:to-accent-secondary
           text-white py-4 px-2 rounded-xl font-semibold shadow-lg
           transform transition-transform duration-200 hover:scale-103
           flex flex-col items-center justify-center gap-1 cursor-pointer
           md:col-span-2 md:flex-row md:gap-2"
```
to:
```tsx
className="bg-gradient-to-b from-accent-primary to-accent-secondary
           hover:from-accent-primary hover:to-accent-secondary
           text-white py-2 md:py-4 px-2 rounded-lg md:rounded-xl font-semibold shadow-lg
           transform transition-transform duration-200 hover:scale-103
           flex flex-col items-center justify-center gap-0.5 md:gap-1 cursor-pointer
           md:col-span-2 md:flex-row md:gap-2"
```

Change the Watch button label (line 49) from:
```tsx
<span className="text-md tracking-wide">Watch</span>
```
to:
```tsx
<span className="text-xs md:text-md tracking-wide">Watch</span>
```

Change the Add button (line 56) classes — replace `py-4` with `py-2 md:py-4`, `rounded-xl` with `rounded-lg md:rounded-xl`, `gap-1` with `gap-0.5 md:gap-1`:
```tsx
className="bg-action-primary hover:bg-action-hover text-white py-2 md:py-4 px-2 rounded-lg md:rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center gap-0.5 md:gap-1 border border-slate-600/50 hover:cursor-pointer md:flex-row md:gap-2"
```

Change the Add button label (line 59) from:
```tsx
<span className="text-md">Add</span>
```
to:
```tsx
<span className="text-xs md:text-md">Add</span>
```

Change the Share button (line 66) classes — same pattern as Add button:
```tsx
className="bg-action-primary hover:bg-action-hover text-white py-2 md:py-4 px-2 rounded-lg md:rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center gap-0.5 md:gap-1 border border-accent-foreground hover:cursor-pointer md:flex-row md:gap-2"
```

Change the Share button label (line 69) from:
```tsx
<span className="text-md">Share</span>
```
to:
```tsx
<span className="text-xs md:text-md">Share</span>
```

**Step 2: Visual verification**

Run: `cd /home/gustaffaivre/Documents/streaming-app/frontend && npm run build:strict`
Expected: Build succeeds with no type errors.

**Step 3: Commit**

```bash
git add frontend/src/components/media/detail/MediaPosterActions.tsx
git commit -m "style(mobile): compact action buttons on detail page"
```

---

### Task 2: Horizontal poster+info layout in MediaDetailHeader

**Files:**
- Modify: `frontend/src/components/media/detail/MediaDetailHeader.tsx:47-134`

**Step 1: Change the outer section to horizontal on mobile**

Change line 48 from:
```tsx
<section className="relative flex flex-col md:flex-row gap-6 md:gap-8 py-8 px-4 md:px-12 max-w-7xl mx-auto">
```
to:
```tsx
<section className="relative flex flex-row gap-4 md:gap-8 py-4 md:py-8 px-4 md:px-12 max-w-7xl mx-auto">
```

**Step 2: Change poster container to ~40% width on mobile**

Change line 50 from:
```tsx
<div className="flex-shrink-0 w-full md:w-1/3 max-w-[360px] mx-auto">
```
to:
```tsx
<div className="flex-shrink-0 w-2/5 max-w-[160px] md:w-1/3 md:max-w-[360px]">
```

**Step 3: Update poster image sizes attribute**

Change line 57 from:
```tsx
sizes="(max-width: 768px) 100vw, 360px"
```
to:
```tsx
sizes="(max-width: 768px) 40vw, 360px"
```

**Step 4: Update the info column to fill remaining space**

Change line 85 from:
```tsx
<div className="flex flex-col gap-6">
```
to:
```tsx
<div className="flex flex-col gap-3 md:gap-6 min-w-0 flex-1">
```

**Step 5: Make title smaller on mobile to fit beside poster**

Change line 88 from:
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{title}</h1>
```
to:
```tsx
<h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white leading-tight">{title}</h1>
```

**Step 6: Hide tagline on mobile (saves vertical space)**

Change line 90 from:
```tsx
{tagline && <p className="text-gray-400 italic mt-2">{tagline}</p>}
```
to:
```tsx
{tagline && <p className="hidden md:block text-gray-400 italic mt-2">{tagline}</p>}
```

**Step 7: Visual verification**

Run: `cd /home/gustaffaivre/Documents/streaming-app/frontend && npm run build:strict`
Expected: Build succeeds with no type errors.

**Step 8: Commit**

```bash
git add frontend/src/components/media/detail/MediaDetailHeader.tsx
git commit -m "style(mobile): horizontal poster+info layout on detail page"
```

---

### Task 3: Reorder page sections and remove hero backdrop in MediaDetailPage

**Files:**
- Modify: `frontend/src/pages/detailPage/MediaDetailPage.tsx:55-153`

**Step 1: Remove the hero backdrop block**

Delete lines 57-72 entirely (the `{details.backdrop_path && (...)}` mobile hero backdrop div).

**Step 2: Add mobile top-margin to BackLink since hero is gone**

Change line 75 (now shifted after deletion) from:
```tsx
<div className="px-4 md:px-[8%] 4xl:px-[12%] md:mt-navbar-offset">
```
to:
```tsx
<div className="px-4 md:px-[8%] 4xl:px-[12%] mt-navbar-offset">
```

(Changed `md:mt-navbar-offset` to `mt-navbar-offset` so mobile also gets the offset since the hero backdrop no longer pushes content down.)

**Step 3: Move the mobile trailer from inside the grid to a top-level position before the grid**

The current mobile trailer (lines 118-131) needs to move above the grid. Replace the entire return block (from `<main>` to `</main>`) with:

```tsx
return (
    <main>
      {/* BackLink — always has navbar offset now that hero backdrop is removed */}
      <div className="px-4 md:px-[8%] 4xl:px-[12%] mt-navbar-offset">
        <BackLink />
      </div>

      {/* Mobile trailer — hero position, full-width */}
      <div className="md:hidden px-4 mt-2">
        <MediaDetailVideo
          backdrop_path={details.backdrop_path ?? ""}
          poster_path={details.poster_path ?? ""}
          title={details.title ?? details.name ?? "Media Trailer"}
          isPlaying={isPlaying}
          media_type={media_type}
          id={numericId}
          onScrollToWatchProviders={scrollToWatchProviders}
          onAddToList={() => setAddToListModalOpen(true)}
        />
      </div>

      {/* Desktop: trailer above 2-column layout, ~78% viewport width */}
      <div className="hidden md:block w-[78%] mx-auto mt-4">
        <MediaDetailVideo
          backdrop_path={details.backdrop_path ?? ""}
          poster_path={details.poster_path ?? ""}
          title={details.title ?? details.name ?? "Media Trailer"}
          isPlaying={isPlaying}
          media_type={media_type}
          id={numericId}
          onScrollToWatchProviders={scrollToWatchProviders}
          onAddToList={() => setAddToListModalOpen(true)}
        />
      </div>

      <div className="px-4 md:px-[8%] 4xl:px-[12%] mt-4">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 md:gap-x-12">
          {/* col 1, row 1 — header (poster+info on mobile) */}
          <div className="order-1 md:order-none min-w-0">
            <MediaDetailHeader
              details={details}
              cast={credits?.cast ?? []}
              crew={credits?.crew ?? []}
              keywords={(keywords ?? []).map((k) => k.name)}
              media_type={media_type}
              onWatchNow={handleWatchNow}
              logo_path={logoPath}
            />
          </div>

          {/* col 2, rows 1-3 — similar media sidebar (pushed to end on mobile) */}
          <div className="order-6 md:order-none mt-4 md:mt-0 md:row-span-3 md:col-start-2 min-w-0">
            <MediaGridSimilar similarMedia={similarMedia} parentType={media_type} />
          </div>

          {/* col 1, row 2 — watch providers */}
          <div className="order-3 md:order-none py-2 md:py-4 min-w-0">
            <WatchProviders mediaType={media_type} mediaId={numericId} title={details.title ?? details.name} />
          </div>

          {/* col 1, row 3 — cast carousel */}
          <div className="order-4 md:order-none min-w-0">
            <MediaCastCarousel cast={credits?.cast ?? []} />
          </div>
        </div>
      </div>

      <AddToListModal
        isOpen={addToListModalOpen}
        onClose={() => setAddToListModalOpen(false)}
        media={{
          tmdbId: numericId,
          mediaType: media_type,
          title: details.title ?? details.name ?? "",
          posterPath: details.poster_path ?? null,
          backdropPath: details.backdrop_path ?? null,
          overview: details.overview ?? null,
          voteAverage: details.vote_average ?? null,
        }}
      />
    </main>
  );
```

Key changes in this rewrite:
- Hero backdrop div: **deleted**
- BackLink: `mt-navbar-offset` (was `md:mt-navbar-offset`)
- Mobile trailer: moved to top-level `md:hidden` div before grid (was inside grid at order-3)
- "Watch Trailer" h2 heading: **removed** (trailer speaks for itself)
- Grid gap: `gap-6 md:gap-8` (was `gap-8`)
- Similar media order: `order-6` (was `order-5`) — now last on mobile
- WatchProviders order: `order-3` (was `order-2`) — after header
- WatchProviders padding: `py-2 md:py-4` (was `py-4`)
- Old mobile trailer div (was order-3 md:hidden): **removed** (replaced by top-level)

**Step 4: Visual verification**

Run: `cd /home/gustaffaivre/Documents/streaming-app/frontend && npm run build:strict`
Expected: Build succeeds with no type errors.

**Step 5: Commit**

```bash
git add frontend/src/pages/detailPage/MediaDetailPage.tsx
git commit -m "style(mobile): reorder detail page sections and remove hero backdrop"
```

---

## Verification Checklist

After all tasks are done, verify on a mobile viewport (Chrome DevTools, 375px width):

1. Trailer appears immediately after BackLink (no hero backdrop)
2. Poster (~40% width) sits left of title/meta/actions
3. Action buttons are compact with smaller text
4. Overview appears below the poster+info row
5. Details (collapsed) appears after overview
6. WatchProviders appears after details
7. Cast carousel scrolls horizontally
8. Similar media section is last

Desktop verification (> 768px):

1. Layout is **unchanged** — trailer at top, 2-column grid with sidebar
2. Poster is full-width in left column (1/3 width, max 360px)
3. Action buttons are full-size
4. All `md:` overrides preserve existing desktop behavior
