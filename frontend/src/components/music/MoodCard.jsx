import React from 'react'
import { Card, CardContent, Typography, Box, Chip } from '@mui/material'

const MOOD_METADATA = {
  1: { emoji: '🌊', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' }, // Calm
  2: { emoji: '⚡', color: '#d97706', bg: '#fffbeb', border: '#fde68a' }, // Energetic
  3: { emoji: '🌧️', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' }, // Sad
  4: { emoji: '☀️', color: '#eab308', bg: '#fefce8', border: '#fef08a' }, // Happy
  5: { emoji: '🎯', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }, // Focus
  6: { emoji: '🚀', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' }, // Euphoric
  7: { emoji: '🍂', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' }, // Nostalgic
  8: { emoji: '🌈', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }, // Optimistic
}

export default function MoodCard({ mood, isSelected = false, onSelect = null }) {
  const meta = MOOD_METADATA[mood.mood_id] || {
    emoji: '🎵',
    color: '#6366f1',
    bg: '#f8fafc',
    border: '#e2e8f0',
  }

  return (
    <Card
      onClick={() => onSelect && onSelect(mood)}
      sx={{
        cursor: onSelect ? 'pointer' : 'default',
        backgroundColor: isSelected ? meta.bg : '#ffffff',
        border: isSelected ? `2px solid ${meta.color}` : `1px solid ${meta.border}`,
        borderRadius: 4,
        boxShadow: isSelected ? `0 8px 20px -6px ${meta.color}40` : '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 10px 24px -8px ${meta.color}50`,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              backgroundColor: meta.bg,
              border: `1px solid ${meta.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            {meta.emoji}
          </Box>
          {mood.tagged_tracks_count !== undefined && (
            <Chip
              size="small"
              label={`${mood.tagged_tracks_count} tracks`}
              sx={{
                fontSize: '0.7rem',
                height: 22,
                backgroundColor: isSelected ? '#ffffff' : meta.bg,
                color: meta.color,
                fontWeight: 600,
                border: `1px solid ${meta.border}`,
              }}
            />
          )}
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5 }}>
          {mood.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.85rem',
            lineHeight: 1.4,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {mood.description || 'Emotional mood profile for audio recommendation.'}
        </Typography>

        {mood.parent_mood_name && (
          <Typography variant="caption" sx={{ color: meta.color, fontWeight: 600, mt: 1 }}>
            ↳ Sub-mood of {mood.parent_mood_name}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
