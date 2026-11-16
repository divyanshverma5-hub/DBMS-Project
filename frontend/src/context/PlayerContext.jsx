import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import trackService from '../services/trackService'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [playbackError, setPlaybackError] = useState(null)
  const [playerCollapsed, setPlayerCollapsed] = useState(false)
  const [skipStatus, setSkipStatus] = useState(null)

  const queueRef = useRef([])
  const queueIndexRef = useRef(-1)
  const skipInProgressRef = useRef(false)

  useEffect(() => {
    let active = true
    if (!isAuthenticated) {
      setCurrentTrack(null)
      setIsPlaying(false)
      setQueue([])
      setQueueIndex(-1)
      queueRef.current = []
      queueIndexRef.current = -1
      setSkipStatus(null)
      return undefined
    }

    trackService.getSkipStatus()
      .then((response) => { if (active) setSkipStatus(response?.skip_status || null) })
      .catch((error) => console.warn('Could not load daily skip allowance:', error.message))

    return () => { active = false }
  }, [isAuthenticated, user?.user_id])

  const playTrack = useCallback((track, newQueue = null) => {
    if (!isAuthenticated) {
      setPlaybackError('Please log in before playing music.')
      setIsPlaying(false)
      return
    }
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
  }, [isAuthenticated])

  const togglePlay = useCallback(() => {
    if (!isAuthenticated) {
      setPlaybackError('Please log in before playing music.')
      return
    }
    setIsPlaying((playing) => !playing)
  }, [isAuthenticated])
  const setPlaybackState = useCallback((playing) => setIsPlaying(Boolean(playing)), [])
  const setPlaybackErrorMessage = useCallback((message) => setPlaybackError(message || null), [])
  const seek = useCallback(() => {}, [])
  const setVolume = useCallback(() => {}, [])
  const toggleMute = useCallback(() => {}, [])

  const nextTrack = useCallback(async () => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0 || !currentTrack || skipInProgressRef.current) return
    if (!isAuthenticated) {
      setPlaybackError('Please log in before playing music.')
      return
    }
    skipInProgressRef.current = true
    try {
      const response = await trackService.recordSkip(currentTrack.track_id)
      if (response?.skip_status) setSkipStatus(response.skip_status)
    } catch (error) {
      setPlaybackError(error.message || 'Could not skip this track.')
      return
    } finally {
      skipInProgressRef.current = false
    }
    const nextIdx = (idx + 1) % q.length
    setQueueIndex(nextIdx)
    queueIndexRef.current = nextIdx
    playTrack(q[nextIdx])
  }, [currentTrack, isAuthenticated, playTrack])

  const prevTrack = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0 || !isAuthenticated) return
    const prevIdx = (idx - 1 + q.length) % q.length
    setQueueIndex(prevIdx)
    queueIndexRef.current = prevIdx
    playTrack(q[prevIdx])
  }, [isAuthenticated, playTrack])

  const value = {
    currentTrack, isPlaying, currentTime: 0,
    duration: currentTrack?.duration_sec || 0,
    volume: 1, isMuted: false, queue, queueIndex, playbackError,
    setPlaybackState, setPlaybackErrorMessage, playerCollapsed,
    setPlayerCollapsed, skipStatus, playTrack, togglePlay, seek,
    setVolume, toggleMute, nextTrack, prevTrack,
  }
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider')
  return context
}

export default PlayerContext
