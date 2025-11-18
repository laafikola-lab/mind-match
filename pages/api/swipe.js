import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SwipePage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load logged in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUser(data.user);
      loadProfiles(data.user.id);
    }
    loadUser();
  }, []);

  // Load other profiles
  async function loadProfiles(myId) {
    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", myId);

    if (error) {
      alert("Error loading profiles");
      return;
    }

    setProfiles(data);
    setLoading(false);
  }

  async function swipe(targetId, liked) {
    const { error } = await supabase.from("swipes").insert([
      {
        swiper_id: user.id,
        target_id: targetId,
        liked,
      },
    ]);
    if (error) alert("Swipe error");

    setProfiles((prev) => prev.slice(1)); // remove first card
  }

  if (loading) return <h2>Loading...</h2>;

  if (profiles.length === 0)
    return <h2>No more profiles right now 🚀</h2>;

  const p = profiles[0];

  return (
    <div style={{ padding: 40 }}>
      <h1>Discover</h1>
      <div
        style={{
          padding: 20,
          border: "1px solid #ccc",
          width: 300,
          marginBottom: 20,
        }}
      >
        <h3>{p.full_name}</h3>
        <p><b>Role:</b> {p.role}</p>
        <p><b>Skills:</b> {p.skills?.join(", ")}</p>
        <p><b>Looking for:</b> {p.looking_for?.join(", ")}</p>
        <p><b>Bio:</b> {p.bio}</p>
      </div>

      <button
        style={{ marginRight: 20 }}
        onClick={() => swipe(p.id, false)}
      >
        ❌ Pass
      </button>
      <button onClick={() => swipe(p.id, true)}>❤️ Like</button>
    </div>
  );
}
