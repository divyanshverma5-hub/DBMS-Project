import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import HeadsetIcon from '@mui/icons-material/Headset'
import MoodIcon from '@mui/icons-material/Mood'
import trackService from '../services/trackService'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { formatDuration, formatDateTime } from '../utils/formatters'

export default function HistoryPage() {
  const [tab, setTab] = useState(0)
  const [listeningHistory, setListeningHistory] = useState([])
  const [moodLogs, setMoodLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [lhRes, mlRes] = await Promise.all([
        trackService.getListeningHistory({ limit: 50 }),
        trackService.getMoodLogHistory().catch(() => ({ mood_logs: [] })),
      ])
      setListeningHistory(lhRes?.history || [])
      setMoodLogs(mlRes?.mood_logs || [])
    } catch (err) {
      setError(err.message || 'Error loading listening history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  if (loading) {
    return <LoadingState message="Retrieving your stream history & mood logs…" />
  }

  if (error && listeningHistory.length === 0 && moodLogs.length === 0) {
    return (
      <ErrorState
        title="History Unavailable"
        message={error}
        onRetry={loadHistory}
      />
    )
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'Full Play':
        return <Chip size="small" label="Full Play" color="success" sx={{ fontWeight: 600, height: 22 }} />
      case 'Skipped':
        return <Chip size="small" label="Skipped (<30s)" color="error" sx={{ fontWeight: 600, height: 22 }} />
      default:
        return <Chip size="small" label="Partial" color="info" sx={{ fontWeight: 600, height: 22 }} />
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0f172a">
          Listening & Mood History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track streams with completion percentages and emotional session records
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
        <Tab icon={<HeadsetIcon fontSize="small" />} iconPosition="start" label={`Stream History (${listeningHistory.length})`} />
        <Tab icon={<MoodIcon fontSize="small" />} iconPosition="start" label={`Mood Log Sessions (${moodLogs.length})`} />
      </Tabs>

      {tab === 0 ? (
        listeningHistory.length === 0 ? (
          <EmptyState
            icon={HeadsetIcon}
            title="No Streams Recorded Yet"
            description="Play tracks from the catalogue to start recording your listening activity."
          />
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Track & Artist</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Played At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Duration Listened</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Completion %</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listeningHistory.map((item) => (
                  <TableRow key={item.listen_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.track_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.artist_name} • {item.album_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(item.played_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(item.duration_listened_sec)} / {formatDuration(item.full_duration_sec)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#6366f1">
                        {item.completion_pct}%
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(item.playback_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        moodLogs.length === 0 ? (
          <EmptyState
            icon={MoodIcon}
            title="No Mood Sessions Logged Yet"
            description="Visit the 'Discover by Mood' page to log your current emotional states."
          />
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mood</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Intensity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Logged At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moodLogs.map((log) => (
                  <TableRow key={log.log_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600} color="#0f172a">
                        {log.mood_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={`${log.intensity} / 5`} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(log.logged_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  )
}
