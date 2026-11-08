import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import PeopleIcon from '@mui/icons-material/People'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import userService from '../services/userService'
import LoadingState from '../components/common/LoadingState'
import { formatDate } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState(0) // 0 = Followers, 1 = Following
  const [profile, setProfile] = useState(null)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit Profile Dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

  // Change Password Dialog
  const [pwOpen, setPwOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(null)

  const loadProfileDetails = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authService.getMe()
      if (res?.user) {
        setProfile(res.user)
        setEditFirstName(res.user.first_name || '')
        setEditLastName(res.user.last_name || '')
        setEditCountry(res.user.country || '')
        setEditBirthDate(res.user.birth_date ? res.user.birth_date.substring(0, 10) : '')
        setEditImageUrl(res.user.profile_image_url || '')

        // Load followers / following
        const [flRes, fwRes] = await Promise.allSettled([
          userService.getFollowers(res.user.user_id),
          userService.getFollowing(res.user.user_id),
        ])
        if (flRes.status === 'fulfilled' && flRes.value?.followers) setFollowers(flRes.value.followers)
        if (fwRes.status === 'fulfilled' && fwRes.value?.following) setFollowing(fwRes.value.following)
      }
    } catch (err) {
      console.warn('Could not load detailed profile:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfileDetails()
  }, [loadProfileDetails])

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditSubmitting(true)
    setEditError(null)
    try {
      const res = await authService.updateProfile({
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        country: editCountry.trim() || null,
        birth_date: editBirthDate || null,
        profile_image_url: editImageUrl.trim() || null,
      })
      if (res?.user) {
        setProfile(res.user)
        updateUser(res.user)
      }
      setEditOpen(false)
    } catch (err) {
      setEditError(err.message || 'Could not update profile.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      setPwError('Please provide both current and new password.')
      return
    }
    setPwSubmitting(true)
    setPwError(null)
    setPwSuccess(null)
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword })
      setPwSuccess('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setTimeout(() => setPwOpen(false), 1200)
    } catch (err) {
      setPwError(err.message || 'Could not change password.')
    } finally {
      setPwSubmitting(false)
    }
  }

  if (loading && !profile) {
    return <LoadingState message="Loading your profile…" />
  }

  const p = profile || user

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="#0f172a">
          User Account & Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Personal metadata, age calculation, and ISA specialization plan details
        </Typography>
      </Box>

      {/* Main Profile Header */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 'auto' }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={p.profile_image_url || undefined}
              alt={p.username}
              sx={{
                width: 110,
                height: 110,
                bgcolor: '#6366f1',
                fontSize: '2.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
              }}
            >
              {p.first_name ? p.first_name.charAt(0).toUpperCase() : p.username.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          <Grid size={{ xs: 12, sm: 'grow' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography variant="h4" fontWeight={800} color="#0f172a">
                {p.first_name} {p.last_name}
              </Typography>
              <Chip
                icon={p.account_type === 'premium' ? <VerifiedIcon sx={{ fontSize: 16 }} /> : undefined}
                label={p.account_type === 'premium' ? `Premium (${p.plan_type || 'Standard'})` : 'Free Account'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: p.account_type === 'premium' ? '#fdf2f8' : '#eff6ff',
                  color: p.account_type === 'premium' ? '#db2777' : '#2563eb',
                }}
              />
            </Box>

            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{p.username} • {p.email}
            </Typography>

            <Typography variant="body2" color="#475569">
              Country: <strong>{p.country || 'Not specified'}</strong>
              {p.age !== null && p.age !== undefined ? ` • Age: ${p.age} years (via fn_age)` : ''}
              {p.birth_date ? ` • Birthday: ${formatDate(p.birth_date)}` : ''}
            </Typography>

            {p.account_type === 'free' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Daily Skip Limit: <strong>{p.daily_skip_limit || 6} skips</strong>
              </Typography>
            )}

            {p.account_type === 'premium' && p.valid_till && (
              <Typography variant="caption" color="#db2777" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                Subscription active until: {formatDate(p.valid_till)}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 'auto' }} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
              sx={{ flexGrow: 1 }}
            >
              Edit Profile
            </Button>
            <Button
              variant="text"
              startIcon={<LockResetIcon />}
              onClick={() => {
                setPwError(null)
                setPwSuccess(null)
                setPwOpen(true)
              }}
              sx={{ color: '#64748b', flexGrow: 1 }}
            >
              Password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Social Followers / Following Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label={`Followers (${followers.length})`} />
          <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label={`Following (${following.length})`} />
        </Tabs>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          {tab === 0 ? (
            followers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                You do not have any followers yet.
              </Typography>
            ) : (
              <List disablePadding>
                {followers.map((f) => (
                  <ListItem
                    key={f.user_id}
                    button
                    onClick={() => navigate(`/users/${f.user_id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={f.profile_image_url || undefined}>
                        {f.first_name ? f.first_name.charAt(0) : f.username.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${f.first_name} ${f.last_name}`}
                      secondary={`@${f.username} • Followed ${formatDate(f.followed_at)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )
          ) : (
            following.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                You are not following any other users yet.
              </Typography>
            ) : (
              <List disablePadding>
                {following.map((f) => (
                  <ListItem
                    key={f.user_id}
                    button
                    onClick={() => navigate(`/users/${f.user_id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={f.profile_image_url || undefined}>
                        {f.first_name ? f.first_name.charAt(0) : f.username.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${f.first_name} ${f.last_name}`}
                      secondary={`@${f.username} • Followed ${formatDate(f.followed_at)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )
          )}
        </Paper>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Profile</DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box component="form" id="edit-profile-form" onSubmit={handleEditSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  disabled={editSubmitting}
                  required
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  disabled={editSubmitting}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Country"
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value)}
              disabled={editSubmitting}
            />

            <TextField
              fullWidth
              type="date"
              label="Birth Date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={editSubmitting}
            />

            <TextField
              fullWidth
              label="Profile Picture URL"
              placeholder="https://images.unsplash.com/…"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              disabled={editSubmitting}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" variant="contained" disabled={editSubmitting}>
            {editSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Change Password</DialogTitle>
        <DialogContent dividers>
          {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
          {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
          <Box component="form" id="change-pw-form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              type="password"
              fullWidth
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={pwSubmitting}
              required
            />
            <TextField
              type="password"
              fullWidth
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={pwSubmitting}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwOpen(false)} disabled={pwSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="change-pw-form" variant="contained" disabled={pwSubmitting}>
            {pwSubmitting ? 'Updating…' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
