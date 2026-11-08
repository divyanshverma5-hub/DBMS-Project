import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useNavigate } from 'react-router-dom'
import playlistService from '../services/playlistService'
import genreMoodService from '../services/genreMoodService'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { formatDuration, formatDate } from '../utils/formatters'

export default function PlaylistsPage() {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create Playlist Dialog State
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMoodId, setNewMoodId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Delete Confirmation Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [plRes, mRes] = await Promise.all([
        playlistService.getUserPlaylists(),
        genreMoodService.getMoods().catch(() => ({ moods: [] })),
      ])
      setPlaylists(plRes?.playlists || [])
      setMoods(mRes?.moods || [])
    } catch (err) {
      setError(err.message || 'Error loading playlists.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      setFormError('Please enter a playlist name.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await playlistService.createPlaylist(newTitle.trim(), newMoodId ? parseInt(newMoodId, 10) : null)
      setCreateOpen(false)
      setNewTitle('')
      setNewMoodId('')
      loadData()
    } catch (err) {
      setFormError(err.message || 'Could not create playlist.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await playlistService.deletePlaylist(deleteTarget.playlist_no)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      setError(err.message || 'Could not delete playlist.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Fetching your personal playlists…" />
  }

  if (error && playlists.length === 0) {
    return (
      <ErrorState
        title="Playlists Unavailable"
        message={error}
        onRetry={loadData}
      />
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">
            Your Playlists
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your collections • Concurrency-safe per-user sequential numbering
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create Playlist
        </Button>
      </Box>

      {playlists.length === 0 ? (
        <EmptyState
          icon={QueueMusicIcon}
          title="No Playlists Yet"
          description="Create custom collections and tag them with your favorite mood themes."
          actionLabel="Create Playlist"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {playlists.map((pl) => (
            <Grid key={pl.playlist_no} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: 3.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)',
                  },
                }}
                onClick={() => navigate(`/playlists/${pl.playlist_no}`)}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QueueMusicIcon />
                    </Box>
                    {pl.mood_name && (
                      <Chip
                        label={pl.mood_name}
                        size="small"
                        sx={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" fontWeight={700} color="#0f172a" gutterBottom>
                    {pl.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#64748b' }}>
                    <Typography variant="caption">
                      {pl.track_count || 0} {pl.track_count === 1 ? 'track' : 'tracks'}
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      <Typography variant="caption">
                        {formatDuration(pl.total_duration_sec || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created {formatDate(pl.created_at)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(pl)
                    }}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Playlist</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" id="create-pl-form" onSubmit={handleCreateSubmit}>
            <TextField
              autoFocus
              fullWidth
              label="Playlist Name"
              placeholder="e.g. Morning Focus Flow"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2.5 }}
            />

            <TextField
              select
              fullWidth
              label="Mood Theme (Optional)"
              value={newMoodId}
              onChange={(e) => setNewMoodId(e.target.value)}
              disabled={submitting}
            >
              <MenuItem value="">No specific mood</MenuItem>
              {moods.map((m) => (
                <MenuItem key={m.mood_id} value={m.mood_id}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-pl-form"
            variant="contained"
            disabled={submitting || !newTitle.trim()}
          >
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Playlist Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Playlist?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This will remove the playlist and its track associations. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
