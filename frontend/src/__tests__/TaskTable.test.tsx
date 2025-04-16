import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TaskTable } from "../components/TaskTable";

jest.useRealTimers();

const mock = new MockAdapter(axios);

const tasks = [
  { id: 1, name: "Test Task", description: "desc", due_date: "2025-04-20", priority_id: 2, portfolio_id: 1, project_id: 1, section_id: 1 },
  { id: 2, name: "Another Task", description: "desc2", due_date: "2025-04-21", priority_id: 1, portfolio_id: 2, project_id: 2, section_id: 2 },
];

const priorities = [
  { id: 1, name: "Low" },
  { id: 2, name: "High" },
];

const portfolios = [
  { id: 1, name: "Portfolio A" },
  { id: 2, name: "Portfolio B" },
];
const projects = [
  { id: 1, name: "Project X", portfolio_id: 1 },
  { id: 2, name: "Project Y", portfolio_id: 2 },
];
const sections = [
  { id: 1, name: "Section 1", project_id: 1 },
  { id: 2, name: "Section 2", project_id: 2 },
];
const statuses = [
  { id: 1, name: "Open" },
  { id: 2, name: "Closed" },
];
const tags = [
  { id: 1, name: "Tag1" },
  { id: 2, name: "Tag2" },
];
const assignees = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

describe("TaskTable", () => {
  let taskApiCallCount = 0;
  const dummyAuth = { username: "user", password: "pass" };

  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
    mock.onGet("/api/portfolios").reply(200, portfolios);
    mock.onGet("/api/projects").reply(200, projects);
    mock.onGet("/api/sections").reply(200, sections);
    mock.onGet("/api/statuses").reply(200, statuses);
    mock.onGet("/api/tags").reply(200, tags);
    mock.onGet("/api/assignees").reply(200, assignees);
    mock.onGet("/api/tasks").reply(config => {
      const params = config.params || {};
      let filtered = tasks;
      if (params.priority_id) {
        filtered = filtered.filter(t => String(t.priority_id) === String(params.priority_id));
      }
      if (params.portfolio_id) {
        filtered = filtered.filter(t => String(t.portfolio_id) === String(params.portfolio_id));
      }
      if (params.project_id) {
        filtered = filtered.filter(t => String(t.project_id) === String(params.project_id));
      }
      if (params.section_id) {
        filtered = filtered.filter(t => String(t.section_id) === String(params.section_id));
      }
      if (params.due_date_before) {
        filtered = filtered.filter(t => t.due_date <= params.due_date_before);
      }
      if (params.due_date_after) {
        filtered = filtered.filter(t => t.due_date >= params.due_date_after);
      }
      if (params.search) {
        filtered = filtered.filter(t => t.name.includes(params.search));
      }
      // Add sorting support
      if (params.sort_key && params.sort_dir) {
        filtered = [...filtered].sort((a, b) => {
          const sortKey = params.sort_key as keyof typeof a;
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          if (aVal === bVal) return 0;
          if (params.sort_dir === "asc") return aVal > bVal ? 1 : -1;
          return aVal < bVal ? 1 : -1;
        });
      }
      return [200, filtered];
    });
    mock.onAny().reply(config => {
      throw new Error(`Unexpected axios request: ${config.method} ${config.url}`);
    });
    taskApiCallCount = 0;
  });

  it("renders all filter dropdowns and inputs", async () => {
    render(<TaskTable auth={dummyAuth} />);
    await waitFor(() => screen.getByText("Test Task"), { timeout: 3000 });
    expect(screen.getByLabelText("Portfolio")).toBeInTheDocument();
    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Section")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Before")).toBeInTheDocument();
    expect(screen.getByLabelText("Due After")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("renders tasks initially", async () => {
    render(<TaskTable auth={dummyAuth} TaskFilterProps={{ debounceMs: 0 }} />);
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.getByText("Another Task")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("sorts tasks by name", async () => {
    render(<TaskTable auth={dummyAuth} TaskFilterProps={{ debounceMs: 0 }} />);
    await waitFor(() => screen.getByText("Test Task"), { timeout: 3000 });
    // Click to sort by name
    await act(async () => {
      fireEvent.click(screen.getByText(/Name/));
    });
    // Only select rows in tbody (skip header)
    let rows = screen.getAllByRole("row").filter(row => row.querySelector("button"));
    expect(rows[0]).toHaveTextContent("Another Task");
    // Click again to reverse sort
    await act(async () => {
      fireEvent.click(screen.getByText(/Name/));
    });
    rows = screen.getAllByRole("row").filter(row => row.querySelector("button"));
    expect(rows[0]).toHaveTextContent("Test Task");
  });

  it("filters by priority", async () => {
    let filterParamsSeen: any[] = [];
    const origLog = console.log;
    console.log = (...args) => {
      if (args[0] && args[0].includes("TaskFilter.onFiltersChange")) {
        filterParamsSeen.push(args[1]);
      }
      origLog(...args);
    };
    render(<TaskTable auth={dummyAuth} />);
    await waitFor(() => screen.getByText("Test Task"), { timeout: 3000 });
    await waitFor(() => expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument(), { timeout: 3000 });
    const prioritySelect = screen.getByLabelText("Priority", { selector: 'select' }) as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(prioritySelect, { target: { value: "2" } });
      fireEvent.blur(prioritySelect);
    });
    await waitFor(() => {
      const rows = screen.getAllByRole("row").filter(row => row.querySelector("button"));
      expect(rows.length).toBe(1);
      expect(rows[0]).toHaveTextContent("Test Task");
      expect(rows.some(row => row.textContent?.includes("Another Task"))).toBe(false);
    }, { timeout: 7000 });
  });

  it("filters by portfolio, project, section, and due date", async () => {
    render(<TaskTable auth={dummyAuth} TaskFilterProps={{ debounceMs: 0 }} />);
    await waitFor(() => screen.getByText("Test Task"), { timeout: 3000 });
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Portfolio", { selector: 'select' }), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText("Project", { selector: 'select' }), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText("Section", { selector: 'select' }), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText("Due Before"), { target: { value: "2025-04-20" } });
    });
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
