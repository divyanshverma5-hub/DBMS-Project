import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Paper,
} from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import { usePlayer } from '../../context/PlayerContext'
import { formatDuration } from '../../utils/formatters'
import AddToPlaylistDialog from './AddToPlaylistDialog'

export default function TrackListItem({
  track,
  index = null,
  playlistContext = null,
  showAlbum = true,
}) {
  const { currentTrack, isPlaying, playTrack } = usePlayer()
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false)

  const isCurrentTrack = currentTrack?.track_id === track.track_id
  const isCurrentlyPlaying = isCurrentTrack && isPlaying
  const hasYouTubeVideo = Boolean(track.youtube_video_id)

  const handlePlayClick = () => {
    if (!isCurrentTrack) playTrack(track, playlistContext)
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          mb: 1,
          borderRadius: 3,
          backgroundColor: isCurrentTrack ? '#f5f3ff' : '#ffffff',
          border: isCurrentTrack ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: isCurrentTrack ? '#ede9fe' : '#f8fafc',
            borderColor: isCurrentTrack ? '#a78bfa' : '#cbd5e1',
          },
        }}
      >
        {/* Left: Play Button + Index + Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexGrow: 1 }}>
          {index !== null && (
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ width: 24, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}
            >
              {index + 1}
            </Typography>
          )}

          <Tooltip title={!hasYouTubeVideo ? 'YouTube video unavailable' : isCurrentlyPlaying ? 'Playing on YouTube' : 'Play on YouTube'}>
            <span>
              <IconButton
                size="small"
                disabled={!hasYouTubeVideo}
                onClick={handlePlayClick}
                sx={{
                  backgroundColor: isCurrentlyPlaying ? '#6366f1' : '#f1f5f9',
                  color: isCurrentlyPlaying ? '#ffffff' : hasYouTubeVideo ? '#4f46e5' : '#94a3b8',
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: isCurrentlyPlaying ? '#4f46e5' : '#e2e8f0',
                  },
                }}
              >
                <PlayArrowRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {(track.cover_image_url || track.artist_image_url) ? (
              <img
                src={track.cover_image_url || track.artist_image_url}
                alt={track.artist_name ? `${track.artist_name} photo` : track.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <MusicNoteIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            )}
          </Box>

          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              noWrap
              sx={{ color: isCurrentTrack ? '#6366f1' : '#0f172a' }}
            >
              {track.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {track.artist_name || 'Various Artists'}
              {showAlbum && track.album_title ? ` • ${track.album_title}` : ''}
            </Typography>
          </Box>
        </Box>

        {/* Center: Valence & Energy Badges */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 2 }}>
          {track.energy !== undefined && track.energy !== null && (
            <Tooltip title={`Energy Score: ${(track.energy * 100).toFixed(0)}%`}>
              <Chip
                size="small"
                label={`⚡ ${(track.energy * 100).toFixed(0)}%`}
                sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309' }}
              />
            </Tooltip>
          )}
          {track.valence !== undefined && track.valence !== null && (
            <Tooltip title={`Valence (Positivity): ${(track.valence * 100).toFixed(0)}%`}>
              <Chip
                size="small"
                label={`😊 ${(track.valence * 100).toFixed(0)}%`}
                sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#047857' }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Right: Duration + Add to Playlist */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ minWidth: 36, textAlign: 'right' }}>
            {formatDuration(track.duration_sec)}
          </Typography>

          <Tooltip title="Add to Playlist">
            <IconButton size="small" onClick={() => setPlaylistDialogOpen(true)} sx={{ color: '#64748b' }}>
              <PlaylistAddRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <AddToPlaylistDialog
        open={playlistDialogOpen}
        onClose={() => setPlaylistDialogOpen(false)}
        track={track}
      />
    </>
  )
}
