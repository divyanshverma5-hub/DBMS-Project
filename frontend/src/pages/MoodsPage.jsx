import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Alert,
  Paper,
  Tabs,
  Tab,
  Stack,
  Chip,
} from '@mui/material'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AppsIcon from '@mui/icons-material/Apps'
import { useSearchParams } from 'react-router-dom'
import genreMoodService from '../services/genreMoodService'
import trackService from '../services/trackService'
import { useAuth } from '../context/AuthContext'
import MoodCard from '../components/music/MoodCard'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

export default function MoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSelected = searchParams.get('selected')

  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(0) // 0 = Mood Grid, 1 = Recursive Hierarchy Tree
  const [moods, setMoods] = useState([])
  const [hierarchy, setHierarchy] = useState([])
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodTracks, setMoodTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tracksLoading, setTracksLoading] = useState(false)
  const [error, setError] = useState(null)

  // Log Mood Dialog State
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [logMoodId, setLogMoodId] = useState(1)
  const [logIntensity, setLogIntensity] = useState(3)
  const [logSubmitting, setLogSubmitting] = useState(false)
  const [logSuccessMsg, setLogSuccessMsg] = useState(null)
  const [logErrorMsg, setLogErrorMsg] = useState(null)

  const handleSelectMood = useCallback(async (mood) => {
    setSelectedMood(mood)
    setSearchParams({ selected: mood.mood_id })
    setTracksLoading(true)
    try {
      const res = await genreMoodService.getTracksByMood(mood.mood_id)
      setMoodTracks(res?.tracks || [])
    } catch (err) {
      console.warn('Error loading mood tracks:', err.message)
      setMoodTracks([])
    } finally {
      setTracksLoading(false)
    }
  }, [setSearchParams])

  const loadMoodsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, hRes] = await Promise.allSettled([
        genreMoodService.getMoods(),
        genreMoodService.getMoodHierarchy(),
      ])

      let loadedMoods = []
      if (mRes.status === 'fulfilled' && mRes.value?.moods) {
        loadedMoods = mRes.value.moods
        setMoods(loadedMoods)
      }
      if (hRes.status === 'fulfilled' && hRes.value?.hierarchy) {
        setHierarchy(hRes.value.hierarchy)
      }

      if (loadedMoods.length > 0) {
        const found = initialSelected
          ? loadedMoods.find((m) => String(m.mood_id) === String(initialSelected))
          : loadedMoods[0]
        if (found) {
          handleSelectMood(found)
        }
      }
    } catch (err) {
      setError(err.message || 'Error loading mood catalogue.')
    } finally {
      setLoading(false)
    }
  }, [initialSelected, handleSelectMood])

  useEffect(() => {
    loadMoodsData()
  }, [loadMoodsData])

  const handleOpenLogDialog = () => {
    setLogMoodId(selectedMood?.mood_id || (moods[0]?.mood_id || 1))
    setLogIntensity(3)
    setLogSuccessMsg(null)
    setLogErrorMsg(null)
    setLogDialogOpen(true)
  }

  const handleLogMoodSubmit = async () => {
    if (!isAuthenticated) return
    setLogSubmitting(true)
    setLogSuccessMsg(null)
    setLogErrorMsg(null)
    try {
      await trackService.logMood(logMoodId, logIntensity)
      setLogSuccessMsg('Emotional mood session recorded successfully!')
      setTimeout(() => {
        setLogDialogOpen(false)
      }, 1500)
    } catch (err) {
      setLogErrorMsg(err.message || 'Could not log mood.')
    } finally {
      setLogSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Mapping emotional mood hierarchy…" />
  }

  if (error && moods.length === 0) {
    return (
      <ErrorState
        title="Mood Catalogue Offline"
        message={error}
        onRetry={loadMoodsData}
      />
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">
            Discover by Mood
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Relational mood hierarchy taxonomy & emotional state sessions
          </Typography>
        </Box>

        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddReactionIcon />}
            onClick={handleOpenLogDialog}
            sx={{ flexShrink: 0 }}
          >
            Log Current Mood
          </Button>
        )}
      </Box>

      {/* Tabs: Grid vs Recursive Hierarchy Tree */}
      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab icon={<AppsIcon fontSize="small" />} iconPosition="start" label="Mood Catalog" />
        <Tab icon={<AccountTreeIcon fontSize="small" />} iconPosition="start" label="Recursive Hierarchy Tree (CTE)" />
      </Tabs>

      {tab === 0 ? (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {moods.map((mood) => (
            <Grid key={mood.mood_id} size={{ xs: 12, sm: 6, md: 3 }}>
              <MoodCard
                mood={mood}
                isSelected={selectedMood?.mood_id === mood.mood_id}
                onSelect={handleSelectMood}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Recursive CTE Hierarchy View */
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Recursive CTE Traversal (DBMS Query 15)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Computed via <code>WITH RECURSIVE mood_tree</code> demonstrating 1:N self-relationships with parent-child breadcrumbs.
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {hierarchy.map((item) => (
              <Paper
                key={item.mood_id}
                elevation={0}
                onClick={() => {
                  const m = moods.find((x) => x.mood_id === item.mood_id)
                  if (m) {
                    handleSelectMood(m)
                    setTab(0)
                  }
                }}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: item.level === 0 ? '#f8fafc' : '#ffffff',
                  pl: item.level === 0 ? 2 : 4,
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600} color={item.level === 0 ? '#6366f1' : '#0f172a'}>
                    {item.level === 0 ? 'Root:' : '↳ Child:'} {item.mood_name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`Level ${item.level}`}
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.breadcrumb_path}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Selected Mood Section & Tracklist */}
      {selectedMood && (
        <Box sx={{ mt: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Tracks Tagged with “{selectedMood.name}”
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedMood.description}
              </Typography>
            </Box>
            <Chip
              label={`${moodTracks.length} Songs`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {tracksLoading ? (
            <LoadingState message={`Fetching tracks tagged with ${selectedMood.name}…`} />
          ) : moodTracks.length === 0 ? (
            <EmptyState
              title={`No tracks tagged as ${selectedMood.name} yet`}
              description="Check another mood category or explore the general catalogue."
            />
          ) : (
            <Stack spacing={1}>
              {moodTracks.map((track, idx) => (
                <TrackListItem
                  key={track.track_id}
                  track={track}
                  index={idx}
                  playlistContext={moodTracks}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Log Mood Emotional Session Dialog */}
      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Log Mood Session</DialogTitle>
        <DialogContent dividers>
          {logErrorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {logErrorMsg}
            </Alert>
          )}
          {logSuccessMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {logSuccessMsg}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Record your current mood to build your emotional listening history.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
              SELECT CURRENT MOOD
            </Typography>
            <Grid container spacing={1}>
              {moods.map((m) => (
                <Grid key={m.mood_id} size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant={logMoodId === m.mood_id ? 'contained' : 'outlined'}
                    onClick={() => setLogMoodId(m.mood_id)}
                    sx={{ fontSize: '0.8rem', py: 1 }}
                  >
                    {m.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
              INTENSITY (1 = MILD, 5 = OVERWHELMING): {logIntensity}
            </Typography>
            <Slider
              value={logIntensity}
              min={1}
              max={5}
              step={1}
              marks
              onChange={(_, v) => setLogIntensity(v)}
              sx={{ color: '#6366f1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)} disabled={logSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLogMoodSubmit}
            disabled={logSubmitting}
          >
            {logSubmitting ? 'Recording…' : 'Record Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
