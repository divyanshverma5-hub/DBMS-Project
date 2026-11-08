import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Chip,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import userService from '../services/userService'
import { useAuth } from '../context/AuthContext'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import { formatDate } from '../utils/formatters'

export default function UserProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user: currentUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await userService.getUserProfile(id)
      setProfile(res?.profile || null)
    } catch (err) {
      setError(err.message || 'Error loading user profile.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !profile) return
    setActionLoading(true)
    try {
      if (profile.is_following) {
        await userService.unfollowUser(profile.user_id)
        setProfile((prev) => ({
          ...prev,
          is_following: false,
          followers_count: Math.max(0, (prev.followers_count || 1) - 1),
        }))
      } else {
        await userService.followUser(profile.user_id)
        setProfile((prev) => ({
          ...prev,
          is_following: true,
          followers_count: (prev.followers_count || 0) + 1,
        }))
      }
    } catch (err) {
      console.warn('Follow action failed:', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Fetching member profile…" />
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="User Not Found"
        message={error || 'This user profile does not exist.'}
        onRetry={loadProfile}
      />
    )
  }

  const isSelf = currentUser && currentUser.user_id === profile.user_id

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: '#64748b' }}
      >
        Back
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 'auto' }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={profile.profile_image_url || undefined}
              alt={profile.username}
              sx={{
                width: 110,
                height: 110,
                bgcolor: '#6366f1',
                fontSize: '2.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
              }}
            >
              {profile.first_name ? profile.first_name.charAt(0) : profile.username.charAt(0)}
            </Avatar>
          </Grid>

          <Grid size={{ xs: 12, sm: 'grow' }}>
            <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>
              {profile.first_name} {profile.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
              Location: <strong>{profile.country || 'Global'}</strong> • Member since {formatDate(profile.joined_at)}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${profile.followers_count || 0} Followers`}
                sx={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}
              />
              <Chip
                label={`${profile.following_count || 0} Following`}
                sx={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}
              />
              <Chip
                label={`${profile.public_playlists_count || 0} Public Playlists`}
                sx={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}
              />
            </Box>
          </Grid>

          {!isSelf && isAuthenticated && (
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button
                variant={profile.is_following ? 'outlined' : 'contained'}
                color={profile.is_following ? 'inherit' : 'primary'}
                startIcon={profile.is_following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                onClick={handleFollowToggle}
                disabled={actionLoading}
              >
                {profile.is_following ? 'Following' : 'Follow'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
