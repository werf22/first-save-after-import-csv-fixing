import React, { useEffect, useState } from "react";
import axios from "axios";
import { TaskRow } from "./TaskRow";
import { TaskFilter } from "./TaskFilter";
import { TaskDetail } from "./TaskDetail";

export interface Task {
  id: number;
  name: string;
  description?: string;
  due_date?: string;
  priority?: string;
  portfolio?: string;
  project?: string;
  sections?: string;
  tags?: string;
  assignee?: string;
  ai_workflow_status?: string;
  created_at?: string;
  completed_at?: string;
  last_modified_at?: string;
  // Add other fields as needed
}

type SortKey = "id" | "name" | "description" | "due_date" | "priority" | "portfolio" | "project" | "sections" | "tags" | "assignee" | "ai_workflow_status";

type SortDir = "asc" | "desc";

interface TaskTableProps {
  auth: { username: string; password: string };
  TaskFilterProps?: any;
}

export const TaskTable: React.FC<TaskTableProps> = ({ auth, TaskFilterProps }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    priority: "",
    portfolio: "",
    project: "",
    sections: "",
    tags: "",
    assignee: "",
    ai_workflow_status: "",
    due_date: "",
    created_at_after: "",
    completed_at_before: "",
    search: "",
  });
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  function fetchTasks() {
    // Filter out empty string or null values from filters
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    params.sort_key = sortKey;
    params.sort_dir = sortDir;
    axios.get("/api/tasks", {
      params,
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then((res) => {
      setTasks(res.data);
    });
  }

  useEffect(() => {
    fetchTasks();
  }, [filters, sortKey, sortDir]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (TaskFilterProps?.portfolio !== undefined) {
      setFilters((prev: any) => ({ ...prev, portfolio: TaskFilterProps.portfolio || "" }));
    }
  }, [TaskFilterProps]);

  useEffect(() => {
    if (refreshList) {
      fetchTasks();
      setRefreshList(false);
    }
  }, [refreshList]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div>
      {selectedTaskId ? (
        <TaskDetail
          taskId={selectedTaskId}
          auth={auth}
          onBack={() => setSelectedTaskId(null)}
          onSaved={() => setRefreshList(true)}
        />
      ) : (
        <div>
          <h2>Task List</h2>
          <TaskFilter filters={filters} onFiltersChange={handleFiltersChange} debounceMs={0} />
          <table aria-label="Task List" role="table">
            <thead>
              <tr>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("id") } onClick={() => handleSort("id")}>ID{sortIndicator("id")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("name") } onClick={() => handleSort("name")}>Name{sortIndicator("name")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("description") } onClick={() => handleSort("description")}>Description</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("due_date") } onClick={() => handleSort("due_date")}>Due Date{sortIndicator("due_date")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("priority") } onClick={() => handleSort("priority")}>Priority{sortIndicator("priority")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("portfolio") } onClick={() => handleSort("portfolio")}>Portfolio{sortIndicator("portfolio")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("project") } onClick={() => handleSort("project")}>Project{sortIndicator("project")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("sections") } onClick={() => handleSort("sections")}>Sections{sortIndicator("sections")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("tags") } onClick={() => handleSort("tags")}>Tags{sortIndicator("tags")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("assignee") } onClick={() => handleSort("assignee")}>Assignee{sortIndicator("assignee")}</th>
                <th scope="col" tabIndex={0} role="columnheader" onKeyDown={e => (e.key==="Enter"||e.key===" ")&&handleSort("ai_workflow_status") } onClick={() => handleSort("ai_workflow_status")}>Status{sortIndicator("ai_workflow_status")}</th>
                <th scope="col" role="columnheader">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center' }}>No tasks found</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>
                      <button style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer" }} onClick={() => setSelectedTaskId(task.id)}>
                        {task.name}
                      </button>
                    </td>
                    <td>{task.description}</td>
                    <td>{task.due_date}</td>
                    <td>{task.priority}</td>
                    <td>{task.portfolio}</td>
                    <td>{task.project}</td>
                    <td>{task.sections}</td>
                    <td>{task.tags}</td>
                    <td>{task.assignee}</td>
                    <td>{task.ai_workflow_status}</td>
                    <td>{/* Optionally add edit/delete here */}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
