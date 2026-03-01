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

type RaceResult = {
  quali_p1: string;
  quali_p2: string;
  race_p1: string;
  race_p2: string;
  race_p3: string;
  race_p4: string;
};

type RaceData = {
  race: {
    id: string;
    name: string;
  };
  predictions: Prediction[];
  result: RaceResult | null;
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

  // Check if a prediction matches the result
  const isCorrect = (predicted: string, actual: string) => predicted === actual;
  const isCloseMatch = (predicted: string, actual: string, actualAlt: string) => 
    predicted === actualAlt;

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
          
          {/* Race Results Card */}
          {data.result && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h3 className="section-title">🏆 Official Results</h3>
              <div className="results-display">
                <div className="results-section">
                  <h4 className="results-section-title">Qualifying</h4>
                  <div className="results-row">
                    <span className="results-position">🏎️ P1</span>
                    <span className="results-driver">{data.result.quali_p1}</span>
                  </div>
                  <div className="results-row">
                    <span className="results-position">P2</span>
                    <span className="results-driver">{data.result.quali_p2}</span>
                  </div>
                </div>
                <div className="results-section">
                  <h4 className="results-section-title">Race</h4>
                  <div className="results-row">
                    <span className="results-position">🥇 P1</span>
                    <span className="results-driver">{data.result.race_p1}</span>
                  </div>
                  <div className="results-row">
                    <span className="results-position">🥈 P2</span>
                    <span className="results-driver">{data.result.race_p2}</span>
                  </div>
                  <div className="results-row">
                    <span className="results-position">🥉 P3</span>
                    <span className="results-driver">{data.result.race_p3}</span>
                  </div>
                  <div className="results-row">
                    <span className="results-position">4️⃣ P4</span>
                    <span className="results-driver">{data.result.race_p4}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Predictions Card */}
          <div className="card">
            <h3 className="section-title">📋 User Predictions</h3>
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
                        <td className={data.result ? (
                          isCorrect(pred.pole, data.result.quali_p1) ? "correct-cell" :
                          isCloseMatch(pred.pole, data.result.quali_p1, data.result.quali_p2) ? "close-cell" : ""
                        ) : ""}>
                          {pred.pole}
                          {data.result && isCorrect(pred.pole, data.result.quali_p1) && " ✓"}
                          {data.result && !isCorrect(pred.pole, data.result.quali_p1) && 
                           isCloseMatch(pred.pole, data.result.quali_p1, data.result.quali_p2) && " ½"}
                        </td>
                        <td className={data.result ? (
                          isCorrect(pred.p1, data.result.race_p1) ? "correct-cell" :
                          isCorrect(pred.p1, data.result.race_p2) ? "close-cell" : ""
                        ) : ""}>
                          {pred.p1}
                          {data.result && isCorrect(pred.p1, data.result.race_p1) && " ✓"}
                          {data.result && !isCorrect(pred.p1, data.result.race_p1) && 
                           isCorrect(pred.p1, data.result.race_p2) && " ½"}
                        </td>
                        <td className={data.result ? (
                          isCorrect(pred.p2, data.result.race_p2) ? "correct-cell" :
                          (isCorrect(pred.p2, data.result.race_p1) || isCorrect(pred.p2, data.result.race_p3)) ? "close-cell" : ""
                        ) : ""}>
                          {pred.p2}
                          {data.result && isCorrect(pred.p2, data.result.race_p2) && " ✓"}
                          {data.result && !isCorrect(pred.p2, data.result.race_p2) && 
                           (isCorrect(pred.p2, data.result.race_p1) || isCorrect(pred.p2, data.result.race_p3)) && " ½"}
                        </td>
                        <td className={data.result ? (
                          isCorrect(pred.p3, data.result.race_p3) ? "correct-cell" :
                          (isCorrect(pred.p3, data.result.race_p2) || isCorrect(pred.p3, data.result.race_p4)) ? "close-cell" : ""
                        ) : ""}>
                          {pred.p3}
                          {data.result && isCorrect(pred.p3, data.result.race_p3) && " ✓"}
                          {data.result && !isCorrect(pred.p3, data.result.race_p3) && 
                           (isCorrect(pred.p3, data.result.race_p2) || isCorrect(pred.p3, data.result.race_p4)) && " ½"}
                        </td>
                        <td className="date-cell">{formatDate(pred.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {data.result && data.predictions.length > 0 && (
              <div className="legend">
                <span className="legend-item"><span className="legend-correct">✓</span> = Exact match (1 pt)</span>
                <span className="legend-item"><span className="legend-close">½</span> = Off by one position (0.5 pt)</span>
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