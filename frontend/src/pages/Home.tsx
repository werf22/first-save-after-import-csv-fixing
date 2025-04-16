import React, { useEffect, useState } from "react";
import { TaskTable } from "../components/TaskTable";
import { CSVControls } from "../components/CSVControls";
import { AIChat } from "../components/AIChat";
import { TaskCreate } from "../components/TaskCreate";
import { Layout } from "../components/Layout";
import { TreeSidebar, TreeNode } from "../components/TreeSidebar";

interface HomeProps {
  auth: { username: string; password: string };
}

const Home: React.FC<HomeProps> = ({ auth }) => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/structure", {
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    })
      .then((res) => res.json())
      .then((data) => {
        // Transform API response to tree structure
        if (data.portfolios) {
          setTree(
            data.portfolios.map((portfolio: any) => ({
              id: portfolio.id,
              name: portfolio.name,
              type: "portfolio",
              children: (portfolio.projects || []).map((project: any) => ({
                id: project.id,
                name: project.name,
                type: "project",
                children: (project.sections || []).map((section: any) => ({
                  id: section.id,
                  name: section.name,
                  type: "section",
                }))
              }))
            }))
          );
        }
      });
  }, [auth]);

  const handleTaskCreated = () => window.location.reload();

  // Determine filter for TaskTable based on selected node
  let filter: any = {};
  if (selectedNode) {
    if (selectedNode.type === "portfolio") filter.portfolio_id = selectedNode.id;
    if (selectedNode.type === "project") filter.project_id = selectedNode.id;
    if (selectedNode.type === "section") filter.section_id = selectedNode.id;
  }

  return (
    <Layout
      sidebar={
        <TreeSidebar
          tree={tree}
          onSelect={setSelectedNode}
          selectedId={selectedNode?.id ?? null}
        />
      }
    >
      <h1>AI To Do List</h1>
      <CSVControls auth={auth} />
      <button style={{marginBottom:16,background:'#1976d2',color:'#fff',padding:'8px 16px',border:'none',borderRadius:4}} onClick={()=>setShowCreate(true)}>+ New Task</button>
      {showCreate && (
        <div style={{background:'#fff',border:'1px solid #ccc',padding:24,position:'fixed',top:80,left:0,right:0,maxWidth:540,margin:'0 auto',zIndex:100}}>
          <TaskCreate auth={auth} onCreated={()=>{ setShowCreate(false); handleTaskCreated(); }} />
          <button style={{marginTop:12}} onClick={()=>setShowCreate(false)}>Cancel</button>
        </div>
      )}
      <TaskTable auth={auth} TaskFilterProps={filter} />
      <AIChat auth={auth} />
    </Layout>
  );
};

export default Home;
