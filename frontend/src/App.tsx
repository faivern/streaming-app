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

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-blue-950 text-white">
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
            path="/media/:media_type/:id/credits"
            element={<CreditsPage />}
            />
          <Route path="/person/:id/:name" element={<CreditsDetailPage />} />

          <Route
            path="/my-list"
            element={
              <div className="text-white text-center py-10 text-xl">
                My List Page Coming Soon
              </div>
            }
            />
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
        </Routes>
      </main>
      <Footer />
      <>
        <Toaster position="bottom-center" />
      </>
    </div>
  );
}

export default App;
