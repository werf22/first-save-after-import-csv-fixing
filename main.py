from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Response, Query
from sqlmodel import Session, select
from models import *
from models import TaskRead
from typing import List
from sqlmodel import create_engine
import pandas as pd
import io
from pydantic import BaseModel
import os
import openai
from datetime import date, datetime
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
from dotenv import load_dotenv
from sqlalchemy.orm import joinedload
from fastapi.encoders import jsonable_encoder
from fastapi import Body
from fastapi import Path

load_dotenv()

***REMOVED*** = os.getenv("***REMOVED***", "sqlite:///./tasks.db")
engine = create_engine(***REMOVED***, echo=False)

app = FastAPI(title="AI To Do List API")

def get_session():
    with Session(engine) as session:
        yield session

# Load OpenAI API key from environment variable
openai.api_key = os.getenv("***REMOVED***")

security = HTTPBasic()

***REMOVED*** = os.getenv("***REMOVED***", "jakub")
***REMOVED*** = os.getenv("***REMOVED***", "cerulik123")

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ***REMOVED***)
    correct_password = secrets.compare_digest(credentials.password, ***REMOVED***)
    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Unauthorized", headers={"WWW-Authenticate": "Basic"})
    return credentials.username

# --- Utility: Clean all integer fields in a task dict (API-side defensive) ---
def clean_int_fields(task_dict):
    import math
    import numpy as np
    for k, v in list(task_dict.items()):
        if v is None:
            continue
        if k.endswith('_id') or k in [
            'id', 'portfolio', 'portfolio_id', 'project', 'project_id',
            'section', 'section_id', 'priority', 'priority_id',
            'parent_task_id', 'subtasks_id_in_system', 'dependents_id',
            'outgoing_dependents_id', 'number_of_variations',
        ]:
            try:
                if isinstance(v, float) and math.isnan(v):
                    task_dict[k] = None
                elif isinstance(v, str) and (v.strip() == '' or v.strip().lower() == 'nan'):
                    task_dict[k] = None
                elif 'numpy' in str(type(v)) and np.isnan(v):
                    task_dict[k] = None
                else:
                    task_dict[k] = int(float(v))
            except Exception:
                task_dict[k] = None
    return task_dict

# --- CRUD for Lookup Tables ---
@app.get("/portfolios", response_model=List[Portfolio])
def get_portfolios(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Portfolio)).all()

@app.post("/portfolios", response_model=Portfolio)
def create_portfolio(portfolio: Portfolio, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    return portfolio

@app.get("/projects", response_model=List[Project])
def get_projects(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Project)).all()

@app.post("/projects", response_model=Project)
def create_project(project: Project, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@app.get("/sections", response_model=List[Section])
def get_sections(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Section)).all()

@app.post("/sections", response_model=Section)
def create_section(section: Section, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(section)
    session.commit()
    session.refresh(section)
    return section

@app.get("/priorities", response_model=List[Priority])
def get_priorities(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Priority)).all()

@app.post("/priorities", response_model=Priority)
def create_priority(priority: Priority, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(priority)
    session.commit()
    session.refresh(priority)
    return priority

@app.get("/tags", response_model=List[Tag])
def get_tags(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Tag)).all()

