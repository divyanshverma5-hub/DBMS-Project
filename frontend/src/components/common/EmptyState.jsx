import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import MusicOffIcon from '@mui/icons-material/MusicOff'

export default function EmptyState({
  icon: Icon = MusicOffIcon,
  title = 'No Items Found',
  description = 'There are no records matching your criteria or currently available in the catalogue.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 5,
        my: 4,
        borderRadius: 4,
        backgroundColor: '#ffffff',
        border: '1px dashed #cbd5e1',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: '#64748b',
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: actionLabel ? 3 : 0, maxWidth: 360 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
