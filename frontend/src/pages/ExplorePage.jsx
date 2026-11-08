import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Slider,
  Paper,
  Button,
  Pagination,
  Stack,
  Collapse,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { useSearchParams } from 'react-router-dom'
import trackService from '../services/trackService'
import genreMoodService from '../services/genreMoodService'
import TrackListItem from '../components/music/TrackListItem'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [tracks, setTracks] = useState([])
  const [genres, setGenres] = useState([])
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters State
  const [search, setSearch] = useState(initialSearch)
  const [genreId, setGenreId] = useState('')
  const [moodId, setMoodId] = useState('')
  const [valenceRange, setValenceRange] = useState([0, 1])
  const [energyRange, setEnergyRange] = useState([0, 1])
  const [sortBy, setSortBy] = useState('title')
  const [sortDir, setSortDir] = useState('ASC')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const pageSize = 15

  // Load filter options (genres, moods)
  useEffect(() => {
    async function loadOptions() {
      try {
        const [gRes, mRes] = await Promise.allSettled([
          genreMoodService.getGenres(),
          genreMoodService.getMoods(),
        ])
        if (gRes.status === 'fulfilled' && gRes.value?.genres) setGenres(gRes.value.genres)
        if (mRes.status === 'fulfilled' && mRes.value?.moods) setMoods(mRes.value.moods)
      } catch (err) {
        console.warn('Could not load genres or moods for filter:', err)
      }
    }
    loadOptions()
  }, [])

  // Sync search param from URL
  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== search) {
      setSearch(q)
    }
  }, [searchParams, search])

  const fetchTracks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        search: search.trim() || undefined,
        genre_id: genreId || undefined,
        mood_id: moodId || undefined,
        min_valence: valenceRange[0] > 0 ? valenceRange[0] : undefined,
        max_valence: valenceRange[1] < 1 ? valenceRange[1] : undefined,
        min_energy: energyRange[0] > 0 ? energyRange[0] : undefined,
        max_energy: energyRange[1] < 1 ? energyRange[1] : undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }

      const res = await trackService.getTracks(params)
      setTracks(res?.tracks || [])
    } catch (err) {
      setError(err.message || 'Error loading tracks.')
    } finally {
      setLoading(false)
    }
  }, [search, genreId, moodId, valenceRange, energyRange, sortBy, sortDir, page])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  const handleResetFilters = () => {
    setSearch('')
    setGenreId('')
    setMoodId('')
    setValenceRange([0, 1])
    setEnergyRange([0, 1])
    setSortBy('title')
    setSortDir('ASC')
    setPage(1)
    setSearchParams({})
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>
          Explore Music Catalogue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filter through tracks by acoustic valence, rhythmic energy, mood, and genre.
        </Typography>
      </Box>

      {/* Main Search and Quick Sort Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by track title or artist…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => {
                        setSearch('')
                        setSearchParams({})
                      }}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort by"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-')
                setSortBy(sb)
                setSortDir(sd)
                setPage(1)
              }}
            >
              <MenuItem value="title-ASC">Title (A to Z)</MenuItem>
              <MenuItem value="title-DESC">Title (Z to A)</MenuItem>
              <MenuItem value="popularity-DESC">Most Popular</MenuItem>
              <MenuItem value="valence-DESC">Highest Valence (Happiest)</MenuItem>
              <MenuItem value="valence-ASC">Lowest Valence (Saddest)</MenuItem>
              <MenuItem value="energy-DESC">Highest Energy</MenuItem>
              <MenuItem value="energy-ASC">Lowest Energy (Calmest)</MenuItem>
              <MenuItem value="duration-DESC">Longest Duration</MenuItem>
              <MenuItem value="duration-ASC">Shortest Duration</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Button
              fullWidth
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ height: 40 }}
            >
              Filters
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Button
              fullWidth
              variant="text"
              color="inherit"
              onClick={handleResetFilters}
              sx={{ color: '#64748b' }}
            >
              Reset All
            </Button>
          </Grid>
        </Grid>

        {/* Collapsible Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ pt: 3, mt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Music Genre"
                  value={genreId}
                  onChange={(e) => {
                    setGenreId(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {genres.map((g) => (
                    <MenuItem key={g.genre_id} value={g.genre_id}>
                      {g.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Associated Mood"
                  value={moodId}
                  onChange={(e) => {
                    setMoodId(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All Moods</MenuItem>
                  {moods.map((m) => (
                    <MenuItem key={m.mood_id} value={m.mood_id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                  VALENCE (POSITIVITY): {(valenceRange[0] * 100).toFixed(0)}% – {(valenceRange[1] * 100).toFixed(0)}%
                </Typography>
                <Slider
                  size="small"
                  value={valenceRange}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(_, val) => {
                    setValenceRange(val)
                    setPage(1)
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  sx={{ color: '#10b981' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                  ENERGY (INTENSITY): {(energyRange[0] * 100).toFixed(0)}% – {(energyRange[1] * 100).toFixed(0)}%
                </Typography>
                <Slider
                  size="small"
                  value={energyRange}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(_, val) => {
                    setEnergyRange(val)
                    setPage(1)
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  sx={{ color: '#f59e0b' }}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Results View */}
      {loading ? (
        <LoadingState message="Filtering tracks from catalogue…" />
      ) : error ? (
        <ErrorState
          title="Catalogue Query Error"
          message={error}
          onRetry={fetchTracks}
        />
      ) : tracks.length === 0 ? (
        <EmptyState
          title="No Matching Tracks"
          description="Try broadening your valence/energy thresholds, clearing filters, or searching a different term."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Showing {tracks.length} results
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ mb: 4 }}>
            {tracks.map((track, i) => (
              <TrackListItem
                key={track.track_id}
                track={track}
                index={(page - 1) * pageSize + i}
                playlistContext={tracks}
              />
            ))}
          </Stack>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Pagination
              count={tracks.length < pageSize && page === 1 ? 1 : page + (tracks.length === pageSize ? 1 : 0)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}
