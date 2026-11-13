import React, { createContext, useContext, useState, useRef, useCallback } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [playbackError, setPlaybackError] = useState(null)
  const [playerCollapsed, setPlayerCollapsed] = useState(false)

  const queueRef = useRef([])
  const queueIndexRef = useRef(-1)

  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return

    if (!track.youtube_video_id) {
      setPlaybackError('This track does not have a YouTube video linked yet.')
      setIsPlaying(false)
      return
    }

    if (Array.isArray(newQueue)) {
      setQueue(newQueue)
      queueRef.current = newQueue
      const idx = newQueue.findIndex((item) => item.track_id === track.track_id)
      const validIdx = idx !== -1 ? idx : 0
      setQueueIndex(validIdx)
      queueIndexRef.current = validIdx
    }

    setCurrentTrack(track)
    setPlaybackError(null)
    setIsPlaying(true)
  }, [])

  // YouTube's embedded player owns play, pause, seeking, and volume controls.
  // These compatibility values remain available to existing components.
  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => !playing)
  }, [])
  const setPlaybackState = useCallback((playing) => {
    setIsPlaying(Boolean(playing))
  }, [])
  const setPlaybackErrorMessage = useCallback((message) => {
    setPlaybackError(message || null)
  }, [])
  const seek = useCallback(() => {}, [])
  const setVolume = useCallback(() => {}, [])
  const toggleMute = useCallback(() => {}, [])

  const nextTrack = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0) return
    const nextIdx = (idx + 1) % q.length
    setQueueIndex(nextIdx)
    queueIndexRef.current = nextIdx
    playTrack(q[nextIdx])
  }, [playTrack])

  const prevTrack = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0) return
    const prevIdx = (idx - 1 + q.length) % q.length
    setQueueIndex(prevIdx)
    queueIndexRef.current = prevIdx
    playTrack(q[prevIdx])
  }, [playTrack])

  const value = {
    currentTrack,
    isPlaying,
    currentTime: 0,
    duration: currentTrack?.duration_sec || 0,
    volume: 1,
    isMuted: false,
    queue,
    queueIndex,
    playbackError,
    setPlaybackState,
    setPlaybackErrorMessage,
    playerCollapsed,
    setPlayerCollapsed,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider')
  return context
}

export default PlayerContext
