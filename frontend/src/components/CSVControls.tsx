import React, { useRef, useState } from "react";
import axios from "axios";
import { Notification } from "./Notification";

interface CSVControlsProps {
  auth: { username: string; password: string };
  onImportComplete?: () => void; // Optional callback to refresh task list without reload
}

export const CSVControls: React.FC<CSVControlsProps> = ({ auth, onImportComplete }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"import" | "export" | null>(null);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleExport = async () => {
    setNotif(null);
    setLoading("export");
    try {
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
      setNotif({ msg: "Export successful!", type: "success" });
    } catch (err: any) {
      setNotif({ msg: err?.response?.data?.detail || "Export failed", type: "error" });
    }
    setLoading(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setNotif(null);
    setLoading("import");
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("/api/tasks/import/csv", formData, {
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      setNotif({ msg: "Import successful!", type: "success" });
      if (onImportComplete) {
        onImportComplete();
      } else {
        window.location.reload(); // fallback
      }
    } catch (err: any) {
      setNotif({ msg: err?.response?.data?.detail || "Import failed", type: "error" });
    }
    setLoading(null);
  };

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={handleExport} disabled={loading === "export"}>
        {loading === "export" ? "Exporting..." : "Export Tasks as CSV"}
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={handleImport}
        disabled={loading === "import"}
        aria-label="Import CSV file"
        data-testid="file-input"
      />
      <button onClick={() => fileInput.current?.click()} disabled={loading === "import"}>
        {loading === "import" ? "Importing..." : "Import Tasks from CSV"}
      </button>
      {notif && <Notification message={notif.msg} type={notif.type} />}
    </div>
  );
};
