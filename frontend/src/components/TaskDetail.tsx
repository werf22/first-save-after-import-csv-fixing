import React, { useEffect, useState } from "react";

interface TaskDetailProps {
  taskId: number;
  auth: { username: string; password: string };
  onBack?: () => void;
  onSaved?: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, auth, onBack, onSaved }) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Chat state
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string; ts?: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Fetch task data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks/${taskId}`, {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    })
      .then(res => res.json())
      .then(setTask)
      .finally(() => setLoading(false));
  }, [taskId, auth]);

  // Fetch chat history
  useEffect(() => {
    fetch(`/api/tasks/${taskId}/chat`, {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChatHistory(data);
        else setChatHistory([]);
      })
      .catch(() => setChatHistory([]));
  }, [taskId, auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const patchFields = {
        name: task.name,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        portfolio: task.portfolio,
        project: task.project,
        sections: task.sections,
        tags: task.tags,
        assignee: task.assignee,
        ai_workflow_status: task.ai_workflow_status,
      };
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify(patchFields)
      });
      setSuccess("Task updated!");
      if (onSaved) onSaved();
    } catch {
      setError("Failed to update task");
    }
    setSaving(false);
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify({ message: chatInput })
      });
      setChatInput("");
      // Try to update chatHistory from response if possible
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatHistory(data);
        else {
          // fallback: refetch chat history
          fetch(`/api/tasks/${taskId}/chat`, {
            headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
          })
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) setChatHistory(data);
            });
        }
      }
    } catch {
      setChatError("Failed to send message");
    }
    setChatLoading(false);
  };

  if (loading || !task) return <div>Loading...</div>;

  return (
    <>
      <form onSubmit={handleSave} style={{ maxWidth: 600, margin: "0 auto" }}>
        <h2>Task Detail</h2>
        <button type="button" onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to List</button>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-name">Task Name</label>
          <input id="task-name" name="name" value={task.name || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-desc">Description</label>
          <textarea id="task-desc" name="description" value={task.description || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-priority">Priority</label>
          <input id="task-priority" name="priority" value={task.priority || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-portfolio">Portfolio</label>
          <input id="task-portfolio" name="portfolio" value={task.portfolio || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-project">Project</label>
          <input id="task-project" name="project" value={task.project || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-sections">Sections</label>
          <input id="task-sections" name="sections" value={task.sections || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-tags">Tags</label>
          <input id="task-tags" name="tags" value={task.tags || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-assignee">Assignee</label>
          <input id="task-assignee" name="assignee" value={task.assignee || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-status">Status</label>
          <input id="task-status" name="ai_workflow_status" value={task.ai_workflow_status || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="task-due">Due Date</label>
          <input id="task-due" type="date" name="due_date" value={task.due_date || ""} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <button type="submit" disabled={saving} style={{ marginTop: 16, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 24px" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {success && <div style={{ color: "green", marginTop: 8 }}>{success}</div>}
        {error && <div style={{ color: "#c00", marginTop: 8 }}>{error}</div>}
      </form>
      <div style={{ maxWidth: 600, margin: "32px auto 0 auto" }}>
        <strong>Task-Specific Chat</strong>
        <div style={{ color: "#888", fontSize: 14 }}>Chat with the AI about this task. All messages are saved in the task history.</div>
        <div style={{ maxHeight: 200, overflowY: "auto", background: "#f9f9f9", border: "1px solid #eee", padding: 12, margin: "12px 0" }}>
          {chatHistory.length === 0 && <div style={{ color: "#aaa" }}>No messages yet.</div>}
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8, textAlign: msg.sender === "user" ? "right" : "left" }}>
              <span style={{ fontWeight: msg.sender === "user" ? 600 : 400, color: msg.sender === "user" ? "#1976d2" : "#333" }}>{msg.sender === "user" ? "You" : "AI"}:</span> {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleChatSend} style={{ display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading}
            placeholder="Type your message..."
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={chatLoading || !chatInput.trim()} style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "0 16px" }}>
            Send
          </button>
        </form>
        {chatError && <div style={{ color: "#c00", marginTop: 8 }}>{chatError}</div>}
      </div>
    </>
  );
};
