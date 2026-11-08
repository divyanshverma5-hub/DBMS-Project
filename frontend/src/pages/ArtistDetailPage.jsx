import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  Grid,
  Stack,
  Tabs,
  Tab,
  Button,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import AlbumIcon from '@mui/icons-material/Album'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import artistService from '../services/artistService'
import AlbumCard from '../components/music/AlbumCard'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

export default function ArtistDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [tab, setTab] = useState(0) // 0 = Tracks, 1 = Albums
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadArtistData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [artistRes, tracksRes] = await Promise.all([
        artistService.getArtistById(id),
        artistService.getArtistTracks(id),
      ])
      setArtist(artistRes?.artist || null)
      setTracks(tracksRes?.tracks || [])
    } catch (err) {
      setError(err.message || 'Error loading artist details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadArtistData()
  }, [loadArtistData])

  if (loading) {
    return <LoadingState message="Fetching artist profile & discography…" />
  }

  if (error || !artist) {
    return (
      <ErrorState
        title="Artist Not Found"
        message={error || 'This artist does not exist in the database.'}
        onRetry={loadArtistData}
      />
    )
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/artists')}
        sx={{ mb: 3, color: '#64748b' }}
      >
        Back to Artists
      </Button>

      {/* Hero Profile Banner */}
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
        <Avatar
          src={artist.image_url || undefined}
          alt={artist.name}
          sx={{
            width: { xs: 120, md: 150 },
            height: { xs: 120, md: 150 },
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            bgcolor: '#e0e7ff',
            color: '#4f46e5',
          }}
        >
          <PersonIcon sx={{ fontSize: 70 }} />
        </Avatar>

        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h3" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {artist.name}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ my: 0.5 }}>
            Origin: <strong>{artist.country || 'Global'}</strong> {artist.debut_year ? `• Debut Year: ${artist.debut_year}` : ''}
          </Typography>

          {/* Multivalued Attribute: Aliases */}
          {artist.aliases && artist.aliases.length > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
                Aliases:
              </Typography>
              {artist.aliases.map((alias) => (
                <Chip
                  key={alias}
                  label={alias}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tabs: Tracks vs Albums */}
      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab icon={<MusicNoteIcon fontSize="small" />} iconPosition="start" label={`Tracks (${tracks.length})`} />
        <Tab icon={<AlbumIcon fontSize="small" />} iconPosition="start" label={`Albums (${artist.albums?.length || 0})`} />
      </Tabs>

      {tab === 0 ? (
        <Box>
          {tracks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tracks recorded for this artist.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {tracks.map((track, idx) => (
                <TrackListItem
                  key={track.track_id}
                  track={track}
                  index={idx}
                  playlistContext={tracks}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        <Box>
          {!artist.albums || artist.albums.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No albums released yet.
            </Typography>
          ) : (
            <Grid container spacing={2.5}>
              {artist.albums.map((album) => (
                <Grid key={album.album_id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <AlbumCard album={{ ...album, artist_name: artist.name }} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
