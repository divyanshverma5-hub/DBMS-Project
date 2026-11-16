import React, { useEffect, useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import likedSongsService from '../../services/likedSongsService'

export default function LikeButton({ track, size = 'small' }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (!isAuthenticated || !track?.track_id) { setLiked(false); return undefined }
    likedSongsService.getLikeStatus(track.track_id)
      .then((result) => { if (active) setLiked(Boolean(result?.liked)) })
      .catch((error) => console.warn('Could not load like status:', error.message))
    return () => { active = false }
  }, [isAuthenticated, track?.track_id])

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (busy) return
    setBusy(true)
    try {
      if (liked) {
        await likedSongsService.unlikeSong(track.track_id)
        setLiked(false)
        window.dispatchEvent(new CustomEvent('liked-songs:updated'))
      } else {
        await likedSongsService.likeSong(track.track_id)
        setLiked(true)
        window.dispatchEvent(new CustomEvent('liked-songs:updated'))
      }
    } catch (error) {
      console.error('Could not update liked songs:', error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Tooltip title={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}>
      <span>
        <IconButton size={size} onClick={handleClick} disabled={busy} aria-label={liked ? 'Unlike song' : 'Like song'} sx={{ color: liked ? '#e11d48' : '#64748b' }}>
          {liked ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
