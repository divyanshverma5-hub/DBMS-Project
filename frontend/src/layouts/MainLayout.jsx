import React, { useState } from 'react'
import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import Navbar from '../components/navigation/Navbar'
import MusicPlayer from '../components/player/MusicPlayer'
import { usePlayer } from '../context/PlayerContext'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentTrack } = usePlayer()

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          width: { md: 'calc(100% - 240px)' },
          minHeight: '100vh',
        }}
      >
        <Navbar onMobileToggle={handleMobileToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: { xs: 2.5, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            // Add padding when music player is active to prevent content cutoff
            pb: currentTrack ? { xs: 14, md: 16 } : 4,
          }}
        >
          <Container maxWidth="xl" disableGutters>
            <Outlet />
          </Container>
        </Box>

        {/* Persistent Bottom Music Player */}
        <MusicPlayer />
      </Box>
    </Box>
  )
}
