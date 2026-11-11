import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import WordsPage from './pages/WordsPage';
import PracticePage from './pages/PracticePage';
import RoadmapPage from './pages/RoadmapPage';
import StorePage from './pages/StorePage';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Main Application with Sidebar Layout */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/category-list" element={<CategoriesPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/quiz" element={<Navigate to="/practice?mode=quiz" replace />} />
            <Route path="/games" element={<Navigate to="/practice?mode=match" replace />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap/:pathId" element={<RoadmapPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
