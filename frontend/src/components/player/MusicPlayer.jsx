import React from 'react'
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Alert,
  Chip,
} from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import { usePlayer } from '../../context/PlayerContext'
import { formatDuration } from '../../utils/formatters'

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackError,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
  } = usePlayer()

  if (!currentTrack) {
    return null
  }

  const handleSeekChange = (_, newValue) => {
    seek(newValue)
  }

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue)
  }

  const hasYouTubeVideo = Boolean(currentTrack.youtube_video_id)
  const hasAudioUrl = Boolean(currentTrack.audio_url && currentTrack.audio_url.trim())

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
        px: { xs: 2, md: 3 },
        py: 1.5,
      }}
    >
      {playbackError && (
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            py: 0.25,
            px: 2,
            mb: 1,
            fontSize: '0.8rem',
            borderRadius: 2,
            alignItems: 'center',
          }}
        >
          {playbackError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1, md: 3 },
          maxWidth: 1600,
          mx: 'auto',
        }}
      >
        {/* Left: Track Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: 140, sm: 220, md: 280 }, maxWidth: 360, gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              borderRadius: 2.5,
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {currentTrack.cover_image_url ? (
              <img
                src={currentTrack.cover_image_url}
                alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <MusicNoteIcon sx={{ color: '#94a3b8' }} />
            )}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              noWrap
              sx={{ color: '#0f172a', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
            >
              {currentTrack.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {currentTrack.artist_name || 'Unknown Artist'}
            </Typography>
            {currentTrack.energy !== undefined && currentTrack.energy !== null && (
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, mt: 0.25 }}>
                <Chip
                  size="small"
                  label={`⚡ ${(currentTrack.energy * 100).toFixed(0)}%`}
                  sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309' }}
                />
                <Chip
                  size="small"
                  label={`😊 ${(currentTrack.valence * 100).toFixed(0)}%`}
                  sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#ecfdf5', color: '#047857' }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Center: YouTube's own controls for YouTube-backed tracks; native controls for MP3 tracks */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, maxWidth: hasYouTubeVideo ? 360 : 640, minWidth: 0 }}>
          {hasYouTubeVideo ? (
            <Box sx={{ width: '100%', maxWidth: 300, aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 2, backgroundColor: '#0f172a' }}>
              <iframe
                key={currentTrack.youtube_video_id}
                title={`YouTube playback: ${currentTrack.title}`}
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(currentTrack.youtube_video_id)}?autoplay=1&controls=1&rel=0&playsinline=1`}
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          ) : (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Previous Track">
                  <IconButton size="small" onClick={prevTrack} sx={{ color: '#475569' }}>
                    <SkipPreviousRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={!hasAudioUrl ? 'No audio file available' : isPlaying ? 'Pause' : 'Play'}>
                  <span>
                    <IconButton
                      disabled={!hasAudioUrl}
                      onClick={togglePlay}
                      sx={{
                        backgroundColor: hasAudioUrl ? '#6366f1' : '#cbd5e1',
                        color: '#ffffff',
                        width: 40,
                        height: 40,
                        '&:hover': { backgroundColor: hasAudioUrl ? '#4f46e5' : '#cbd5e1' },
                      }}
                    >
                      {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Next Track">
                  <IconButton size="small" onClick={nextTrack} sx={{ color: '#475569' }}>
                    <SkipNextRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, mt: 0.25 }}>
                <Typography variant="caption" sx={{ color: '#64748b', minWidth: 32, textAlign: 'right', fontSize: '0.75rem' }}>
                  {formatDuration(currentTime)}
                </Typography>
                <Slider
                  size="small"
                  value={currentTime}
                  max={duration || currentTrack.duration_sec || 100}
                  onChange={handleSeekChange}
                  disabled={!hasAudioUrl || duration === 0}
                  sx={{
                    color: '#6366f1', height: 4,
                    '& .MuiSlider-thumb': { width: 10, height: 10 },
                    '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: '#94a3b8' },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', minWidth: 32, fontSize: '0.75rem' }}>
                  {formatDuration(duration || currentTrack.duration_sec)}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Right: Volume Controls */}
        <Box sx={{ display: hasYouTubeVideo ? 'none' : { xs: 'none', sm: 'flex' }, alignItems: 'center', width: 160, gap: 1 }}>
          <IconButton size="small" onClick={toggleMute} sx={{ color: '#64748b' }}>
            {isMuted || volume === 0 ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
          </IconButton>
          <Slider
            size="small"
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            sx={{
              color: '#64748b',
              width: 90,
              height: 4,
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
