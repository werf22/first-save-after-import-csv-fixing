import React, { useState } from "react";

interface TaskCreateProps {
  auth: { username: string; password: string };
  onCreated?: () => void;
}

const STEP_INITIAL = "initial";
const STEP_SUGGESTING = "suggesting";
const STEP_SUGGESTED = "suggested";
const STEP_SAVING = "saving";
type Step = "initial" | "suggesting" | "suggested" | "saving";

export const TaskCreate: React.FC<TaskCreateProps> = ({ auth, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [step, setStep] = useState<Step>(STEP_INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use a mapping object for step labels to avoid TS comparison errors
  const STEP_LABELS: Record<Step, string> = {
    initial: "Suggest with AI",
    suggesting: "Requesting AI Suggestions...",
    suggested: "Create Task",
    saving: "Creating..."
  };

  // Step 1: Submit initial data for AI suggestions
  const handleAISuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep(STEP_SUGGESTING);
    try {
      const resp = await fetch("/api/ai-categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify({ name, description, due_date: dueDate })
      });
      if (!resp.ok) throw new Error("AI suggestion failed");
      const data = await resp.json();
      setAiSuggestions(data);
      setStep(STEP_SUGGESTED);
    } catch (err: any) {
      setError(err.message || "AI suggestion failed");
      setStep(STEP_INITIAL);
    }
  };

  // Step 2: Accept/modify suggestions and create the task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setStep(STEP_SAVING);
    try {
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify({
          name,
          description,
          due_date: dueDate,
          ...aiSuggestions // Portfolio, Project, Section, etc.
        })
      });
      if (!resp.ok) throw new Error("Task creation failed");
      setSuccess("Task created!");
      setName("");
      setDescription("");
      setDueDate("");
      setAiSuggestions(null);
      setStep(STEP_INITIAL);
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Task creation failed");
      setStep(STEP_SUGGESTED);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Create New Task</h2>
      {step === "initial" && (
        <form onSubmit={handleAISuggest}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-name">Task Name</label>
            <input id="create-task-name" name="name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-desc">Description</label>
            <textarea id="create-task-desc" name="description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-due">Due Date</label>
            <input id="create-task-due" type="date" name="due_date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%" }} />
          </div>
          {error && <div style={{ color: "#c00" }}>{error}</div>}
          <button
            type="submit"
            disabled={!(["initial", "suggested"] as Step[]).includes(step)}
            style={{ marginTop: 12, padding: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}
          >
            {STEP_LABELS[step]}
          </button>
        </form>
      )}
      {step === "suggested" && aiSuggestions && (
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-name-suggested">Task Name</label>
            <input id="create-task-name-suggested" name="name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-desc-suggested">Description</label>
            <textarea id="create-task-desc-suggested" name="description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="create-task-due-suggested">Due Date</label>
            <input id="create-task-due-suggested" type="date" name="due_date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%" }} />
          </div>
          {/* Show AI suggestions for Portfolio, Project, Section, etc. */}
          {Object.entries(aiSuggestions).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label htmlFor={`create-task-suggestion-${key}`}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              <input id={`create-task-suggestion-${key}`} name={key} value={typeof value === 'string' || typeof value === 'number' ? value : undefined} onChange={e => setAiSuggestions((prev: any) => ({ ...prev, [key]: e.target.value }))} style={{ width: "100%" }} />
            </div>
          ))}
          {error && <div style={{ color: "#c00" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}
          <button
            type="submit"
            disabled={!(["initial", "suggested"] as Step[]).includes(step)}
            style={{ marginTop: 12, padding: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}
          >
            {STEP_LABELS[step]}
          </button>
        </form>
      )}
      {success && <div style={{ color: "green", marginTop: 16 }}>{success}</div>}
    </div>
  );
};
