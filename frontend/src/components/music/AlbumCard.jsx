import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AlbumIcon from '@mui/icons-material/Album'

export default function AlbumCard({ album }) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/albums/${album.album_id}`)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          pt: '100%', // 1:1 Aspect ratio square
          position: 'relative',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
        }}
      >
        {(album.cover_image_url || album.artist_image_url) ? (
          <img
            src={album.cover_image_url || album.artist_image_url}
            alt={album.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <AlbumIcon sx={{ fontSize: 60 }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#0f172a' }}>
          {album.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {album.artist_name || 'Artist'}
        </Typography>
        {album.release_date && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {album.release_date.substring(0, 4)}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
