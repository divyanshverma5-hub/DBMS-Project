import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import ratingService from '../services/ratingService'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { formatDateTime } from '../utils/formatters'

export default function RatingsPage() {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRatings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ratingService.getUserRatings()
      setRatings(res?.ratings || [])
    } catch (err) {
      setError(err.message || 'Error loading your ratings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const handleUpdateRating = async (trackId, newRating) => {
    if (!newRating) return
    try {
      await ratingService.rateTrack(trackId, newRating)
      setRatings((prev) =>
        prev.map((r) => (r.track_id === trackId ? { ...r, rating: newRating } : r))
      )
    } catch (err) {
      console.warn('Could not update rating:', err.message)
    }
  }

  const handleDeleteRating = async (trackId) => {
    try {
      await ratingService.deleteRating(trackId)
      setRatings((prev) => prev.filter((r) => r.track_id !== trackId))
    } catch (err) {
      setError(err.message || 'Could not remove rating.')
    }
  }

  if (loading) {
    return <LoadingState message="Fetching your submitted track ratings…" />
  }

  if (error && ratings.length === 0) {
    return (
      <ErrorState
        title="Ratings Unavailable"
        message={error}
        onRetry={loadRatings}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0f172a">
          My Ratings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Songs rated by you (1 to 5 stars) • Implements SQL UPSERT semantics
        </Typography>
      </Box>

      {ratings.length === 0 ? (
        <EmptyState
          icon={StarRoundedIcon}
          title="No Ratings Submitted Yet"
          description="Browse tracks and rate your favorite songs to track your personal taste."
        />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table size="medium">
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Song & Album</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Artist</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Your Rating</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rated On</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratings.map((item) => (
                <TableRow key={item.track_id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.track_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.album_title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.artist_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Rating
                      size="small"
                      value={item.rating}
                      onChange={(_, val) => handleUpdateRating(item.track_id, val)}
                      sx={{ color: '#f59e0b' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(item.rated_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove rating">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRating(item.track_id)}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
