// pages/api/discover.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Get the currently logged-in user from the Supabase auth cookie
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: 'Not signed in' });
    }

    // For now: just return *all other* profiles, no fancy matching
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('auth_id', user.id)          // everyone except me
      .order('created_at', { ascending: false });

    if (error) {
      console.error('discover error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ profiles: data || [] });
  } catch (err) {
    console.error('discover exception:', err);
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}
