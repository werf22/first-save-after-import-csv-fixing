import React, { useState } from "react";

export interface TreeNode {
  id: number;
  name: string;
  type: "portfolio" | "project" | "section";
  children?: TreeNode[];
}

interface TreeSidebarProps {
  tree: TreeNode[];
  onSelect: (node: TreeNode) => void;
  selectedId: number | null;
}

export const TreeSidebar: React.FC<TreeSidebarProps> = ({ tree, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});

  const toggle = (id: number) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const renderNode = (node: TreeNode, depth = 0) => (
    <div key={node.id} style={{ marginLeft: depth * 16 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {node.children && (
          <button
            aria-label={expanded[node.id] ? "Collapse" : "Expand"}
            onClick={() => toggle(node.id)}
            style={{ marginRight: 4, background: "none", border: "none", cursor: "pointer" }}
          >
            {expanded[node.id] ? "▼" : "▶"}
          </button>
        )}
        <button
          style={{
            background: selectedId === node.id ? "#1976d2" : "none",
            color: selectedId === node.id ? "#fff" : undefined,
            border: "none",
            textAlign: "left",
            padding: "4px 8px",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: node.type === "portfolio" ? 600 : 400,
            width: "100%"
          }}
          onClick={() => onSelect(node)}
        >
          {node.name}
        </button>
      </div>
      {node.children && expanded[node.id] && (
        <div>{node.children.map(child => renderNode(child, depth + 1))}</div>
      )}
    </div>
  );

  return (
    <nav aria-label="Portfolio-Project-Section Tree Sidebar">
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Structure</h2>
      {tree.length === 0 && <div style={{ color: "#888" }}>No data</div>}
      {tree.map(node => renderNode(node))}
    </nav>
  );
};
