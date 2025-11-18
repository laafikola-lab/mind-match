// pages/profile.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Profile({ session }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    role: '',
    skills: [],       // array
    looking_for: [],  // array
    bio: '',
    commitment: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    const current = session.user
    setUser(current)
    loadProfile(current.id)
  }, [session])

  async function loadProfile(authId) {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "No rows" error when single() returns nothing — ignore that
      console.error('Error loading profile:', error)
    }
    if (data) {
      // ensure arrays are arrays
      setProfile({
        full_name: data.full_name || '',
        role: data.role || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
        bio: data.bio || '',
        commitment: data.commitment || ''
      })
    }
    setLoading(false)
  }

  // helper: convert comma-separated string to array (used if you want to add an input)
  function csvToArray(str) {
    if (!str) return []
    return str.split(',').map(s => s.trim()).filter(Boolean)
  }

  // helper: convert array to comma string (for display in a simple text input if you use that)
  function arrayToCsv(arr) {
    if (!arr || !arr.length) return ''
    return arr.join(', ')
  }

  async function saveProfile(e) {
    e?.preventDefault()
    if (!user) return
    setSaving(true)

    // prepare updates
    const updates = {
      auth_id: user.id,                // important: tie row to auth user
      email: user.email,
      full_name: profile.full_name,
      role: profile.role,
      skills: profile.skills,          // should be an array
      looking_for: profile.looking_for,// array
      bio: profile.bio,
      commitment: profile.commitment,
      updated_at: new Date()
    }

    // Upsert by auth_id. Supabase upsert uses unique constraint on auth_id.
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'auth_id' })
      .select()
      .single()

    setSaving(false)
    if (error) {
      alert('Save error: ' + error.message)
      console.error(error)
    } else {
      alert('Profile saved')
      setProfile({
        full_name: data.full_name || '',
        role: data.role || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
        bio: data.bio || '',
        commitment: data.commitment || ''
      })
    }
  }

  if (!session) return <p>Loading…</p>

  return (
    <div style={{ maxWidth: 720, margin: '30px auto', padding: 20 }}>
      <h2>Your Profile</h2>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={saveProfile}>
          <label>Full Name</label><br/>
          <input
            value={profile.full_name}
            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
          /><br/>

          <label>Role</label><br/>
          <select
            value={profile.role}
            onChange={e => setProfile({ ...profile, role: e.target.value })}
          >
            <option value="">Choose role</option>
            <option value="Idea">Idea / Visionary</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Marketing">Marketing / Growth</option>
            <option value="Operations">Operations / Business</option>
            <option value="CoFounder">Co-Founder (General)</option>
          </select><br/>

          <label>Skills (comma separated)</label><br/>
          <input
            value={arrayToCsv(profile.skills)}
            onChange={e => setProfile({ ...profile, skills: csvToArray(e.target.value) })}
            placeholder="e.g. React, Node, UI/UX"
          /><br/>

          <label>Looking for (comma separated)</label><br/>
          <input
            value={arrayToCsv(profile.looking_for)}
            onChange={e => setProfile({ ...profile, looking_for: csvToArray(e.target.value) })}
            placeholder="e.g. Developer, Designer, Marketer"
          /><br/>

          <label>Commitment</label><br/>
          <select
            value={profile.commitment}
            onChange={e => setProfile({ ...profile, commitment: e.target.value })}
          >
            <option value="">Choose</option>
            <option value="ready">Ready now</option>
            <option value="serious">Serious (part-time)</option>
            <option value="exploring">Exploring</option>
          </select><br/>

          <label>Bio</label><br/>
          <textarea
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          /><br/>

          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
        </form>
      )}
    </div>
  )
}
