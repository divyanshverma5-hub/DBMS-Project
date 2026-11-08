import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import albumService from '../services/albumService'
import AlbumCard from '../components/music/AlbumCard'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAlbums = useCallback(async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const res = await albumService.getAlbums({ search: query.trim() || undefined, limit: 50 })
      setAlbums(res?.albums || [])
    } catch (err) {
      setError(err.message || 'Error loading albums.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlbums()
  }, [loadAlbums])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadAlbums(search)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">
            Albums Catalogue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full studio releases, EPs, and compilations
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 320 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search album titles…"
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
        <LoadingState message="Loading albums from database…" />
      ) : error ? (
        <ErrorState
          title="Could Not Load Albums"
          message={error}
          onRetry={() => loadAlbums(search)}
        />
      ) : albums.length === 0 ? (
        <EmptyState
          title="No Albums Found"
          description="Try searching with a different keyword."
          actionLabel="Clear Search"
          onAction={() => {
            setSearch('')
            loadAlbums('')
          }}
        />
      ) : (
        <Grid container spacing={3}>
          {albums.map((album) => (
            <Grid key={album.album_id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
              <AlbumCard album={album} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
