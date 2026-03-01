"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Prediction = {
  user: string;
  pole: string;
  p1: string;
  p2: string;
  p3: string;
  submittedAt: string;
};

type RaceData = {
  race: {
    id: string;
    name: string;
  };
  predictions: Prediction[];
};

export default function RacePredictions() {
  const params = useParams();
  const raceId = params.id as string;
  
  const [data, setData] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPredictions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/predictionsByRace?race_id=${raceId}`);
        const result = await res.json();
        
        if (!res.ok) {
          setError(result.error || "Failed to load predictions");
        } else {
          setData(result);
        }
      } catch (err) {
        setError("An error occurred while loading predictions");
      } finally {
        setLoading(false);
      }
    }
    
    if (raceId) {
      fetchPredictions();
    }
  }, [raceId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="f1-decoration">
        <div className="f1-line"></div>
        <span className="f1-badge">2026</span>
        <div className="f1-line f1-line-right"></div>
      </div>

      <h1 className="title">Race Predictions</h1>
      
      {loading ? (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading predictions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>
        </div>
      ) : data ? (
        <>
          <p className="subtitle">{data.race.name}</p>
          
          <div className="card">
            {data.predictions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888" }}>
                No predictions submitted yet for this race.
              </p>
            ) : (
              <div className="predictions-table-container">
                <table className="predictions-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>🏎️ Pole</th>
                      <th>🥇 P1</th>
                      <th>🥈 P2</th>
                      <th>🥉 P3</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.predictions.map((pred, idx) => (
                      <tr key={idx}>
                        <td className="user-cell">{pred.user}</td>
                        <td>{pred.pole}</td>
                        <td>{pred.p1}</td>
                        <td>{pred.p2}</td>
                        <td>{pred.p3}</td>
                        <td className="date-cell">{formatDate(pred.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="link">
          ← Back to Predictions
        </Link>
        <Link href="/races" className="link">
          📋 All Races
        </Link>
        <Link href="/standings" className="link">
          📊 Leaderboard
        </Link>
      </div>
    </main>
  );
}