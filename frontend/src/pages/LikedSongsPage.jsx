import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Chip, Stack } from '@mui/material'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import likedSongsService from '../services/likedSongsService'

export default function LikedSongsPage() {
  const [tracks, setTracks] = useState([])
  const [moods, setMoods] = useState([])
  const [selectedMood, setSelectedMood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [songResult, moodResult] = await Promise.all([
        likedSongsService.getLikedSongs(selectedMood ? { mood_id: selectedMood } : {}),
        likedSongsService.getLikedMoods(),
      ])
      setTracks(songResult?.tracks || [])
      setMoods(moodResult?.moods || [])
    } catch (err) {
      setError(err.message || 'Could not load your liked songs.')
    } finally {
      setLoading(false)
    }
  }, [selectedMood])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState message="Loading your Liked Songs…" />
  if (error) return <ErrorState title="Liked Songs Unavailable" message={error} onRetry={load} />

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
          <FavoriteRoundedIcon sx={{ color: '#e11d48', fontSize: 30 }} />
          <Typography variant="h4" fontWeight={800} color="#0f172a">Liked Songs</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Your saved tracks, grouped by the moods already assigned in the music catalogue.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
        <Chip label="All moods" clickable color={selectedMood === null ? 'primary' : 'default'} variant={selectedMood === null ? 'filled' : 'outlined'} onClick={() => setSelectedMood(null)} />
        {moods.map((mood) => (
          <Chip key={mood.mood_id} label={mood.name} clickable color={selectedMood === mood.mood_id ? 'primary' : 'default'} variant={selectedMood === mood.mood_id ? 'filled' : 'outlined'} onClick={() => setSelectedMood(mood.mood_id)} />
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}{selectedMood ? ' in this mood' : ' liked'}
      </Typography>

      {tracks.length === 0 ? (
        <EmptyState
          icon={FavoriteRoundedIcon}
          title={selectedMood ? 'No liked songs in this mood' : 'Your library is empty'}
          description={selectedMood ? 'Try another mood or choose All moods.' : 'Tap the heart beside any track to save it here.'}
        />
      ) : tracks.map((track, index) => <TrackListItem key={track.track_id} track={track} index={index} showAlbum />)}
    </Box>
  )
}
