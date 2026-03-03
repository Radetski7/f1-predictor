"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Standing = {
  user: string;
  points: number;
  exactMatches: number;
  semiMatches: number;
};

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
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

  const getRankClass = (index: number) => {
    if (index === 0) return "rank-1";
    if (index === 1) return "rank-2";
    if (index === 2) return "rank-3";
    return "rank-other";
  };

  const getTrophy = (index: number) => {
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="f1-decoration">
        <div className="f1-line"></div>
        <span className="f1-badge">2026</span>
        <div className="f1-line f1-line-right"></div>
      </div>

      <h1 className="title">Leaderboard</h1>
      <p className="subtitle">See who&apos;s leading the prediction championship</p>

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading standings...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏎️</div>
            <p>No predictions yet.</p>
          </div>
        ) : (
          <ul className="standings-list">
            {standings.map((s, i) => (
              <li key={i} className="standings-item">
                <div className="standings-rank">
                  <span className={`rank-number ${getRankClass(i)}`}>
                    {i + 1}
                  </span>
                  <span className="standings-name">
                    {getTrophy(i)} {s.user}
                  </span>
                </div>
                <div className="standings-stats">
                  <div className="standings-matches">
                    <span className="match-exact" title="Exact matches (1 pt each)">
                      ✓ {s.exactMatches}
                    </span>
                    <span className="match-semi" title="Semi-matches (0.5 pt each)">
                      ½ {s.semiMatches}
                    </span>
                  </div>
                  <span className="standings-points">{s.points} pts</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="standings-legend">
          <span>✓ = Exact match (1 pt)</span>
          <span>½ = Off by one (0.5 pt)</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="link">
          ← Back to Predictions
        </Link>
        <Link href="/races" className="link">
          📋 View Race Predictions
        </Link>
      </div>
    </main>
  );
}