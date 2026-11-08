import React from 'react'
import { Typography, Button, Paper } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'Failed to load data from the server. Please verify the backend connection and try again.',
  onRetry = null,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        my: 4,
        borderRadius: 4,
        border: '1px solid #fee2e2',
        backgroundColor: '#fff5f5',
        maxWidth: 520,
        mx: 'auto',
      }}
    >
      <ErrorIcon sx={{ fontSize: 44, color: '#ef4444', mb: 1.5 }} />
      <Typography variant="h6" fontWeight={600} color="#991b1b" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="#7f1d1d" sx={{ mb: onRetry ? 2.5 : 0, maxWidth: 420 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            backgroundColor: '#ef4444',
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          Retry
        </Button>
      )}
    </Paper>
  )
}
