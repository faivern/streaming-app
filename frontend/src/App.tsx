import MovieList from './components/MovieList';
import Carousel from './components/TrendingCarousel';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div>
      <Header />
       <Routes>
        <Route path="/" element={<>
          <Carousel />
          <MovieList />
        </>} />
        <Route path="/shows" element={<div className="text-white">Shows Page Coming Soon</div>} />
      </Routes>
    </div>
  );
}

export default App;