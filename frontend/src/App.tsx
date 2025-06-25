import Carousel from './components/TrendingCarousel';
import Header from './components/Header';
import MediaGrid from './components/MediaGrid';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-blue-950 min-h-screen ">
      <Header />
       <Routes>
        <Route path="/" element={<>
          <Carousel />
          <main className="pt-20">
          <MediaGrid type="movie" />
          </main>
        </>} />
        <Route path="/shows" element={<div className="text-white">Shows Page Coming Soon</div>} />
      </Routes>
    </div>
  );
}

export default App;