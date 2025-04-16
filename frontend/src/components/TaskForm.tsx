import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Task } from "./TaskTable";
import { Notification } from "./Notification";

interface Option {
  id: number;
  name: string;
}

interface TaskFormProps {
  onSuccess?: () => void;
  auth: { username: string; password: string };
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, auth }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [tags, setTags] = useState("");
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [portfolioOptions, setPortfolioOptions] = useState<Option[]>([]);
  const [projectOptions, setProjectOptions] = useState<Option[]>([]);
  const [sectionOptions, setSectionOptions] = useState<Option[]>([]);
  // --- AI suggestion state ---
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiSuggestError, setAiSuggestError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/api/priorities", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then(res => setPriorityOptions(res.data));
    axios.get("/api/portfolios", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then(res => setPortfolioOptions(res.data));
    axios.get("/api/projects", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then(res => setProjectOptions(res.data));
    axios.get("/api/sections", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then(res => setSectionOptions(res.data));
  }, [auth]);

  // --- AI suggestion logic ---
  useEffect(() => {
    if (!name.trim() && !description.trim()) {
      setAiSuggestions(null);
      setAiSuggestError(null);
      setAiSuggestLoading(false);
      return;
    }
    // Debounce AI call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiSuggestLoading(true);
      setAiSuggestError(null);
      try {
        const resp = await axios.post(
          "/api/ai-categorize",
          { name, description, due_date: dueDate },
          { headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) } }
        );
        setAiSuggestions(resp.data);
      } catch (err: any) {
        setAiSuggestError("AI suggestion failed");
        setAiSuggestions(null);
      }
      setAiSuggestLoading(false);
    }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [name, description, dueDate, auth]);

  const handleAcceptSuggestion = (field: string) => {
    if (!aiSuggestions || !aiSuggestions[field]) return;
    if (field === "priority_id") setPriorityId(String(aiSuggestions[field]));
    if (field === "portfolio_id") setPortfolioId(String(aiSuggestions[field]));
    if (field === "project_id") setProjectId(String(aiSuggestions[field]));
    if (field === "section_id") setSectionId(String(aiSuggestions[field]));
    if (field === "tags") setTags(aiSuggestions[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post("/api/tasks", {
        name,
        description,
        due_date: dueDate || null,
        priority_id: priorityId ? Number(priorityId) : aiSuggestions?.priority_id || null,
        portfolio_id: portfolioId ? Number(portfolioId) : aiSuggestions?.portfolio_id || null,
        project_id: projectId ? Number(projectId) : aiSuggestions?.project_id || null,
        section_id: sectionId ? Number(sectionId) : aiSuggestions?.section_id || null,
        tags: tags || aiSuggestions?.tags || "",
        ...aiSuggestions
      }, {
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      setName("");
      setDescription("");
      setDueDate("");
      setPriorityId("");
      setPortfolioId("");
      setProjectId("");
      setSectionId("");
      setTags("");
      setAiSuggestions(null);
      setSuccess("Task created successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create task");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Create Task Form" style={{ margin: "2em 0", padding: 16, border: "1px solid #eee", maxWidth: 500 }}>
      <h3>Create New Task</h3>
      {success && <Notification message={success} type="success" />}
      {error && <Notification message={error} type="error" />}
      <div>
        <label htmlFor="taskform-name">Name *</label>
        <input id="taskform-name" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-desc">Description</label>
        <input id="taskform-desc" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-due">Due Date</label>
        <input id="taskform-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-priority">Priority</label>
        <select id="taskform-priority" value={priorityId || aiSuggestions?.priority_id || ""} onChange={e => setPriorityId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {priorityOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.priority_id && !priorityId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("priority_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-portfolio">Portfolio</label>
        <select id="taskform-portfolio" value={portfolioId || aiSuggestions?.portfolio_id || ""} onChange={e => setPortfolioId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {portfolioOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.portfolio_id && !portfolioId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("portfolio_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-project">Project</label>
        <select id="taskform-project" value={projectId || aiSuggestions?.project_id || ""} onChange={e => setProjectId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {projectOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.project_id && !projectId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("project_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-section">Section</label>
        <select id="taskform-section" value={sectionId || aiSuggestions?.section_id || ""} onChange={e => setSectionId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {sectionOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.section_id && !sectionId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("section_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-tags">Tags</label>
        <input id="taskform-tags" value={tags || aiSuggestions?.tags || ""} onChange={e => setTags(e.target.value)} style={{ width: "100%" }} />
        {aiSuggestions?.tags && !tags && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("tags")}>Accept AI suggestion</button>
        )}
      </div>
      {aiSuggestLoading && <div style={{ color: '#888', fontSize: 13 }}>AI suggesting fields...</div>}
      {aiSuggestError && <div style={{ color: 'red', fontSize: 13 }}>{aiSuggestError}</div>}
      <button type="submit" disabled={loading || !name.trim()} style={{ marginTop: 8 }}>
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};
