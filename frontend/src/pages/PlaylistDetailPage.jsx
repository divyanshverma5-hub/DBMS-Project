import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import playlistService from '../services/playlistService'
import genreMoodService from '../services/genreMoodService'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { formatDuration } from '../utils/formatters'

export default function PlaylistDetailPage() {
  const { playlistNo } = useParams()
  const navigate = useNavigate()
  const { playTrack } = usePlayer()
  const { user } = useAuth()

  const [playlist, setPlaylist] = useState(null)
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editMoodId, setEditMoodId] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

  const loadPlaylistData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [plRes, mRes] = await Promise.all([
        playlistService.getPlaylistById(playlistNo),
        genreMoodService.getMoods().catch(() => ({ moods: [] })),
      ])
      const pl = plRes?.playlist || null
      setPlaylist(pl)
      setMoods(mRes?.moods || [])
      if (pl) {
        setEditName(pl.name)
        setEditMoodId(pl.mood_id || '')
      }
    } catch (err) {
      setError(err.message || 'Error loading playlist.')
    } finally {
      setLoading(false)
    }
  }, [playlistNo])

  useEffect(() => {
    loadPlaylistData()
  }, [loadPlaylistData])

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const firstPlayable = playlist.tracks.find((t) => t.audio_url) || playlist.tracks[0]
      playTrack(firstPlayable, playlist.tracks)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      await playlistService.updatePlaylist(playlistNo, {
        name: editName.trim(),
        mood_id: editMoodId ? parseInt(editMoodId, 10) : null,
      })
      setEditOpen(false)
      loadPlaylistData()
    } catch (err) {
      setEditError(err.message || 'Could not update playlist.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleRemoveTrack = async (trackId) => {
    try {
      await playlistService.removeTrackFromPlaylist(playlistNo, trackId)
      // Optimistically update tracks list
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.track_id !== trackId),
      }))
    } catch (err) {
      setError(err.message || 'Could not remove track.')
    }
  }

  if (loading) {
    return <LoadingState message="Loading playlist tracks…" />
  }

  if (error || !playlist) {
    return (
      <ErrorState
        title="Playlist Not Found"
        message={error || 'This playlist does not exist or you do not have permission to view it.'}
        onRetry={loadPlaylistData}
      />
    )
  }

  const tracks = playlist.tracks || []
  const isOwner = user && user.username === playlist.owner_username

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/playlists')}
        sx={{ mb: 3, color: '#64748b' }}
      >
        Back to Playlists
      </Button>

      {/* Playlist Header Banner */}
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
            width: { xs: 120, md: 150 },
            height: { xs: 120, md: 150 },
            borderRadius: 3.5,
            backgroundColor: '#e0e7ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)',
          }}
        >
          <QueueMusicIcon sx={{ fontSize: 70 }} />
        </Box>

        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            PLAYLIST #{playlist.playlist_no}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Typography variant="h3" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              {playlist.name}
            </Typography>
            {isOwner && (
              <IconButton size="small" onClick={() => setEditOpen(true)} sx={{ color: '#64748b' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
            Created by <strong>{playlist.owner_username}</strong>
            {playlist.mood_name ? ` • Themed for ${playlist.mood_name}` : ''} • {tracks.length} tracks (
            {formatDuration(playlist.total_duration_sec || 0)})
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            sx={{ mt: 1 }}
          >
            Play All
          </Button>
        </Box>
      </Paper>

      {/* Playlist Tracks List */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Tracks in this Playlist
        </Typography>

        {tracks.length === 0 ? (
          <EmptyState
            title="Playlist is Empty"
            description="Explore tracks in the catalogue and click the 'Add to Playlist' icon to build this playlist."
            actionLabel="Explore Music"
            onAction={() => navigate('/explore')}
          />
        ) : (
          tracks.map((track, idx) => (
            <Box key={track.track_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <TrackListItem
                  track={track}
                  index={idx}
                  playlistContext={tracks}
                />
              </Box>
              {isOwner && (
                <Tooltip title="Remove track from playlist">
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveTrack(track.track_id)}
                    sx={{ color: '#94a3b8', mb: 1, '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))
        )}
      </Box>

      {/* Edit Playlist Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Playlist Details</DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box component="form" id="edit-pl-form" onSubmit={handleEditSubmit}>
            <TextField
              autoFocus
              fullWidth
              label="Playlist Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={editSubmitting}
              sx={{ mb: 2.5 }}
            />

            <TextField
              select
              fullWidth
              label="Mood Theme"
              value={editMoodId}
              onChange={(e) => setEditMoodId(e.target.value)}
              disabled={editSubmitting}
            >
              <MenuItem value="">No mood tag</MenuItem>
              {moods.map((m) => (
                <MenuItem key={m.mood_id} value={m.mood_id}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-pl-form"
            variant="contained"
            disabled={editSubmitting || !editName.trim()}
          >
            {editSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
