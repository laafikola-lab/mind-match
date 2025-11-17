// pages/_app.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data?.session ?? null)

      // Listen to future auth state changes (login/logout)
      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession)
        // If user just signed in and current route is /login, push to /profile
        if (newSession && router.pathname === '/login') {
          router.replace('/profile')
        }
      })

      return () => listener.subscription.unsubscribe()
    }

    init()
    return () => { mounted = false }
  }, [router])

  return <Component {...pageProps} session={session} />
}
