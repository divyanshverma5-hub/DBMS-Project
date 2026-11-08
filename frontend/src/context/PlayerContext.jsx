import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import trackService from '../services/trackService'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio())
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [playbackError, setPlaybackError] = useState(null)

  // Track listening metrics
  const sessionListenedRef = useRef(0)
  const lastTimeRef = useRef(0)
  const activeTrackRef = useRef(null)

  // Flush listening history on track change or completion
  const flushListeningRecord = useCallback(async (trackToRecord, listenedSec) => {
    if (!trackToRecord || !trackToRecord.track_id) return
    const roundedSec = Math.round(listenedSec)
    // Only record if user listened for at least 3 seconds
    if (roundedSec >= 3) {
      try {
        await trackService.recordListen(trackToRecord.track_id, roundedSec)
      } catch (err) {
        // Silently catch if not logged in or backend unavailable
        console.debug('Listening record flush skipped or failed:', err.message)
      }
    }
  }, [])

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    audio.volume = volume

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (!audio.paused && audio.currentTime > lastTimeRef.current) {
        const delta = audio.currentTime - lastTimeRef.current
        // Guard against massive jump from seek
        if (delta > 0 && delta < 2) {
          sessionListenedRef.current += delta
        }
      }
      lastTimeRef.current = audio.currentTime
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setPlaybackError(null)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      lastTimeRef.current = audio.currentTime
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      flushListeningRecord(activeTrackRef.current, sessionListenedRef.current)
      sessionListenedRef.current = 0
      // Auto play next in queue if available
      nextTrack()
    }

    const handleError = () => {
      setIsPlaying(false)
      setPlaybackError('Unable to stream this audio file. The source may be offline or restricted.')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [flushListeningRecord, volume])

  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return

    // If new queue provided, replace queue
    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue)
      const idx = newQueue.findIndex((t) => t.track_id === track.track_id)
      setQueueIndex(idx !== -1 ? idx : 0)
    }

    // Flush previous track's listening record
    if (activeTrackRef.current && sessionListenedRef.current >= 3) {
      flushListeningRecord(activeTrackRef.current, sessionListenedRef.current)
    }

    sessionListenedRef.current = 0
    lastTimeRef.current = 0
    activeTrackRef.current = track
    setCurrentTrack(track)
    setPlaybackError(null)

    const audio = audioRef.current
    if (!track.audio_url || !track.audio_url.trim()) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      setPlaybackError('No streamable audio URL provided for this track.')
      setIsPlaying(false)
      return
    }

    audio.src = track.audio_url
    audio.load()
    audio.play().catch((err) => {
      console.warn('Playback initiation error:', err.message)
      setPlaybackError('Playback error: ' + err.message)
      setIsPlaying(false)
    })
  }, [flushListeningRecord])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!currentTrack) return

    if (isPlaying) {
      audio.pause()
    } else {
      if (playbackError) return
      audio.play().catch((err) => {
        setPlaybackError('Playback error: ' + err.message)
      })
    }
  }, [currentTrack, isPlaying, playbackError])

  const seek = useCallback((timeInSec) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = timeInSec
      setCurrentTime(timeInSec)
      lastTimeRef.current = timeInSec
    }
  }, [])

  const setVolume = useCallback((newVolume) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false)
      if (audioRef.current) audioRef.current.volume = volume || 0.8
    } else {
      setIsMuted(true)
      if (audioRef.current) audioRef.current.volume = 0
    }
  }, [isMuted, volume])

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return
    const nextIdx = (queueIndex + 1) % queue.length
    setQueueIndex(nextIdx)
    playTrack(queue[nextIdx])
  }, [queue, queueIndex, playTrack])

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return
    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      seek(0)
      return
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length
    setQueueIndex(prevIdx)
    playTrack(queue[prevIdx])
  }, [queue, queueIndex, playTrack, seek])

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    playbackError,
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
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

export default PlayerContext
