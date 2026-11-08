import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material'
import MoodRoundedIcon from '@mui/icons-material/MoodRounded'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loginIdentifier.trim() || !password) {
      setError('Please enter your username/email and password.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await login(loginIdentifier.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            backgroundColor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <MoodRoundedIcon sx={{ fontSize: 28 }} />
        </Box>

        <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
          Sign in to Music Mood
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your credentials to access playlists, ratings, and mood discovery.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Username or Email"
            placeholder="e.g. alex_smith or alex@example.com"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            disabled={loading}
            autoFocus
            required
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ py: 1.25, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account yet?{' '}
            <Link component={RouterLink} to="/register" sx={{ color: '#6366f1', fontWeight: 600 }}>
              Create an account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
