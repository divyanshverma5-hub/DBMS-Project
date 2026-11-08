/**
 * Utility functions for formatting durations, numbers, and dates.
 */

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function formatScore(score) {
  if (score === null || score === undefined) return 'N/A'
  return `${(score * 100).toFixed(0)}%`
}
