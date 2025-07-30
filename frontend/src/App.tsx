import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/home/HomePage";
import MediaDetailPage from "./pages/detailPage/MediaDetailPage";
import CreditsPage from "./pages/creditsPage/creditsPage";
import { Toaster } from "react-hot-toast";
import CreditsDetailPage from "./pages/creditsPage/creditsDetailPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-900 to-blue-950 text-white">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/shows"
            element={<div className="text-white text-center py-10 text-xl">Shows Page Coming Soon</div>}
          />
          <Route path="/media/:media_type/:id" element={<MediaDetailPage />} />
          <Route path="/media/:media_type/:id/credits" element={<CreditsPage />} />
          <Route path="/person/:id/:name" element={<CreditsDetailPage />} />
          <Route
            path="/my-list"
            element={<div className="text-white text-center py-10 text-xl">My List Page Coming Soon</div>}
          />
        </Routes>
      </main>
      <Footer />
      <>
        <Toaster position="bottom-center" />
        {/* your routes/components */}
      </>
    </div>
  );
}

export default App;
