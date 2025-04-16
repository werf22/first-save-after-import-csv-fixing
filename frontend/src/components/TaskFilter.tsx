import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Option {
  id: number;
  name: string;
}

interface TaskFilterProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  debounceMs?: number;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({ filters, onFiltersChange, debounceMs = 300 }) => {
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [portfolioOptions, setPortfolioOptions] = useState<Option[]>([]);
  const [projectOptions, setProjectOptions] = useState<Option[]>([]);
  const [sectionOptions, setSectionOptions] = useState<Option[]>([]);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<Option[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    axios.get("/api/priorities").then(res => setPriorityOptions(res.data));
    axios.get("/api/portfolios").then(res => setPortfolioOptions(res.data));
    axios.get("/api/projects").then(res => setProjectOptions(res.data));
    axios.get("/api/sections").then(res => setSectionOptions(res.data));
    axios.get("/api/statuses").then(res => setStatusOptions(res.data));
    axios.get("/api/tags").then(res => setTagOptions(res.data));
    axios.get("/api/assignees").then(res => setAssigneeOptions(res.data));
  }, []);

  // Ensure select value is always valid after async options load
  useEffect(() => {
    if (
      priorityOptions.length > 0 &&
      filters.priority_id !== "" &&
      !priorityOptions.some(opt => String(opt.id) === String(filters.priority_id))
    ) {
      onFiltersChange({ ...filters, priority_id: "" });
    }
  }, [priorityOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div style={{ margin: "1em 0", display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <label htmlFor="portfolio-select">Portfolio:</label>
      <select id="portfolio-select" name="portfolio_id" value={filters.portfolio_id || ""} onChange={handleChange} aria-label="Portfolio">
        <option value="">All</option>
        {portfolioOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="project-select">Project:</label>
      <select id="project-select" name="project_id" value={filters.project_id || ""} onChange={handleChange} aria-label="Project">
        <option value="">All</option>
        {projectOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="section-select">Section:</label>
      <select id="section-select" name="section_id" value={filters.section_id || ""} onChange={handleChange} aria-label="Section">
        <option value="">All</option>
        {sectionOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="priority-select">Priority:</label>
      <select id="priority-select" name="priority_id" value={filters.priority_id || ""} onChange={handleChange} aria-label="Priority">
        <option value="">All</option>
        {priorityOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="status-select">Status:</label>
      <select id="status-select" name="status" value={filters.status || ""} onChange={handleChange} aria-label="Status">
        <option value="">All</option>
        {statusOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="tag-select">Tag:</label>
      <select id="tag-select" name="tag" value={filters.tag || ""} onChange={handleChange} aria-label="Tag">
        <option value="">All</option>
        {tagOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="assignee-select">Assignee:</label>
      <select id="assignee-select" name="assignee" value={filters.assignee || ""} onChange={handleChange} aria-label="Assignee">
        <option value="">All</option>
        {assigneeOptions.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <label htmlFor="due-date-before">Due Before:</label>
      <input id="due-date-before" name="due_date_before" type="date" value={filters.due_date_before || ""} onChange={handleChange} aria-label="Due Before" />
      <label htmlFor="due-date-after">Due After:</label>
      <input id="due-date-after" name="due_date_after" type="date" value={filters.due_date_after || ""} onChange={handleChange} aria-label="Due After" />
      <label htmlFor="created-at-after">Created After:</label>
      <input id="created-at-after" name="created_at_after" type="date" value={filters.created_at_after || ""} onChange={handleChange} aria-label="Created After" />
      <label htmlFor="created-at-before">Created Before:</label>
      <input id="created-at-before" name="created_at_before" type="date" value={filters.created_at_before || ""} onChange={handleChange} aria-label="Created Before" />
      <label htmlFor="completed-at-after">Completed After:</label>
      <input id="completed-at-after" name="completed_at_after" type="date" value={filters.completed_at_after || ""} onChange={handleChange} aria-label="Completed After" />
      <label htmlFor="completed-at-before">Completed Before:</label>
      <input id="completed-at-before" name="completed_at_before" type="date" value={filters.completed_at_before || ""} onChange={handleChange} aria-label="Completed Before" />
      <label htmlFor="last-modified-at-after">Last Modified After:</label>
      <input id="last-modified-at-after" name="last_modified_at_after" type="date" value={filters.last_modified_at_after || ""} onChange={handleChange} aria-label="Last Modified After" />
      <label htmlFor="last-modified-at-before">Last Modified Before:</label>
      <input id="last-modified-at-before" name="last_modified_at_before" type="date" value={filters.last_modified_at_before || ""} onChange={handleChange} aria-label="Last Modified Before" />
      <input name="search" type="text" placeholder="Search..." value={filters.search || ""} onChange={handleChange} aria-label="Search" />
    </div>
  );
};
