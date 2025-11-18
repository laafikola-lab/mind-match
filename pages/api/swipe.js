// pages/api/swipe.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { targetId, action } = req.body;
    if (!targetId || !["like", "pass"].includes(action)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session?.user) return res.status(401).json({ error: "Not signed in" });

    const swiperId = session.user.id;

    // Insert the swipe
    const { error: insertErr } = await supabase.from("swipes").insert([
      { swiper_id: swiperId, target_id: targetId, action }
    ]);
    if (insertErr) return res.status(500).json({ error: insertErr.message });

    // If like, check reciprocal like and create match (server-side)
    if (action === "like") {
      const { data: reciprocal, error: recErr } = await supabase
        .from("swipes")
        .select("*")
        .eq("swiper_id", targetId)
        .eq("target_id", swiperId)
        .eq("action", "like")
        .limit(1);

      if (!recErr && reciprocal && reciprocal.length > 0) {
        // create ordered pair (user_a < user_b)
        const [a, b] = [swiperId, targetId].sort();
        await supabase.from("matches").insert([{ user_a: a, user_b: b }]);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("swipe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
