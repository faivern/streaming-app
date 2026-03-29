import { useState } from "react";
import { useAiDiscover } from "../../hooks/aiDiscover/useAiDiscover";
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";
import AiSearchInput from "../../components/aiDiscover/AiSearchInput";
import AiQuickPrompts from "../../components/aiDiscover/AiQuickPrompts";
import AiExplanation from "../../components/aiDiscover/AiExplanation";
import AiResultsGrid from "../../components/aiDiscover/AiResultsGrid";
import AiQuickActions from "../../components/aiDiscover/AiQuickActions";
import MediaCardSkeleton from "../../components/media/skeleton/MediaCardSkeleton";

export default function AiDiscoverPage() {
  const [query, setQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { mutate, data, isPending, error } = useAiDiscover();
  const { data: user } = useUser();
  const { openSignInModal } = useSignInModal();

  const errorStatus = error?.response?.status;
  const retryAfterSeconds = error?.response?.headers?.["retry-after"]
    ? parseInt(error.response.headers["retry-after"] as string, 10)
    : null;

  const handleSubmit = () => {
    if (!query.trim() || isPending) return;
    setHasSubmitted(true);
    mutate(query.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
    setHasSubmitted(true);
    mutate(prompt);
  };

  const handleRefine = (newQuery: string) => {
    setQuery(newQuery);
    mutate(newQuery);
  };

  return (
    <div className="min-h-dvh bg-background mt-navbar-offset pb-bottom-nav md:pb-0 px-page">
      {!user ? (
        /* Auth gate */
        <div className="flex flex-col items-center justify-center pt-16">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white text-center">
            Discover movies with AI
          </h1>
          <p className="text-base text-[var(--subtle)] text-center mt-4 max-w-md">
            Sign in to describe what you're in the mood for and get personalized
            recommendations powered by AI.
          </p>
          <button
            type="button"
            onClick={() => openSignInModal()}
            className="mt-6 bg-[var(--action-primary)] hover:bg-[var(--action-hover)] text-white font-semibold rounded-xl px-6 py-3 min-h-11 transition-colors duration-200"
          >
            Sign in to get started
          </button>
        </div>
      ) : !hasSubmitted ? (
        /* Idle state */
        <div className="flex flex-col items-center text-center pt-16">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            What are you looking for?
          </h1>
          <p className="text-base text-[var(--subtle)] mt-4 max-w-lg">
            Describe a mood, a scene you remember, or what you're in the mood for.
          </p>
          <div className="mt-6 max-w-2xl w-full">
            <AiSearchInput
              query={query}
              onQueryChange={setQuery}
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          </div>
          <div className="mt-4">
            <AiQuickPrompts visible={true} onSelect={handleQuickPrompt} />
          </div>
          <p className="text-sm text-[var(--subtle)] mt-3">
            Searching across 10,000 popular titles
          </p>
        </div>
      ) : (
        /* Results state */
        <div className="pt-6">
          <div className="max-w-2xl w-full mx-auto">
            <AiSearchInput
              query={query}
              onQueryChange={setQuery}
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          </div>

          <div className="mt-6">
            {isPending && (
              <>
                {/* Explanation skeleton */}
                <div className="border-l-4 border-[var(--accent-primary)] bg-[var(--component-primary)] rounded-r-xl px-4 py-3 animate-pulse h-20" />
                {/* Card skeletons */}
                <div className="mt-6 flex gap-6 overflow-hidden lg:grid lg:grid-cols-5 lg:gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-[0_0_calc(50%-12px)] min-w-0 lg:flex-none"
                    >
                      <MediaCardSkeleton />
                    </div>
                  ))}
                </div>
              </>
            )}

            {!isPending && error && (
              <div className="bg-[var(--component-primary)] rounded-xl px-6 py-8 text-center mt-6">
                {errorStatus === 503 && (
                  <>
                    <h2 className="text-xl font-semibold text-white">
                      AI is temporarily unavailable
                    </h2>
                    <p className="text-base text-[var(--subtle)] mt-2">
                      Our discovery service is down. Please try again in a moment.
                    </p>
                  </>
                )}
                {errorStatus === 429 && (
                  <>
                    <h2 className="text-xl font-semibold text-white">
                      You've reached the query limit
                    </h2>
                    <p className="text-base text-[var(--subtle)] mt-2">
                      Try again in {Math.ceil((retryAfterSeconds ?? 30) / 60)} minutes.
                    </p>
                  </>
                )}
                {errorStatus === 400 && (
                  <>
                    <h2 className="text-xl font-semibold text-white">
                      Invalid query
                    </h2>
                    <p className="text-base text-[var(--subtle)] mt-2">
                      Your query couldn't be processed. Keep it under 500 characters and describe a movie or show.
                    </p>
                  </>
                )}
                {errorStatus !== 503 && errorStatus !== 429 && errorStatus !== 400 && (
                  <>
                    <h2 className="text-xl font-semibold text-white">
                      Something went wrong
                    </h2>
                    <p className="text-base text-[var(--subtle)] mt-2">
                      Please try again.
                    </p>
                  </>
                )}
              </div>
            )}

            {!isPending && !error && data && data.results.length === 0 && (
              <div className="bg-[var(--component-primary)] rounded-xl px-6 py-8 text-center mt-6">
                <h2 className="text-xl font-semibold text-white">
                  No matches found
                </h2>
                <p className="text-base text-[var(--subtle)] mt-2">
                  Try different words or describe the mood you're going for.
                </p>
              </div>
            )}

            {!isPending && !error && data && data.results.length > 0 && (
              <>
                <div className="mt-6">
                  <AiExplanation message={data.message} />
                </div>
                <div className="mt-6">
                  <AiResultsGrid results={data.results} />
                </div>
                <div className="mt-4">
                  <AiQuickActions
                    onRefine={handleRefine}
                    currentQuery={query}
                    resultTitles={data.results.map((r) => r.title)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
