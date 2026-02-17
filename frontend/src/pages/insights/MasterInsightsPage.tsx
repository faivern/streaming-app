import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useMasterInsights } from "../../hooks/insights";
import { useUserLists } from "../../hooks/lists/useLists";
import {
  HeroStatCard,
  GenreDonutCard,
  TopGenresCard,
  RatingComparisonCard,
  TopPeopleCard,
  ActiveMonthCard,
  ReleaseYearCard,
} from "../../components/insights/cards";
import BentoGrid from "../../components/insights/layout/BentoGrid";
import InsightsEmptyState from "../../components/insights/states/InsightsEmptyState";
import InsightsSkeleton from "../../components/insights/states/InsightsSkeleton";

export default function MasterInsightsPage() {
  const navigate = useNavigate();
  const { data: insights, isLoading } = useMasterInsights();
  const { data: lists = [] } = useUserLists();

  const handleBrowse = () => {
    navigate("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 md:px-8 py-6 mt-20 lg:mt-24 max-w-7xl mx-auto">
        <InsightsSkeleton />
      </div>
    );
  }

  // Empty state (less than 3 items across all lists)
  if (!insights || insights.totalCount < 3) {
    return (
      <div className="px-4 md:px-8 py-6 mt-20 lg:mt-24 max-w-7xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/lists" className="text-subtle hover:text-text-h1 transition-colors">
                Lists
              </Link>
            </li>
            <li className="text-subtle">/</li>
            <li className="text-text-h1" aria-current="page">
              All Insights
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/lists"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-component-primary/40 hover:bg-component-primary/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-h1" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-h1">All Lists Insights</h1>
            <p className="text-sm text-subtle mt-1">
              Aggregated from {lists.length} {lists.length === 1 ? "list" : "lists"}
            </p>
          </div>
        </div>

        <InsightsEmptyState onBrowse={handleBrowse} />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 mt-20 lg:mt-24 max-w-7xl mx-auto">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link to="/lists" className="text-subtle hover:text-text-h1 transition-colors">
              Lists
            </Link>
          </li>
          <li className="text-subtle">/</li>
          <li className="text-text-h1" aria-current="page">
            All Insights
          </li>
        </ol>
      </nav>

      {/* Page title with back button and subtitle */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/lists"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-component-primary/40 hover:bg-component-primary/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-text-h1" />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-h1">All Lists Insights</h1>
          <p className="text-sm text-subtle mt-1">
            Aggregated from {lists.length} {lists.length === 1 ? "list" : "lists"}
          </p>
        </div>
      </div>

      {/* Bento grid with subtle gradient background */}
      <div className="relative">
        {/* Background gradient for glassmorphism depth */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl" />
        </div>

        <BentoGrid>
          <HeroStatCard totalCount={insights.totalCount} />
          <GenreDonutCard data={insights.genreDistribution} />
          <TopPeopleCard
            actors={insights.topActors}
            directors={insights.topDirectors}
          />
          <TopGenresCard genres={insights.topGenres} />
          <RatingComparisonCard data={insights.ratingComparison} />
          <ActiveMonthCard data={insights.mostActiveMonth} />
          <ReleaseYearCard data={insights.releaseYearBreakdown} />
        </BentoGrid>
      </div>
    </div>
  );
}
