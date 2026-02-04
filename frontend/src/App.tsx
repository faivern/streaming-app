import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/home/HomePage";
import MediaDetailPage from "./pages/detailPage/MediaDetailPage";
import CreditsPage from "./pages/creditsPage/creditsPage";
import { Toaster } from "react-hot-toast";
import CreditsDetailPage from "./pages/creditsPage/creditsDetailPage";
import GenreDetailPage from "./pages/genreDetailPage/GenreDetailPage";
import CollectionPage from "./pages/collectionPage/collectionPage";
import ScrollToTop from "./components/layout/ScrollToTop";
import MyListsPage from "./pages/myLists";
import ProviderPage from "./pages/providerPage/ProviderPage";
import ProvidersPage from "./pages/providersPage/ProvidersPage";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import { useTheme } from "./hooks/useTheme";

function App() {
  // Theme is managed by useTheme hook (persisted to localStorage)
  useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background text-white scrollbar">
      <Header />
      <main className="flex-grow">
        <ScrollToTop />
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
            path="/media/:mediaType/:id/credits"
            element={<CreditsPage />}
          />
          <Route path="/person/:id/:name" element={<CreditsDetailPage />} />

          <Route path="/lists" element={<MyListsPage />} />
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
      </main>
      <Footer />
      <Toaster
        position="bottom-center"
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
    </div>
  );
}

export default App;