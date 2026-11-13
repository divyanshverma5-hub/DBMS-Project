import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import MoodRoundedIcon from '@mui/icons-material/MoodRounded'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [accountType, setAccountType] = useState('free')
  const [planType, setPlanType] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country: country.trim() || null,
        birth_date: birthDate || null,
        account_type: accountType,
        daily_skip_limit: accountType === 'free' ? 6 : null,
        plan_type: accountType === 'premium' ? planType : null,
        valid_months: accountType === 'premium' ? 12 : null,
      }

      await register(payload)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
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
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 5 },
          width: '100%',
          maxWidth: 580,
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <MoodRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join Music Mood to personalize your playlist and emotional music exploration
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Username"
            placeholder="e.g. music_lover88"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
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

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Country"
                placeholder="e.g. India, USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Birth Date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Account Specialization ISA Selection */}
          <Box sx={{ mt: 1, p: 2, borderRadius: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Account Type (ISA Specialization)
            </Typography>
            <RadioGroup
              row
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              sx={{ mb: accountType === 'premium' ? 2 : 0 }}
            >
              <FormControlLabel value="free" control={<Radio color="primary" />} label="Free User (6 skips/day)" />
              <FormControlLabel value="premium" control={<Radio color="primary" />} label="Premium User" />
            </RadioGroup>

            {accountType === 'premium' && (
              <TextField
                select
                fullWidth
                size="small"
                label="Premium Plan Type"
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="basic">Basic Plan (1 Month)</MenuItem>
                <MenuItem value="standard">Standard Plan (12 Months)</MenuItem>
                <MenuItem value="family">Family Plan (12 Months)</MenuItem>
              </TextField>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 1, py: 1.25, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register & Enter'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ color: '#6366f1', fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
