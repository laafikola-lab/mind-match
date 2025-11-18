// pages/api/discover.js
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session

  if (!session?.user) return res.status(401).json({ error: 'Not signed in' })

  const authId = session.user.id

  // exclude yourself and exclude users you've already swiped on
  const { data: swiped } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', authId)

  const excluded = (swiped || []).map(s => s.target_id).concat([authId])

  const { data, error } = await supabase
    .from('profiles')
    .select('auth_id, full_name, role, skills, looking_for, bio, commitment')
    .not('auth_id', 'in', `(${excluded.map(e => `'${e}'`).join(',')})`)
    .limit(40)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ profiles: data || [] })
}
