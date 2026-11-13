import React from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import MoodRoundedIcon from '@mui/icons-material/MoodRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import AlbumRoundedIcon from '@mui/icons-material/AlbumRounded'
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useAuth } from '../../context/AuthContext'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Home', path: '/', icon: HomeRoundedIcon },
  { label: 'Explore Tracks', path: '/explore', icon: ExploreRoundedIcon },
  { label: 'Discover by Mood', path: '/moods', icon: MoodRoundedIcon },
  { label: 'Artists', path: '/artists', icon: PeopleAltRoundedIcon },
  { label: 'Albums', path: '/albums', icon: AlbumRoundedIcon },
  { divider: true },
  { label: 'Playlists', path: '/playlists', icon: QueueMusicRoundedIcon, authRequired: true },
  { label: 'Listening History', path: '/history', icon: HistoryRoundedIcon, authRequired: true },
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon, authRequired: true },
]

export default function Sidebar({ mobileOpen, onMobileClose, collapsed = false, onToggleCollapsed }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      {/* Brand Header */}
      <Box sx={{ p: collapsed ? 1.5 : 2.5, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            backgroundColor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <MoodRoundedIcon />
        </Box>
        {!collapsed && <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.2 }}>
            Music Mood
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Aura Recommender
          </Typography>
        </Box>}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton size="small" onClick={onToggleCollapsed} sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#64748b' }}>
            {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mx: 2, borderColor: '#f1f5f9' }} />

      {/* Nav List */}
      <List sx={{ px: collapsed ? 1 : 1.5, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
          }

          const IconComponent = item.icon
          const isActive = location.pathname === item.path

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onMobileClose}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: collapsed ? 1.25 : 1.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: isActive ? '#6366f1' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: isActive ? '#6366f1' : '#64748b' }}>
                  <IconComponent fontSize="small" />
                </ListItemIcon>
                {!collapsed && <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                      },
                    },
                  }}
                />}
              </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
      </List>

      {/* User Tier / Info Badge */}
      {isAuthenticated && user && !collapsed && (
        <Box sx={{ p: 2, m: 1.5, borderRadius: 2.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
            ACCOUNT STATUS
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
              {user.username}
            </Typography>
            <Chip
              size="small"
              label={user.account_type === 'premium' ? 'Premium' : 'Free Tier'}
              sx={{
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 600,
                backgroundColor: user.account_type === 'premium' ? '#fdf2f8' : '#eff6ff',
                color: user.account_type === 'premium' ? '#db2777' : '#2563eb',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: collapsed ? 76 : DRAWER_WIDTH }, flexShrink: { md: 0 }, transition: 'width 0.2s ease' }}>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #e2e8f0' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: collapsed ? 76 : DRAWER_WIDTH, borderRight: '1px solid #e2e8f0', transition: 'width 0.2s ease' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
