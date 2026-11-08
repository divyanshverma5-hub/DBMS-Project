const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Core HTTP Request Wrapper using native Fetch API.
 * Automatically injects JWT Bearer token and parses backend standard JSON envelope.
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, params = null, headers = {} } = {}) {
  let url = `${API_BASE_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  const token = localStorage.getItem('token')
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    method,
    headers: reqHeaders,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (err) {
    throw new Error(`Network error connecting to backend at ${url}: ${err.message}. Ensure backend server is running.`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned invalid non-JSON response (HTTP ${response.status})`)
  }

  if (!response.ok || data.success === false) {
    if (response.status === 401) {
      // Dispatch custom event for expired/invalid token
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    const errorMsg = data.message || `Request failed with HTTP status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data.data
}

export default {
  get: (endpoint, params) => apiRequest(endpoint, { method: 'GET', params }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint, params) => apiRequest(endpoint, { method: 'DELETE', params }),
}
