// pages/swipe.js
import { useEffect, useState } from 'react'

export default function SwipePage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => { fetchCandidates() }, [])

  async function fetchCandidates() {
    setLoading(true)
    const res = await fetch('/api/discover')
    const json = await res.json()
    setProfiles(json.profiles || [])
    setLoading(false)
  }

  async function doSwipe(targetId, action) {
    if (busy) return
    setBusy(true)
    await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, action })
    })
    setProfiles(prev => prev.filter(p => p.auth_id !== targetId))
    setBusy(false)
  }

  if (loading) return <p style={{maxWidth:720,margin:'40px auto'}}>Loading...</p>
  if (!profiles.length) return <p style={{maxWidth:720,margin:'40px auto'}}>No candidates right now.</p>

  const p = profiles[0]

  return (
    <div style={{ maxWidth:720, margin:'30px auto', padding:20 }}>
      <h2>Discover</h2>
      <div style={{border:'1px solid #ddd', padding:20, borderRadius:8}}>
        <h3>{p.full_name} — {p.role}</h3>
        <p>{p.bio}</p>
        <p><strong>Skills:</strong> {(p.skills||[]).join(', ')}</p>
        <p><strong>Looking for:</strong> {(p.looking_for||[]).join(', ')}</p>

        <div style={{display:'flex', gap:12, marginTop:12}}>
          <button onClick={() => doSwipe(p.auth_id, 'pass')} disabled={busy}>Pass</button>
          <button onClick={() => doSwipe(p.auth_id, 'like')} disabled={busy}>Like</button>
        </div>
      </div>
    </div>
  )
}
