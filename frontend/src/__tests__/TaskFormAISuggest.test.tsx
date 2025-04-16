import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TaskForm } from "../components/TaskForm";

const mock = new MockAdapter(axios);
const priorities = [
  { id: 1, name: "Low" },
  { id: 2, name: "High" },
];

describe("TaskForm AI Suggestion", () => {
  const dummyAuth = { username: "user", password: "pass" };

  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
  });

  it("shows AI suggestion for priority and allows accepting it", async () => {
    mock.onPost("/api/ai-categorize").reply(200, { priority_id: 2 });
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Urgent bug" } });
    await waitFor(() => screen.getByText(/Accept AI suggestion/i));
    fireEvent.click(screen.getByText(/Accept AI suggestion/i));
    const select = screen.getByLabelText(/Priority/i) as HTMLSelectElement;
    expect(select.value).toBe("2");
    expect(select.options[select.selectedIndex].text).toBe("High");
  });

  it("shows AI error if suggestion fails", async () => {
    mock.onPost("/api/ai-categorize").reply(500);
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test AI fail" } });
    await waitFor(() => screen.getByText(/AI suggestion failed/i));
  });
});
