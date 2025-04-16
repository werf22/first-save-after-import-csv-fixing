import React, { useState, useEffect } from "react";
import axios from "axios";
import { Task } from "./TaskTable";
import { Notification } from "./Notification";

interface TaskRowProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [priority, setPriority] = useState(task.priority || "");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setNotif(null);
    try {
      await axios.patch(`/api/tasks/${task.id}`, {
        name,
        description,
        due_date: dueDate || null,
        priority: priority || null,
      });
      setNotif({ msg: "Task updated!", type: "success" });
      setEditing(false);
      onUpdate();
    } catch {
      setNotif({ msg: "Failed to update task", type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setLoading(true);
    setNotif(null);
    try {
      await axios.delete(`/api/tasks/${task.id}`);
      setNotif({ msg: "Task deleted!", type: "success" });
      onUpdate();
    } catch {
      setNotif({ msg: "Failed to delete task", type: "error" });
    }
    setLoading(false);
  };

  if (editing) {
    return (
      <tr>
        <td>{task.id}</td>
        <td>
          <input value={name || ""} onChange={e => setName(e.target.value)} />
        </td>
        <td>
          <input value={description || ""} onChange={e => setDescription(e.target.value)} />
        </td>
        <td>
          <input type="date" value={dueDate || ""} onChange={e => setDueDate(e.target.value)} />
        </td>
        <td>
          <input value={priority || ""} onChange={e => setPriority(e.target.value)} placeholder="Priority" />
        </td>
        <td>
          <button onClick={handleSave} disabled={loading || !name.trim()}>Save</button>
          <button onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
          {notif && <Notification message={notif.msg} type={notif.type} />}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{task.id}</td>
      <td>{task.name}</td>
      <td>{task.description}</td>
      <td>{task.due_date}</td>
      <td>{task.priority}</td>
      <td>
        <button onClick={() => setEditing(true)}>Edit</button>
        <button onClick={handleDelete} disabled={loading}>Delete</button>
        {notif && <Notification message={notif.msg} type={notif.type} />}
      </td>
    </tr>
  );
};
