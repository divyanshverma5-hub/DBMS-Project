import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Chip,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ExploreIcon from '@mui/icons-material/Explore'
import MoodIcon from '@mui/icons-material/Mood'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '../context/AuthContext'
import trackService from '../services/trackService'
import artistService from '../services/artistService'
import albumService from '../services/albumService'
import genreMoodService from '../services/genreMoodService'
import TrackListItem from '../components/music/TrackListItem'
import ArtistCard from '../components/music/ArtistCard'
import AlbumCard from '../components/music/AlbumCard'
import MoodCard from '../components/music/MoodCard'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [moods, setMoods] = useState([])
  const [popularTracks, setPopularTracks] = useState([])
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [highlightAlbums, setHighlightAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [moodsRes, tracksRes, artistsRes, albumsRes] = await Promise.allSettled([
        genreMoodService.getMoods(),
        trackService.getTracks({ limit: 6, sort_by: 'popularity', sort_dir: 'DESC' }),
        artistService.getArtists({ limit: 6 }),
        albumService.getAlbums({ limit: 4 }),
      ])

      if (moodsRes.status === 'fulfilled' && moodsRes.value?.moods) {
        setMoods(moodsRes.value.moods)
      }
      if (tracksRes.status === 'fulfilled' && tracksRes.value?.tracks) {
        setPopularTracks(tracksRes.value.tracks)
      }
      if (artistsRes.status === 'fulfilled' && artistsRes.value?.artists) {
        setFeaturedArtists(artistsRes.value.artists)
      }
      if (albumsRes.status === 'fulfilled' && albumsRes.value?.albums) {
        setHighlightAlbums(albumsRes.value.albums)
      }

      // If all failed, show error
      if (
        moodsRes.status === 'rejected' &&
        tracksRes.status === 'rejected' &&
        artistsRes.status === 'rejected'
      ) {
        throw new Error(moodsRes.reason?.message || 'Could not connect to the backend API.')
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading your musical atmosphere…" />
  }

  if (error && popularTracks.length === 0 && moods.length === 0) {
    return (
      <ErrorState
        title="Backend Connectivity Error"
        message={`${error} (Note: If MySQL is not running locally, backend queries will fail. Ensure backend is running at http://localhost:5000)`}
        onRetry={loadHomeData}
      />
    )
  }

  return (
    <Box>
      {/* Welcome Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 5,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 50%, #ede9fe 100%)',
          border: '1px solid #c7d2fe',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.15)',
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Chip
            size="small"
            label="🎵 DBMS PROJECT • VALENCE & ENERGY SCORES"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              mb: 2,
            }}
          />
          <Typography
            variant="h4"
            fontWeight={800}
            color="#0f172a"
            sx={{ mb: 1.5, fontSize: { xs: '1.75rem', md: '2.4rem' }, lineHeight: 1.2 }}
          >
            {isAuthenticated && user
              ? `Welcome back, ${user.first_name || user.username}! How are you feeling?`
              : 'Discover music tuned to your emotional rhythm.'}
          </Typography>
          <Typography variant="body1" color="#475569" sx={{ mb: 3, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Explore tracks classified by valence (positivity) and energy (intensity), query relational mood hierarchies,
            and create personal playlists.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<MoodIcon />}
              onClick={() => navigate('/moods')}
              sx={{ px: 3, py: 1.25 }}
            >
              Discover by Mood
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ExploreIcon />}
              onClick={() => navigate('/explore')}
              sx={{
                px: 3,
                py: 1.25,
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                color: '#334155',
                '&:hover': { backgroundColor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Browse All Tracks
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Mood Entry Point Carousel/Grid */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Browse by Mood
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select an emotional state to find songs with matching valence and energy
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/moods')}
            sx={{ fontWeight: 600, color: '#6366f1' }}
          >
            All Moods
          </Button>
        </Box>

        <Grid container spacing={2}>
          {moods.slice(0, 4).map((m) => (
            <Grid key={m.mood_id} size={{ xs: 12, sm: 6, md: 3 }}>
              <MoodCard
                mood={m}
                onSelect={(selected) => navigate(`/moods?selected=${selected.mood_id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Popular Tracks Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Popular Tracks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Most streamed songs in the catalogue
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/explore')}
            sx={{ fontWeight: 600, color: '#6366f1' }}
          >
            See More
          </Button>
        </Box>

        {popularTracks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No track statistics available yet.
          </Typography>
        ) : (
          popularTracks.map((track, i) => (
            <TrackListItem
              key={track.track_id}
              track={track}
              index={i}
              playlistContext={popularTracks}
            />
          ))
        )}
      </Box>

      {/* Featured Artists Grid */}
      {featuredArtists.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Featured Artists
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Singers, composers, and bands across diverse styles
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/artists')}
              sx={{ fontWeight: 600, color: '#6366f1' }}
            >
              All Artists
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {featuredArtists.map((artist) => (
              <Grid key={artist.artist_id} size={{ xs: 6, sm: 4, md: 2 }}>
                <ArtistCard artist={artist} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Album Highlights */}
      {highlightAlbums.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Featured Albums
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Curated discography releases
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/albums')}
              sx={{ fontWeight: 600, color: '#6366f1' }}
            >
              All Albums
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {highlightAlbums.map((album) => (
              <Grid key={album.album_id} size={{ xs: 6, sm: 4, md: 3 }}>
                <AlbumCard album={album} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
