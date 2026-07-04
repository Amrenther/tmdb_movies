import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import MovieDetails from "./pages/MovieDetails";
import { FavoritesPage, WatchlistPage } from "./pages/SavedPages";
import './App.css'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
