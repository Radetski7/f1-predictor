"use client";
import { useEffect, useState } from "react";
import { drivers } from "@/lib/drivers";
import { users } from "@/lib/users";

type Race = { id: string; name: string };

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [submittedRaces, setSubmittedRaces] = useState<string[]>([]);
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
    }
    fetchData();
  }, [form.user]);

  async function submit(e: any) {
    e.preventDefault();

    // Simple frontend validation: ensure all fields are selected
    const values = [form.pole, form.p1, form.p2, form.p3];
    if (values.includes("") || !form.race_id) {
      alert("Please select all fields");
      return;
    }

    const res = await fetch("/api/submitPrediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.success ? "Prediction submitted" : data.error);

    // Refresh submitted races
    if (data.success) setSubmittedRaces((prev) => [...prev, form.race_id]);
  }

  // Compute available drivers dynamically
  const getAvailableDrivers = (currentField: string) => {
    const selectedDrivers = ["pole", "p1", "p2", "p3"]
      .filter((f) => f !== currentField)
      .map((f) => (form as any)[f])
      .filter(Boolean);

    return drivers.map((d) => ({
      name: d,
      disabled: selectedDrivers.includes(d),
    }));
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>F1 Predictor</h1>

      <form onSubmit={submit}>
        {/* Race Selector */}
        <div>
          <label>Race: </label>
          <select
            value={form.race_id}
            onChange={(e) => setForm({ ...form, race_id: e.target.value })}
          >
            {races.map((r) => (
              <option
                key={r.id}
                value={r.id}
                disabled={submittedRaces.includes(r.id)}
              >
                {r.name} {submittedRaces.includes(r.id) ? "(Already submitted)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* User input */}
        <div>
          <label>User: </label>
          <select
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
          >
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Driver dropdowns */}
        {["pole", "p1", "p2", "p3"].map((field) => (
          <div key={field}>
            <label>{field.toUpperCase()}: </label>
            <select
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            >
              <option value="">--Select--</option>
              {getAvailableDrivers(field).map((d) => (
                <option key={d.name} value={d.name} disabled={d.disabled}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit">Submit Prediction</button>
      </form>

      <p>
        <a href="/standings">View Standings</a>
      </p>
    </main>
  );
}