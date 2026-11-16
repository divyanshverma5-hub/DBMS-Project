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

  const nextTrack = useCallback(async ({ automatic = false } = {}) => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (!currentTrack || skipInProgressRef.current) return
    if (!isAuthenticated) {
      setPlaybackError('Please log in before playing music.')
      return
    }

    // Manual track changes use the daily allowance. Natural track completion
    // advances automatically and never consumes one of the user's skips.
    if (!automatic && skipStatus?.account_type === 'free' && Number(skipStatus.skips_remaining) <= 0) {
      setPlaybackError('You have used all 6 free skips for today.')
      return
    }

    skipInProgressRef.current = true
    try {
      let activeQueue = q
      let nextIdx

      // Tracks started from a single card may not have a playlist queue.
      // In that case, fetch the catalogue and build a queue so Next still works.
      if (activeQueue.length === 0) {
        const response = await trackService.getTracks({
          limit: 100,
          sort_by: 'popularity',
          sort_dir: 'DESC',
        })
        const candidates = (response?.tracks || []).filter((track) =>
          track.youtube_video_id &&
          Number(track.track_id) !== Number(currentTrack.track_id)
        )

        if (candidates.length === 0) {
          throw new Error('No other playable tracks are available right now.')
        }

        const randomIndex = Math.floor(Math.random() * candidates.length)
        activeQueue = [currentTrack, ...candidates]
        nextIdx = randomIndex + 1
      } else {
        nextIdx = (idx + 1) % activeQueue.length
      }

      if (!automatic) {
        const response = await trackService.recordSkip(currentTrack.track_id)
        if (response?.skip_status) setSkipStatus(response.skip_status)
      }

      setQueue(activeQueue)
      queueRef.current = activeQueue
      setQueueIndex(nextIdx)
      queueIndexRef.current = nextIdx
      playTrack(activeQueue[nextIdx], activeQueue)
    } catch (error) {
      setPlaybackError(error.message || (automatic ? 'Could not play the next track.' : 'Could not skip this track.'))
    } finally {
      skipInProgressRef.current = false
    }
  }, [currentTrack, isAuthenticated, playTrack, skipStatus])

  const prevTrack = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0 || !isAuthenticated) return
    if (skipStatus?.account_type === 'free' && Number(skipStatus.skips_remaining) <= 0) {
      setPlaybackError('You have used all 6 free skips for today.')
      return
    }
    const prevIdx = (idx - 1 + q.length) % q.length
    setQueueIndex(prevIdx)
    queueIndexRef.current = prevIdx
    playTrack(q[prevIdx])
  }, [isAuthenticated, playTrack, skipStatus])

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
