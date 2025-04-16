import React from "react";

interface SidebarProps {
  items: { id: number; name: string; onClick: () => void }[];
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => (
  <nav aria-label="Sidebar Navigation">
    {title && <h2 style={{ fontSize: 18, marginBottom: 16 }}>{title}</h2>}
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map(item => (
        <li key={item.id}>
          <button onClick={item.onClick} style={{ background: "none", border: "none", textAlign: "left", width: "100%", padding: "8px 0", cursor: "pointer", fontSize: 16 }}>
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);