@app.post("/tags", response_model=Tag)
def create_tag(tag: Tag, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

# --- CRUD for Tasks ---
@app.get("/tasks", response_model=List[Task])
def get_tasks(
    session: Session = Depends(get_session),
    user: str = Depends(get_current_user),
    tag: str = Query(None),
    status: str = Query(None),
    assignee: str = Query(None),
    created_at_after: str = Query(None),
    completed_at_before: str = Query(None),
    task_type: str = Query(None),
    type: str = Query(None),
    last_modified_at_after: str = Query(None)
):
    query = select(Task)
    if tag is not None:
        query = query.where(Task.tags != None).where(Task.tags.like(f"%{tag}%"))
    if status is not None:
        query = query.where(Task.ai_workflow_status == status)
    if assignee is not None:
        query = query.where(Task.assignee == assignee)
    if created_at_after is not None:
        query = query.where(Task.created_at >= created_at_after)
    if completed_at_before is not None:
        query = query.where(Task.completed_at <= completed_at_before)
    if task_type is not None:
        query = query.where(Task.task_type == task_type)
    if type is not None:
        query = query.where(Task.type == type)
    if last_modified_at_after is not None:
        query = query.where(Task.last_modified_at >= last_modified_at_after)
    results = session.exec(query).all()
    return results

@app.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/tasks", response_model=TaskRead)
def create_task(task: Task = Body(...), session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    # Convert any date strings to date objects if needed
    import datetime
    data = jsonable_encoder(task)
    for date_field in ["created_at", "completed_at", "last_modified_at"]:
        val = data.get(date_field)
        if isinstance(val, str):
            try:
                data[date_field] = datetime.date.fromisoformat(val)
            except Exception:
                data[date_field] = None
    db_task = Task(**data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: Task, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in updated_task.dict(exclude_unset=True).items():
        setattr(db_task, k, v)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.patch("/tasks/{task_id}", response_model=Task)
def update_task_partial(task_id: int, task_update: dict = Body(...), session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_update.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(db_task)
    session.commit()
    return {"ok": True}

# --- Task Chat Endpoints ---
@app.post("/tasks/{task_id}/chat")
def task_chat(task_id: int, payload: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    """
    Task-specific AI chat endpoint. Stores user message, gets AI response, stores AI reply, returns full chat history.
    """
    # Validate task exists
    task = session.exec(select(Task).where(Task.id == task_id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    user_msg = payload.get("message", "")
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message required")
    # Store user message
    user_chat = TaskChatMessage(task_id=task_id, sender="user", message=user_msg, timestamp=datetime.utcnow())
    session.add(user_chat)
    session.commit()
    session.refresh(user_chat)
    # Get AI response (dummy for now, can wire to OpenAI)
    ai_response = f"AI says: {user_msg[::-1]}"
    ai_chat = TaskChatMessage(task_id=task_id, sender="ai", message=ai_response, timestamp=datetime.utcnow())
    session.add(ai_chat)
    session.commit()
    session.refresh(ai_chat)
    # Return full chat history for this task
    history = session.exec(select(TaskChatMessage).where(TaskChatMessage.task_id == task_id).order_by(TaskChatMessage.timestamp)).all()
    return [{"sender": m.sender, "message": m.message, "timestamp": m.timestamp.isoformat()} for m in history]

@app.get("/tasks/{task_id}/chat")
def get_task_chat(task_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    """
    Get full chat history for a task.
    """
    history = session.exec(select(TaskChatMessage).where(TaskChatMessage.task_id == task_id).order_by(TaskChatMessage.timestamp)).all()
    return [{"sender": m.sender, "message": m.message, "timestamp": m.timestamp.isoformat()} for m in history]

# --- CSV Import/Export ---
@app.get("/tasks/export/csv")
def export_tasks_csv(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    tasks = session.exec(select(Task)).all()
    df = pd.DataFrame([t.dict() for t in tasks])
    output = io.StringIO()
    df.to_csv(output, index=False, sep=';')
    return Response(content=output.getvalue(), media_type="text/csv")

@app.post("/tasks/import/csv")
def import_tasks_csv(file: UploadFile = File(...), session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    import pandas as pd
    import io
    df = pd.read_csv(io.BytesIO(file.file.read()))
    imported = []
    skipped = 0
    for _, row in df.iterrows():
        row_dict = row.to_dict()
        row_dict = clean_int_fields(row_dict)
        # Skip if required field 'name' is missing or empty
        if not row_dict.get('name') or str(row_dict['name']).strip() == '':
            skipped += 1
            continue
        task = Task(**row_dict)
        session.add(task)
        imported.append(task)
    session.commit()
    return {"imported": len(imported), "skipped": skipped}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    AI chat endpoint using OpenAI. Falls back to dummy if no API key or if OpenAI API is not supported.
    """
    fallback = False
    ai_response = None
    if openai.api_key:
        try:
            # Try OpenAI v1+ API, fallback to dummy if not supported
            if hasattr(openai, "ChatCompletion"):
                completion = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": request.message}],
                    max_tokens=128,
                )
                ai_response = completion.choices[0].message.content
            else:
                fallback = True
        except Exception as e:
            fallback = True
            ai_response = f"[OpenAI error: {str(e)}]"
    else:
        fallback = True
    if fallback or ai_response is None:
        ai_response = f"AI says: {request.message[::-1]}"
    return ChatResponse(response=ai_response)
