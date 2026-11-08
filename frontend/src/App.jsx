import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import MoodsPage from './pages/MoodsPage'
import ArtistsPage from './pages/ArtistsPage'
import ArtistDetailPage from './pages/ArtistDetailPage'
import AlbumsPage from './pages/AlbumsPage'
import AlbumDetailPage from './pages/AlbumDetailPage'
import PlaylistsPage from './pages/PlaylistsPage'
import PlaylistDetailPage from './pages/PlaylistDetailPage'
import HistoryPage from './pages/HistoryPage'
import RatingsPage from './pages/RatingsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ProfilePage from './pages/ProfilePage'
import UserProfilePage from './pages/UserProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Application Shell */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="moods" element={<MoodsPage />} />
                <Route path="artists" element={<ArtistsPage />} />
                <Route path="artists/:id" element={<ArtistDetailPage />} />
                <Route path="albums" element={<AlbumsPage />} />
                <Route path="albums/:id" element={<AlbumDetailPage />} />
                <Route path="users/:id" element={<UserProfilePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="playlists"
                  element={
                    <ProtectedRoute>
                      <PlaylistsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="playlists/:playlistNo"
                  element={
                    <ProtectedRoute>
                      <PlaylistDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ratings"
                  element={
                    <ProtectedRoute>
                      <RatingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="recommendations"
                  element={
                    <ProtectedRoute>
                      <RecommendationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
