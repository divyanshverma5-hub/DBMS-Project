import React from 'react'
import { Card, Typography, Box, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Person'

export default function ArtistCard({ artist }) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/artists/${artist.artist_id}`)}
      sx={{
        cursor: 'pointer',
        textAlign: 'center',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Avatar
        src={artist.image_url || undefined}
        alt={artist.name}
        sx={{
          width: 100,
          height: 100,
          mb: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          bgcolor: '#e0e7ff',
          color: '#4f46e5',
        }}
      >
        <PersonIcon sx={{ fontSize: 50 }} />
      </Avatar>

      <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ width: '100%', color: '#0f172a' }}>
        {artist.name}
      </Typography>

      <Typography variant="caption" color="text.secondary" noWrap sx={{ width: '100%' }}>
        {artist.country || 'Global'} {artist.debut_year ? `• Debut ${artist.debut_year}` : ''}
      </Typography>

      {artist.albums_count !== undefined && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>
            {artist.albums_count} {artist.albums_count === 1 ? 'Album' : 'Albums'}
          </Typography>
        </Box>
      )}
    </Card>
  )
}
