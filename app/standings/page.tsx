"use client";
import { useEffect, useState } from "react";

export default function StandingsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch("/api/standings");
        const data = await res.json();
        setStandings(data.standings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Leaderboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : standings.length === 0 ? (
        <p>No predictions yet.</p>
      ) : (
        <ul>
          {standings.map((s, i) => (
            <li key={i}>
              {i + 1}. {s.user}: {s.points}
            </li>
          ))}
        </ul>
      )}

      <p>
        <a href="/">Back to Predictions</a>
      </p>
    </main>
  );
}