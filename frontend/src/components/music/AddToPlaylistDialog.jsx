import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import AddIcon from '@mui/icons-material/Add'
import playlistService from '../../services/playlistService'
import { useAuth } from '../../context/AuthContext'

export default function AddToPlaylistDialog({ open, onClose, track }) {
  const { isAuthenticated } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && isAuthenticated) {
      loadPlaylists()
      setError(null)
      setSuccessMsg(null)
      setIsCreating(false)
      setNewPlaylistName('')
    }
  }, [open, isAuthenticated])

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const data = await playlistService.getUserPlaylists()
      setPlaylists(data?.playlists || [])
    } catch (err) {
      setError(err.message || 'Could not load playlists.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistNo) => {
    if (!track) return
    setSubmitting(true)
    setError(null)
    try {
      await playlistService.addTrackToPlaylist(playlistNo, track.track_id)
      setSuccessMsg(`"${track.title}" added to playlist!`)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Could not add track to playlist.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAndAdd = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim() || !track) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await playlistService.createPlaylist(newPlaylistName.trim())
      const pNo = created.playlist_no
      await playlistService.addTrackToPlaylist(pNo, track.track_id)
      setSuccessMsg(`Created playlist and added "${track.title}"!`)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Could not create playlist.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Log in required</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Please log in or register to save tracks to your personal playlists.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Add to Playlist
        {track && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {track.title} — {track.artist_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {isCreating ? (
          <Box component="form" onSubmit={handleCreateAndAdd} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Create New Playlist
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="e.g. Chill Evening Vibes"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setIsCreating(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                type="submit"
                disabled={submitting || !newPlaylistName.trim()}
              >
                {submitting ? 'Creating…' : 'Create & Add'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Button
              startIcon={<AddIcon />}
              fullWidth
              variant="outlined"
              sx={{ mb: 2, borderStyle: 'dashed' }}
              onClick={() => setIsCreating(true)}
            >
              Create New Playlist
            </Button>

            <Divider sx={{ my: 1.5 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : playlists.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                You have no playlists yet. Create your first one above!
              </Typography>
            ) : (
              <List sx={{ pt: 0 }}>
                {playlists.map((pl) => (
                  <ListItem key={pl.playlist_no} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleAddToPlaylist(pl.playlist_no)}
                      disabled={submitting}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: '#6366f1' }}>
                        <QueueMusicIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={pl.name}
                        secondary={`${pl.track_count || 0} tracks ${pl.mood_name ? `• ${pl.mood_name}` : ''}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
