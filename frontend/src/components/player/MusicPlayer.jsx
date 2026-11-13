import React, { useEffect, useRef } from 'react'
import { Box, Typography, IconButton, Stack, Tooltip, Alert, Chip } from '@mui/material'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { usePlayer } from '../../context/PlayerContext'
import { useAuth } from '../../context/AuthContext'
import trackService from '../../services/trackService'

let youtubeApiPromise = null

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReadyCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReadyCallback === 'function') {
          try { previousReadyCallback() } catch (error) { console.warn('Existing YouTube callback failed:', error) }
        }
        resolve(window.YT)
      }

      let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.onerror = () => {
          youtubeApiPromise = null
          reject(new Error('Could not load the YouTube player API.'))
        }
        document.head.appendChild(script)
      }
    })
  }

  return youtubeApiPromise
}

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playbackError,
    setPlaybackState,
    setPlaybackErrorMessage,
    nextTrack,
    prevTrack,
    playerCollapsed,
    setPlayerCollapsed,
  } = usePlayer()
  const { isAuthenticated } = useAuth()
  const playerHostRef = useRef(null)
  const youtubePlayerRef = useRef(null)
  const isPlayingRef = useRef(isPlaying)
  const isAuthenticatedRef = useRef(isAuthenticated)

  isPlayingRef.current = isPlaying
  isAuthenticatedRef.current = isAuthenticated

  // Keep the YouTube player mounted while collapsed, but move it out of view.
  // The IFrame API provides reliable play-state events for listening-history tracking.
  useEffect(() => {
    if (!currentTrack?.youtube_video_id || !playerHostRef.current) return undefined

    const trackId = currentTrack.track_id
    const videoId = currentTrack.youtube_video_id
    let player = null
    let progressTimer = null
    let listenedSeconds = 0
    let lastVideoTime = null
    let active = true

    const stopProgressTimer = () => {
      if (progressTimer) {
        window.clearInterval(progressTimer)
        progressTimer = null
      }
      lastVideoTime = null
    }

    const flushListeningEvent = () => {
      const durationListened = Math.floor(listenedSeconds)
      listenedSeconds = 0
      if (!isAuthenticatedRef.current || durationListened < 1) return

      trackService.recordListen(trackId, durationListened).catch((error) => {
        console.warn('Could not save listening history:', error.message)
      })
    }

    const startProgressTimer = () => {
      if (progressTimer || !player) return
      try { lastVideoTime = player.getCurrentTime() } catch { lastVideoTime = null }

      progressTimer = window.setInterval(() => {
        if (!player) return
        try {
          const currentVideoTime = player.getCurrentTime()
          if (lastVideoTime !== null) {
            const delta = currentVideoTime - lastVideoTime
            // Count real playback progress, not buffering time or manual seek jumps.
            if (delta > 0 && delta <= 3) listenedSeconds += delta
          }
          lastVideoTime = currentVideoTime
        } catch {
          stopProgressTimer()
        }
      }, 1000)
    }

    loadYouTubeIframeApi()
      .then((YT) => {
        if (!active || !playerHostRef.current) return

        player = new YT.Player(playerHostRef.current, {
          width: '250',
          height: '141',
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!active) return
              player = event.target
              youtubePlayerRef.current = player
              if (isPlayingRef.current) player.playVideo()
              else player.pauseVideo()
            },
            onStateChange: (event) => {
              if (!active) return
              if (event.data === YT.PlayerState.PLAYING) {
                setPlaybackState(true)
                startProgressTimer()
              } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                stopProgressTimer()
                setPlaybackState(false)
                flushListeningEvent()
              } else if (event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
                stopProgressTimer()
              }
            },
            onError: () => {
              setPlaybackState(false)
              setPlaybackErrorMessage('YouTube could not play this video. Try another upload.')
            },
          },
        })
      })
      .catch((error) => {
        if (active) {
          setPlaybackState(false)
          setPlaybackErrorMessage(error.message)
        }
      })

    return () => {
      active = false
      stopProgressTimer()
      flushListeningEvent()
      if (player) {
        try { player.destroy() } catch (error) { console.warn('Could not destroy YouTube player:', error) }
      }
      if (youtubePlayerRef.current === player) youtubePlayerRef.current = null
    }
  }, [
    currentTrack?.track_id,
    currentTrack?.youtube_video_id,
    setPlaybackState,
    setPlaybackErrorMessage,
  ])

  // Drive the native YouTube player from the dock's play/pause button.
  useEffect(() => {
    const player = youtubePlayerRef.current
    if (!player) return
    try {
      if (isPlaying) player.playVideo()
      else player.pauseVideo()
    } catch (error) {
      console.warn('Could not update YouTube playback state:', error)
    }
  }, [isPlaying, currentTrack?.youtube_video_id])

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
              {(currentTrack.cover_image_url || currentTrack.artist_image_url) ? <img src={currentTrack.cover_image_url || currentTrack.artist_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MusicNoteIcon sx={{ color: '#94a3b8' }} />}
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
                {(currentTrack.cover_image_url || currentTrack.artist_image_url) ? <img src={currentTrack.cover_image_url || currentTrack.artist_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MusicNoteIcon sx={{ color: '#94a3b8' }} />}
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
          </Box>
        )}
        {currentTrack.youtube_video_id ? (
          <Box sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: { xs: 176, sm: 220, md: 250 },
            height: { xs: 99, sm: 124, md: 141 },
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: '#0f172a',
            opacity: playerCollapsed ? 0 : 1,
            pointerEvents: playerCollapsed ? 'none' : 'auto',
          }}>
            <div
              key={currentTrack.youtube_video_id}
              ref={playerHostRef}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        ) : !playerCollapsed && <Typography variant="caption" color="error">YouTube video unavailable</Typography>}
      </Box>
    </Box>
  )
}
