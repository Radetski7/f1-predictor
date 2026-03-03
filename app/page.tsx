"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { drivers } from "@/lib/drivers";
import { users } from "@/lib/users";
import Modal from "@/app/components/Modal";

type Race = { 
  id: string; 
  name: string; 
  isPredictionLocked: boolean;
  fp1_start: string;
};

type ModalState = {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [submittedRaces, setSubmittedRaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    race_id: "",
    user: "",
    pole: "",
    p1: "",
    p2: "",
    p3: "",
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

  // Fetch races on initial load
  useEffect(() => {
    async function fetchRaces() {
      setLoading(true);
      try {
        const racesRes = await fetch("/api/races");
        const racesData = await racesRes.json();
        setRaces(racesData.races);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRaces();
  }, []);

  // Fetch submitted predictions when user changes
  useEffect(() => {
    async function fetchSubmitted() {
      if (!form.user) {
        setSubmittedRaces([]);
        return;
      }
      try {
        const res = await fetch("/api/predictionsByUser?user=" + form.user);
        const data = await res.json();
        setSubmittedRaces(data.race_ids);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSubmitted();
  }, [form.user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Simple frontend validation: ensure all fields are selected
    if (!form.user || !form.race_id || !form.pole || !form.p1 || !form.p2 || !form.p3) {
      showModal("warning", "Incomplete Form", "Please select all fields before submitting your prediction.");
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
        const raceName = races.find(r => r.id === form.race_id)?.name || "the race";
        showModal("success", "Prediction Submitted!", `Your prediction for ${raceName} has been recorded. Good luck!`);
        const newSubmittedRaces = [...submittedRaces, form.race_id];
        setSubmittedRaces(newSubmittedRaces);
        
        // Find next available race
        const nextAvailableRace = races.find(
          (r) => !newSubmittedRaces.includes(r.id)
        );
        
        // Reset form with next available race or keep current if none available
        setForm((f) => ({
          ...f,
          race_id: nextAvailableRace ? nextAvailableRace.id : "",
          pole: "",
          p1: "",
          p2: "",
          p3: "",
        }));
      } else {
        // Handle specific errors with better messages
        let errorTitle = "Submission Failed";
        let errorMessage = data.error || "An unknown error occurred. Please try again.";
        
        if (data.error?.includes("already submitted")) {
          errorTitle = "Already Submitted";
          errorMessage = "You have already submitted a prediction for this race. Each user can only submit one prediction per race.";
        } else if (data.error?.includes("prediction was already taken")) {
          errorTitle = "Prediction Taken";
          errorMessage = "This exact prediction combination has already been taken by another user. Please choose different drivers.";
        } else if (data.error?.includes("locked")) {
          errorTitle = "Predictions Locked";
          errorMessage = "Predictions for this race are now locked. The deadline has passed.";
        }
        
        showModal("error", errorTitle, errorMessage);
      }
    } catch (err) {
      showModal("error", "Connection Error", "Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Compute available drivers dynamically
  // Pole position is independent - same driver can be selected for pole and P1/P2/P3
  // P1, P2, P3 must be unique among themselves
  const getAvailableDrivers = (currentField: string) => {
    // For pole position, all drivers are available
    if (currentField === "pole") {
      return drivers.map((d) => ({
        name: d,
        disabled: false,
      }));
    }
    
    // For P1, P2, P3 - only restrict based on other podium positions (not pole)
    const podiumFields = ["p1", "p2", "p3"];
    const selectedPodiumDrivers = podiumFields
      .filter((f) => f !== currentField)
      .map((f) => (form as Record<string, string>)[f])
      .filter(Boolean);

    return drivers.map((d) => ({
      name: d,
      disabled: selectedPodiumDrivers.includes(d),
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
                onChange={(e) => setForm({ ...form, user: e.target.value, race_id: "", pole: "", p1: "", p2: "", p3: "" })}
              >
                <option value="">Select user...</option>
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
                className={`form-select ${!form.user ? "form-select-disabled" : ""}`}
                value={form.race_id}
                onChange={(e) => setForm({ ...form, race_id: e.target.value })}
                disabled={!form.user}
              >
                <option value="">{form.user ? "Select race..." : "Select user first..."}</option>
                {races.map((r) => {
                  const isSubmitted = submittedRaces.includes(r.id);
                  const isLocked = r.isPredictionLocked;
                  const isDisabled = isSubmitted || isLocked;
                  
                  let statusText = "";
                  if (isSubmitted) statusText = "✓ Submitted";
                  else if (isLocked) statusText = "🔒 Locked";
                  
                  return (
                    <option
                      key={r.id}
                      value={r.id}
                      disabled={isDisabled}
                    >
                      {r.name} {statusText}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="divider"></div>

            {/* Driver Predictions */}
            <div className="predictions-grid">
              {["pole", "p1", "p2", "p3"].map((field) => (
                <div key={field} className="form-group">
                  <label className="form-label">{fieldLabels[field]}</label>
                  <select
                    className={`form-select ${!form.user ? "form-select-disabled" : ""}`}
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    disabled={!form.user}
                  >
                    <option value="">{form.user ? "Select driver..." : "Select user first..."}</option>
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

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/races" className="link">
          📋 View Race Predictions →
        </Link>
        <Link href="/standings" className="link">
          📊 View Leaderboard →
        </Link>
        <Link href="/results" className="link">
          🏆 Enter Race Results →
        </Link>
      </div>
    </main>
  );
}