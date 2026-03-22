import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BottomNav from "./components/layout/BottomNav";
import ScrollToTop from "./components/layout/ScrollToTop";
import Loading from "./components/feedback/Loading";
import ErrorBoundary from "./components/feedback/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { SignInModalProvider } from "./context/SignInModalContext";
import SignInModal from "./components/auth/SignInModal";

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

function App() {
  // Theme is managed by useTheme hook (persisted to localStorage)
  useTheme();

  return (
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
          <Route path="/media/:media_type/:id" element={<MediaDetailPage />} />
          <Route
            path="/media/:media_type/:id/credits"
            element={<CreditsPage />}
          />
          <Route path="/person/:id/:name" element={<CreditsDetailPage />} />

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
          <Route path="/genre/:genreId" element={<GenreDetailPage />} />
          <Route
            path="/collections/:collectionId"
            element={<CollectionPage />}
          />
          <Route path="/provider/:providerId" element={<ProviderPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
      <Footer />
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
  );
}

export default App;