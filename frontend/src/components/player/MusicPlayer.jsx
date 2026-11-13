import React from 'react'
import { Box, Typography, IconButton, Stack, Tooltip, Alert, Chip } from '@mui/material'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import { usePlayer } from '../../context/PlayerContext'

export default function MusicPlayer() {
  const { currentTrack, playbackError, nextTrack, prevTrack } = usePlayer()

  if (!currentTrack) return null

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
        <Alert severity="warning" variant="filled" sx={{ py: 0.25, px: 2, mb: 1, fontSize: '0.8rem', borderRadius: 2 }}>
          {playbackError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 1, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: 110, sm: 180, md: 240 }, maxWidth: 320, gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentTrack.cover_image_url ? (
              <img src={currentTrack.cover_image_url} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <MusicNoteIcon sx={{ color: '#94a3b8' }} />
            )}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: '#0f172a' }}>{currentTrack.title}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{currentTrack.artist_name || 'Unknown Artist'}</Typography>
            {currentTrack.energy != null && (
              <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' }, mt: 0.25 }}>
                <Chip size="small" label={`⚡ ${(currentTrack.energy * 100).toFixed(0)}%`} sx={{ height: 18, fontSize: '0.65rem' }} />
                <Chip size="small" label={`😊 ${(currentTrack.valence * 100).toFixed(0)}%`} sx={{ height: 18, fontSize: '0.65rem' }} />
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, minWidth: 0, maxWidth: 480 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Tooltip title="Previous Track">
              <IconButton size="small" onClick={prevTrack} sx={{ color: '#475569' }}><SkipPreviousRoundedIcon /></IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">YouTube playback</Typography>
            <Tooltip title="Next Track">
              <IconButton size="small" onClick={nextTrack} sx={{ color: '#475569' }}><SkipNextRoundedIcon /></IconButton>
            </Tooltip>
          </Stack>
          {currentTrack.youtube_video_id ? (
            <Box sx={{ width: '100%', maxWidth: 360, aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 2, backgroundColor: '#0f172a' }}>
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
            <Typography variant="caption" color="error">This track does not have a YouTube video linked yet.</Typography>
          )}
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, width: { sm: 110, md: 180 } }} />
      </Box>
    </Box>
  )
}
