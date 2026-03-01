"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Race = {
  id: string;
  name: string;
};

export default function RacesList() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaces() {
      setLoading(true);
      try {
        const res = await fetch("/api/races");
        const data = await res.json();
        setRaces(data.races);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRaces();
  }, []);

  return (
    <main className="container">
      {/* Header */}
      <div className="f1-decoration">
        <div className="f1-line"></div>
        <span className="f1-badge">2026</span>
        <div className="f1-line f1-line-right"></div>
      </div>

      <h1 className="title">All Races</h1>
      <p className="subtitle">View predictions for each race</p>

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading races...</p>
          </div>
        ) : races.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>No races available.</p>
        ) : (
          <div className="races-list">
            {races.map((race) => (
              <Link
                key={race.id}
                href={`/race/${race.id}`}
                className="race-item"
              >
                <span className="race-name">{race.name}</span>
                <span className="race-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="link">
          ← Back to Predictions
        </Link>
        <Link href="/standings" className="link">
          📊 Leaderboard
        </Link>
      </div>
    </main>
  );
}