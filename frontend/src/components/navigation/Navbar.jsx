import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onMobileToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      navigate('/explore')
    }
  }

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    navigate('/')
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2, px: { xs: 2, md: 3 } }}>
        {/* Left: Mobile hamburger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' }, color: '#475569' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Quick Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: 3,
              px: 2,
              py: 0.5,
              width: { xs: 180, sm: 280, md: 360 },
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: '#6366f1',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.12)',
              },
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search tracks, artists, albums…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%', fontSize: '0.875rem' }}
            />
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {!isAuthenticated ? (
            <>
              <Button
                variant="text"
                color="inherit"
                onClick={() => navigate('/login', { state: { from: location } })}
                sx={{ color: '#475569', fontWeight: 600 }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 600 }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textTransform: 'none',
                  p: 0.5,
                  borderRadius: 3,
                }}
              >
                <Avatar
                  src={user.profile_image_url || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#6366f1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{user.username}
                  </Typography>
                </Box>
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    borderRadius: 3,
                    minWidth: 190,
                    mt: 1.5,
                    border: '1px solid #e2e8f0',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <PersonRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/playlists'); }}>
                  <ListItemIcon>
                    <QueueMusicRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  My Playlists
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                  <ListItemIcon sx={{ color: '#ef4444' }}>
                    <LogoutRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Log Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
