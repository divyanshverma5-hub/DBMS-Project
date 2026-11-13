import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
} from '@mui/material'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AlbumIcon from '@mui/icons-material/Album'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import albumService from '../services/albumService'
import { usePlayer } from '../context/PlayerContext'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import { formatDate } from '../utils/formatters'

export default function AlbumDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playTrack } = usePlayer()

  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAlbumData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await albumService.getAlbumById(id)
      setAlbum(res?.album || null)
    } catch (err) {
      setError(err.message || 'Error loading album details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadAlbumData()
  }, [loadAlbumData])

  const handlePlayAll = () => {
    if (album?.tracks && album.tracks.length > 0) {
      // Find first playable track
      const firstPlayable = album.tracks.find((t) => t.youtube_video_id) || album.tracks[0]
      playTrack(firstPlayable, album.tracks)
    }
  }

  if (loading) {
    return <LoadingState message="Loading album tracks…" />
  }

  if (error || !album) {
    return (
      <ErrorState
        title="Album Not Found"
        message={error || 'This album does not exist in the database.'}
        onRetry={loadAlbumData}
      />
    )
  }

  const tracks = album.tracks || []

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/albums')}
        sx={{ mb: 3, color: '#64748b' }}
      >
        Back to Albums
      </Button>

      {/* Album Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: { xs: 140, md: 180 },
            height: { xs: 140, md: 180 },
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
        >
          {(album.cover_image_url || album.artist_image_url) ? (
            <img
              src={album.cover_image_url || album.artist_image_url}
              alt={album.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <AlbumIcon sx={{ fontSize: 80, color: '#94a3b8' }} />
          )}
        </Box>

        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            ALBUM RELEASE
          </Typography>
          <Typography variant="h3" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {album.title}
          </Typography>

          <Typography variant="subtitle1" sx={{ my: 1 }}>
            By{' '}
            <Link
              to={`/artists/${album.artist_id}`}
              style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}
            >
              {album.artist_name}
            </Link>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Release Date: {formatDate(album.release_date)} • {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
          >
            Play Album
          </Button>
        </Box>
      </Paper>

      {/* Ordered Tracklist */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Tracklist
        </Typography>

        {tracks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No tracks in this album yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {tracks.map((track, i) => (
              <TrackListItem
                key={track.track_id}
                track={{
                  ...track,
                  album_title: album.title,
                  cover_image_url: album.cover_image_url,
                  artist_image_url: album.artist_image_url,
                  artist_name: album.artist_name,
                }}
                index={i}
                showAlbum={false}
                playlistContext={tracks.map((t) => ({
                  ...t,
                  album_title: album.title,
                  cover_image_url: album.cover_image_url,
                  artist_name: album.artist_name,
                }))}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
