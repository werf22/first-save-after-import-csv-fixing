import React, { useRef } from "react";
import axios from "axios";

interface CSVControlsProps {
  auth: { username: string; password: string };
}

export const CSVControls: React.FC<CSVControlsProps> = ({ auth }) => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const response = await axios.get("/api/tasks/export/csv", {
      responseType: "blob",
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    await axios.post("/api/tasks/import/csv", formData, {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    });
    window.location.reload(); // Simplest way to refresh task list
  };

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={handleExport}>Export Tasks as CSV</button>
      <input
        type="file"
        accept=".csv"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={handleImport}
      />
      <button onClick={() => fileInput.current?.click()}>Import Tasks from CSV</button>
    </div>
  );
};
