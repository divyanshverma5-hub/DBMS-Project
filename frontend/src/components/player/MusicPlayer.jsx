import React, { useEffect, useRef, useCallback } from 'react'
import { Box, Typography, IconButton, Stack, Tooltip, Alert, Chip } from '@mui/material'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { usePlayer } from '../../context/PlayerContext'

export default function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, playbackError, nextTrack, prevTrack, playerCollapsed, setPlayerCollapsed } = usePlayer()
  const iframeRef = useRef(null)

  const syncYouTubePlayback = useCallback(() => {
    const playerWindow = iframeRef.current?.contentWindow
    if (!playerWindow) return
    playerWindow.postMessage(JSON.stringify({
      event: 'command',
      func: isPlaying ? 'playVideo' : 'pauseVideo',
      args: [],
    }), 'https://www.youtube-nocookie.com')
  }, [isPlaying])

  useEffect(() => {
    syncYouTubePlayback()
  }, [syncYouTubePlayback, currentTrack?.youtube_video_id])
  if (!currentTrack) return null

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', px: { xs: 1.5, md: 3 }, py: playerCollapsed ? 1 : 1.25 }}>
      {playbackError && <Alert severity="warning" variant="filled" sx={{ py: 0.25, px: 2, mb: 1, fontSize: '0.8rem', borderRadius: 2 }}>{playbackError}</Alert>}
      <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative' }}>
        <Tooltip title={playerCollapsed ? 'Expand player' : 'Collapse player'}>
          <IconButton size="small" onClick={() => setPlayerCollapsed((value) => !value)} aria-label={playerCollapsed ? 'Expand player' : 'Collapse player'} sx={{ position: 'absolute', right: 0, top: playerCollapsed ? '50%' : 0, transform: playerCollapsed ? 'translateY(-50%)' : 'none', zIndex: 2, color: '#64748b' }}>
            {playerCollapsed ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </Tooltip>
        {playerCollapsed ? (
          <Box sx={{ minHeight: 52, display: 'flex', alignItems: 'center', gap: 1.5, pr: 5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', flexShrink: 0, bgcolor: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
              {currentTrack.cover_image_url ? <img src={currentTrack.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MusicNoteIcon sx={{ color: '#94a3b8' }} />}
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>{currentTrack.title}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{currentTrack.artist_name || 'Unknown Artist'} · YouTube playback</Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={isPlaying ? 'Pause' : 'Resume'}><IconButton size="small" onClick={togglePlay} aria-label={isPlaying ? 'Pause playback' : 'Resume playback'}>{isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}</IconButton></Tooltip>
              <Tooltip title="Previous track"><IconButton size="small" onClick={prevTrack}><SkipPreviousRoundedIcon /></IconButton></Tooltip>
              <Tooltip title="Next track"><IconButton size="small" onClick={nextTrack}><SkipNextRoundedIcon /></IconButton></Tooltip>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: 142, pr: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '1 1 0', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', flexShrink: 0, bgcolor: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
                {currentTrack.cover_image_url ? <img src={currentTrack.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MusicNoteIcon sx={{ color: '#94a3b8' }} />}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>{currentTrack.title}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">{currentTrack.artist_name || 'Unknown Artist'}</Typography>
                {currentTrack.energy != null && <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}><Chip size="small" label={'⚡ ' + (currentTrack.energy * 100).toFixed(0) + '%'} sx={{ height: 18, fontSize: '0.65rem' }} /><Chip size="small" label={'😊 ' + (currentTrack.valence * 100).toFixed(0) + '%'} sx={{ height: 18, fontSize: '0.65rem' }} /></Stack>}
              </Box>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Tooltip title={isPlaying ? 'Pause' : 'Resume'}><IconButton size="small" onClick={togglePlay} aria-label={isPlaying ? 'Pause playback' : 'Resume playback'}>{isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}</IconButton></Tooltip>
              <Tooltip title="Previous track"><IconButton size="small" onClick={prevTrack}><SkipPreviousRoundedIcon /></IconButton></Tooltip>
              <Tooltip title="Next track"><IconButton size="small" onClick={nextTrack}><SkipNextRoundedIcon /></IconButton></Tooltip>
            </Stack>
            {currentTrack.youtube_video_id ? (
              <Box sx={{ width: { xs: 176, sm: 220, md: 250 }, flexShrink: 0, aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 2, bgcolor: '#0f172a' }}>
                <iframe key={currentTrack.youtube_video_id} title={'YouTube playback: ' + currentTrack.title} ref={iframeRef} onLoad={syncYouTubePlayback} src={'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(currentTrack.youtube_video_id) + '?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1&origin=' + encodeURIComponent(window.location.origin)} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{ width: '100%', height: '100%', border: 0 }} />
              </Box>
            ) : <Typography variant="caption" color="error">YouTube video unavailable</Typography>}
          </Box>
        )}
      </Box>
    </Box>
  )
}
