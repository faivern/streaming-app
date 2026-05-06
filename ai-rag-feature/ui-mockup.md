# AI Discovery — UI Design

## Page Layout: `/discover/ai`

```
┌─────────────────────────────────────────────────────────────────┐
│  CINELAS    Home   Discover   [AI Discovery]   My Lists    👤   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                   What are you looking for?                       │
│          Describe a mood, a scene you remember,                  │
│              or what you're in the mood for                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ A movie where a guy relives the same day over and...  🔍│     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────┐ ┌──────────────────────┐ ┌────────────────┐    │
│  │🎬 "Something │ │🔍 "A heist movie     │ │🤔 "That movie  │    │
│  │like Inter-  │ │with a twist ending"  │ │with the red    │    │
│  │stellar"     │ │                      │ │pill"           │    │
│  └─────────────┘ └──────────────────────┘ └────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ ✨ AI DISCOVERY                                         │     │
│  │                                                         │     │
│  │ That sounds like Groundhog Day (1993)! Bill Murray      │     │
│  │ relives February 2nd repeatedly. Here are some          │     │
│  │ similar time-loop films you might enjoy:                │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐        │
│  │       │  │       │  │       │  │       │  │       │        │
│  │ poster│  │ poster│  │ poster│  │ poster│  │ poster│        │
│  │       │  │       │  │       │  │       │  │       │        │
│  │       │  │       │  │       │  │       │  │       │        │
│  ├───────┤  ├───────┤  ├───────┤  ├───────┤  ├───────┤        │
│  │Ground-│  │Edge of│  │Palm   │  │Source │  │Happy  │        │
│  │hog Day│  │Tmrw   │  │Springs│  │Code   │  │Death  │        │
│  │1993   │  │2014   │  │2020   │  │2011   │  │Day    │        │
│  │98%    │  │91%    │  │85%    │  │79%    │  │74%    │        │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘        │
│                                                                  │
│  ┌──────────────┐ ┌─────────────────────┐ ┌────────────────┐    │
│  │🔄 More like   │ │📺 TV shows instead   │ │🎯 Something    │    │
│  │  these        │ │                     │ │  darker        │    │
│  └──────────────┘ └─────────────────────┘ └────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Floating CTA Button (All Pages)

```
┌─────────────────────────────────────────────────┐
│                                                  │
│          (any Cinelas page content)               │
│                                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │    │ │    │ │    │ │    │                    │
│  └────┘ └────┘ └────┘ └────┘                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │    │ │    │ │    │ │    │                    │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
│                    ┌────────────────────────────┐│
│                    │ ✨ Don't know what to watch?││
│                    └────────────────────────────┘│
│                                                  │
│  ┌──────┬──────┬──────┬──────┬──────┐           │
│  │ Home │Disco-│ AI   │Lists │ More │  ← mobile │
│  │      │ver   │      │      │      │    bottom  │
│  └──────┴──────┴──────┴──────┴──────┘    nav     │
└─────────────────────────────────────────────────┘
```

**CTA Positioning:**
- Desktop: `fixed bottom-6 right-4`
- Mobile: `fixed bottom-20 right-4` (above `<BottomNav />`)
- Only visible when user is logged in
- Links to `/discover/ai`

## Frontend States

### 1. Idle State
- Input bar with placeholder text + quick prompt chips
- No results area visible

### 2. Loading State
```
┌─────────────────────────────────────────────┐
│ ✨ Searching...                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │
└─────────────────────────────────────────────┘

┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│
│░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│
│░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│
│░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│  │░░░░░│
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
  (skeleton card placeholders with pulse animation)
```
- Input disabled during query
- Skeleton cards with pulse animation

### 3. Success State
- AI explanation bubble + 5 result cards + quick action buttons (as shown in main layout)

### 4. Empty Results
```
┌─────────────────────────────────────────────┐
│ 🤷 I couldn't find anything matching that    │
│    description. Try being more specific or   │
│    use different words.                      │
└─────────────────────────────────────────────┘
```

### 5. Error State (503)
```
┌─────────────────────────────────────────────┐
│ ⚠️  Our AI is temporarily unavailable.       │
│    Please try again in a moment.             │
└─────────────────────────────────────────────┘
```

### 6. Rate Limited (429)
```
┌─────────────────────────────────────────────┐
│ ⏳ You've reached the query limit.           │
│    Try again in {minutes} minutes.           │
└─────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── <AiDiscoverCta />              ← floating button (global, auth-gated)
└── <Routes>
    └── /discover/ai → <AiDiscoverPage />
        ├── Auth guard (useUser + useSignInModal)
        ├── <AiSearchInput />       ← input bar + submit
        ├── <AiQuickPrompts />      ← example query chips
        ├── <AiExplanation />       ← LLM summary bubble
        ├── <AiResultsGrid />       ← 5x MediaCard with match scores
        └── <AiQuickActions />      ← refinement buttons
```

## Key Reused Components
- `MediaCard` — existing card component for displaying movie/TV results
- `useUser()` — auth state hook
- `useSignInModal()` — sign-in prompt for unauthenticated users
- `api` Axios instance — HTTP client for backend calls

## Quick Prompt Suggestions

Default chips shown before first query:
1. "A mind-bending thriller like Inception"
2. "Cozy feel-good movie for a rainy day"
3. "Something with a twist ending"
4. "A movie where the villain wins"
5. "Dark comedy about ordinary people"

Clicking a chip populates the input and auto-submits.

## Quick Action Buttons (Post-Result)

These generate new independent queries using previous result context:

| Button | Generated Query |
|--------|----------------|
| "More like these" | "More movies similar to {title1}, {title2}, {title3} — {original query}" |
| "TV shows instead" | "{original query}" + media_type filter |
| "Something darker" | "Something darker than {title1}, {title2} — {original query}" |

The frontend stores the last result titles in component state to construct these follow-up queries.
