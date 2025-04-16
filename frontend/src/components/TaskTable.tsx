import React, { useEffect, useState } from "react";
import axios from "axios";
import { TaskRow } from "./TaskRow";
import { TaskFilter } from "./TaskFilter";
import { TaskDetail } from "./TaskDetail";

// --- DYNAMIC FIELD CONFIGURATION ---
// CSV fields from TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv
const CSV_FIELDS = [
  "Task ID","Name","Description","Notes","Task Comments","Portfolio","Project","Sections","Parent Task","Parent Task ID","Subtasks (for user)","Subtasks (for AI)","Subtasks (in System)","Subtasks ID (in System)","AI Brainstorm Ideas on How It Can Help Me:","Dependents","Dependents ID","Outgoing Dependents","Outgoing Dependents ID","Tags","Priority","Due Date","Start Date","Deadline Type","Recurrence / Frequency","Created At","Completed At","Last Modified At","Task Goal","Input Data & Context","Desired Output Format","AI Action / Process (Free Text)","AI Action / Process (Dropdown)","AI Workflow Status","Allow Autonomous Execution","Number of Variations (If Applicable)","Desired Style / Tone","Specific Constraints / Instructions","AI Behavior on Uncertainty","AI Creativity Level","AI Processing Priority","AI Agent Status Log","AI Output / Result Link","Action Required From User","Related Portfolios","Related Projects","Related Sections","Related Tasks","Related Tasks ID","Related Entities","Target Audience","Task Purpose (Why)","Type","Task Type","Estimated User Time","Cognitive Load (For User)","Energy Level Required (For User)","Required Tools / Software","Required Hardware","Required Skills","Estimated Cost / Budget","Expected Impact / Success Metric","Location","Execution Location","Required Device(s)","Internet Requirement","Focus Requirement","Optimal Time of Day","Assignee","Collaborators","Related Entity","Waiting For","Financial Return (Value & Speed)","AI Output Rating","Feedback for AI","Suggested Initial Steps / Subtasks","Relatated Areas for AI to Consider","Potential Dependencies / Related Tasks"
];

// Map CSV fields to API/database fields (snake_case, lowercase)
const FIELD_MAP = CSV_FIELDS.map(f => f
  .replace(/\s*\([^)]*\)/g, "") // remove parentheticals
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .replace(/_+/g, '_')
  .toLowerCase()
);

// Utility: ensure unique keys for React
function getUniqueFieldKeys(fields: string[]): string[] {
  const seen = new Map<string, number>();
  return fields.map(f => {
    const count = seen.get(f) || 0;
    seen.set(f, count + 1);
    return count === 0 ? f : `${f}_${count}`;
  });
}

const UNIQUE_FIELD_KEYS = getUniqueFieldKeys(FIELD_MAP);

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
  [key: string]: any;
}

type SortKey = typeof UNIQUE_FIELD_KEYS[number];

type SortDir = "asc" | "desc";

interface TaskTableProps {
  auth: { username: string; password: string };
  TaskFilterProps?: any;
}

const DROPDOWN_ID_FIELDS: Record<string, string> = {
  priority: 'priority_id',
  portfolio: 'portfolio_id',
  project: 'project_id',
  sections: 'section_id',
};

const applyFilters = (tasks: any[], filters: Record<string, any>) => {
  return tasks.filter(task => {
    for (const key in filters) {
      const value = filters[key];
      if (!value) continue;
      if (DROPDOWN_ID_FIELDS[key]) {
        // Compare id field as string for dropdowns
        if (String(task[DROPDOWN_ID_FIELDS[key]]) !== String(value)) return false;
      } else if (key.includes('date')) {
        if (!task[key] || !task[key].startsWith(value)) return false;
      } else {
        if (!task[key] || !String(task[key]).toLowerCase().includes(String(value).toLowerCase())) return false;
      }
    }
    return true;
  });
};

function sortTasks(tasks: Task[], sortKey: string, sortDir: 'asc' | 'desc'): Task[] {
  return [...tasks].sort((a, b) => {
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

export const TaskTable: React.FC<TaskTableProps> = ({ auth, TaskFilterProps }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Raw, unfiltered data
  const [tasks, setTasks] = useState<Task[]>([]); // Filtered/visible tasks
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
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(UNIQUE_FIELD_KEYS[0]);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [refreshList, setRefreshList] = useState(false);

  async function fetchTasks() {
    await axios.get("/api/tasks", {
      params: {},
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    }).then((res) => {
      setAllTasks(res.data);
      setTasks(sortTasks(applyFilters(res.data, filters), sortKey, sortDir));
    });
  }

  useEffect(() => {
    fetchTasks();
  }, [refreshList]);

  useEffect(() => {
    const filtered = applyFilters(allTasks, filters);
    setTasks(sortTasks(filtered, sortKey, sortDir));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, allTasks, sortKey, sortDir]);

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

  const handleSort = (field: string) => {
    if (sortKey === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDir('asc');
    }
  };

  const sortIndicator = (field: SortKey) =>
    sortKey === field ? (sortDir === "asc" ? " ▲" : " ▼") : "";

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
          <div style={{ overflowX: "auto" }}>
            <table aria-label="Task List" role="table">
              <thead>
                <tr>
                  {UNIQUE_FIELD_KEYS.map((field, i) => (
                    <th
                      key={field}
                      role="columnheader"
                      aria-label={CSV_FIELDS[i]}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort(field)}
                      aria-sort={sortKey === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      {CSV_FIELDS[i]}
                      {sortKey === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={CSV_FIELDS.length + 1} style={{ textAlign: 'center' }}>No tasks found</td></tr>
                ) : (
                  tasks.map((task, i) => (
                    <tr key={task.id || i}>
                      {UNIQUE_FIELD_KEYS.map(field => (
                        <td key={field}>{task[field] !== undefined ? String(task[field]) : ''}</td>
                      ))}
                      <td>
                        <button onClick={() => setSelectedTaskId(task.id)}>Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
