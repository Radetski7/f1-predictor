"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { drivers } from "@/lib/drivers";
import Modal from "@/app/components/Modal";

type RaceResult = {
  quali_p1: string;
  quali_p2: string;
  race_p1: string;
  race_p2: string;
  race_p3: string;
  race_p4: string;
};

type Race = {
  id: string;
  name: string;
  hasResult: boolean;
  result: RaceResult | null;
};

type ModalState = {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function ResultsPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    race_id: "",
    quali_p1: "",
    quali_p2: "",
    race_p1: "",
    race_p2: "",
    race_p3: "",
    race_p4: "",
  });
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showModal = (type: ModalState["type"], title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal((m) => ({ ...m, isOpen: false }));
  };

  // Fetch races and their results
  useEffect(() => {
    async function fetchRaces() {
      setLoading(true);
      try {
        const res = await fetch("/api/results");
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields
    if (
      !form.race_id ||
      !form.quali_p1 ||
      !form.quali_p2 ||
      !form.race_p1 ||
      !form.race_p2 ||
      !form.race_p3 ||
      !form.race_p4
    ) {
      showModal("warning", "Incomplete Form", "Please fill in all qualifying and race positions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submitResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        const raceName = races.find(r => r.id === form.race_id)?.name || "the race";
        showModal("success", "Results Submitted!", `The official results for ${raceName} have been recorded. Points will be calculated automatically.`);
        // Update local state
        setRaces((prev) =>
          prev.map((r) =>
            r.id === form.race_id
              ? {
                  ...r,
                  hasResult: true,
                  result: {
                    quali_p1: form.quali_p1,
                    quali_p2: form.quali_p2,
                    race_p1: form.race_p1,
                    race_p2: form.race_p2,
                    race_p3: form.race_p3,
                    race_p4: form.race_p4,
                  },
                }
              : r
          )
        );
        // Reset form
        setForm({
          race_id: "",
          quali_p1: "",
          quali_p2: "",
          race_p1: "",
          race_p2: "",
          race_p3: "",
          race_p4: "",
        });
      } else {
        // Handle specific errors
        let errorTitle = "Submission Failed";
        let errorMessage = data.error || "An unknown error occurred. Please try again.";
        
        if (data.error?.includes("already exists")) {
          errorTitle = "Results Already Entered";
          errorMessage = "Results have already been entered for this race. Each race can only have one set of results.";
        } else if (data.error?.includes("not found")) {
          errorTitle = "Race Not Found";
          errorMessage = "The selected race could not be found. Please refresh the page and try again.";
        }
        
        showModal("error", errorTitle, errorMessage);
      }
    } catch (err) {
      showModal("error", "Connection Error", "Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Get available drivers for qualifying (P1 and P2 must be different)
  const getAvailableQualiDrivers = (currentField: string) => {
    const otherField = currentField === "quali_p1" ? "quali_p2" : "quali_p1";
    const otherValue = (form as Record<string, string>)[otherField];

    return drivers.map((d) => ({
      name: d,
      disabled: d === otherValue,
    }));
  };

  // Get available drivers for race positions (P1-P4 must be unique)
  const getAvailableRaceDrivers = (currentField: string) => {
    const raceFields = ["race_p1", "race_p2", "race_p3", "race_p4"];
    const selectedDrivers = raceFields
      .filter((f) => f !== currentField)
      .map((f) => (form as Record<string, string>)[f])
      .filter(Boolean);

    return drivers.map((d) => ({
      name: d,
      disabled: selectedDrivers.includes(d),
    }));
  };

  const selectedRace = races.find((r) => r.id === form.race_id);

  return (
    <main className="container">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Header */}
      <div className="f1-decoration">
        <div className="f1-line"></div>
        <span className="f1-badge">ADMIN</span>
        <div className="f1-line f1-line-right"></div>
      </div>

      <h1 className="title">Race Results</h1>
      <p className="subtitle">Enter the official race results</p>

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading races...</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {/* Race Selector */}
            <div className="form-group">
              <label className="form-label">🏁 Select Race</label>
              <select
                className="form-select"
                value={form.race_id}
                onChange={(e) =>
                  setForm({
                    race_id: e.target.value,
                    quali_p1: "",
                    quali_p2: "",
                    race_p1: "",
                    race_p2: "",
                    race_p3: "",
                    race_p4: "",
                  })
                }
              >
                <option value="">Select race...</option>
                {races.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.hasResult}>
                    {r.name} {r.hasResult ? "✓ Results entered" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedRace && selectedRace.hasResult && (
              <div className="result-display">
                <p className="result-label">Current Results:</p>
                <div className="result-grid">
                  <div>
                    <strong>Quali P1:</strong> {selectedRace.result?.quali_p1}
                  </div>
                  <div>
                    <strong>Quali P2:</strong> {selectedRace.result?.quali_p2}
                  </div>
                  <div>
                    <strong>Race P1:</strong> {selectedRace.result?.race_p1}
                  </div>
                  <div>
                    <strong>Race P2:</strong> {selectedRace.result?.race_p2}
                  </div>
                  <div>
                    <strong>Race P3:</strong> {selectedRace.result?.race_p3}
                  </div>
                  <div>
                    <strong>Race P4:</strong> {selectedRace.result?.race_p4}
                  </div>
                </div>
              </div>
            )}

            {form.race_id && !selectedRace?.hasResult && (
              <>
                <div className="divider"></div>

                {/* Qualifying Results */}
                <h3 className="section-title">🏎️ Qualifying Results</h3>
                <div className="predictions-grid">
                  <div className="form-group">
                    <label className="form-label">Pole Position (P1)</label>
                    <select
                      className="form-select"
                      value={form.quali_p1}
                      onChange={(e) =>
                        setForm({ ...form, quali_p1: e.target.value })
                      }
                    >
                      <option value="">Select driver...</option>
                      {getAvailableQualiDrivers("quali_p1").map((d) => (
                        <option key={d.name} value={d.name} disabled={d.disabled}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Second Place (P2)</label>
                    <select
                      className="form-select"
                      value={form.quali_p2}
                      onChange={(e) =>
                        setForm({ ...form, quali_p2: e.target.value })
                      }
                    >
                      <option value="">Select driver...</option>
                      {getAvailableQualiDrivers("quali_p2").map((d) => (
                        <option key={d.name} value={d.name} disabled={d.disabled}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="divider"></div>

                {/* Race Results */}
                <h3 className="section-title">🏆 Race Results</h3>
                <div className="predictions-grid">
                  {["race_p1", "race_p2", "race_p3", "race_p4"].map(
                    (field, idx) => (
                      <div key={field} className="form-group">
                        <label className="form-label">
                          {idx === 0
                            ? "🥇 Winner (P1)"
                            : idx === 1
                            ? "🥈 Second (P2)"
                            : idx === 2
                            ? "🥉 Third (P3)"
                            : "4️⃣ Fourth (P4)"}
                        </label>
                        <select
                          className="form-select"
                          value={(form as Record<string, string>)[field]}
                          onChange={(e) =>
                            setForm({ ...form, [field]: e.target.value })
                          }
                        >
                          <option value="">Select driver...</option>
                          {getAvailableRaceDrivers(field).map((d) => (
                            <option
                              key={d.name}
                              value={d.name}
                              disabled={d.disabled}
                            >
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  )}
                </div>

                <div className="divider"></div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "✅ Submit Race Results"}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" className="link">
          ← Back to Predictions
        </Link>
        <Link href="/races" className="link">
          📋 View Race Predictions
        </Link>
        <Link href="/standings" className="link">
          📊 Leaderboard
        </Link>
      </div>
    </main>
  );
}