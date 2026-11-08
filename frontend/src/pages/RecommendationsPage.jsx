import React, { useState, useEffect, useCallback } from 'react'
import {
  Alert, Box, Button, Chip, Grid, MenuItem, Paper, TextField, Typography,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import recommendationService from '../services/recommendationService'
import genreMoodService from '../services/genreMoodService'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import { formatScore, formatDateTime } from '../utils/formatters'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [moods, setMoods] = useState([])
  const [selectedMoodId, setSelectedMoodId] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generationInfo, setGenerationInfo] = useState(null)

  useEffect(() => {
    genreMoodService.getMoods()
      .then((res) => setMoods(res?.moods || []))
      .catch(() => setError('Could not load moods.'))
  }, [])

  const loadRecommendations = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await recommendationService.getUserRecommendations({
        mood_id: selectedMoodId || undefined,
        limit: 50,
      })
      setRecommendations(result?.recommendations || [])
    } catch (err) {
      setError(err.message || 'Could not load recommendations.')
    } finally {
      setLoading(false)
    }
  }, [selectedMoodId])

  useEffect(() => { loadRecommendations() }, [loadRecommendations])

  const generate = async () => {
    if (!selectedMoodId) return
    setGenerating(true)
    setError('')
    setGenerationInfo(null)
    try {
      const result = await recommendationService.generateRecommendations(
        Number(selectedMoodId), 20,
      )
      setRecommendations(result?.recommendations || [])
      setGenerationInfo(result)
    } catch (err) {
      setError(err.message || 'Could not generate recommendations.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <LoadingState message="Loading recommendations…" />

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Chip
          icon={<AutoAwesomeIcon />}
          label="VALENCE + ENERGY + BLOOM FILTER"
          color="secondary"
          size="small"
          sx={{ mb: 1.5 }}
        />
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Recommended for You
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Choose a mood to generate a ranked list. Previously heard tracks are screened
          using a Bloom Filter; remaining tracks are scored by valence and energy similarity.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Recommendations ({recommendations.length})
        </Typography>
        <TextField
          select
          size="small"
          label="Choose Mood"
          value={selectedMoodId}
          onChange={(event) => setSelectedMoodId(event.target.value)}
          sx={{ width: 220 }}
        >
          <MenuItem value="">Select a mood</MenuItem>
          {moods.map((mood) => (
            <MenuItem key={mood.mood_id} value={mood.mood_id}>{mood.name}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          disabled={!selectedMoodId || generating}
          onClick={generate}
        >
          {generating ? 'Generating…' : 'Generate for Mood'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {generationInfo && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Generated {generationInfo.count} recommendations. Bloom Filter screened
          {` ${generationInfo.excluded_previously_heard} `}previously heard track IDs
          {` (estimated false-positive rate: ${
            (generationInfo.bloom_filter?.estimated_false_positive_rate * 100 || 0).toFixed(2)
          }%).`}
        </Alert>
      )}

      {recommendations.length === 0 ? (
        <EmptyState
          icon={AutoAwesomeIcon}
          title="No Recommendations Found"
          description="Choose a mood and generate recommendations. Tracks without valence or energy metadata are skipped."
        />
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((rec) => (
            <Grid key={rec.rec_id} size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 3, border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2,
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
                    playlistContext={recommendations.map((item) => ({
                      track_id: item.track_id,
                      title: item.track_title,
                      artist_name: item.artist_name,
                      album_title: item.album_title,
                      cover_image_url: item.cover_image_url,
                      duration_sec: item.duration_sec,
                      valence: item.valence,
                      energy: item.energy,
                      audio_url: item.audio_url,
                    }))}
                  />
                </Box>
                <Box sx={{ minWidth: { md: 190 } }}>
                  <Chip size="small" label={rec.mood_name} color="secondary" sx={{ mb: 0.5 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Score: <strong>{formatScore(rec.score)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated {formatDateTime(rec.generated_at)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
