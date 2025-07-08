import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import MediaDetailPage from "./pages/media/MediaDetailPage";

function App() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-blue-950 min-h-screen text-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/shows"
          element={<div className="text-white text-center py-10 text-xl">Shows Page Coming Soon</div>}
        />
        <Route path="/media/:media_type/:id" element={<MediaDetailPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
