// pages/login.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login({ session }) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  // If user already has a session, go to profile
  useEffect(() => {
    if (session) router.replace('/profile')
  }, [session, router])

  async function handleLogin(e) {
    e.preventDefault()
    setMsg('Sending magic link…')

    const redirectTo = `${window.location.origin}/profile`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    })
    if (error) setMsg('Error: ' + error.message)
    else setMsg('Magic link sent. Open the link in the same browser/tab.')
  }

  // While session is resolving, hide form to avoid flicker
  if (session) return <p style={{ maxWidth: 640, margin: '40px auto' }}>Redirecting…</p>

  return (
    <div style={{ maxWidth: 420, margin: '50px auto', padding: 20 }}>
      <h2>Mind Match — Login</h2>
      <p>Enter your email to receive a sign-in link</p>
      <form onSubmit={handleLogin}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@domain.com"
          style={{ width: '100%', padding: 12, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Send link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
