import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingState({ message = 'Loading music catalogue…' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress size={44} thickness={4} color="primary" />
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  )
}
