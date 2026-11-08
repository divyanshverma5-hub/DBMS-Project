import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import recommendationService from '../services/recommendationService'
import genreMoodService from '../services/genreMoodService'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { formatScore, formatDateTime } from '../utils/formatters'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [moods, setMoods] = useState([])
  const [selectedMoodId, setSelectedMoodId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    genreMoodService.getMoods().then((res) => {
      if (res?.moods) setMoods(res.moods)
    }).catch(() => {})
  }, [])

  const loadRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await recommendationService.getUserRecommendations({
        mood_id: selectedMoodId || undefined,
        limit: 50,
      })
      setRecommendations(res?.recommendations || [])
    } catch (err) {
      setError(err.message || 'Error loading recommendations.')
    } finally {
      setLoading(false)
    }
  }, [selectedMoodId])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  if (loading) {
    return <LoadingState message="Fetching stored recommendation records…" />
  }

  if (error && recommendations.length === 0) {
    return (
      <ErrorState
        title="Recommendations Unavailable"
        message={error}
        onRetry={loadRecommendations}
      />
    )
  }

  return (
    <Box>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)',
          border: '1px solid #f0abfc',
        }}
      >
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          size="small"
          label="DATABASE RECOMMENDATIONS (TERNARY RELATIONSHIP)"
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            backgroundColor: '#c026d3',
            color: '#ffffff',
            mb: 1.5,
          }}
        />
        <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>
          Recommended for You
        </Typography>
        <Typography variant="body2" color="#701a75" sx={{ maxWidth: 640 }}>
          View stored recommendation records associated with your profile and emotional states,
          mapped from the ternary relationship <code>APP_USER × TRACK × MOOD</code> with millisecond timestamp precision.
        </Typography>
      </Paper>

      {/* Mood Filter Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Stored Recommendation Records ({recommendations.length})
        </Typography>
        <Box sx={{ width: 220 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Mood"
            value={selectedMoodId}
            onChange={(e) => setSelectedMoodId(e.target.value)}
          >
            <MenuItem value="">All Moods</MenuItem>
            {moods.map((m) => (
              <MenuItem key={m.mood_id} value={m.mood_id}>
                {m.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <EmptyState
          icon={AutoAwesomeIcon}
          title="No Recommendations Found"
          description="There are currently no pre-stored recommendation records for your account. Log more mood sessions and listen to tracks to populate recommendations."
        />
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((rec) => (
            <Grid key={rec.rec_id} size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <TrackListItem
                    track={{
                      track_id: rec.track_id,
                      title: rec.track_title,
                      artist_name: rec.artist_name,
                      album_title: rec.album_title,
                      cover_image_url: rec.cover_image_url,
                      duration_sec: rec.duration_sec,
                      valence: rec.valence,
                      energy: rec.energy,
                      audio_url: rec.audio_url,
                    }}
                    playlistContext={recommendations.map((r) => ({
                      track_id: r.track_id,
                      title: r.track_title,
                      artist_name: r.artist_name,
                      album_title: r.album_title,
                      cover_image_url: r.cover_image_url,
                      duration_sec: r.duration_sec,
                      valence: r.valence,
                      energy: r.energy,
                      audio_url: r.audio_url,
                    }))}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: { xs: 0, md: 2 },
                    borderLeft: { md: '1px solid #f1f5f9' },
                    minWidth: { md: 200 },
                    justifyContent: { xs: 'space-between', md: 'flex-start' },
                  }}
                >
                  <Box>
                    <Chip
                      size="small"
                      label={rec.mood_name}
                      sx={{ backgroundColor: '#fdf4ff', color: '#c026d3', fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Score: <strong>{formatScore(rec.score)}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Generated {formatDateTime(rec.generated_at)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
