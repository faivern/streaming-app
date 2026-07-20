import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import Header from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BottomNav from "./components/layout/BottomNav";
import CookieBanner from "./components/layout/CookieBanner";
import ScrollToTop from "./components/layout/ScrollToTop";
import Loading from "./components/feedback/Loading";
import ErrorBoundary from "./components/feedback/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { SignInModalProvider } from "./context/SignInModalContext";
import { AiDiscoverSessionProvider } from "./context/AiDiscoverSessionContext";
import SignInModal from "./components/auth/SignInModal";
import AiDiscoverCta from "./components/aiDiscover/AiDiscoverCta";

// Lazy-loaded page components (route-based code splitting)
const HomePage = lazy(() => import("./pages/home/HomePage"));
const MediaDetailPage = lazy(() => import("./pages/detailPage/MediaDetailPage"));
const CreditsPage = lazy(() => import("./pages/creditsPage/creditsPage"));
const CreditsDetailPage = lazy(() => import("./pages/creditsPage/creditsDetailPage"));
const GenreDetailPage = lazy(() => import("./pages/genreDetailPage/GenreDetailPage"));
const CollectionPage = lazy(() => import("./pages/collectionPage/collectionPage"));
const MyListsPage = lazy(() => import("./pages/myLists"));
const ListInsightsPage = lazy(() => import("./pages/insights/ListInsightsPage"));
const MasterInsightsPage = lazy(() => import("./pages/insights/MasterInsightsPage"));
const ProviderPage = lazy(() => import("./pages/providerPage/ProviderPage"));
const ProvidersPage = lazy(() => import("./pages/providersPage/ProvidersPage"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const AiDiscoverPage = lazy(() => import("./pages/aiDiscover/AiDiscoverPage"));
const NotFoundPage = lazy(() => import("./pages/notFound"));
const BadRequestPage = lazy(() => import("./pages/status/BadRequestPage"));
const UnauthorizedPage = lazy(() => import("./pages/status/UnauthorizedPage"));
const ForbiddenPage = lazy(() => import("./pages/status/ForbiddenPage"));
const ServiceUnavailablePage = lazy(() => import("./pages/status/ServiceUnavailablePage"));

// Legacy redirect components for old URL patterns
function LegacyMediaRedirect() {
  const { media_type, id } = useParams();
  return <Navigate to={`/${media_type}/${id}`} replace />;
}
function LegacyMediaCreditsRedirect() {
  const { media_type, id } = useParams();
  return <Navigate to={`/${media_type}/${id}/credits`} replace />;
}
function LegacyPersonRedirect() {
  const { id, name } = useParams();
  return <Navigate to={`/person/${id}${name ? `-${name}` : ""}`} replace />;
}
function LegacyCollectionRedirect() {
  const { collectionId } = useParams();
  return <Navigate to={`/collection/${collectionId}`} replace />;
}

function App() {
  useTheme();
  const { pathname } = useLocation();
  const hideFooter = pathname === "/discover/ai";

  return (
    <AiDiscoverSessionProvider>
    <SignInModalProvider>
    <div className="min-h-dvh flex flex-col bg-background text-white scrollbar">
      <Header />
      <main className="flex-grow pb-bottom-nav md:pb-0">
        <ScrollToTop />
        <ErrorBoundary>
        <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/shows"
            element={
              <div className="text-white text-center py-10 text-xl">
                Shows Page Coming Soon
              </div>
            }
          />
          {/* SEO-friendly routes */}
          <Route path="/movie/:id" element={<MediaDetailPage mediaType="movie" />} />
          <Route path="/movie/:id/credits" element={<CreditsPage mediaType="movie" />} />
          <Route path="/tv/:id" element={<MediaDetailPage mediaType="tv" />} />
          <Route path="/tv/:id/credits" element={<CreditsPage mediaType="tv" />} />
          <Route path="/person/:id" element={<CreditsDetailPage />} />

          <Route path="/lists" element={<MyListsPage />} />
          <Route path="/list/:id/insights" element={<ListInsightsPage />} />
          <Route path="/lists/insights" element={<MasterInsightsPage />} />
          <Route
            path="/movies"
            element={
              <div className="text-white text-center py-10 text-xl">
                Movies Page Coming Soon
              </div>
            }
          />
          <Route path="/genre/:genreId/:mediaType?" element={<GenreDetailPage />} />
          <Route path="/collection/:collectionId" element={<CollectionPage />} />
          <Route path="/provider/:providerId" element={<ProviderPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/discover/ai" element={<AiDiscoverPage />} />

          {/* Legacy redirects for old URL patterns */}
          <Route path="/media/:media_type/:id" element={<LegacyMediaRedirect />} />
          <Route path="/media/:media_type/:id/credits" element={<LegacyMediaCreditsRedirect />} />
          <Route path="/person/:id/:name" element={<LegacyPersonRedirect />} />
          <Route path="/collections/:collectionId" element={<LegacyCollectionRedirect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Status pages — dev-only test routes */}
          {import.meta.env.DEV && (
            <>
              <Route path="/status/400" element={<BadRequestPage />} />
              <Route path="/status/401" element={<UnauthorizedPage />} />
              <Route path="/status/403" element={<ForbiddenPage />} />
              <Route path="/status/503" element={<ServiceUnavailablePage />} />
            </>
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
      <AiDiscoverCta />
      <CookieBanner />
      {!hideFooter && <Footer />}
      <Toaster
        position="bottom-center"
        containerStyle={{
          bottom: "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + 0.5rem)",
        }}
        toastOptions={{
          style: {
            background: "var(--component-primary)",
            color: "var(--text-h1)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />
      <SignInModal />
    </div>
    </SignInModalProvider>
    </AiDiscoverSessionProvider>
  );
}

export default App;