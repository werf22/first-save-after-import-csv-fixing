import React from "react";

export interface NotificationProps {
  message: string;
  type?: "success" | "error";
}

export const Notification: React.FC<NotificationProps> = ({ message, type = "success" }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: type === "success" ? "#d4edda" : "#f8d7da",
        color: type === "success" ? "#155724" : "#721c24",
        border: `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
        padding: "0.75em 1.25em",
        borderRadius: 6,
        margin: "1em 0",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
};
