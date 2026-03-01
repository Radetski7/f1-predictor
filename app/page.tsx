"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { drivers } from "@/lib/drivers";
import { users } from "@/lib/users";

type Race = { id: string; name: string };

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [submittedRaces, setSubmittedRaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    race_id: "",
    user: "Alice",
    pole: "",
    p1: "",
    p2: "",
    p3: "",
  });

  // Fetch races and submitted predictions for this user
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [racesRes, standingsRes] = await Promise.all([
          fetch("/api/races"),
          fetch("/api/predictionsByUser?user=" + form.user),
        ]);

        const racesData = await racesRes.json();
        const submittedData = await standingsRes.json();

        setRaces(racesData.races);
        setSubmittedRaces(submittedData.race_ids);

        if (racesData.races.length > 0) {
          const firstAvailable = racesData.races.find(
            (r: Race) => !submittedData.race_ids.includes(r.id)
          );
          if (firstAvailable) setForm((f) => ({ ...f, race_id: firstAvailable.id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [form.user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Simple frontend validation: ensure all fields are selected
    const values = [form.pole, form.p1, form.p2, form.p3];
    if (values.includes("") || !form.race_id) {
      alert("Please select all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submitPrediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (data.success) {
        alert("🏁 Prediction submitted successfully!");
        setSubmittedRaces((prev) => [...prev, form.race_id]);
        // Reset driver selections
        setForm((f) => ({ ...f, pole: "", p1: "", p2: "", p3: "" }));
      } else {
        alert(data.error || "Failed to submit prediction");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Compute available drivers dynamically
  const getAvailableDrivers = (currentField: string) => {
    const selectedDrivers = ["pole", "p1", "p2", "p3"]
      .filter((f) => f !== currentField)
      .map((f) => (form as Record<string, string>)[f])
      .filter(Boolean);

    return drivers.map((d) => ({
      name: d,
      disabled: selectedDrivers.includes(d),
    }));
  };

  const fieldLabels: Record<string, string> = {
    pole: "🏎️ Pole Position",
    p1: "🥇 Race Winner (P1)",
    p2: "🥈 Second Place (P2)",
    p3: "🥉 Third Place (P3)",
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="f1-decoration">
        <div className="f1-line"></div>
        <span className="f1-badge">2026</span>
        <div className="f1-line f1-line-right"></div>
      </div>

      <h1 className="title">F1 Predictor</h1>
      <p className="subtitle">Make your predictions for the upcoming race</p>

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading races...</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {/* User Selector */}
            <div className="form-group">
              <label className="form-label">👤 Predictor</label>
              <select
                className="form-select"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value, pole: "", p1: "", p2: "", p3: "" })}
              >
                {users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Race Selector */}
            <div className="form-group">
              <label className="form-label">🏁 Race</label>
              <select
                className="form-select"
                value={form.race_id}
                onChange={(e) => setForm({ ...form, race_id: e.target.value })}
              >
                {races.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    disabled={submittedRaces.includes(r.id)}
                  >
                    {r.name} {submittedRaces.includes(r.id) ? "✓ Submitted" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="divider"></div>

            {/* Driver Predictions */}
            <div className="predictions-grid">
              {["pole", "p1", "p2", "p3"].map((field) => (
                <div key={field} className="form-group">
                  <label className="form-label">{fieldLabels[field]}</label>
                  <select
                    className="form-select"
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  >
                    <option value="">Select driver...</option>
                    {getAvailableDrivers(field).map((d) => (
                      <option key={d.name} value={d.name} disabled={d.disabled}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "🏁 Submit Prediction"}
            </button>
          </form>
        )}
      </div>

      <Link href="/standings" className="link">
        📊 View Leaderboard →
      </Link>
    </main>
  );
}