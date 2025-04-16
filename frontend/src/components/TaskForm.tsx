import React, { useState, useEffect } from "react";
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
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/api/priorities", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then(res => setPriorityOptions(res.data));
  }, [auth]);

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
        priority_id: priorityId ? Number(priorityId) : null,
      }, {
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      setName("");
      setDescription("");
      setDueDate("");
      setPriorityId("");
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
        <select id="taskform-priority" value={priorityId} onChange={e => setPriorityId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {priorityOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={loading || !name.trim()} style={{ marginTop: 8 }}>
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};
