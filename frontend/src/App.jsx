import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(r => r.json())
      .then(data => { setHealth(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: '#6c47ff' }}>🎵 Music Mood Recommendation</h1>
      <p style={{ color: '#555' }}>Phase 1 — Project Foundation</p>
      <hr />
      <h2>API Health Check</h2>
      {loading && <p>Checking backend connection…</p>}
      {error && <p style={{ color: 'red' }}>❌ Could not reach backend: {error}</p>}
      {health && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {Object.entries(health).map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: '6px 12px', fontWeight: 600, border: '1px solid #eee' }}>{k}</td>
                <td style={{ padding: '6px 12px', border: '1px solid #eee', color: v === 'connected' ? 'green' : v === 'disconnected' ? 'red' : '#333' }}>
                  {String(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
