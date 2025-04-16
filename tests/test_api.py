import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient
from main import app, engine
from sqlmodel import SQLModel, Session
import base64
from datetime import date
from sqlalchemy import text

@pytest.fixture(autouse=True)
def clean_db():
    # Clean all tables before each test
    with Session(engine) as session:
        session.exec(text("DELETE FROM tag"))
        session.exec(text("DELETE FROM task"))
        session.exec(text("DELETE FROM section"))
        session.exec(text("DELETE FROM project"))
        session.exec(text("DELETE FROM portfolio"))
        session.exec(text("DELETE FROM priority"))
        session.commit()

# Ensure all tables are created before any tests run
def setup_module(module):
    SQLModel.metadata.create_all(engine)

client = TestClient(app)

def auth_headers():
    user = os.getenv("***REMOVED***", "jakub")
    pw = os.getenv("***REMOVED***", "cerulik123")
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

def test_create_and_get_portfolio():
    response = client.post("/portfolios", json={"name": "Personal", "description": "Personal Portfolio"}, headers=auth_headers())
    assert response.status_code == 200
    pid = response.json()["id"]
    response = client.get("/portfolios", headers=auth_headers())
    assert response.status_code == 200
    assert any(p["id"] == pid for p in response.json())

def test_create_and_get_task():
    # Create dependencies first
    portfolio = client.post("/portfolios", json={"name": "Work"}, headers=auth_headers()).json()
    project = client.post("/projects", json={"name": "ProjectX", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/sections", json={"name": "SectionA", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/priorities", json={"name": "P1"}, headers=auth_headers()).json()
    # Create a task with new schema (use *_id fields)
    task_data = {
        "name": "Test Task",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }
    response = client.post("/tasks", json=task_data, headers=auth_headers())
    assert response.status_code == 200
    tid = response.json()["id"]
    # Retrieve and check
    response = client.get(f"/tasks/{tid}", headers=auth_headers())
    assert response.status_code == 200
    task = response.json()
    print("DEBUG: returned task dict:", task)
    assert task["name"] == "Test Task"
    assert task["portfolio_id"] == portfolio["id"]
    assert task["project_id"] == project["id"]
    assert task["section_id"] == section["id"]
    assert task["priority_id"] == priority["id"]

def test_csv_export_import():
    # Create a task so export is not empty
    portfolio = client.post("/portfolios", json={"name": "CSVPortfolio"}, headers=auth_headers()).json()
    project = client.post("/projects", json={"name": "CSVProject", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/sections", json={"name": "CSVSection", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/priorities", json={"name": "CSVPriority"}, headers=auth_headers()).json()
    task_data = {
        "name": "CSV Task",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }
    client.post("/tasks", json=task_data, headers=auth_headers())
    # Export
    response = client.get("/tasks/export/csv", headers=auth_headers())
    assert response.status_code == 200
    csv_data = response.content.decode()
    assert "name" in csv_data
    # Import (should not fail)
    files = {"file": ("tasks.csv", csv_data)}
    response = client.post("/tasks/import/csv", files=files, headers=auth_headers())
    assert response.status_code == 200
    assert "imported" in response.json()

def test_chat_endpoint():
    payload = {"message": "Hello AI!"}
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["response"].startswith("AI says: ")
    assert data["response"].endswith("!IA olleH")

def test_auth_required():
    endpoints = [
        ("get", "/portfolios"),
        ("post", "/portfolios"),
        ("get", "/projects"),
        ("post", "/projects"),
        ("get", "/tasks"),
        ("post", "/tasks"),
        ("get", "/tasks/export/csv"),
        ("post", "/tasks/import/csv")
    ]
    for method, url in endpoints:
        resp = getattr(client, method)(url)
        assert resp.status_code == 401

def test_task_advanced_filters():
    portfolio = client.post("/portfolios", json={"name": "FilterPortfolio"}, headers=auth_headers()).json()
    project = client.post("/projects", json={"name": "FilterProject", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/sections", json={"name": "FilterSection", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/priorities", json={"name": "FilterPriority"}, headers=auth_headers()).json()
    tag = client.post("/tags", json={"name": "FilterTag"}, headers=auth_headers()).json()
    # Create tasks with various values
    t1 = client.post("/tasks", json={
        "name": "Task1",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"],
        "ai_workflow_status": "Open",
        "assignee": "Jakub",
        "type": "Task",
        "task_type": "Bug",
        "created_at": date(2024, 4, 10).isoformat(),
        "completed_at": date(2024, 4, 12).isoformat(),
        "last_modified_at": date(2024, 4, 13).isoformat(),
    }, headers=auth_headers()).json()
    t2 = client.post("/tasks", json={
        "name": "Task2",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"],
        "ai_workflow_status": "Closed",
        "assignee": "Anna",
        "type": "Task",
        "task_type": "Feature",
        "created_at": date(2024, 4, 11).isoformat(),
        "completed_at": date(2024, 4, 14).isoformat(),
        "last_modified_at": date(2024, 4, 15).isoformat(),
    }, headers=auth_headers()).json()
    # Attach tag to t1 (now just update the string field)
    t1_id = t1["id"]
    # Instead of TaskTagLink, update the task's tags string directly
    resp = client.patch(f"/tasks/{t1_id}", json={"tags": "FilterTag"}, headers=auth_headers())
    assert resp.status_code == 200
    # Filter by status
    resp = client.get(f"/tasks?status=Open", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by assignee
    resp = client.get(f"/tasks?assignee=Anna", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task2" for task in resp.json())
    # Filter by created_at_after
    resp = client.get(f"/tasks?created_at_after=2024-04-10", headers=auth_headers())
    assert resp.status_code == 200
    print("created_at_after=2024-04-10", [task["name"] for task in resp.json()])
    assert any(task["name"] == "Task2" for task in resp.json())
    # Filter by tag
    resp = client.get(f"/tasks?tag=FilterTag", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by task_type
    resp = client.get(f"/tasks?task_type=Bug", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by type
    resp = client.get(f"/tasks?type=Task", headers=auth_headers())
    assert resp.status_code == 200
    assert len([task for task in resp.json() if task["name"] in ("Task1","Task2")]) == 2
    # Filter by completed_at_before
    resp = client.get(f"/tasks?completed_at_before=2024-04-13", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by last_modified_at_after
    resp = client.get(f"/tasks?last_modified_at_after=2024-04-14", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task2" for task in resp.json())
