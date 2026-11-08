import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import artistService from '../services/artistService'
import ArtistCard from '../components/music/ArtistCard'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'

export default function ArtistsPage() {
  const [artists, setArtists] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadArtists = useCallback(async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const res = await artistService.getArtists({ search: query.trim() || undefined, limit: 50 })
      setArtists(res?.artists || [])
    } catch (err) {
      setError(err.message || 'Error loading artists.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArtists()
  }, [loadArtists])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadArtists(search)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">
            Artists Catalogue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performers, producers, and composer collectives
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 320 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search artists by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {loading ? (
        <LoadingState message="Loading artists from database…" />
      ) : error ? (
        <ErrorState
          title="Could Not Load Artists"
          message={error}
          onRetry={() => loadArtists(search)}
        />
      ) : artists.length === 0 ? (
        <EmptyState
          title="No Artists Found"
          description="Try searching with a different keyword."
          actionLabel="Clear Search"
          onAction={() => {
            setSearch('')
            loadArtists('')
          }}
        />
      ) : (
        <Grid container spacing={3}>
          {artists.map((artist) => (
            <Grid key={artist.artist_id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
              <ArtistCard artist={artist} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
